import { useState } from "react";
import { PageContainer } from "../../../components/layout/PageContainer";
import { Button } from "../../../components/ui/Button";
import { Spinner } from "../../../components/ui/Spinner";
import { useActiveUser } from "../../../context/useActiveUser";
import { CreateSupplierDialog } from "../components/CreateSupplierDialog";
import { SupplierTable } from "../components/SupplierTable";
import { useSupplierList } from "../hooks/useSuppliers";
import { canCreateSupplier } from "../workflow";

export function SupplierListPage() {
  const { activeUser } = useActiveUser();
  const { data, isPending, isError, refetch, isFetching } = useSupplierList();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const canCreate = canCreateSupplier(activeUser).allowed;

  return (
    <PageContainer
      title="Suppliers"
      description="Review supplier records and their approval status."
      actions={
        canCreate ? (
          <Button onClick={() => setIsCreateOpen(true)}>Create supplier</Button>
        ) : null
      }
    >
      {isPending ? (
        <Spinner label="Loading suppliers..." />
      ) : isError ? (
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
      ) : data.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-6 text-sm text-slate-700">
          <p>No suppliers yet.</p>
          {canCreate ? (
            <Button
              variant="secondary"
              className="mt-3"
              onClick={() => setIsCreateOpen(true)}
            >
              Create supplier
            </Button>
          ) : null}
        </div>
      ) : (
        <SupplierTable suppliers={data} />
      )}

      {canCreate ? (
        <CreateSupplierDialog
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
        />
      ) : null}
    </PageContainer>
  );
}
