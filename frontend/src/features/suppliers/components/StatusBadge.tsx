import { STATUS_LABELS } from "../constants";
import type { SupplierStatus } from "../types";

const STATUS_CLASSES: Record<SupplierStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-800",
  PENDING_APPROVAL: "bg-amber-100 text-amber-900",
  APPROVED: "bg-green-100 text-green-900",
  REJECTED: "bg-red-100 text-red-800",
};

export function StatusBadge({ status }: { status: SupplierStatus }) {
  return (
    <span
      className={`inline-flex rounded-lg px-2 py-0.5 text-xs font-medium ${STATUS_CLASSES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
