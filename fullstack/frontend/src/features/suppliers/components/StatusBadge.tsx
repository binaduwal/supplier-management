import type { SupplierStatus } from "../../../types/supplier";

const STATUS_LABELS: Record<SupplierStatus, string> = {
  DRAFT: "Draft",
  PENDING_APPROVAL: "Pending approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export function StatusBadge({ status }: { status: SupplierStatus }) {
  return (
    <span className={`status-badge status-badge--${status.toLowerCase()}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
