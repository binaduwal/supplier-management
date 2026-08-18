import { Link } from "react-router-dom";
import { getUserName } from "../../../data/users";
import type { Supplier } from "../../../types/supplier";
import { getCountryName } from "../constants";
import { StatusBadge } from "./StatusBadge";

export function SupplierTable({ suppliers }: { suppliers: Supplier[] }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Company name</th>
            <th>Country</th>
            <th>VAT ID</th>
            <th>Created by</th>
            <th>Status</th>
            <th className="col-action">Action</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.length === 0 ? (
            <tr>
              <td className="table-empty" colSpan={6}>
                No suppliers yet.
              </td>
            </tr>
          ) : (
            suppliers.map((supplier) => (
            <tr key={supplier.id}>
              <td className="cell-company">{supplier.companyName}</td>
              <td>{getCountryName(supplier.country)}</td>
              <td className="cell-vat">{supplier.vatId}</td>
              <td>{getUserName(supplier.createdBy)}</td>
              <td>
                <StatusBadge status={supplier.status} />
              </td>
              <td className="col-action">
                <span className="tooltip">
                  <Link
                    className="icon-button"
                    to={`/suppliers/${supplier.id}`}
                    aria-label={`View ${supplier.companyName}`}
                  >
                    <svg
                      className="icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </Link>
                  <span className="tooltip__text" role="tooltip">
                    View details
                  </span>
                </span>
              </td>
            </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
