import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { createServer, type Server } from "node:http";
import { after, before, beforeEach, describe, test } from "node:test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { AddressInfo } from "node:net";

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "file:./test.db";

fs.rmSync(path.join(backendRoot, "test.db"), { force: true });
fs.rmSync(path.join(backendRoot, "test.db-journal"), { force: true });

execSync("npx prisma migrate deploy", {
  cwd: backendRoot,
  env: { ...process.env, DATABASE_URL: "file:./test.db" },
  stdio: "inherit",
});

const { createApp } = await import("../src/app.js");
const { prisma } = await import("../src/db/prisma.js");
const { SupplierController } = await import("../src/controllers/supplier.controller.js");
const { supplierRepository } = await import("../src/repositories/supplier.repository.js");
const { SupplierService } = await import("../src/services/supplier.service.js");

const app = createApp(new SupplierController(new SupplierService(supplierRepository)));

type UserId = "anna" | "max";

interface RequestOptions {
  user?: UserId | string;
  body?: unknown;
  skipUser?: boolean;
}

let server: Server;
let baseUrl = "";

async function request(method: string, pathname: string, options: RequestOptions = {}) {
  const headers = new Headers();
  if (!options.skipUser) {
    headers.set("X-User-Id", options.user ?? "anna");
  }
  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const json = (await response.json()) as {
    data?: Record<string, unknown> & { id?: string; status?: string };
    error?: { code: string; message: string };
  };

  return { status: response.status, json };
}

function validSupplier(overrides: Record<string, string> = {}) {
  return {
    companyName: "Nordlicht Logistics GmbH",
    vatId: "DE123456789",
    country: "Germany",
    contactEmail: "ops@nordlicht.example",
    ...overrides,
  };
}

async function createSupplier(user: UserId = "anna", overrides: Record<string, string> = {}) {
  const result = await request("POST", "/api/suppliers", {
    user,
    body: validSupplier(overrides),
  });
  assert.equal(result.status, 201);
  return result.json.data as { id: string; status: string; createdBy: string; vatId: string };
}

async function submitSupplier(id: string, user: UserId = "anna") {
  const result = await request("POST", `/api/suppliers/${id}/submit`, { user });
  assert.equal(result.status, 200);
  return result.json.data as { id: string; status: string };
}

before(async () => {
  server = createServer(app);
  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
});

beforeEach(async () => {
  await prisma.supplier.deleteMany();
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  await prisma.$disconnect();
});

