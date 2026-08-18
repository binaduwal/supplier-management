import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { isApiError } from "../../../api/http";
import { Select } from "../../../components/ui/Select";
import { COUNTRIES } from "../constants";
import {
  createSupplierSchema,
  type CreateSupplierValues,
} from "../schemas";

interface SupplierFormProps {
  open: boolean;
  pending: boolean;
  onClose: () => void;
  onCreate: (values: CreateSupplierValues) => Promise<unknown>;
}

export function SupplierForm({
  open,
  pending,
  onClose,
  onCreate,
}: SupplierFormProps) {
  const titleId = "create-supplier-title";
  const dialogRef = useRef<HTMLDivElement>(null);
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
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
      if (event.key === "Escape" && !pending) {
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, pending]);

  if (!open) {
    return null;
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      await onCreate(values);
      reset();
      onClose();
    } catch (error) {
      if (isApiError(error) && error.code === "VAT_ID_ALREADY_EXISTS") {
        setError("vatId", { type: "server", message: error.message });
        return;
      }
      if (isApiError(error) && error.details) {
        for (const detail of error.details) {
          if (
            detail.field === "companyName" ||
            detail.field === "vatId" ||
            detail.field === "country" ||
            detail.field === "contactEmail"
          ) {
            setError(detail.field, { type: "server", message: detail.message });
          }
        }
      }
    }
  });

  return (
    <div
      className="modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget && !pending) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className="modal__header">
          <div>
            <h2 id={titleId}>Create supplier</h2>
            <p className="muted">
              New suppliers start as drafts and can be submitted for approval
              later.
            </p>
          </div>
          <button
            className="icon-button"
            type="button"
            aria-label="Close"
            disabled={pending}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form className="form-grid" onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="companyName">Company name</label>
            <input
              id="companyName"
              autoComplete="organization"
              {...register("companyName")}
            />
            {errors.companyName ? (
              <p className="field-error">{errors.companyName.message}</p>
            ) : null}
          </div>
          <div className="field">
            <label htmlFor="vatId">VAT ID</label>
            <input id="vatId" {...register("vatId")} />
            {errors.vatId ? <p className="field-error">{errors.vatId.message}</p> : null}
          </div>
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
          <div className="field">
            <label htmlFor="contactEmail">Contact email</label>
            <input
              id="contactEmail"
              type="email"
              autoComplete="email"
              {...register("contactEmail")}
            />
            {errors.contactEmail ? (
              <p className="field-error">{errors.contactEmail.message}</p>
            ) : null}
          </div>
          <div className="modal__actions form-grid__full">
            <button className="button" type="submit" disabled={pending}>
              {pending ? "Creating..." : "Create supplier"}
            </button>
            <button
              className="button button--secondary"
              type="button"
              disabled={pending}
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
