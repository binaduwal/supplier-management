import { Prisma } from "../../generated/prisma/client.js";
import { AppError, ErrorCode } from "../errors/AppError.js";
import type { SupplierRepository } from "../repositories/supplier.repository.js";
import type { CreateSupplierInput } from "../validation/supplier.schemas.js";

function normalizeVatId(vatId: string): string {
  return vatId.trim().toUpperCase();
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export class SupplierService {
  constructor(private readonly suppliers: SupplierRepository) {}

  list() {
    return this.suppliers.findMany();
  }

  async getById(id: string) {
    const supplier = await this.suppliers.findById(id);
    if (!supplier) {
      throw new AppError(
        ErrorCode.SUPPLIER_NOT_FOUND,
        "Supplier not found.",
        404,
      );
    }
    return supplier;
  }

  async create(input: CreateSupplierInput, userId: string) {
    try {
      return await this.suppliers.create({
        companyName: input.companyName.trim(),
        vatId: normalizeVatId(input.vatId),
        country: input.country.trim(),
        contactEmail: input.contactEmail.trim(),
        status: "DRAFT",
        createdBy: userId,
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new AppError(
          ErrorCode.VAT_ID_ALREADY_EXISTS,
          "A supplier with this VAT ID already exists.",
          409,
        );
      }
      throw error;
    }
  }

  async submit(id: string) {
    const supplier = await this.getById(id);
    if (supplier.status !== "DRAFT") {
      throw new AppError(
        ErrorCode.INVALID_STATUS_TRANSITION,
        "Only draft suppliers can be submitted for approval.",
        409,
      );
    }

    return this.suppliers.update(id, { status: "PENDING_APPROVAL" });
  }

  async approve(id: string, userId: string) {
    const supplier = await this.getById(id);

    if (supplier.status !== "PENDING_APPROVAL") {
      throw new AppError(
        ErrorCode.INVALID_STATUS_TRANSITION,
        "Only suppliers pending approval can be approved.",
        409,
      );
    }

    if (supplier.createdBy === userId) {
      throw new AppError(
        ErrorCode.SELF_APPROVAL_NOT_ALLOWED,
        "You cannot approve a supplier you created.",
        403,
      );
    }

    return this.suppliers.update(id, {
      status: "APPROVED",
      approvedBy: userId,
    });
  }

  async reject(id: string, reason: string, userId: string) {
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      throw new AppError(
        ErrorCode.REJECTION_REASON_REQUIRED,
        "A rejection reason is required.",
        400,
      );
    }

    const supplier = await this.getById(id);

    if (supplier.status !== "PENDING_APPROVAL") {
      throw new AppError(
        ErrorCode.INVALID_STATUS_TRANSITION,
        "Only suppliers pending approval can be rejected.",
        409,
      );
    }

    if (supplier.createdBy === userId) {
      throw new AppError(
        ErrorCode.SELF_APPROVAL_NOT_ALLOWED,
        "You cannot reject a supplier you created.",
        403,
      );
    }

    return this.suppliers.update(id, {
      status: "REJECTED",
      rejectedBy: userId,
      rejectionReason: trimmedReason,
    });
  }
}