describe("supplier workflow", () => {
  test("1. supplier is created with DRAFT status", async () => {
    const result = await request("POST", "/api/suppliers", { body: validSupplier() });

    assert.equal(result.status, 201);
    assert.equal(result.json.data?.status, "DRAFT");
  });

  test("2. creator is stored from X-User-Id", async () => {
    const result = await request("POST", "/api/suppliers", {
      user: "anna",
      body: validSupplier(),
    });

    assert.equal(result.status, 201);
    assert.equal(result.json.data?.createdBy, "anna");
  });

  test("3. duplicate VAT ID is rejected", async () => {
    await createSupplier("anna", { vatId: "DE111111111" });
    const result = await request("POST", "/api/suppliers", {
      user: "max",
      body: validSupplier({
        companyName: "Other GmbH",
        vatId: "de111111111",
        contactEmail: "other@example.com",
      }),
    });

    assert.equal(result.status, 409);
    assert.equal(result.json.error?.code, "VAT_ID_ALREADY_EXISTS");
  });

  test("4. DRAFT supplier can be submitted", async () => {
    const created = await createSupplier();
    const result = await request("POST", `/api/suppliers/${created.id}/submit`);

    assert.equal(result.status, 200);
    assert.equal(result.json.data?.status, "PENDING_APPROVAL");
  });

  test("5. invalid status transition is rejected", async () => {
    const created = await createSupplier();
    await submitSupplier(created.id);
    const result = await request("POST", `/api/suppliers/${created.id}/submit`);

    assert.equal(result.status, 409);
    assert.equal(result.json.error?.code, "INVALID_STATUS_TRANSITION");
  });

  test("6. creator cannot approve their own supplier", async () => {
    const created = await createSupplier("anna");
    await submitSupplier(created.id, "anna");
    const result = await request("POST", `/api/suppliers/${created.id}/approve`, {
      user: "anna",
    });

    assert.equal(result.status, 403);
    assert.equal(result.json.error?.code, "SELF_APPROVAL_NOT_ALLOWED");
  });

  test("7. creator cannot reject their own supplier", async () => {
    const created = await createSupplier("anna");
    await submitSupplier(created.id, "anna");
    const result = await request("POST", `/api/suppliers/${created.id}/reject`, {
      user: "anna",
      body: { reason: "Incomplete paperwork" },
    });

    assert.equal(result.status, 403);
    assert.equal(result.json.error?.code, "SELF_APPROVAL_NOT_ALLOWED");
  });

  test("8. a different user can approve a supplier", async () => {
    const created = await createSupplier("anna");
    await submitSupplier(created.id, "anna");
    const result = await request("POST", `/api/suppliers/${created.id}/approve`, {
      user: "max",
    });

    assert.equal(result.status, 200);
    assert.equal(result.json.data?.status, "APPROVED");
    assert.equal(result.json.data?.approvedBy, "max");
  });

  test("9. rejection without a reason is rejected", async () => {
    const created = await createSupplier("anna");
    await submitSupplier(created.id, "anna");

    const missing = await request("POST", `/api/suppliers/${created.id}/reject`, {
      user: "max",
      body: {},
    });
    assert.equal(missing.status, 400);
    assert.equal(missing.json.error?.code, "REJECTION_REASON_REQUIRED");

    const blank = await request("POST", `/api/suppliers/${created.id}/reject`, {
      user: "max",
      body: { reason: "   " },
    });
    assert.equal(blank.status, 400);
    assert.equal(blank.json.error?.code, "REJECTION_REASON_REQUIRED");
  });

  test("10. rejection with a reason succeeds", async () => {
    const created = await createSupplier("anna");
    await submitSupplier(created.id, "anna");
    const result = await request("POST", `/api/suppliers/${created.id}/reject`, {
      user: "max",
      body: { reason: "Missing tax documents" },
    });

    assert.equal(result.status, 200);
    assert.equal(result.json.data?.status, "REJECTED");
    assert.equal(result.json.data?.rejectedBy, "max");
    assert.equal(result.json.data?.rejectionReason, "Missing tax documents");
  });

  test("11. APPROVED supplier cannot be processed again", async () => {
    const created = await createSupplier("anna");
    await submitSupplier(created.id, "anna");
    await request("POST", `/api/suppliers/${created.id}/approve`, { user: "max" });

    const approveAgain = await request("POST", `/api/suppliers/${created.id}/approve`, {
      user: "max",
    });
    assert.equal(approveAgain.status, 409);
    assert.equal(approveAgain.json.error?.code, "INVALID_STATUS_TRANSITION");

    const rejectAfterApprove = await request("POST", `/api/suppliers/${created.id}/reject`, {
      user: "max",
      body: { reason: "Too late" },
    });
    assert.equal(rejectAfterApprove.status, 409);
    assert.equal(rejectAfterApprove.json.error?.code, "INVALID_STATUS_TRANSITION");
  });

  test("12. REJECTED supplier cannot be processed again", async () => {
    const created = await createSupplier("anna");
    await submitSupplier(created.id, "anna");
    await request("POST", `/api/suppliers/${created.id}/reject`, {
      user: "max",
      body: { reason: "Incomplete" },
    });

    const rejectAgain = await request("POST", `/api/suppliers/${created.id}/reject`, {
      user: "max",
      body: { reason: "Still incomplete" },
    });
    assert.equal(rejectAgain.status, 409);
    assert.equal(rejectAgain.json.error?.code, "INVALID_STATUS_TRANSITION");

    const approveAfterReject = await request("POST", `/api/suppliers/${created.id}/approve`, {
      user: "max",
    });
    assert.equal(approveAfterReject.status, 409);
    assert.equal(approveAfterReject.json.error?.code, "INVALID_STATUS_TRANSITION");
  });

  test("invalid email returns VALIDATION_ERROR", async () => {
    const result = await request("POST", "/api/suppliers", {
      body: validSupplier({ contactEmail: "not-an-email" }),
    });

    assert.equal(result.status, 400);
    assert.equal(result.json.error?.code, "VALIDATION_ERROR");
  });

  test("unknown supplier returns SUPPLIER_NOT_FOUND", async () => {
    const result = await request("GET", "/api/suppliers/does-not-exist");

    assert.equal(result.status, 404);
    assert.equal(result.json.error?.code, "SUPPLIER_NOT_FOUND");
  });
});
