import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { COUNTRIES } from "../constants";
import { useCreateSupplier } from "../hooks/useSuppliers";
import {
  createSupplierSchema,
  type CreateSupplierValues,
} from "../schemas";
import { isSupplierServiceError } from "../types";

interface CreateSupplierDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateSupplierDialog({
  open,
  onClose,
}: CreateSupplierDialogProps) {
  const titleId = "create-supplier-title";
  const dialogRef = useRef<HTMLDivElement>(null);
  const createMutation = useCreateSupplier();

  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<CreateSupplierValues>({
    resolver: zodResolver(createSupplierSchema),
    defaultValues: {
      companyName: "",
      vatId: "",
      country: "",
      contactEmail: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !createMutation.isPending) {
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, createMutation.isPending]);

  if (!open) {
    return null;
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createMutation.mutateAsync(values);
      onClose();
    } catch (error) {
      if (isSupplierServiceError(error) && error.code === "DUPLICATE_VAT") {
        setError("vatId", { type: "manual", message: error.message });
      }
    }
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 pt-16"
      onClick={(event) => {
        if (event.target === event.currentTarget && !createMutation.isPending) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-4 shadow-lg outline-none"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-slate-900">
              Create supplier
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              New suppliers start as drafts and can be submitted for approval
              later.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            disabled={createMutation.isPending}
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-4 space-y-4" noValidate>
          <Input
            label="Company name"
            autoComplete="organization"
            error={errors.companyName?.message}
            {...register("companyName")}
          />
          <Input
            label="VAT ID"
            error={errors.vatId?.message}
            {...register("vatId")}
          />
          <Controller
            name="country"
            control={control}
            render={({ field }) => (
              <Select
                name={field.name}
                label="Country"
                placeholder="Search for a country"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.country?.message}
                options={COUNTRIES.map((country) => ({
                  value: country.code,
                  label: country.name,
                }))}
              />
            )}
          />
          <Input
            label="Contact email"
            type="email"
            autoComplete="email"
            error={errors.contactEmail?.message}
            {...register("contactEmail")}
          />

          <div className="flex items-center gap-2">
            <Button type="submit" pending={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create supplier"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={createMutation.isPending}
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
