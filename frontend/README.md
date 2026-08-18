# Supplier Management

React + TypeScript frontend for creating suppliers and moving them through approval.

```text
DRAFT → PENDING_APPROVAL → APPROVED
                         → REJECTED
```

No backend is included. Data is stored in the browser.

## Starting the application

Requires Node.js and npm.

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

Use the header dropdown to switch between Anna (requester and approver) and Max (approver).

## Running the tests

```bash
cd frontend
npm test
```

## State management and component approach

**State**

- React Query loads suppliers and handles loading, error, retry, and cache updates after create, submit, approve, and reject.
- React context stores the active user.
- React Hook Form and Zod handle create and reject forms.

**Components**

- `src/components` — layout and reusable form controls
- `src/features/suppliers` — pages, table, create dialog, hooks, and services

The UI calls hooks. Hooks call `supplierService`. The service applies rules from `workflow.ts`, then reads or writes `localStorage`. Pages do not touch storage.

## Known limitations

- No real API or login
- Suppliers cannot be edited or deleted
- The list has no search, sort, or pagination
- Seed data is created only when `localStorage` is empty. Clear `supplier-management.suppliers` to restore it.

## Assumptions

- Both users can create a supplier and submit their own drafts.
- Anna has approval permissions so the self-approval rule can be shown in the UI.
- The creator cannot approve or reject their own supplier. The service enforces this, not only the UI.
- VAT IDs must be unique after trimming. Comparison is case-insensitive.
- Form fields are trimmed before validation. A rejection reason is required.
