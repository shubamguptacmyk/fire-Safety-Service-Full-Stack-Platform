# Fire Safety Platform — REST API Reference (v2.0)

Production-ready, single source of truth REST API for Indian Fire Safety e-commerce, equipment lifecycle, statutory Maharashtra Fire Act (Form B) AMC compliance, technician field operations, and business management.

---

## 1. System Overview & Architecture

- **Base URL:** `http://localhost:5000/api`
- **Authentication:** Dual-token JWT (Access Token in `Authorization: Bearer <token>`, Refresh Token with sliding-window rotation & token-version revocation)
- **Database:** MongoDB via Mongoose with multi-index compound indexes and optimistic concurrency.
- **Zero-Dependency Development Modes:**
  - `EMAIL_MODE=development` (Logs emails to console with HTML previews)
  - `PAYMENT_MODE=mock` (Instant simulated payment success)
  - `SMS_MODE=mock` (Console dispatched OTPs)

---

## 2. Global Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email address" }
  ]
}
```

---

## 3. Section-by-Section API Specification

### Section 6. CART API
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/cart` | Auth | Add item to cart |
| `POST` | `/api/cart/items` | Auth | Add item to cart (canonical alias) |
| `GET` | `/api/cart` | Auth | Get current authenticated customer cart |
| `PUT` | `/api/cart/items/:productId` | Auth | Update line quantity |
| `PATCH`| `/api/cart/items/:productId`| Auth | Alias for quantity update |
| `DELETE`| `/api/cart/items/:productId`| Auth | Remove single item from cart |
| `DELETE`| `/api/cart` | Auth | Clear entire shopping cart |
| `POST` | `/api/cart/sync` | Auth | Sync guest offline cart items after user logs in |

*Key Rules:*
- Prices are **never** trusted from frontend; real-time prices retrieved from MongoDB `Product` collection.
- Checks stock availability before adding or updating.
- Automatically calculates GST, delivery shipping fees, subtotal, and total amount.

---

### Section 7. WISHLIST API
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/wishlist` | Auth | List saved wishlist items with populated product details |
| `POST` | `/api/wishlist/:productId` | Auth | Toggle/add product in wishlist |
| `POST` | `/api/wishlist/toggle` | Auth | Toggle item via body payload `{ productId }` |
| `DELETE`| `/api/wishlist/:productId` | Auth | Remove product from wishlist |
| `DELETE`| `/api/wishlist` | Auth | Clear entire wishlist |

---

### Section 8. ORDER API
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | Public/Auth | Create order from cart or items snapshot |
| `GET` | `/api/orders` | Auth | Customer view own orders (or admin lists all) |
| `GET` | `/api/orders/my` | Auth | Explicit customer order history |
| `GET` | `/api/orders/:id` | Auth | Get single order details with ownership verification |
| `PATCH`| `/api/orders/:id/cancel` | Auth | Customer cancel eligible pending order |
| `POST` | `/api/orders/:id/cancel` | Auth | Alias for cancellation |
| `GET` | `/api/admin/orders` | Staff | List all platform orders with search, filters & pagination |
| `GET` | `/api/admin/orders/:id` | Staff | Get order detail as staff |
| `PATCH`| `/api/admin/orders/:id/status` | Staff | Update order status (`Pending`, `Confirmed`, `Processing`, `Packed`, `Dispatched`, `Delivered`, `Cancelled`) |
| `PATCH`| `/api/admin/orders/:id/payment-status` | Staff | Update payment status (`pending`, `paid`, `failed`, `refunded`) |
| `GET` | `/api/orders/:id/invoice` | Auth | Download official GST Tax Invoice PDF |

---

### Section 9. PAYMENT API
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/payments/create` | Public/Auth | Initialize payment (`mock`, `cod`, or `razorpay`) |
| `POST` | `/api/payments/verify` | Public/Auth | Verify HMAC SHA256 signature and confirm order |
| `POST` | `/api/payments/webhook` | Public | Razorpay webhook listener for asynchronous capture |
| `GET` | `/api/payments/:id` | Auth/Staff | Retrieve payment receipt |

---

