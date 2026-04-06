# Finance Dashboard API

A RESTful backend for a Finance Dashboard built with **Node.js**, **Express**, and **MongoDB (Mongoose)**. Features JWT authentication, role-based access control, financial record management, aggregated analytics, and centralized error handling.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JSON Web Tokens (JWT) |
| Validation | express-validator |
| Security | Helmet, CORS, Rate Limiting |

---

## Project Structure

```
zorvyn/
├── src/
│   ├── config/         # Database connection
│   ├── controllers/    # HTTP layer — reads request, calls service, sends response
│   ├── services/       # Business logic — all rules and data operations live here
│   ├── models/         # Mongoose schemas with validation and indexes
│   ├── routes/         # Express routers with per-route validation chains
│   ├── middleware/     # JWT auth, role guards, validation error handler
│   └── utils/          # ApiError, ApiResponse, asyncHandler
├── scripts/
│   └── seed.js         # Populates DB with sample users and records
├── server.js           # Entry point
└── .env.example        # Environment variable template
```

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set your values:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/finance_dashboard
JWT_SECRET=your_strong_secret_here
JWT_EXPIRES_IN=7d
```

Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Seed sample data (recommended)

```bash
npm run seed
```

Creates 3 users and 20 financial records across 4 months.

| Role | Email | Password |
|------|-------|----------|
| admin | admin@finance.dev | Admin@1234 |
| analyst | analyst@finance.dev | Analyst@1234 |
| viewer | viewer@finance.dev | Viewer@1234 |

### 4. Start the server

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

Server runs at `http://localhost:5000/api`.

---

## API Reference

### Base URL: `http://localhost:5000/api`

All protected routes require:
```
Authorization: Bearer <token>
```

---

### Auth

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/register` | Public | Create account |
| POST | `/auth/login` | Public | Login, returns JWT |
| GET | `/auth/me` | Authenticated | Current user profile |

**Register**
```json
POST /auth/register
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "pass1234",
  "role": "viewer"
}
```

**Login response**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful.",
  "data": {
    "user": { "_id": "...", "name": "Jane Smith", "role": "viewer" },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### Records

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/records` | All roles | List records (filtered, paginated) |
| GET | `/records/:id` | All roles | Get one record |
| POST | `/records` | Admin | Create record |
| PUT | `/records/:id` | Admin | Update record |
| DELETE | `/records/:id` | Admin | Soft delete |

**Query parameters for GET `/records`:**

| Param | Type | Example |
|-------|------|---------|
| `type` | `income` \| `expense` | `?type=income` |
| `category` | string (partial match) | `?category=rent` |
| `startDate` | ISO date | `?startDate=2025-01-01` |
| `endDate` | ISO date | `?endDate=2025-03-31` |
| `page` | number | `?page=2` |
| `limit` | number (max 100) | `?limit=5` |

**Paginated response:**
```json
{
  "success": true,
  "data": {
    "records": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalRecords": 20,
      "totalPages": 2
    }
  }
}
```

**Create record:**
```json
POST /records
{
  "amount": 75000,
  "type": "income",
  "category": "Salary",
  "date": "2025-05-01",
  "note": "May salary"
}
```

---

### Dashboard

All dashboard routes require **analyst** or **admin** role.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Full combined response (all metrics) |
| GET | `/dashboard/summary` | Total income, expense, net balance |
| GET | `/dashboard/categories` | Breakdown by category and type |
| GET | `/dashboard/recent` | Recent transactions (`?limit=10`) |
| GET | `/dashboard/trends` | Monthly income/expense trend |

**GET `/dashboard` response:**
```json
{
  "success": true,
  "data": {
    "totalIncome": 360500,
    "totalExpense": 109900,
    "netBalance": 250600,
    "categoryBreakdown": [
      { "category": "Salary", "type": "income", "total": 340000 },
      { "category": "Rent",   "type": "expense", "total": 72000 }
    ],
    "recentTransactions": [ ... ],
    "monthlyTrends": [
      { "year": 2025, "month": 1, "type": "income",  "total": 97000 },
      { "year": 2025, "month": 1, "type": "expense", "total": 26200 }
    ]
  }
}
```

---

### Users (Admin only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List all users (paginated) |
| GET | `/users/:id` | Get user by ID |
| PATCH | `/users/:id` | Update name, role, or isActive |
| DELETE | `/users/:id` | Soft delete |

---

## Role Matrix

| Action | Viewer | Analyst | Admin |
|--------|--------|---------|-------|
| View own records | Yes | — | — |
| View all records | No | Yes | Yes |
| Create / Update / Delete records | No | No | Yes |
| View dashboard analytics | No | Yes | Yes |
| Manage users | No | No | Yes |

---

## Error Response Format

All errors follow a consistent shape:

```json
{
  "success": false,
  "statusCode": 422,
  "message": "Validation failed",
  "errors": [
    { "field": "amount", "message": "Amount must be greater than 0" },
    { "field": "date",   "message": "Date cannot be in the future" }
  ]
}
```

