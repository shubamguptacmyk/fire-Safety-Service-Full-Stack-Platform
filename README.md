# AK Fire Safety Service — Full-Stack Platform

A fire-safety products & services platform for an Indian company (Navi Mumbai): e-commerce for
extinguishers/cylinders/hydrant & suppression systems/detectors/alarm panels, plus B2B quoting,
AMC contracts, service booking, technician management, and an automatic refill/AMC reminder engine.

**Stack:** React + Vite + TypeScript (customer PWA) · React + Vite + TypeScript (admin dashboard) ·
Node.js + Express + TypeScript · MongoDB + Mongoose · JWT auth with RBAC · Cloudinary · Nodemailer ·
node-cron. No Next.js, no PostgreSQL, no required Redis.

## Current status: Phase 4 of 6 complete

This repository is being built in the phased order below, verified at each step rather than generated
as one unreviewable block. **Phases 1, 2, 3, and 4 are fully working, verified real code — not placeholders:**

### Phase 1: Core Foundation & Auth
- ✅ Full monorepo structure (`client/`, `admin/`, `server/`)
- ✅ MongoDB connection + validated environment config (fails fast on missing/bad env vars)
- ✅ `User`, `RefreshToken`, `AuditLog`, `Address` Mongoose models
- ✅ JWT auth: register, login, refresh (with rotation + revocation), logout, logout-all-devices
- ✅ Full RBAC: 6 roles (`super_admin`, `admin`, `sales`, `technician`, `accountant`, `customer`),
  granular permission strings, enforced **only** server-side via `requirePermission()` middleware
- ✅ Security middleware: Helmet, CORS, rate limiting, Mongo query sanitization, error handler, Zod
- ✅ Consistent `{ success, message, data, meta }` / `{ success, message, errors }` API envelope
- ✅ Customer & Admin base routing shells and Jest test suite

### Phase 2: Product Catalog, Search, Categories & Admin Management
- ✅ `Category` model with slug, subcategories, sort order, and active flags
- ✅ `Product` model with rich fire safety schema (SKU, brand, price, discount, capacity, fire class, weight, ISI certifications, specs table, features list, image gallery, datasheet PDF link)
- ✅ High-performance MongoDB text search index and compound indexes
- ✅ Category CRUD API (`/api/categories`) with staff permission checks (`categories.manage`)
- ✅ Product catalog API (`/api/products`) with text search, multi-criteria filters (category, brand, fireClass, price range, inStock), sorting, and pagination metadata
- ✅ Product detail API (`/api/products/slug/:slug`) returning product info and related products
- ✅ Low-stock inventory endpoint (`/api/products/admin/low-stock`) and quick stock patch API
- ✅ File & media upload API (`/api/upload/image`, `/api/upload/document`) supporting Cloudinary with seamless local disk fallback for zero-dependency development
- ✅ Customer frontend:
  - Responsive catalog page (`/products` & `/products/:category`) with sidebar filter drawer, sort options, and pagination
  - Product detail page (`/product/:slug`) with image gallery, specs table, features, certifications, and Add to Cart / Request Quote buttons
  - Dedicated search results page (`/search`) and debounced autocomplete search in header
  - Dynamic homepage featuring categories, best sellers, and featured products
- ✅ Admin dashboard:
  - Dedicated Catalog page (`/catalog`) with Products table, Categories manager, and Low Stock inventory alerts
  - Full `ProductModal` with tabbed editing, image upload, specs builder, and status flags
  - `CategoryModal` with subcategories manager
  - Quick `StockModal` for on-the-fly inventory adjustments
- ✅ Realistic database seeder with 8 categories and 12 ISI-certified fire safety products