### Section 10. COUPON API
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/coupons/validate` | Public/Auth | Validate discount code against cart subtotal |
| `GET` | `/api/admin/coupons` | Admin | List all promotional coupon codes |
| `GET` | `/api/admin/coupons/:id` | Admin | Get coupon configuration & usage history |
| `POST` | `/api/admin/coupons` | Admin | Create percentage or fixed discount coupon |
| `PUT` | `/api/admin/coupons/:id` | Admin | Update coupon thresholds, dates, or active status |
| `DELETE`| `/api/admin/coupons/:id` | Admin | Delete coupon code |

---

### Section 11. GST INVOICE API
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/invoices` | Staff | Create custom or manual tax invoice |
| `GET` | `/api/invoices` | Auth | List invoices (customer sees own, staff sees all) |
| `GET` | `/api/invoices/:id` | Auth | Get invoice data by ID |
| `GET` | `/api/invoices/:id/pdf` | Auth | Download server-generated GST Invoice PDF via PDFKit |

---

### Section 12. QUOTATION API
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/quotes` | Public/Auth | Submit B2B price quote request |
| `GET` | `/api/quotes` | Auth | Customer view own quotes (or staff lists all) |
| `GET` | `/api/quotes/:id` | Auth | View quote proposal and itemized pricing |
| `PATCH`| `/api/quotes/:id/cancel` | Auth | Cancel quote request |
| `GET` | `/api/quotes/:id/pdf` | Auth | Download B2B formal price quote PDF |
| `GET` | `/api/admin/quotes` | Sales/Admin | List all quotes with status filtering |
| `GET` | `/api/admin/quotes/:id` | Sales/Admin | Get quote details as staff |
| `PATCH`| `/api/admin/quotes/:id/status`| Sales/Admin | Approve, reject, or revise proposal pricing |
| `POST` | `/api/admin/quotes/:id/convert-to-order` | Sales/Admin | Convert approved quote directly into an Order |

---

### Section 13. CUSTOMER EQUIPMENT REGISTRY
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/equipment` | Auth | Register new fire extinguisher or safety asset |
| `GET` | `/api/equipment` | Auth | List customer equipment (or staff lists all) |
| `GET` | `/api/equipment/:id` | Auth | Get equipment details (next refill, hydro-test due) |
| `PUT` | `/api/equipment/:id` | Auth | Update asset serial number or location |
| `DELETE`| `/api/equipment/:id` | Auth | Remove decommissioned equipment |
| `GET` | `/api/equipment/qr/:qrCode` | Auth/Tech | Scan extinguisher QR code in field |

*Status Lifecycle (computed dynamically from inspection and refill dates):*
- `Healthy`
- `Inspection Due Soon` (<= 30 days)
- `Refill Due Soon` (<= 30 days)
- `Overdue` (< current date)

---

### Section 14. AMC CONTRACT API
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/amc` | Admin/Sales | Create AMC contract with scheduled visits |
| `GET` | `/api/amc` | Auth | Customer view own AMCs (or staff lists all) |
| `GET` | `/api/amc/:id` | Auth | Get contract visits, coverage, and Form B status |
| `PUT` | `/api/amc/:id` | Admin/Sales | Update AMC contract details |
| `PATCH`| `/api/amc/:id/status` | Admin/Sales | Update status (`Active`, `Expired`, `Renewed`, `Cancelled`) |
| `GET` | `/api/admin/amc` | Admin/Sales | Staff list all contracts |
| `GET` | `/api/admin/amc/:id` | Admin/Sales | Staff view contract details |
| `PATCH`| `/api/admin/amc/:id/status` | Admin/Sales | Staff update contract status |
| `GET` | `/api/amc/:id/form-b` | Auth | Download certified Maharashtra Fire Act Form B PDF |

---

### Section 15. SERVICE BOOKING API
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/services/book` | Public/Auth | Book refilling, inspection, audit, or hydrant repair |
| `GET` | `/api/services/bookings` | Admin/Staff | Staff view all booking requests |
| `GET` | `/api/services/bookings/:id` | Auth/Staff | View booking details and equipment inspection list |
| `PATCH`| `/api/services/bookings/:id/cancel`| Auth | Cancel service booking |
| `GET` | `/api/admin/services` | Admin/Staff | Staff list all service bookings |
| `GET` | `/api/admin/services/:id` | Admin/Staff | Staff view single booking details |
| `PATCH`| `/api/admin/services/:id/status` | Staff | Update booking status (`Requested`, `Confirmed`, `Assigned`, `In Progress`, `Completed`, `Cancelled`, `Rejected`) |
| `POST` | `/api/admin/services/:id/assign-technician` | Staff | Assign licensed field technician to booking |
| `POST` | `/api/services/:id/job-card` | Tech/Staff | Submit technician digital Job Card with test results |

---

