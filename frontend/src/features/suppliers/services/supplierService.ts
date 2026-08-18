import type { User } from "../../../types/user";
import type { CreateSupplierValues } from "../schemas";
import { SupplierServiceError, type Supplier } from "../types";
import {
  canApproveSupplier,
  canCreateSupplier,
  canRejectSupplier,
  canSubmitSupplier,
} from "../workflow";
import { loadSuppliers, saveSuppliers } from "./supplierStorage";

const NETWORK_DELAY_MS = 400;

function delay(ms = NETWORK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function normalizeVatId(vatId: string): string {
  return vatId.trim().toUpperCase();
}

function findByVatId(suppliers: Supplier[], vatId: string): Supplier | undefined {
  const normalized = normalizeVatId(vatId);
  return suppliers.find(
    (supplier) => normalizeVatId(supplier.vatId) === normalized,
  );
}

export async function listSuppliers(): Promise<Supplier[]> {
  await delay();
  return loadSuppliers();
}

export async function getSupplierById(id: string): Promise<Supplier> {
  await delay();
  const supplier = loadSuppliers().find((item) => item.id === id);
  if (!supplier) {
    throw new SupplierServiceError("NOT_FOUND", "Supplier not found.");
  }
  return supplier;
}

export async function createSupplier(
  values: CreateSupplierValues,
  user: User,
): Promise<Supplier> {
  await delay();

  const createDecision = canCreateSupplier(user);
  if (!createDecision.allowed) {
    throw new SupplierServiceError(
      "FORBIDDEN",
      createDecision.reason ?? "You cannot create suppliers.",
    );
  }

  const suppliers = loadSuppliers();
  if (findByVatId(suppliers, values.vatId)) {
    throw new SupplierServiceError(
      "DUPLICATE_VAT",
      "A supplier with this VAT ID already exists.",
    );
  }

  const supplier: Supplier = {
    id: crypto.randomUUID(),
    companyName: values.companyName.trim(),
    vatId: values.vatId.trim(),
    country: values.country.trim(),
    contactEmail: values.contactEmail.trim(),
    status: "DRAFT",
    createdBy: user.id,
    createdAt: new Date().toISOString(),
  };

  saveSuppliers([supplier, ...suppliers]);
  return supplier;
}

export async function submitSupplier(
  id: string,
  user: User,
): Promise<Supplier> {
  await delay();

  const suppliers = loadSuppliers();
  const index = suppliers.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new SupplierServiceError("NOT_FOUND", "Supplier not found.");
  }

  const current = suppliers[index];
  const decision = canSubmitSupplier(current, user);
  if (!decision.allowed) {
    const code =
      current.status !== "DRAFT" ? "INVALID_TRANSITION" : "FORBIDDEN";
    throw new SupplierServiceError(
      code,
      decision.reason ?? "This supplier cannot be submitted.",
    );
  }

  const updated: Supplier = {
    ...current,
    status: "PENDING_APPROVAL",
  };
  suppliers[index] = updated;
  saveSuppliers(suppliers);
  return updated;
}

export async function approveSupplier(
  id: string,
  user: User,
): Promise<Supplier> {
  await delay();

  const suppliers = loadSuppliers();
  const index = suppliers.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new SupplierServiceError("NOT_FOUND", "Supplier not found.");
  }

  const current = suppliers[index];
  const decision = canApproveSupplier(current, user);
  if (!decision.allowed) {
    const code =
      current.createdBy === user.id
        ? "SELF_APPROVAL"
        : current.status !== "PENDING_APPROVAL"
          ? "INVALID_TRANSITION"
          : "FORBIDDEN";
    throw new SupplierServiceError(
      code,
      decision.reason ?? "This supplier cannot be approved.",
    );
  }

  const updated: Supplier = {
    ...current,
    status: "APPROVED",
    approvedBy: user.id,
  };
  suppliers[index] = updated;
  saveSuppliers(suppliers);
  return updated;
}

export async function rejectSupplier(
  id: string,
  reason: string,
  user: User,
): Promise<Supplier> {
  await delay();

  const trimmedReason = reason.trim();
  if (!trimmedReason) {
    throw new SupplierServiceError(
      "VALIDATION",
      "A rejection reason is required.",
    );
  }

  const suppliers = loadSuppliers();
  const index = suppliers.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new SupplierServiceError("NOT_FOUND", "Supplier not found.");
  }

  const current = suppliers[index];
  const decision = canRejectSupplier(current, user);
  if (!decision.allowed) {
    const code =
      current.createdBy === user.id
        ? "SELF_APPROVAL"
        : current.status !== "PENDING_APPROVAL"
          ? "INVALID_TRANSITION"
          : "FORBIDDEN";
    throw new SupplierServiceError(
      code,
      decision.reason ?? "This supplier cannot be rejected.",
    );
  }

  const updated: Supplier = {
    ...current,
    status: "REJECTED",
    rejectedBy: user.id,
    rejectionReason: trimmedReason,
  };
  suppliers[index] = updated;
  saveSuppliers(suppliers);
  return updated;
}
