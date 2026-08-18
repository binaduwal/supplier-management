import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { getUserName } from "../../../data/users";
import { getCountryName } from "../constants";
import type { Supplier } from "../types";
import { StatusBadge } from "./StatusBadge";

export function SupplierTable({ suppliers }: { suppliers: Supplier[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-slate-700">
          <tr>
            <th className="border-b border-slate-200 px-3 py-2 font-medium">
              Company name
            </th>
            <th className="border-b border-slate-200 px-3 py-2 font-medium">
              Country
            </th>
            <th className="border-b border-slate-200 px-3 py-2 font-medium">
              VAT ID
            </th>
            <th className="border-b border-slate-200 px-3 py-2 font-medium">
              Created by
            </th>
            <th className="border-b border-slate-200 px-3 py-2 font-medium">
              Status
            </th>
            <th className="border-b border-slate-200 px-3 py-2 pr-24 font-medium">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier) => (
            <tr key={supplier.id} className="hover:bg-slate-50">
              <td className="border-b border-slate-200 px-3 py-2 font-medium text-slate-900">
                {supplier.companyName}
              </td>
              <td className="border-b border-slate-200 px-3 py-2">
                {getCountryName(supplier.country)}
              </td>
              <td className="border-b border-slate-200 px-3 py-2 font-mono text-xs">
                {supplier.vatId}
              </td>
              <td className="border-b border-slate-200 px-3 py-2">
                {getUserName(supplier.createdBy)}
              </td>
              <td className="border-b border-slate-200 px-3 py-2">
                <StatusBadge status={supplier.status} />
              </td>
              <td className="border-b border-slate-200 px-3 py-2 pr-24">
                <span className="relative inline-flex">
                  <Link
                    to={`/suppliers/${supplier.id}`}
                    aria-label={`View ${supplier.companyName}`}
                    className="peer inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100"
                  >
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute top-1/2 left-full z-10 ml-2 -translate-y-1/2 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs whitespace-nowrap text-slate-700 opacity-0 shadow-sm peer-hover:opacity-100 peer-focus-visible:opacity-100"
                  >
                    View details
                  </span>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