### Section 16. TECHNICIAN API
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/admin/technicians` | Staff | Register licensed field technician |
| `GET` | `/api/admin/technicians` | Staff | List all technicians with active job counts & ratings |
| `GET` | `/api/admin/technicians/:id` | Staff | Get technician profile |
| `PUT` | `/api/admin/technicians/:id` | Staff | Update technician profile and license info |
| `PATCH`| `/api/admin/technicians/:id/status` | Staff | Update status (`active`, `on-leave`, `busy`, `inactive`) |
| `DELETE`| `/api/admin/technicians/:id` | Staff | Remove technician |
| `GET` | `/api/technicians/my-jobs` | Tech | Get jobs assigned to logged-in technician |
| `PATCH`| `/api/technicians/jobs/:id/status` | Tech | Update job execution status |
| `POST` | `/api/technicians/jobs/:id/photos` | Tech | Upload before/after/testing photographs |
| `POST` | `/api/technicians/jobs/:id/notes` | Tech | Add technician job remarks and observations |

---

### Section 17. REVIEWS API
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/reviews` | Auth | Submit verified customer review (1–5 stars) |
| `GET` | `/api/reviews` | Staff | Staff moderation queue for pending reviews |
| `GET` | `/api/products/:productId/reviews` | Public | Get approved reviews and star distribution |
| `PUT` | `/api/reviews/:id` | Auth | Edit submitted review |
| `DELETE`| `/api/reviews/:id` | Auth/Staff | Remove review |
| `GET` | `/api/admin/reviews` | Admin | View all reviews across products & services |
| `PATCH`| `/api/admin/reviews/:id/status` | Admin | Approve or reject review with moderation notes |
| `DELETE`| `/api/admin/reviews/:id` | Admin | Delete review from administrative moderation |

---

### Section 18. BLOG CMS API
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/blog` | Public | Read published articles with category/tag filters |
| `GET` | `/api/blog/:slug` | Public | Get article by SEO slug (increments view count) |
| `POST` | `/api/admin/blog` | Admin | Create new blog draft or article |
| `GET` | `/api/admin/blog` | Admin | Manage all drafts and published posts |
| `GET` | `/api/admin/blog/:id` | Admin | Get single blog post |
| `PUT` | `/api/admin/blog/:id` | Admin | Update article content, title, tags, and SEO |
| `DELETE`| `/api/admin/blog/:id` | Admin | Delete blog article |
| `PATCH`| `/api/admin/blog/:id/publish` | Admin | One-click publish blog draft |

---

### Section 19. CRM & CUSTOMER 360
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/crm/customers` | Admin/Sales | List customers with lifetime spend, orders count, and calculated tier (`Bronze`, `Silver`, `Gold`, `Platinum`) |
| `GET` | `/api/crm/customers/:id` | Admin/Sales | 360-degree customer profile: orders, equipment, quotes, AMCs, bookings |
| `PATCH`| `/api/crm/customers/:id/notes` | Admin | Add staff internal notes and tags |

---

### Section 20. BUSINESS INTELLIGENCE & EXPORTS
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/overview` | Staff | Real-time KPIs: revenue, order funnel, quotes, AMC status, low-stock warnings, 30-day daily sales graph |
| `GET` | `/api/reports/sales` | Staff | Time-series sales analytics, revenue by payment method |
| `GET` | `/api/reports/services` | Staff | Completed jobs, technician workload breakdown |
| `GET` | `/api/reports/amc` | Staff | Active AMCs, renewal calendar (30/60 days), Form B compliance |
| `GET` | `/api/reports/inventory` | Admin | Stock valuation, out-of-stock items |
| `GET` | `/api/reports/export/orders` | Accountant | Download orders as `.xlsx` or `.csv` |
| `GET` | `/api/reports/export/customers`| Admin | Download customer directory as `.xlsx` or `.csv` |
| `GET` | `/api/reports/export/products` | Admin | Download product inventory as `.xlsx` or `.csv` |
| `GET` | `/api/reports/export/services` | Admin | Download service bookings as `.xlsx` or `.csv` |

---

### Section 21. PLATFORM SETTINGS & AUDIT LOGS
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/settings/public` | Public | Public company details, GSTIN, default tax rate |
| `GET` | `/api/settings` | Admin | View all company, tax, shipping, and numbering settings |
| `PUT` | `/api/settings/:key` | Admin | Update system configuration |
| `GET` | `/api/audit-logs` | SuperAdmin | Audit trail of all administrative updates and logins |
