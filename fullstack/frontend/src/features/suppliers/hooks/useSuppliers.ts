import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Supplier } from "../../../types/supplier";
import {
  approveSupplier,
  createSupplier,
  getSupplier,
  listSuppliers,
  rejectSupplier,
  submitSupplier,
} from "../api";
import type { CreateSupplierValues } from "../schemas";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong.";
}

export function useSupplierList() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const data = await listSuppliers();
      setSuppliers(data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { suppliers, loading, error, refresh };
}

export function useSupplier(id: string | undefined) {
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!id) {
      setSupplier(null);
      setLoading(false);
      setError("Supplier not found.");
      return;
    }

    setError(null);
    try {
      const data = await getSupplier(id);
      setSupplier(data);
    } catch (err) {
      setSupplier(null);
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { supplier, setSupplier, loading, error, refresh };
}

export function useSupplierActions(onSuccess?: (supplier: Supplier) => void) {
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const run = useCallback(
    async (
      action: string,
      work: () => Promise<Supplier>,
      successMessage: string,
    ) => {
      setPendingAction(action);
      try {
        const supplier = await work();
        toast.success(successMessage);
        onSuccess?.(supplier);
        return supplier;
      } catch (err) {
        toast.error(errorMessage(err));
        throw err;
      } finally {
        setPendingAction(null);
      }
    },
    [onSuccess],
  );

  return {
    pendingAction,
    create: (values: CreateSupplierValues) =>
      run("create", () => createSupplier(values), "Supplier created successfully."),
    submit: (id: string) =>
      run(
        "submit",
        () => submitSupplier(id),
        "Supplier submitted for approval.",
      ),
    approve: (id: string) =>
      run(
        "approve",
        () => approveSupplier(id),
        "Supplier approved successfully.",
      ),
    reject: (id: string, reason: string) =>
      run(
        "reject",
        () => rejectSupplier(id, reason),
        "Supplier rejected successfully.",
      ),
  };
}
