import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useActiveUser } from "../../../context/useActiveUser";
import { SUPPLIER_QUERY_KEY } from "../constants";
import type { CreateSupplierValues } from "../schemas";
import {
  approveSupplier,
  createSupplier,
  getSupplierById,
  listSuppliers,
  rejectSupplier,
  submitSupplier,
} from "../services/supplierService";
import type { Supplier } from "../types";

function toastApiError(error: unknown) {
  toast.error(
    error instanceof Error ? error.message : "Something went wrong.",
  );
}

export function useSupplierList() {
  return useQuery({
    queryKey: SUPPLIER_QUERY_KEY,
    queryFn: listSuppliers,
  });
}

export function useSupplier(id: string | undefined) {
  return useQuery({
    queryKey: [...SUPPLIER_QUERY_KEY, id],
    queryFn: () => getSupplierById(id!),
    enabled: Boolean(id),
  });
}

function useInvalidateSuppliers() {
  const queryClient = useQueryClient();

  return (supplier: Supplier) => {
    void queryClient.invalidateQueries({
      queryKey: SUPPLIER_QUERY_KEY,
      exact: true,
    });
    queryClient.setQueryData([...SUPPLIER_QUERY_KEY, supplier.id], supplier);
  };
}

export function useCreateSupplier() {
  const { activeUser } = useActiveUser();
  const invalidate = useInvalidateSuppliers();

  return useMutation({
    mutationFn: (values: CreateSupplierValues) =>
      createSupplier(values, activeUser),
    onSuccess: (supplier) => {
      invalidate(supplier);
      toast.success("Supplier created successfully.");
    },
    onError: toastApiError,
  });
}

export function useSubmitSupplier() {
  const { activeUser } = useActiveUser();
  const invalidate = useInvalidateSuppliers();

  return useMutation({
    mutationFn: (id: string) => submitSupplier(id, activeUser),
    onSuccess: (supplier) => {
      invalidate(supplier);
      toast.success("Supplier submitted for approval.");
    },
    onError: toastApiError,
  });
}

export function useApproveSupplier() {
  const { activeUser } = useActiveUser();
  const invalidate = useInvalidateSuppliers();

  return useMutation({
    mutationFn: (id: string) => approveSupplier(id, activeUser),
    onSuccess: (supplier) => {
      invalidate(supplier);
      toast.success("Supplier approved successfully.");
    },
    onError: toastApiError,
  });
}

export function useRejectSupplier() {
  const { activeUser } = useActiveUser();
  const invalidate = useInvalidateSuppliers();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectSupplier(id, reason, activeUser),
    onSuccess: (supplier) => {
      invalidate(supplier);
      toast.success("Supplier rejected successfully.");
    },
    onError: toastApiError,
  });
}
