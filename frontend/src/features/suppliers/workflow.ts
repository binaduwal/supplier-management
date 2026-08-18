import { hasRole, type User } from "../../types/user";
import type { Supplier } from "./types";

export interface ActionDecision {
  allowed: boolean;
  reason?: string;
}

export function canCreateSupplier(_user: User): ActionDecision {
  return { allowed: true };
}

export function canSubmitSupplier(
  supplier: Supplier,
  user: User,
): ActionDecision {
  if (supplier.createdBy !== user.id) {
    return {
      allowed: false,
      reason: "You can only submit suppliers you created.",
    };
  }
  if (supplier.status !== "DRAFT") {
    return {
      allowed: false,
      reason: "Only draft suppliers can be submitted for approval.",
    };
  }
  return { allowed: true };
}

export function canApproveSupplier(
  supplier: Supplier,
  user: User,
): ActionDecision {
  if (!hasRole(user, "APPROVER")) {
    return {
      allowed: false,
      reason: "Only approvers can approve suppliers.",
    };
  }
  if (supplier.status !== "PENDING_APPROVAL") {
    return {
      allowed: false,
      reason: "Only suppliers pending approval can be approved.",
    };
  }
  if (supplier.createdBy === user.id) {
    return {
      allowed: false,
      reason: "You cannot approve a supplier you created.",
    };
  }
  return { allowed: true };
}

export function canRejectSupplier(
  supplier: Supplier,
  user: User,
): ActionDecision {
  if (!hasRole(user, "APPROVER")) {
    return {
      allowed: false,
      reason: "Only approvers can reject suppliers.",
    };
  }
  if (supplier.status !== "PENDING_APPROVAL") {
    return {
      allowed: false,
      reason: "Only suppliers pending approval can be rejected.",
    };
  }
  if (supplier.createdBy === user.id) {
    return {
      allowed: false,
      reason: "You cannot reject a supplier you created.",
    };
  }
  return { allowed: true };
}
