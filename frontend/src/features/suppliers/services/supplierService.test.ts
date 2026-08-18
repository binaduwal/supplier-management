import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "../../../types/user";
import { isSupplierServiceError } from "../types";
import {
  approveSupplier,
  createSupplier,
  listSuppliers,
  rejectSupplier,
  submitSupplier,
} from "./supplierService";

const anna: User = {
  id: "anna",
  name: "Anna Requester",
  roles: ["REQUESTER", "APPROVER"],
};

const max: User = {
  id: "max",
  name: "Max Approver",
  roles: ["APPROVER"],
};

async function flush<T>(work: Promise<T>): Promise<T> {
  const settled = work.then(
    (value) => ({ ok: true as const, value }),
    (error: unknown) => ({ ok: false as const, error }),
  );
  await vi.advanceTimersByTimeAsync(500);
  const result = await settled;
  if (!result.ok) {
    throw result.error;
  }
  return result.value;
}

describe("supplierService", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("creates a draft supplier owned by the active user", async () => {
    const created = await flush(
      createSupplier(
        {
          companyName: "Elbe Metal Works GmbH",
          vatId: "DE998877665",
          country: "DE",
          contactEmail: "office@elbe-metal.de",
        },
        anna,
      ),
    );

    expect(created.status).toBe("DRAFT");
    expect(created.createdBy).toBe("anna");
    expect(created.companyName).toBe("Elbe Metal Works GmbH");

    const list = await flush(listSuppliers());
    expect(list.some((supplier) => supplier.id === created.id)).toBe(true);
  });

  it("does not create a supplier with a duplicate VAT ID", async () => {
    await flush(listSuppliers());

    try {
      await flush(
        createSupplier(
          {
            companyName: "Duplicate GmbH",
            vatId: "de123456789",
            country: "DE",
            contactEmail: "dup@example.de",
          },
          anna,
        ),
      );
      expect.unreachable("duplicate VAT should fail");
    } catch (error) {
      expect(isSupplierServiceError(error)).toBe(true);
      if (isSupplierServiceError(error)) {
        expect(error.code).toBe("DUPLICATE_VAT");
      }
    }
  });

  it("submits a draft to pending approval", async () => {
    const created = await flush(
      createSupplier(
        {
          companyName: "Elbe Metal Works GmbH",
          vatId: "DE998877665",
          country: "DE",
          contactEmail: "office@elbe-metal.de",
        },
        anna,
      ),
    );

    const submitted = await flush(submitSupplier(created.id, anna));
    expect(submitted.status).toBe("PENDING_APPROVAL");
  });

  it("prevents self-approval in the service layer", async () => {
    await flush(listSuppliers());

    try {
      await flush(approveSupplier("sup-nordlicht", anna));
      expect.unreachable("self-approval should fail");
    } catch (error) {
      expect(isSupplierServiceError(error)).toBe(true);
      if (isSupplierServiceError(error)) {
        expect(error.code).toBe("SELF_APPROVAL");
        expect(error.message).toBe("You cannot approve a supplier you created.");
      }
    }

    const list = await flush(listSuppliers());
    const nordlicht = list.find((supplier) => supplier.id === "sup-nordlicht");
    expect(nordlicht?.status).toBe("PENDING_APPROVAL");
  });

  it("lets Max approve a supplier created by Anna", async () => {
    await flush(listSuppliers());
    const approved = await flush(approveSupplier("sup-nordlicht", max));
    expect(approved.status).toBe("APPROVED");
    expect(approved.approvedBy).toBe("max");
  });

  it("keeps the supplier pending when reject has no reason", async () => {
    await flush(listSuppliers());

    try {
      await flush(rejectSupplier("sup-nordlicht", "   ", max));
      expect.unreachable("empty rejection reason should fail");
    } catch (error) {
      expect(isSupplierServiceError(error)).toBe(true);
      if (isSupplierServiceError(error)) {
        expect(error.code).toBe("VALIDATION");
      }
    }

    const list = await flush(listSuppliers());
    const nordlicht = list.find((supplier) => supplier.id === "sup-nordlicht");
    expect(nordlicht?.status).toBe("PENDING_APPROVAL");
  });

  it("rejects a pending supplier with a reason", async () => {
    await flush(listSuppliers());
    const rejected = await flush(
      rejectSupplier(
        "sup-nordlicht",
        "Insurance certificate is expired.",
        max,
      ),
    );

    expect(rejected.status).toBe("REJECTED");
    expect(rejected.rejectedBy).toBe("max");
    expect(rejected.rejectionReason).toBe("Insurance certificate is expired.");
  });
});
