export const ErrorCode = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  SUPPLIER_NOT_FOUND: "SUPPLIER_NOT_FOUND",
  VAT_ID_ALREADY_EXISTS: "VAT_ID_ALREADY_EXISTS",
  INVALID_STATUS_TRANSITION: "INVALID_STATUS_TRANSITION",
  SELF_APPROVAL_NOT_ALLOWED: "SELF_APPROVAL_NOT_ALLOWED",
  REJECTION_REASON_REQUIRED: "REJECTION_REASON_REQUIRED",
  MISSING_USER: "MISSING_USER",
  UNKNOWN_USER: "UNKNOWN_USER",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export interface ErrorDetail {
  field: string;
  message: string;
}

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly httpStatus: number;
  readonly details?: ErrorDetail[];

  constructor(
    code: ErrorCode,
    message: string,
    httpStatus: number,
    details?: ErrorDetail[],
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.httpStatus = httpStatus;
    this.details = details;
  }
}
