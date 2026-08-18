import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ActiveUserProvider } from "../../../context/ActiveUserContext.tsx";
import { loadSuppliers } from "../services/supplierStorage";
import { SupplierDetailPage } from "./SupplierDetailPage";

function renderDetail(supplierId: string, userId: string) {
  localStorage.setItem("supplier-management.activeUserId", userId);
  loadSuppliers();

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/suppliers/${supplierId}`]}>
        <ActiveUserProvider>
          <Routes>
            <Route path="/suppliers/:id" element={<SupplierDetailPage />} />
          </Routes>
        </ActiveUserProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("SupplierDetailPage", () => {
  it("prevents Anna from approving her own pending supplier", async () => {
    renderDetail("sup-nordlicht", "anna");

    expect(
      await screen.findByRole("heading", { name: "Nordlicht Logistics GmbH" }, { timeout: 2000 }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("You cannot approve or reject a supplier you created."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Reject" })).toBeDisabled();
  });

  it("lets Max approve and reject a supplier created by Anna", async () => {
    renderDetail("sup-nordlicht", "max");

    expect(
      await screen.findByRole("heading", { name: "Nordlicht Logistics GmbH" }, { timeout: 2000 }),
    ).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Approve" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Reject" })).toBeEnabled();
    expect(
      screen.queryByText("You cannot approve or reject a supplier you created."),
    ).not.toBeInTheDocument();
  });
});
