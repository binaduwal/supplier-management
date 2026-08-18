import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ActiveUserProvider } from "../../../context/ActiveUserContext.tsx";
import { loadSuppliers } from "../services/supplierStorage";
import { CreateSupplierDialog } from "./CreateSupplierDialog";

function renderDialog(onClose = vi.fn()) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return {
    onClose,
    user: userEvent.setup(),
    ...render(
      <QueryClientProvider client={queryClient}>
        <ActiveUserProvider>
          <CreateSupplierDialog open onClose={onClose} />
        </ActiveUserProvider>
      </QueryClientProvider>,
    ),
  };
}

describe("CreateSupplierDialog", () => {
  it("stays open and shows field errors when submitted empty", async () => {
    const { user, onClose } = renderDialog();

    await user.click(screen.getByRole("button", { name: "Create supplier" }));

    expect(await screen.findByText("Company name is required.")).toBeInTheDocument();
    expect(screen.getByText("VAT ID is required.")).toBeInTheDocument();
    expect(screen.getByText("Country is required.")).toBeInTheDocument();
    expect(screen.getByText("Contact email is required.")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: "Create supplier" })).toBeInTheDocument();
  });

  it("shows a duplicate VAT error and keeps the entered values", async () => {
    loadSuppliers();
    const { user, onClose } = renderDialog();

    await user.type(screen.getByLabelText("Company name"), "Duplicate GmbH");
    await user.type(screen.getByLabelText("VAT ID"), "DE123456789");

    const country = screen.getByRole("combobox", { name: "Country" });
    await user.click(country);
    await user.type(country, "Germany");
    await user.keyboard("{Enter}");

    await user.type(screen.getByLabelText("Contact email"), "dup@example.de");
    await user.click(screen.getByRole("button", { name: "Create supplier" }));

    expect(
      await screen.findByText("A supplier with this VAT ID already exists.", undefined, {
        timeout: 2000,
      }),
    ).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Company name")).toHaveValue("Duplicate GmbH");
    expect(screen.getByLabelText("VAT ID")).toHaveValue("DE123456789");
    expect(screen.getByLabelText("Contact email")).toHaveValue("dup@example.de");
    expect(screen.getByRole("dialog", { name: "Create supplier" })).toBeInTheDocument();
  });
});
