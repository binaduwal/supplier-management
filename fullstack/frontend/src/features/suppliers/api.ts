import { http } from "../../api/http";
import type { Supplier } from "../../types/supplier";
import type { CreateSupplierValues } from "./schemas";

interface Envelope<T> {
  data: T;
}

export async function listSuppliers(): Promise<Supplier[]> {
  const response = await http.get<Envelope<Supplier[]>>("/suppliers");
  return response.data.data;
}

export async function getSupplier(id: string): Promise<Supplier> {
  const response = await http.get<Envelope<Supplier>>(`/suppliers/${id}`);
  return response.data.data;
}

export async function createSupplier(
  values: CreateSupplierValues,
): Promise<Supplier> {
  const response = await http.post<Envelope<Supplier>>("/suppliers", values);
  return response.data.data;
}

export async function submitSupplier(id: string): Promise<Supplier> {
  const response = await http.post<Envelope<Supplier>>(`/suppliers/${id}/submit`);
  return response.data.data;
}

export async function approveSupplier(id: string): Promise<Supplier> {
  const response = await http.post<Envelope<Supplier>>(
    `/suppliers/${id}/approve`,
  );
  return response.data.data;
}

export async function rejectSupplier(
  id: string,
  reason: string,
): Promise<Supplier> {
  const response = await http.post<Envelope<Supplier>>(
    `/suppliers/${id}/reject`,
    { reason },
  );
  return response.data.data;
}
