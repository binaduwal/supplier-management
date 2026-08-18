import { describe, expect, it } from "vitest";
import { createSupplierSchema, rejectSupplierSchema } from "./schemas";

describe("createSupplierSchema", () => {
  it("rejects empty required fields", () => {
    const result = createSupplierSchema.safeParse({
      companyName: "  ",
      vatId: "",
      country: "",
      contactEmail: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages).toContain("Company name is required.");
      expect(messages).toContain("VAT ID is required.");
      expect(messages).toContain("Country is required.");
      expect(messages).toContain("Contact email is required.");
    }
  });

  it("rejects an invalid email", () => {
    const result = createSupplierSchema.safeParse({
      companyName: "Nordlicht Logistics GmbH",
      vatId: "DE111222333",
      country: "DE",
      contactEmail: "not-an-email",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes("contactEmail"))).toBe(
        true,
      );
    }
  });

  it("trims values on success", () => {
    const result = createSupplierSchema.safeParse({
      companyName: "  Nordlicht Logistics GmbH  ",
      vatId: "  DE111222333  ",
      country: " DE ",
      contactEmail: "  contracts@nordlicht-logistics.de  ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        companyName: "Nordlicht Logistics GmbH",
        vatId: "DE111222333",
        country: "DE",
        contactEmail: "contracts@nordlicht-logistics.de",
      });
    }
  });
});

describe("rejectSupplierSchema", () => {
  it("rejects a whitespace-only reason", () => {
    const result = rejectSupplierSchema.safeParse({ reason: "   " });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "A rejection reason is required.",
      );
    }
  });

  it("accepts a trimmed reason", () => {
    const result = rejectSupplierSchema.safeParse({
      reason: "  Missing insurance certificate  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.reason).toBe("Missing insurance certificate");
    }
  });
});
