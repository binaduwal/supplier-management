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
  approvedBy: string | null;
  rejectedBy: string | null;
  rejectionReason: string | null;
}
