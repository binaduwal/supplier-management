# Supplier Management

Full-stack supplier intake and approval workflow. Anna creates and submits suppliers. Max approves or rejects them. There is no real login; the active user is simulated with a header selector and an `X-User-Id` request header.

```text
DRAFT → PENDING_APPROVAL → APPROVED
                         → REJECTED
```

The backend is the source of truth for every business rule.

## Architecture

```text
React UI
  → Axios (X-User-Id)
    → Express route
      → Controller
        → Service (workflow rules)
          → Repository
            → Prisma
              → SQLite
```

## Tech stack

- Frontend: React, TypeScript, Vite, Axios, React Hook Form, Zod
- Backend: Node.js, Express, TypeScript, Zod, Prisma 7, SQLite
- Tests: Node.js test runner against the real HTTP API and SQLite

## Setup

Requires Node.js 20+.

```bash
cd fullstack/backend
npm install
npx prisma generate
npx prisma migrate deploy

cd ../frontend
npm install
```

Copy `backend/.env.example` to `backend/.env` if `.env` is missing:

```env
DATABASE_URL="file:./dev.db"
PORT=3001
```

## Database

Prisma stores suppliers in a local SQLite file (`fullstack/backend/dev.db`).

```bash
cd fullstack/backend
npx prisma generate
npx prisma migrate deploy
```

VAT ID has a database unique constraint. Status is a Prisma enum: `DRAFT`, `PENDING_APPROVAL`, `APPROVED`, `REJECTED`.

## Running the apps

Terminal 1:

```bash
cd fullstack/backend
npm run dev
```

API: `http://localhost:3001`

Terminal 2:

```bash
cd fullstack/frontend
npm run dev
```

UI: `http://localhost:5173`

Vite proxies `/api` to the backend during development.

## Running tests

```bash
cd fullstack/backend
npm test
```

The suite covers the required workflow rules against HTTP endpoints and SQLite.

## API overview

All supplier endpoints require:

```http
X-User-Id: anna
```

or

```http
X-User-Id: max
```

| Method | Path | Body | Success |
| --- | --- | --- | --- |
| `GET` | `/api/suppliers` | — | `200 { data: Supplier[] }` |
| `GET` | `/api/suppliers/:id` | — | `200 { data: Supplier }` |
| `POST` | `/api/suppliers` | `{ companyName, vatId, country, contactEmail }` | `201` draft |
| `POST` | `/api/suppliers/:id/submit` | — | `200` pending approval |
| `POST` | `/api/suppliers/:id/approve` | — | `200` approved |
| `POST` | `/api/suppliers/:id/reject` | `{ reason }` | `200` rejected |

Error shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "details": [{ "field": "contactEmail", "message": "Enter a valid email address." }]
  }
}
```

| Code | HTTP |
| --- | --- |
| `VALIDATION_ERROR` | 400 |
| `REJECTION_REASON_REQUIRED` | 400 |
| `MISSING_USER` / `UNKNOWN_USER` | 400 |
| `SUPPLIER_NOT_FOUND` | 404 |
| `SELF_APPROVAL_NOT_ALLOWED` | 403 |
| `VAT_ID_ALREADY_EXISTS` | 409 |
| `INVALID_STATUS_TRANSITION` | 409 |

## User simulation

The header dropdown selects Anna (Requester) or Max (Approver). Axios sends that value as `X-User-Id`. The backend validates the header and uses it as `createdBy`, `approvedBy`, or `rejectedBy`.

- Anna can create suppliers and submit her drafts.
- Max can approve or reject suppliers that are pending approval, except ones he created.

## Assumptions

- Only `anna` and `max` are valid users.
- Roles are a UI convenience. The backend allows either user to create a supplier, and blocks approve/reject only for invalid status or self-approval.
- VAT IDs are trimmed and stored uppercase, so uniqueness is case-insensitive.
- The client cannot set `status`, `createdBy`, `approvedBy`, `rejectedBy`, or `rejectionReason`.
- Country is a short selectable list in the UI and a required string on the API.

## Limitations

- No real authentication or authorization product
- No edit or delete
- No search, sort, or pagination
- SQLite file database, not shared across machines
- No audit log beyond the fields on the supplier row

## Production improvements

- Replace the user header with real authentication and RBAC
- Move from SQLite to Postgres
- Add optimistic locking around status transitions
- Add an audit table for workflow events
- Share Zod types between frontend and backend
- Add structured logging, rate limiting, and HTTPS termination