### Phase 3: Full Commerce Engine, B2B Quotations & GST Invoicing
- ✅ `Order`, `Quote`, `Invoice`, `Payment`, `Cart`, and `Wishlist` Mongoose models
- ✅ End-to-end atomic order placement (`/api/orders`) with live stock verification, atomic inventory decrements, and automated restock on cancellation
- ✅ Statutory 18% GST tax calculation with CGST (9%) / SGST (9%) or IGST (18%) and automated `Invoice` document generation
- ✅ PDFKit generation engine ([pdf.service.ts](file:///C:/Aman/fire-safety-platform-2/server/src/services/pdf.service.ts)) streaming professional GST Tax Invoices and Commercial B2B Quotations
- ✅ B2B Quotations API (`/api/quotes`) supporting multi-item RFQs, 30-day price validity locks, admin pricing updates, and one-click quote-to-order conversion
- ✅ Persistent user cart (`/api/cart`) with stock boundary enforcement and guest-to-account synchronization
- ✅ Persistent user wishlist (`/api/wishlist`) with toggle and removal endpoints
- ✅ Customer frontend connected to real APIs:
  - Checkout page ([Checkout.tsx](file:///C:/Aman/fire-safety-platform-2/client/src/pages/Checkout.tsx)) creating real orders in DB with instant confirmation
  - Orders page ([Orders.tsx](file:///C:/Aman/fire-safety-platform-2/client/src/pages/Orders.tsx)) and detail tracking ([OrderDetail.tsx](file:///C:/Aman/fire-safety-platform-2/client/src/pages/OrderDetail.tsx))
  - Invoices page ([Invoices.tsx](file:///C:/Aman/fire-safety-platform-2/client/src/pages/Invoices.tsx)) downloading real generated GST PDF invoices
  - Quotations page ([Quotes.tsx](file:///C:/Aman/fire-safety-platform-2/client/src/pages/Quotes.tsx)) and submission ([RequestQuote.tsx](file:///C:/Aman/fire-safety-platform-2/client/src/pages/RequestQuote.tsx)) downloading official proposal PDFs
- ✅ Admin dashboard connected to real APIs:
  - Orders & Quotes manager ([OrdersAdmin.tsx](file:///C:/Aman/fire-safety-platform-2/admin/src/pages/OrdersAdmin.tsx)) with real-time status transitions, transporter dispatch tracking, and one-click quote-to-order conversion
  - Upgraded Dashboard ([Dashboard.tsx](file:///C:/Aman/fire-safety-platform-2/admin/src/pages/Dashboard.tsx)) with live sales turnover KPIs, order counts, and RFQ queues
- ✅ Comprehensive integration test suite ([commerce.test.ts](file:///C:/Aman/fire-safety-platform-2/server/src/__tests__/commerce.test.ts))

### Phase 4: Field Services, Customer Equipment, AMC & Automated Cron Reminder Engine
- ✅ `CustomerEquipment` model with automatic lifecycle computation (`Healthy`, `Inspection Due Soon`, `Refill Due Soon`, `Overdue`), installation metadata, and QR code tracking
- ✅ `Technician` model with licensing/PESO certification credentials, skills, service areas, and real-time active vs completed job counters
- ✅ `AMCContract` model with statutory Form B compliance status (`Current`, `Due in 30 Days`, `Overdue`), quarterly/half-yearly visit schedules, and renewal tracking
- ✅ `ServiceBooking` model covering full dispatch lifecycle (`Requested`, `Confirmed`, `Assigned`, `Technician On The Way`, `In Progress`, `Completed`, `Cancelled`), job card summaries, hydraulic pressure testing logs, and Form B references
- ✅ `Notification` and `NotificationLog` models with compound unique deduplication indexes to eliminate notification spam
- ✅ Automated Cron Reminder Engine ([reminder.cron.ts](file:///C:/Aman/fire-safety-platform-2/server/src/jobs/reminder.cron.ts)) running scheduled scans (30d, 15d, 7d, 1d, 0d, overdue) for extinguisher refills and AMC Form B renewals with mock SMS, email, and in-app alerts
- ✅ Customer frontend:
  - Equipment tracker ([MyEquipment.tsx](file:///C:/Aman/fire-safety-platform-2/client/src/pages/MyEquipment.tsx)) with real-time status counters, filter chips, registration modal, delete actions, and one-click service dispatch
  - Service Booking ([BookService.tsx](file:///C:/Aman/fire-safety-platform-2/client/src/pages/BookService.tsx)) pre-filled with customer details, equipment references, date/slot selectors, and instant booking ID confirmations
  - Service History & Job Cards ([ServiceHistory.tsx](file:///C:/Aman/fire-safety-platform-2/client/src/pages/ServiceHistory.tsx)) displaying completed visits, assigned technicians, and interactive signed Job Card inspection modals
  - AMC Contracts overview ([AMCService.tsx](file:///C:/Aman/fire-safety-platform-2/client/src/pages/services/AMCService.tsx)) with live registered contracts and Form B compliance badges
- ✅ Admin dashboard:
  - Operations Console ([ServicesAdmin.tsx](file:///C:/Aman/fire-safety-platform-2/admin/src/pages/ServicesAdmin.tsx)) featuring 4 operational tabs:
    1. **Service Bookings**: Real-time dispatch modal assigning certified technicians and interactive modal to sign & finalize Job Cards with pressure test logs
    2. **AMC Contracts**: Contract creation modal, Form B compliance monitoring, and on-site scheduled visit logging
    3. **Technicians**: Staff directory, licensing records, active workload indicators, and technician onboarding modal
    4. **Automated Cron Engine**: On-demand reminder scan execution with live audit metrics
- ✅ Integration test suite ([services.test.ts](file:///C:/Aman/fire-safety-platform-2/server/src/__tests__/services.test.ts))

**Phases 5 & 6 (CRM, Business Analytics/Reports, CMS/Blog/FAQ/Reviews, Real Payments & Multi-channel notifications) are next.**

## Project structure

```
fire-safety-platform/
├── client/     customer-facing PWA (React + Vite + TS + Tailwind)
├── admin/      staff dashboard (React + Vite + TS + Tailwind)
├── server/     REST API (Node + Express + TS + MongoDB + Mongoose)
├── package.json   root scripts (concurrently runs all three)
└── README.md
```

Inside `server/src/`: `config/ controllers/ middleware/ models/ routes/ services/ validators/ utils/
jobs/ seed/` — one module per concern, never one giant file.

## Installation

Requires Node.js 18+ and a MongoDB instance (local `mongod`, Docker, or a free MongoDB Atlas cluster).

```bash
git clone <this-repo>
cd fire-safety-platform
npm run install:all          # installs server, client, and admin dependencies

cp server/.env.example server/.env
cp client/.env.example client/.env
cp admin/.env.example admin/.env
```

Edit `server/.env` and set at minimum:
- `MONGODB_URI` — e.g. `mongodb://127.0.0.1:27017/fire_safety_platform` or an Atlas connection string
- `JWT_SECRET` and `JWT_REFRESH_SECRET` — any long random strings for local dev

Everything else (Cloudinary, email, payments, SMS/WhatsApp) has a working **mock/development mode**
out of the box — see "Free-first development" below.

## Running locally

```bash
npm run seed      # creates a super_admin account + demo sales/technician/accountant accounts
npm run dev       # starts server (:5000), client (:5173), and admin (:5174) together
```

Or run each independently: `npm run server`, `npm run client`, `npm run admin`.

- Customer site: http://localhost:5173
- Admin dashboard: http://localhost:5174 — log in with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`
  from `server/.env` (defaults: `admin@akfiresafety.example` / `ChangeMe123!` — change these before
  any real deployment)
- API: http://localhost:5000/api — health check at `/api/health`

## Free-first development (spec section 6)

No paid service is required to run this locally:

| Concern | Env var | Dev-safe default |
|---|---|---|
| Payments | `PAYMENT_MODE=mock` | No Razorpay account needed until you switch to `razorpay` |
| Email | `EMAIL_MODE=development` | Logs to console instead of requiring SMTP credentials |
| SMS | `SMS_MODE=mock` | Logs to console/DB instead of requiring MSG91/Twilio |
| WhatsApp | `WHATSAPP_MODE=mock` | Same pattern — provider interface is ready, not required |
| File storage | Cloudinary env vars blank | Upload endpoints (built in Phase 2) return a clear "not configured" error rather than silently failing |

Real providers can be swapped in later purely by changing env vars — no code changes to calling code.

## Authentication & RBAC

- Access tokens: short-lived JWT (`JWT_EXPIRES_IN`, default 15m), carries `role` + resolved `permissions`.
- Refresh tokens: longer-lived (`JWT_REFRESH_EXPIRES_IN`, default 30d), stored server-side by hash in
  `RefreshToken` so they can be individually revoked; rotated on every use.
- `requireAuth` verifies the access token. `requirePermission('products.create')` (etc.) checks the
  permission server-side on every protected route — **the frontend hiding a button is UX only**, never
  the security boundary, per spec section 37.
- Roles ship with fixed permission sets in `server/src/utils/permissions.ts` — see that file for the
  full grid.

## API documentation (Phase 1 surface)

All responses follow: `{ success, message, data, meta? }` on success, `{ success: false, message, errors: [] }` on error.

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create a customer account, returns token pair |
| POST | `/api/auth/login` | Public | Login by email or phone, returns token pair |
| POST | `/api/auth/refresh` | Public (valid refresh token) | Rotates refresh token, returns new pair |
| POST | `/api/auth/logout` | Public | Revokes one refresh token |
| POST | `/api/auth/logout-all` | Bearer token | Revokes all sessions for the current user |
| GET | `/api/auth/me` | Bearer token | Returns the current authenticated user |
| GET | `/api/health` | Public | Liveness check |
| GET | `/api/categories` | Public | List active categories & subcategories |
| GET | `/api/categories/slug/:slug` | Public | Get category details by slug |
| POST | `/api/categories` | Staff (`categories.manage`) | Create a new category |
| PUT | `/api/categories/:id` | Staff (`categories.manage`) | Update category & subcategories |
| DELETE | `/api/categories/:id` | Staff (`categories.manage`) | Delete category (checks linked products) |
| GET | `/api/products` | Public | Query products (search, filters, sort, pagination) |
| GET | `/api/products/slug/:slug` | Public | Product details & related items |
| GET | `/api/products/featured-bestsellers` | Public | Top featured & best-selling products |
| GET | `/api/products/filters` | Public | Dynamic filter metadata (brands, prices, fire classes) |
| GET | `/api/products/admin/low-stock` | Staff (`products.read`) | Low inventory alert items |
| POST | `/api/products` | Staff (`products.create`) | Create product with full specs & images |
| PUT | `/api/products/:id` | Staff (`products.update`) | Update product |
| PATCH | `/api/products/:id/stock` | Staff (`products.update`) | Quick stock adjustment |
| DELETE | `/api/products/:id` | Staff (`products.delete`) | Delete product |
| POST | `/api/upload/image` | Staff (`products.create`) | Upload image (Cloudinary or local fallback) |
| POST | `/api/upload/document` | Staff (`products.create`) | Upload PDF datasheet (Cloudinary or local fallback) |

## Testing

```bash
cd server
cp .env.example .env   # point MONGODB_URI at a disposable test DB, e.g. .../fire_safety_test
npx jest
```

Covers:
- Auth & RBAC (register, login, password check, `/me`, duplicate prevention)
- Category & Product CRUD, duplicate SKU rejection, permission gates, search, filters, pagination, and stock updates.

## Production build

```bash
npm run build   # builds server (tsc), client (vite build), admin (vite build)
```

## Deployment targets (spec section 63)

- **Customer frontend (`client/`):** Vercel or Netlify — set `VITE_API_URL` to your deployed API.
- **Admin frontend (`admin/`):** Vercel or Netlify, ideally on a separate subdomain (e.g.
  `admin.akfiresafety.example`) — never bundle admin routes into the public site's deploy.
- **Backend (`server/`):** Render, Railway, or Fly.io free tier — set all `server/.env` variables
  as environment variables in the host's dashboard, never commit `.env`.
- **Database:** MongoDB Atlas free tier (M0).
- **File storage:** Cloudinary free tier.

## Troubleshooting

- **"Invalid environment configuration" on server boot** — a required var (`MONGODB_URI`,
  `JWT_SECRET`, `JWT_REFRESH_SECRET`) is missing from `server/.env`; the exact field is printed.
- **CORS errors in the browser** — confirm `CLIENT_URL`/`ADMIN_URL` in `server/.env` match the actual
  ports Vite is running on (5173/5174 by default).
- **401 loops on the frontend** — check that both `JWT_SECRET` and `JWT_REFRESH_SECRET` are set and
  unchanged between server restarts in dev; changing them invalidates all issued tokens.
