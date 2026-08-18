import { describe, expect, it } from "vitest";
import type { User } from "../../types/user";
import type { Supplier } from "./types";
import {
  canApproveSupplier,
  canCreateSupplier,
  canRejectSupplier,
  canSubmitSupplier,
} from "./workflow";

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

const pendingByAnna: Supplier = {
  id: "sup-1",
  companyName: "Nordlicht Logistics GmbH",
  vatId: "DE291847563",
  country: "DE",
  contactEmail: "contracts@nordlicht-logistics.de",
  status: "PENDING_APPROVAL",
  createdBy: "anna",
  createdAt: "2026-07-28T11:05:00.000Z",
};

const draftByAnna: Supplier = {
  ...pendingByAnna,
  id: "sup-2",
  status: "DRAFT",
};

describe("canCreateSupplier", () => {
  it("allows both Anna and Max to create suppliers", () => {
    expect(canCreateSupplier(anna).allowed).toBe(true);
    expect(canCreateSupplier(max).allowed).toBe(true);
  });
});

describe("canSubmitSupplier", () => {
  it("allows the creator to submit a draft", () => {
    expect(canSubmitSupplier(draftByAnna, anna).allowed).toBe(true);
  });

  it("does not allow another user to submit the draft", () => {
    const decision = canSubmitSupplier(draftByAnna, max);
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toMatch(/you created/i);
  });
});

describe("canApproveSupplier", () => {
  it("allows Max to approve a supplier created by Anna", () => {
    expect(canApproveSupplier(pendingByAnna, max).allowed).toBe(true);
  });

  it("prevents Anna from approving her own supplier", () => {
    const decision = canApproveSupplier(pendingByAnna, anna);
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe("You cannot approve a supplier you created.");
  });
});

describe("canRejectSupplier", () => {
  it("allows Max to reject a supplier created by Anna", () => {
    expect(canRejectSupplier(pendingByAnna, max).allowed).toBe(true);
  });

  it("prevents Anna from rejecting her own supplier", () => {
    const decision = canRejectSupplier(pendingByAnna, anna);
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe("You cannot reject a supplier you created.");
  });
});
