import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useParams } from "react-router-dom";
import { PageContainer } from "../../../components/layout/PageContainer";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Spinner } from "../../../components/ui/Spinner";
import { useActiveUser } from "../../../context/useActiveUser";
import { hasRole } from "../../../types/user";
import { getUserName } from "../../../data/users";
import { StatusBadge } from "../components/StatusBadge";
import { getCountryName } from "../constants";
import {
  useApproveSupplier,
  useRejectSupplier,
  useSubmitSupplier,
  useSupplier,
} from "../hooks/useSuppliers";
import {
  rejectSupplierSchema,
  type RejectSupplierValues,
} from "../schemas";
import { isSupplierServiceError, type Supplier } from "../types";
import {
  canApproveSupplier,
  canRejectSupplier,
  canSubmitSupplier,
} from "../workflow";

function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-slate-900">{value}</dd>
    </div>
  );
}

export function SupplierDetailPage() {
  const { id } = useParams();
  const { activeUser } = useActiveUser();
  const { data, isPending, isError, refetch, isFetching } = useSupplier(id);
  const submitMutation = useSubmitSupplier();
  const approveMutation = useApproveSupplier();
  const rejectMutation = useRejectSupplier();

  const rejectForm = useForm<RejectSupplierValues>({
    resolver: zodResolver(rejectSupplierSchema),
    defaultValues: { reason: "" },
  });

  if (isPending) {
    return (
      <PageContainer title="Supplier">
        <Spinner label="Loading suppliers..." />
      </PageContainer>
    );
  }

  if (isError || !data) {
    return (
      <PageContainer title="Supplier">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p>Unable to load suppliers.</p>
          <Button
            variant="secondary"
            className="mt-3"
            pending={isFetching}
            onClick={() => {
              void refetch();
            }}
          >
            Try again
          </Button>
        </div>
      </PageContainer>
    );
  }

  const supplier = data;
  const submitDecision = canSubmitSupplier(supplier, activeUser);
  const approveDecision = canApproveSupplier(supplier, activeUser);
  const rejectDecision = canRejectSupplier(supplier, activeUser);
  const isApprover = hasRole(activeUser, "APPROVER");
  const showSubmit = supplier.status === "DRAFT" && submitDecision.allowed;
  const showApprovalActions =
    supplier.status === "PENDING_APPROVAL" && isApprover;
  const showWorkflowActions = showSubmit || showApprovalActions;

  const handleSubmitForApproval = async () => {
    try {
      await submitMutation.mutateAsync(supplier.id);
    } catch {
      // Error toast is shown from the mutation hook.
    }
  };

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync(supplier.id);
    } catch {
      // Error toast is shown from the mutation hook.
    }
  };

  const handleReject = rejectForm.handleSubmit(async (values) => {
    try {
      await rejectMutation.mutateAsync({
        id: supplier.id,
        reason: values.reason,
      });
    } catch (error) {
      if (isSupplierServiceError(error) && error.code === "VALIDATION") {
        rejectForm.setError("reason", {
          type: "manual",
          message: error.message,
        });
      }
    }
  });

  return (
    <PageContainer
      title={supplier.companyName}
      description="Supplier details and approval actions."
      actions={
        <Link
          to="/suppliers"
          className="text-sm text-slate-600 underline-offset-2 hover:underline"
        >
          Back to suppliers
        </Link>
      }
    >
      <div className="space-y-6">
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <dl className="grid gap-4 sm:grid-cols-2">
            <Field label="Company name" value={supplier.companyName} />
            <Field label="VAT ID" value={supplier.vatId} />
            <Field label="Country" value={getCountryName(supplier.country)} />
            <Field label="Contact email" value={supplier.contactEmail} />
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Status
              </dt>
              <dd className="mt-1">
                <StatusBadge status={supplier.status} />
              </dd>
            </div>
            <Field label="Created by" value={getUserName(supplier.createdBy)} />
            <Field label="Created at" value={formatDate(supplier.createdAt)} />
            {supplier.approvedBy ? (
              <Field
                label="Approved by"
                value={getUserName(supplier.approvedBy)}
              />
            ) : null}
            {supplier.rejectedBy ? (
              <Field
                label="Rejected by"
                value={getUserName(supplier.rejectedBy)}
              />
            ) : null}
          </dl>

          {supplier.status === "REJECTED" && supplier.rejectionReason ? (
            <div className="mt-4 border-t border-slate-200 pt-4">
              <h2 className="text-sm font-medium text-slate-900">
                Rejection reason
              </h2>
              <p className="mt-1 text-sm text-slate-700">
                {supplier.rejectionReason}
              </p>
            </div>
          ) : null}
        </section>

        {showWorkflowActions ? (
          <SupplierActions
            supplier={supplier}
            submitDecision={submitDecision}
            approveDecision={approveDecision}
            rejectDecision={rejectDecision}
            submitPending={submitMutation.isPending}
            approvePending={approveMutation.isPending}
            rejectPending={rejectMutation.isPending}
            rejectForm={rejectForm}
            onSubmit={handleSubmitForApproval}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        ) : null}
      </div>
    </PageContainer>
  );
}

