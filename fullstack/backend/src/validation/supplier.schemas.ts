import { z } from "zod";

export const createSupplierSchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required."),
  vatId: z.string().trim().min(1, "VAT ID is required."),
  country: z.string().trim().min(1, "Country is required."),
  contactEmail: z
    .string()
    .trim()
    .min(1, "Contact email is required.")
    .pipe(z.email("Enter a valid email address.")),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;

export const rejectSupplierSchema = z.object({
  reason: z.string().trim().min(1, "A rejection reason is required."),
});
