import type { Supplier } from "../types";

const STORAGE_KEY = "supplier-management.suppliers";

const SEED_SUPPLIERS: Supplier[] = [
  {
    id: "sup-mueller",
    companyName: "Müller Industrietechnik GmbH",
    vatId: "DE123456789",
    country: "DE",
    contactEmail: "einkauf@mueller-industrie.de",
    status: "DRAFT",
    createdBy: "anna",
    createdAt: "2026-07-14T09:20:00.000Z",
  },
  {
    id: "sup-nordlicht",
    companyName: "Nordlicht Logistics GmbH",
    vatId: "DE291847563",
    country: "DE",
    contactEmail: "contracts@nordlicht-logistics.de",
    status: "PENDING_APPROVAL",
    createdBy: "anna",
    createdAt: "2026-07-28T11:05:00.000Z",
  },
  {
    id: "sup-rheinwerk",
    companyName: "Rheinwerk Components AG",
    vatId: "DE564738291",
    country: "DE",
    contactEmail: "supplier@rheinwerk-components.de",
    status: "PENDING_APPROVAL",
    createdBy: "max",
    createdAt: "2026-06-19T15:40:00.000Z",
  },
  {
    id: "sup-hanseatic",
    companyName: "Hanseatic Packaging GmbH",
    vatId: "DE109283746",
    country: "DE",
    contactEmail: "sales@hanseatic-packaging.de",
    status: "REJECTED",
    createdBy: "anna",
    createdAt: "2026-05-06T08:15:00.000Z",
    rejectedBy: "max",
    rejectionReason: "Invalid VAT ID.",
  },
  {
    id: "sup-alpenstahl",
    companyName: "Alpenstahl Werkzeuge GmbH",
    vatId: "ATU67283915",
    country: "NP",
    contactEmail: "office@alpenstahl.at",
    status: "APPROVED",
    createdBy: "anna",
    createdAt: "2026-06-03T13:50:00.000Z",
    rejectedBy: "max",
    rejectionReason:
      "Insurance certificate expired in May 2026. Please resubmit with a current policy.",
  },
];

function isSupplier(value: unknown): value is Supplier {
  if (!value || typeof value !== "object") {
    return false;
  }
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.companyName === "string" &&
    typeof item.vatId === "string" &&
    typeof item.country === "string" &&
    typeof item.contactEmail === "string" &&
    typeof item.status === "string" &&
    typeof item.createdBy === "string" &&
    typeof item.createdAt === "string"
  );
}

export function loadSuppliers(): Supplier[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) {
    saveSuppliers(SEED_SUPPLIERS);
    return SEED_SUPPLIERS.map((supplier) => ({ ...supplier }));
  }

  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed) || !parsed.every(isSupplier)) {
    throw new Error("Stored supplier data is invalid.");
  }
  return parsed;
}

export function saveSuppliers(suppliers: Supplier[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(suppliers));
}
