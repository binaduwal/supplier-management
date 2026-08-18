import { useState } from "react";
import { PageContainer } from "../../../components/layout/PageContainer";
import { useActiveUser } from "../../../context/useActiveUser";
import { SupplierForm } from "../components/SupplierForm";
import { SupplierTable } from "../components/SupplierTable";
import { useSupplierActions, useSupplierList } from "../hooks/useSuppliers";

export function SupplierListPage() {
  const { activeUser } = useActiveUser();
  const { suppliers, loading, error, refresh } = useSupplierList();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const actions = useSupplierActions(async () => {
    await refresh();
  });
  const canCreate = activeUser.role === "REQUESTER";

  return (
    <PageContainer
      title="Suppliers"
      description="Review supplier records and their approval status."
      actions={
        canCreate ? (
          <button className="button" type="button" onClick={() => setIsCreateOpen(true)}>
            Create supplier
          </button>
        ) : null
      }
    >
      {loading ? (
        <p className="muted">Loading suppliers...</p>
      ) : error ? (
        <div className="banner banner--error" role="alert">
          <p>{error}</p>
          <button className="button button--secondary" type="button" onClick={() => void refresh()}>
            Try again
          </button>
        </div>
      ) : (
        <SupplierTable suppliers={suppliers} />
      )}

      {canCreate ? (
        <SupplierForm
          open={isCreateOpen}
          pending={actions.pendingAction === "create"}
          onClose={() => setIsCreateOpen(false)}
          onCreate={actions.create}
        />
      ) : null}
    </PageContainer>
  );
}
