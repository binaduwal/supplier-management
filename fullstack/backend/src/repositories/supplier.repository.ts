import type { Prisma, Supplier, SupplierStatus } from "../../generated/prisma/client.js";
import { prisma } from "../db/prisma.js";

export type SupplierCreateData = {
  companyName: string;
  vatId: string;
  country: string;
  contactEmail: string;
  status: SupplierStatus;
  createdBy: string;
};

export type SupplierUpdateData = Prisma.SupplierUpdateInput;

export class SupplierRepository {
  findMany(): Promise<Supplier[]> {
    return prisma.supplier.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  findById(id: string): Promise<Supplier | null> {
    return prisma.supplier.findUnique({ where: { id } });
  }

  create(data: SupplierCreateData): Promise<Supplier> {
    return prisma.supplier.create({ data });
  }

  update(id: string, data: SupplierUpdateData): Promise<Supplier> {
    return prisma.supplier.update({ where: { id }, data });
  }
}

export const supplierRepository = new SupplierRepository();
