import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useParams } from "react-router-dom";
import { PageContainer } from "../../../components/layout/PageContainer";
import { useActiveUser } from "../../../context/useActiveUser";
import { getUserName } from "../../../data/users";
import { StatusBadge } from "../components/StatusBadge";
import { getCountryName } from "../constants";
import { useSupplier, useSupplierActions } from "../hooks/useSuppliers";
import {
  rejectSupplierSchema,
  type RejectSupplierValues,
} from "../schemas";

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-field">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export function SupplierDetailPage() {
  const { id } = useParams();
  const { activeUser } = useActiveUser();
  const { supplier, setSupplier, loading, error, refresh } = useSupplier(id);
  const actions = useSupplierActions((updated) => {
    setSupplier(updated);
  });
  const rejectForm = useForm<RejectSupplierValues>({
    resolver: zodResolver(rejectSupplierSchema),
    defaultValues: { reason: "" },
  });

  if (loading) {
    return (
      <PageContainer title="Supplier">
        <p className="muted">Loading supplier...</p>
      </PageContainer>
    );
  }

  if (error || !supplier) {
    return (
      <PageContainer title="Supplier">
        <p className="banner banner--error" role="alert">
          {error ?? "Supplier not found."}
        </p>
        <button className="button button--secondary" type="button" onClick={() => void refresh()}>
          Try again
        </button>
      </PageContainer>
    );
  }

  const isCreator = supplier.createdBy === activeUser.id;
  const canSubmit =
    activeUser.role === "REQUESTER" &&
    isCreator &&
    supplier.status === "DRAFT";
  const canReview =
    activeUser.role === "APPROVER" && supplier.status === "PENDING_APPROVAL";
  const selfBlocked = canReview && isCreator;
  const busy = actions.pendingAction !== null;

  const onReject = rejectForm.handleSubmit(async (values) => {
    try {
      await actions.reject(supplier.id, values.reason);
      rejectForm.reset();
    } catch {
      // Error toast is shown from the action hook.
    }
  });

  return (
    <PageContainer
      title={supplier.companyName}
      description="Supplier details and approval actions."
      actions={
        <Link to="/suppliers" className="back-link">
          Back to suppliers
        </Link>
      }
    >
      <section className="card">
        <dl className="detail-grid">
          <Field label="Company name" value={supplier.companyName} />
          <Field label="VAT ID" value={supplier.vatId} />
          <Field label="Country" value={getCountryName(supplier.country)} />
          <Field label="Contact email" value={supplier.contactEmail} />
          <div className="detail-field">
            <dt>Status</dt>
            <dd>
              <StatusBadge status={supplier.status} />
            </dd>
          </div>
          <Field label="Created by" value={getUserName(supplier.createdBy)} />
          <Field label="Created at" value={formatDate(supplier.createdAt)} />
          {supplier.approvedBy ? (
            <Field label="Approved by" value={getUserName(supplier.approvedBy)} />
          ) : null}
          {supplier.rejectedBy ? (
            <Field label="Rejected by" value={getUserName(supplier.rejectedBy)} />
          ) : null}
        </dl>
        {supplier.status === "REJECTED" && supplier.rejectionReason ? (
          <div className="rejection-reason">
            <h2>Rejection reason</h2>
            <p>{supplier.rejectionReason}</p>
          </div>
        ) : null}
      </section>

      {canSubmit || canReview ? (
        <section className="card">
          <h2>Actions</h2>
          {canSubmit ? (
            <button
              className="button"
              type="button"
              disabled={busy}
              onClick={() => {
                void actions.submit(supplier.id);
              }}
            >
              {actions.pendingAction === "submit"
                ? "Submitting..."
                : "Submit for approval"}
            </button>
          ) : null}

          {canReview ? (
            <div className="review-actions">
              {selfBlocked ? (
                <p className="banner banner--warning" role="status">
                  You cannot approve or reject a supplier you created.
                </p>
              ) : null}
              <div className="action-row">
                <button
                  className="button"
                  type="button"
                  disabled={busy || selfBlocked}
                  onClick={() => {
                    void actions.approve(supplier.id);
                  }}
                >
                  {actions.pendingAction === "approve" ? "Approving..." : "Approve"}
                </button>
                <form className="reject-form" onSubmit={onReject} noValidate>
                  <label htmlFor="reason">Rejection reason</label>
                  <input
                    id="reason"
                    disabled={busy || selfBlocked}
                    {...rejectForm.register("reason")}
                  />
                  <button
                    className="button button--danger"
                    type="submit"
                    disabled={busy || selfBlocked}
                  >
                    {actions.pendingAction === "reject" ? "Rejecting..." : "Reject"}
                  </button>
                  {rejectForm.formState.errors.reason ? (
                    <p className="field-error">
                      {rejectForm.formState.errors.reason.message}
                    </p>
                  ) : null}
                </form>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </PageContainer>
  );
}