interface Decision {
  allowed: boolean;
  reason?: string;
}

function SupplierActions({
  supplier,
  submitDecision,
  approveDecision,
  rejectDecision,
  submitPending,
  approvePending,
  rejectPending,
  rejectForm,
  onSubmit,
  onApprove,
  onReject,
}: {
  supplier: Supplier;
  submitDecision: Decision;
  approveDecision: Decision;
  rejectDecision: Decision;
  submitPending: boolean;
  approvePending: boolean;
  rejectPending: boolean;
  rejectForm: ReturnType<typeof useForm<RejectSupplierValues>>;
  onSubmit: () => Promise<void>;
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
}) {
  const isSelfApprovalBlocked =
    approveDecision.reason === "You cannot approve a supplier you created." ||
    rejectDecision.reason === "You cannot reject a supplier you created.";

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-900">Actions</h2>

      {supplier.status === "DRAFT" && submitDecision.allowed ? (
        <div className="mt-3">
          <Button
            pending={submitPending}
            onClick={() => {
              void onSubmit();
            }}
          >
            {submitPending ? "Submitting..." : "Submit for approval"}
          </Button>
        </div>
      ) : null}

      {supplier.status === "PENDING_APPROVAL" ? (
        <div className="mt-4 space-y-3">
          {isSelfApprovalBlocked ? (
            <p
              className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950"
              role="status"
            >
              You cannot approve or reject a supplier you created.
            </p>
          ) : null}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Button
              pending={approvePending}
              disabled={!approveDecision.allowed || rejectPending}
              onClick={() => {
                void onApprove();
              }}
            >
              {approvePending ? "Approving..." : "Approve"}
            </Button>
            {!approveDecision.allowed && approveDecision.reason ? (
              <p className="mt-2 max-w-xs text-sm text-slate-600">
                {approveDecision.reason}
              </p>
            ) : null}
          </div>

          <form
            onSubmit={onReject}
            className="flex w-full flex-col gap-2 sm:flex-row sm:items-start lg:max-w-xl"
            noValidate
          >
            <div className="min-w-0 flex-1">
              <Input
                label="Rejection reason"
                error={rejectForm.formState.errors.reason?.message}
                disabled={!rejectDecision.allowed}
                {...rejectForm.register("reason")}
              />
              {!rejectDecision.allowed && rejectDecision.reason ? (
                <p className="mt-2 text-sm text-slate-600">
                  {rejectDecision.reason}
                </p>
              ) : null}
            </div>
            <Button
              type="submit"
              variant="danger"
              className="sm:mt-6"
              pending={rejectPending}
              disabled={!rejectDecision.allowed || approvePending}
            >
              {rejectPending ? "Rejecting..." : "Reject"}
            </Button>
          </form>
        </div>
        </div>
      ) : null}
    </section>
  );
}