| Code | Meaning |
|------|---------|
| 400 | Bad request |
| 401 | Missing or invalid token |
| 403 | Insufficient role |
| 404 | Resource not found |
| 409 | Conflict (duplicate email) |
| 422 | Validation failed |
| 500 | Unexpected server error |

---

## Assumptions

- **Analyst role is read-only across all records.** Analysts exist to analyze system-wide data. Since only admins create records, scoping analysts to their own records would produce empty dashboards — defeating the purpose of the role. Analysts can view all records and dashboard data but cannot modify anything.

- **Viewers see only their own records.** Viewers are end-users who can track their own transactions. As records are created by admins, a viewer would typically see records explicitly assigned to (created by) them. A freshly registered viewer with no admin-created records assigned to them will receive an empty list — this is expected behavior, not a bug.

- **Only admins create records.** In this system, financial records are managed centrally by admins. This keeps data integrity and auditability centralized. A future version could allow users to submit records for admin approval.

- **Any role can be self-assigned at registration.** The `/auth/register` endpoint accepts an optional `role` field. In a real production system this would be locked down so that self-registering users always receive the `viewer` role, with admins elevating roles manually. For this assessment, open role selection is left in place to make testing all three role behaviors straightforward without requiring an extra admin step.

- **Dashboard aggregations are all-time (no default date range).** Summary, category breakdown, and trend endpoints aggregate across the entire record history. Date-range filtering can be added to each pipeline with a `$match` stage if scoped analytics are needed.

- **Role changes on a live token take effect at the next login.** Because JWTs are stateless, a token issued before a role change still carries the old role until it expires. The fix — a token blocklist or short-lived access tokens — is documented in the Tradeoffs section. For this scope, the gap is accepted.

- **No password change or reset endpoint.** Users cannot update their own password after registration. An admin can soft-delete and re-create an account as a workaround. A `/auth/change-password` route can be added trivially using the existing `bcrypt.hash` pattern.

- **Soft delete is used instead of hard delete.** Records and users are never physically removed. `deletedAt` is set to the current timestamp and all queries include `{ deletedAt: null }`. This preserves audit history.

- **JWT authentication without refresh tokens.** Tokens are stateless and expire after 7 days (configurable). Refresh token support is not implemented but can be added by introducing a token store.

- **No email verification.** Accounts are active immediately on registration. This is a simplification appropriate for an internal finance tool with controlled user creation.

- **`createdBy` represents the admin who entered the record, not a financial owner.** In a multi-user ledger context these could be different fields. Here they are the same, meaning a viewer only sees records that an admin explicitly created while logged in as that viewer — which is why the seed script creates records under each user's ID for demonstration purposes.

---

## Tradeoffs

### Soft delete vs. hard delete
Soft delete preserves audit history and allows data recovery, at the cost of more complex queries (every query must include `{ deletedAt: null }`). Given that financial records should maintain historical integrity, soft delete is the right choice here.

### Stateless JWT vs. sessions
JWTs are stateless — no server-side session store is needed, which scales well. The tradeoff is that a token cannot be invalidated before it expires (e.g., on logout or role change). For a production system, a token blocklist or short-lived access tokens with refresh tokens would be preferred.

### Admin-only record creation
Centralizing record creation under the admin role ensures data integrity and a single source of truth. The tradeoff is reduced flexibility for multi-user entry scenarios. This can be extended by adding a record submission/approval flow.

### Combined dashboard endpoint
`GET /dashboard` runs four aggregation pipelines in parallel via `Promise.all`. This provides a great developer experience (one request for all data) but is heavier than calling sub-endpoints selectively. For high-traffic systems, each sub-endpoint can be called independently and cached.

### express-validator over Joi/Zod
`express-validator` integrates cleanly with existing Express middleware chains and keeps validation co-located with route definitions. The tradeoff vs. Zod or Joi is slightly more verbose validation rules, but the explicit middleware pattern improves readability for reviewers.

---

## Design Decisions

### Service layer pattern
All business logic lives in `services/`. Controllers only handle HTTP concerns (reading `req`, calling the service, writing `res`). This makes services independently testable and prevents business logic from leaking into route handlers.

### Ownership isolation in one place
`buildBaseFilter()` in `record.service.js` is the single function that applies the viewer vs. analyst vs. admin data scope rule. There is exactly one place to update if the policy changes.

### MongoDB aggregation pipelines
Dashboard analytics use native aggregation pipelines instead of loading documents into memory and processing in JavaScript. This keeps analytics fast even as the dataset grows.

### Compound indexes
```js
recordSchema.index({ createdBy: 1, date: -1 });  // viewer queries — own records sorted by date
recordSchema.index({ type: 1, category: 1 });     // filtered list queries
recordSchema.index({ deletedAt: 1 });              // soft-delete exclusion
```

### Centralized error handling
A single error handler in `app.js` catches all errors. `ApiError` marks known operational errors (shown to users). Unexpected errors are logged server-side and hidden from the response.

---

## Testing

1. Run `npm run seed` to populate data
2. Use [Postman](https://www.postman.com/) or any HTTP client (e.g. `curl`, Insomnia)
3. `POST /api/auth/login` with the seeded credentials to get a JWT token
4. Add the token as `Authorization: Bearer <token>` on subsequent requests
