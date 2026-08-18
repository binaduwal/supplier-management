export type SupplierStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED";

export interface Supplier {
  id: string;
  companyName: string;
  vatId: string;
  country: string;
  contactEmail: string;
  status: SupplierStatus;
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  rejectedBy?: string;
  rejectionReason?: string;
}

export type SupplierServiceErrorCode =
  | "DUPLICATE_VAT"
  | "FORBIDDEN"
  | "INVALID_TRANSITION"
  | "SELF_APPROVAL"
  | "VALIDATION"
  | "NOT_FOUND";

export class SupplierServiceError extends Error {
  readonly code: SupplierServiceErrorCode;

  constructor(code: SupplierServiceErrorCode, message: string) {
    super(message);
    this.name = "SupplierServiceError";
    this.code = code;
  }
}

export function isSupplierServiceError(
  error: unknown,
): error is SupplierServiceError {
  return error instanceof SupplierServiceError;
}
