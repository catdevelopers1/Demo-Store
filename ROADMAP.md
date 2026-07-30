# Complete Technical Roadmap & Development Milestones — Reusable Pakistani Commerce Framework

This roadmap defines the sequential, modular execution plan for building the Cloudflare-native e-commerce framework for Pakistani Clothing Brands (COD-dominant).

Every milestone is strictly versioned. **Do not combine multiple large milestones together.** Always complete all testing requirements and review criteria before tagging a release.

---

## Roadmap Overview (v0.1.0 to v1.0.0)

- **[COMPLETED] v0.1.0 — Milestone 0:** Framework Scaffolding & Edge Infrastructure
- **[COMPLETED] v0.2.0 — Milestone 1:** Authentication & RBAC Architecture
- **[COMPLETED] v0.3.0 — Milestone 2:** Store Settings & Dynamic Configuration Engine
- **[COMPLETED] v0.4.0 — Milestone 3:** Category & Taxonomy Engine
- **[COMPLETED] v0.5.0 — Milestone 4:** Product Catalog & Variant Matrix Engine
- **[COMPLETED] v0.6.0 — Milestone 5:** R2 Product Image & Asset Pipeline
- **[COMPLETED] v0.7.0 — Milestone 6:** Inventory & Stock Management Engine
- **[COMPLETED] v0.8.0 — Milestone 7:** Customer Profile & Pakistani Address Book
- **[COMPLETED] v0.9.0 — Milestone 8:** Storefront Product Discovery & FTS5 Edge Search
- **[COMPLETED] v0.10.0 — Milestone 9:** Shopping Cart & Stock Validation Engine
- **[COMPLETED] v0.11.0 — Milestone 10:** Discount Code & Coupon Promotion Engine
- **v0.12.0 — Milestone 11:** Cash on Delivery (COD) Checkout Engine
- **v0.6.0 — Milestone 5:** R2 Product Image & Asset Pipeline
- **v0.7.0 — Milestone 6:** Inventory & Stock Management Engine
- **v0.8.0 — Milestone 7:** Customer Profile & Pakistani Address Book
- **v0.9.0 — Milestone 8:** Storefront Product Discovery & FTS5 Edge Search
- **v0.10.0 — Milestone 9:** Shopping Cart & Stock Validation Engine
- **v0.11.0 — Milestone 10:** Discount Code & Coupon Promotion Engine
- **v0.12.0 — Milestone 11:** Cash on Delivery (COD) Checkout Engine
- **v0.13.0 — Milestone 12:** Order Lifecycle Management & Audit Timeline
- **v0.14.0 — Milestone 13:** Admin Dashboard & Core E-Commerce Analytics
- **v0.15.0 / v1.0.0 — Milestone 14:** Version 1 Production Hardening, Audit & Stable Release

---

## Detailed Milestone Specifications

### Milestone 0: Framework Scaffolding & Edge Infrastructure (v0.1.0) — [COMPLETED]
- **Goal:** Establish a pristine, Edge-first TypeScript 5.x, React 19, Vite 7, Tailwind CSS 4, and Cloudflare Workers/D1/R2/KV repository structure adhering to Feature-First architecture.
- **Status:** Completed on 2026-07-30 (`v0.1.0`). All type checking, linting, unit tests, integration tests, and smoke tests passing.
- **Features included:**
  - TypeScript 5.x strict compiler setup with zero-any policy.
  - React 19 + Vite 7 + React Router 7 foundational app shell and routing setup.
  - Tailwind CSS 4 styling engine configured with dynamic CSS variable design tokens.
  - Cloudflare Wrangler configuration (`wrangler.json`) defining local and production D1 (`DB`), R2 (`BUCKET`), KV (`KV`), and Turnstile bindings.
  - Core API middleware (JSON envelope formatter, Edge logger, Zod error handler).
  - Automated testing harness setup: Vitest for unit/integration tests and Playwright for E2E tests.
- **Dependencies:** Stable releases of React 19, TypeScript 5, Vite 7, Tailwind CSS 4, React Router 7, Zod, Vitest, Playwright, Wrangler.
- **Expected files/modules affected:**
  - `package.json`, `tsconfig.json`, `vite.config.ts`, `wrangler.json`
  - `src/app/*`, `src/core/api/*`, `src/core/db/*`, `src/core/kv/*`
  - `.github/workflows/ci.yml`
- **Risks:**
  - Runtime incompatibilities between React Router 7 and Cloudflare Pages Functions if Node.js polyfills are accidentally introduced.
- **Testing requirements:**
  - Unit test verifying standard JSON API response envelope generation (`src/core/api`).
  - Integration test verifying local Cloudflare D1 database connection and schema execution.
  - Playwright E2E basic smoke test verifying homepage hydration.
- **Definition of completion:**
  - Clean `tsc --noEmit` type check.
  - Zero linting errors.
  - Passing Vitest and Playwright smoke tests.
  - Tagged Git release `v0.1.0`.

---

### Milestone 1: Authentication & RBAC Architecture (v0.2.0) — [COMPLETED]
- **Goal:** Implement secure, Edge-native authentication for Admins and Customers with Cloudflare Turnstile bot protection and Role-Based Access Control (RBAC).
- **Status:** Completed on 2026-07-30 (`v0.2.0`). All type checking, linting, unit tests, integration tests, and E2E auth tests passing.
- **Features included:**
  - User identity schema in D1 (`users` table) with role enums (`ADMIN`, `CUSTOMER`).
  - WebCrypto PBKDF2 password hashing (100k iterations, SHA-256) running natively on Cloudflare Workers.
  - HMAC-SHA256 signed session token generation stored in HttpOnly, Secure, SameSite=Strict cookies.
  - Cloudflare Turnstile verification middleware for login and registration requests.
  - API endpoints: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/session`.
  - Frontend Auth Provider and protected route guards (`<AdminGuard />`, `<CustomerGuard />`).
- **Dependencies:** Milestone 0 (v0.1.0).
- **Expected files/modules affected:**
  - `migrations/0001_auth_users.sql`
  - `src/features/authentication/api/*`, `src/features/authentication/components/*`, `src/features/authentication/db/*`, `src/features/authentication/validation/*`
  - `src/core/security/*`
- **Risks:**
  - Cookie SameSite restrictions causing authentication failures on mobile browsers if SSL/HTTPS headers are misconfigured.
  - Turnstile latency or verification timeouts in edge environments.
- **Testing requirements:**
  - Unit tests for WebCrypto password hashing/salting and Zod registration validation.
  - Integration tests for D1 user creation, duplicate email rejection, and invalid Turnstile token rejection.
  - Playwright E2E tests for Admin Login and Customer Registration workflows.
- **Definition of completion:**
  - All auth API endpoints documented in `API.md`.
  - 100% test pass rate for authentication unit, integration, and E2E suites.
  - Tagged Git release `v0.2.0`.

---

### Milestone 2: Store Settings & Dynamic Configuration Engine (v0.3.0) — [COMPLETED]
- **Goal:** Implement a 100% database/KV-driven store configuration engine so that brand branding, colors, contact details, and COD shipping rules can be customized without touching code.
- **Status:** Completed on 2026-07-30 (`v0.3.0`). All type checking, linting, unit tests, integration tests, and E2E settings tests passing.
- **Features included:**
  - `store_settings` D1 schema and Cloudflare KV caching layer (3600s TTL).
  - Configurable properties: Brand Name, Logo R2 Key, Favicon, Primary/Secondary Color Hex codes, Pakistani Support Phone/WhatsApp (`03XX...`), COD Shipping Base Rate PKR, Free Shipping Threshold PKR, Store SEO Metadata.
  - API endpoints: `GET /api/v1/settings` (KV cached), `PUT /api/v1/admin/settings` (Admin protected, invalidates KV).
  - Admin UI settings panel for managing store branding and COD policies.
  - Dynamic CSS variable injection on the storefront header/footer based on store configuration.
- **Dependencies:** Milestone 1 (v0.2.0 - Admin RBAC required for editing settings).
- **Expected files/modules affected:**
  - `migrations/0002_store_settings.sql`
  - `src/features/settings/api/*`, `src/features/settings/components/*`, `src/features/settings/db/*`, `src/features/settings/types/*`
  - `src/app/Layout.tsx`
- **Risks:**
  - KV propagation delay causing stale store branding settings after admin edits if cache invalidation keys are mismanaged.
- **Testing requirements:**
  - Unit tests for store settings Zod schema and default PKR shipping fallbacks.
  - Integration tests verifying `PUT /admin/settings` correctly writes to D1 and purges the KV cache key.
  - Playwright E2E tests verifying updated brand colors and store name immediately reflect on storefront.
- **Definition of completion:**
  - Zero hardcoded branding strings remain in storefront layout components.
  - Settings API documented in `API.md`.
  - Tagged Git release `v0.3.0`.

---

### Milestone 3: Category & Taxonomy Engine (v0.4.0) — [COMPLETED]
- **Goal:** Build a hierarchical category management system supporting parent/child relationships, SEO-friendly slugs, and category cover imagery for apparel collections (e.g., Lawn > Unstitched > 3-Piece).
- **Status:** Completed on 2026-07-30 (`v0.4.0`). All type checking, linting, unit tests, integration tests, and E2E category tests passing.
- **Features included:**
  - `categories` D1 schema (`id`, `parent_id`, `name`, `slug`, `description`, `image_r2_key`, `sort_order`, `is_active`).
  - API endpoints: `GET /api/v1/categories` (tree structure), `GET /api/v1/categories/:slug`, `POST /api/v1/admin/categories`, `PUT /api/v1/admin/categories/:id`, `DELETE /api/v1/admin/categories/:id`.
  - Recursive category tree builder with cycle-detection prevention.
  - Admin UI: Category management table, parent category selector, and sort ordering.
  - Storefront UI: Navigation dropdown menu, category grid card, and breadcrumbs component.
- **Dependencies:** Milestone 2 (v0.3.0).
- **Expected files/modules affected:**
  - `migrations/0003_categories.sql`
  - `src/features/categories/api/*`, `src/features/categories/components/*`, `src/features/categories/db/*`, `src/features/categories/utils/*`
- **Risks:**
  - Infinite recursion loops if a category is accidentally assigned as its own parent in hierarchical queries.
- **Testing requirements:**
  - Unit tests for recursive category tree generation and slug normalization (`"Unstitched Lawn 3-Piece"` -> `"unstitched-lawn-3-piece"`).
  - Integration tests verifying cycle detection blocks self-parenting categories.
  - Playwright E2E test verifying admin category creation and storefront navigation bar display.
- **Definition of completion:**
  - Recursive tree logic covered by automated tests.
  - Category endpoints documented in `API.md`.
  - Tagged Git release `v0.4.0`.

---

### Milestone 4: Product Catalog & Variant Matrix Engine (v0.5.0) — [COMPLETED]
- **Goal:** Implement the core clothing product catalog and dynamic variant generation engine (supporting options like Size: S/M/L/XL, Color, and Fabric) with SKU mapping and PKR price overrides.
- **Status:** Completed on 2026-07-30 (`v0.5.0`). All type checking, linting, unit tests, integration tests, and E2E product tests passing.
- **Features included:**
  - D1 schemas: `products`, `product_options`, `product_option_values`, `product_variants`, `product_variant_options`.
  - Dynamic variant SKU generation and matrix validation (e.g., Size × Color = discrete sellable SKUs).
  - API endpoints: `GET /api/v1/products`, `GET /api/v1/products/:slug`, `POST /api/v1/admin/products` (batch creates product, options, values, and variants in a single D1 transaction), `PUT /api/v1/admin/products/:id`.
  - Admin UI: Product creation wizard with interactive variant matrix editor.
  - Storefront UI: Product detail page (PDP) skeleton with option selectors and dynamic price display.
- **Dependencies:** Milestone 3 (v0.4.0 - Products must belong to categories).
- **Expected files/modules affected:**
  - `migrations/0004_products_variants.sql`
  - `src/features/products/api/*`, `src/features/products/components/*`, `src/features/products/db/*`
  - `src/features/variants/api/*`, `src/features/variants/components/*`, `src/features/variants/db/*`
- **Risks:**
  - High complexity in matrix permutation updates when an admin adds or removes a size option on an existing product with active orders.
- **Testing requirements:**
  - Unit tests for Cartesian product variant matrix generation (`[S, M, L] × [Red, Blue] = 6 SKUs`).
  - Integration tests verifying atomic D1 batch transaction rollback if variant SKU creation fails.
  - Playwright E2E test for admin product & variant creation wizard.
- **Definition of completion:**
  - Atomic transaction rules verified for product/variant creation.
  - Endpoints documented in `API.md`.
  - Tagged Git release `v0.5.0`.

---

### Milestone 5: R2 Product Image & Asset Pipeline (v0.6.0) — [COMPLETED]
- **Goal:** Integrate Cloudflare R2 object storage for uploading, deleting, sorting, and serving optimized product and variant lookbook images.
- **Status:** Completed on 2026-07-30 (`v0.6.0`). All type checking, linting, unit tests, integration tests, and E2E lookbook tests passing.
- **Features included:**
  - D1 schema: `product_images` (`id`, `product_id`, `variant_id`, `r2_key`, `url`, `alt_text`, `sort_order`, `is_primary`).
  - Edge API handlers: `POST /api/v1/admin/images/upload` (accepts multipart/form-data, validates mime type/file size, writes to R2 bucket), `DELETE /api/v1/admin/images/:id` (deletes from R2 and D1).
  - Admin UI: Drag-and-drop image uploader, sort order adjuster, primary image selector, alt-text editor.
  - Storefront UI: Product image gallery with thumbnail switcher and zoom-in modal.
- **Dependencies:** Milestone 4 (v0.5.0 - Images link to products and variants).
- **Expected files/modules affected:**
  - `migrations/0005_product_images.sql`
  - `src/features/products/api/imageUpload.ts`, `src/features/products/components/ProductImageGallery.tsx`
  - `src/core/r2/index.ts`
- **Risks:**
  - Orphaned objects in Cloudflare R2 if a database transaction fails after file upload completes (requires cleanup rollback logic).
- **Testing requirements:**
  - Unit tests for file extension, MIME-type validation, and safe R2 key generation (`products/{productId}/{uuid}.webp`).
  - Integration tests using Miniflare R2 mock bucket verifying upload, metadata storage, and deletion cleanup.
  - Playwright E2E test verifying image upload in Admin and display on Product Detail Page.
- **Definition of completion:**
  - Complete R2 upload/delete lifecycle documented.
  - Tagged Git release `v0.6.0`.

---

### Milestone 6: Inventory & Stock Management Engine (v0.7.0) — [COMPLETED]
- **Goal:** Implement real-time stock ledger tracking per SKU variant, low-stock alerts, and race-condition-safe stock reservation logic.
- **Status:** Completed on 2026-07-30 (`v0.7.0`). All type checking, linting, unit tests, integration tests, and E2E inventory tests passing.
- **Features included:**
  - D1 schemas: `inventory_items` (`variant_id`, `quantity_available`, `quantity_reserved`, `low_stock_threshold`) and `inventory_logs` audit table.
  - API endpoints: `GET /api/v1/admin/inventory`, `PATCH /api/v1/admin/inventory/:variantId` (manual stock adjustments with mandatory audit reason: `RESTOCK` | `ADJUSTMENT` | `RETURN`).
  - Internal stock reservation edge interface: `reserveStock(variantId, qty)` and `releaseStock(variantId, qty)`.
  - Admin UI: Inventory management dashboard with filter for low-stock items and audit log viewer.
  - Storefront UI: "Out of Stock", "Only 2 left in stock!", and dynamic Add-to-Cart button disabling.
- **Dependencies:** Milestone 4 (v0.5.0 - Inventory ties directly to `product_variants`).
- **Expected files/modules affected:**
  - `migrations/0006_inventory.sql`
  - `src/features/inventory/api/*`, `src/features/inventory/components/*`, `src/features/inventory/db/*`, `src/features/inventory/utils/*`
- **Risks:**
  - Concurrent checkout requests causing negative stock if `quantity_available >= requested_qty` check is not enforced via SQL conditional constraints (`WHERE quantity_available >= ?`).
- **Testing requirements:**
  - Unit tests for inventory threshold evaluators and audit log reason formatting.
  - Integration tests executing concurrent D1 stock reservation queries to prove zero negative inventory is possible under race conditions.
  - Playwright E2E test verifying "Out of Stock" button state when quantity is 0.
- **Definition of completion:**
  - Zero-negative-stock SQL constraint verified via automated concurrency test.
  - Tagged Git release `v0.7.0`.

---

### Milestone 7: Customer Profile & Pakistani Address Book (v0.8.0) — [COMPLETED]
- **Goal:** Implement customer account profiles, order history view, and a Pakistani-standardized Address Book supporting cities, provinces, postal codes, and verified mobile numbers.
- **Status:** Completed on 2026-07-30 (`v0.8.0`). All type checking, linting, unit tests, integration tests, and E2E customer tests passing.
- **Features included:**
  - D1 schemas: `customer_profiles`, `customer_addresses`.
  - Pakistani Mobile Number validator (`^(\+92|0|92)?3[0-9]{9}$`) and Pakistani City/Province selector (e.g., Lahore/Punjab, Karachi/Sindh, Islamabad, Peshawar/KPK, Quetta/Balochistan).
  - API endpoints: `GET /api/v1/customer/profile`, `GET /api/v1/customer/addresses`, `POST /api/v1/customer/addresses`, `PUT /api/v1/customer/addresses/:id`, `DELETE /api/v1/customer/addresses/:id`.
  - Storefront UI: Customer Dashboard, Address Book manager, and "Set Default Shipping Address" modal.
- **Dependencies:** Milestone 1 (v0.2.0 - Customer RBAC session required).
- **Expected files/modules affected:**
  - `migrations/0007_customer_addresses.sql`
  - `src/features/customers/api/*`, `src/features/customers/components/*`, `src/features/customers/db/*`, `src/features/customers/validation/*`
  - `src/shared/utils/phone.ts`, `src/shared/utils/pakistanCities.ts`
- **Risks:**
  - Unstandardized city string inputs causing inconsistent COD shipping fee calculations later.
- **Testing requirements:**
  - Unit tests for Pakistani mobile number normalization and Zod address validation.
  - Integration tests verifying default address toggling (setting a new default automatically unsets the previous default address).
  - Playwright E2E tests for customer logging in, adding a Lahore address, and managing profile.
- **Definition of completion:**
  - Pakistani phone & city validation rules documented in `DATABASE.md`.
  - Tagged Git release `v0.8.0`.

---

### Milestone 8: Storefront Product Discovery & FTS5 Edge Search (v0.9.0) — [COMPLETED]
- **Goal:** Build the customer storefront catalog discovery experience, including keyword search over Cloudflare D1 FTS5, category filtering, price sorting, and responsive apparel grids.
- **Status:** Completed on 2026-07-30 (`v0.9.0`). All type checking, linting, unit tests, integration tests, and E2E search tests passing.
- **Features included:**
  - D1 FTS5 virtual table (`products_fts`) synced via SQLite triggers on `products` and `product_variants`.
  - Edge API endpoint: `GET /api/v1/search?q=lawn&category=unstitched&minPrice=3000&maxPrice=10000&sort=price_asc&page=1&limit=20`.
  - Storefront UI: Responsive Navbar with Search Drawer, Hero Section, Category Filter Sidebar, Product Grid, Product Card with price PKR formatting, and Pagination controls.
- **Dependencies:** Milestone 4 (v0.5.0), Milestone 5 (v0.6.0).
- **Expected files/modules affected:**
  - `migrations/0008_fts5_search.sql`
  - `src/features/search/api/*`, `src/features/search/components/*`, `src/features/search/db/*`
  - `src/features/products/components/ProductCard.tsx`, `src/features/products/components/ProductGrid.tsx`
- **Risks:**
  - FTS5 syntax errors on special characters in customer search queries (`"`, `'`, `*`, `-`). All user search input must be safely sanitized before FTS5 query matching.
- **Testing requirements:**
  - Unit tests for search query string sanitization and pagination math.
  - Integration tests verifying FTS5 returns matching lawn/khaddar suits in sub-10ms query time.
  - Playwright E2E tests verifying searching for "Lawn", applying category filter, and viewing search results.
- **Definition of completion:**
  - FTS5 search queries verified against SQL injection and syntax errors.
  - Tagged Git release `v0.9.0`.

---

### Milestone 9: Shopping Cart & Stock Validation Engine (v0.10.0) — [COMPLETED]
- **Goal:** Implement an edge-validated shopping cart that supports guest users via browser local storage and authenticated users via D1 synchronization, with real-time stock availability verification.
- **Status:** Completed on 2026-07-30 (`v0.10.0`). All type checking, linting, unit tests, integration tests, and E2E cart tests passing.
- **Features included:**
  - Shopping Cart React Context/State provider and local storage persistence for guests.
  - API endpoint: `POST /api/v1/cart/validate` (takes an array of `variantId` and `quantity`, checks D1 `quantity_available`, and returns verified item prices, names, stock warnings, and total PKR).
  - Storefront UI: Sliding Cart Drawer, Cart Page, quantity increment/decrement controls, item removal, and "Proceed to COD Checkout" button.
- **Dependencies:** Milestone 6 (v0.7.0 - Must validate against active inventory ledger).
- **Expected files/modules affected:**
  - `src/features/cart/api/*`, `src/features/cart/components/*`, `src/features/cart/hooks/*`, `src/features/cart/types/*`
  - `src/shared/components/CartDrawer.tsx`
- **Risks:**
  - Cart price tampering if checkout trusts client-side cart totals instead of re-calculating from `products.base_price_pkr` / `variants.price_override_pkr` on the server.
- **Testing requirements:**
  - Unit tests for cart subtotal PKR calculation and quantity clipping when requested qty exceeds available stock.
  - Integration tests verifying `POST /api/v1/cart/validate` rejects out-of-stock items and recalculates authoritative server-side prices.
  - Playwright E2E tests for adding size M to cart, modifying quantity in drawer, and verifying PKR total.
- **Definition of completion:**
  - Server-side price authority verified (zero client-side price trust).
  - Tagged Git release `v0.10.0`.

---

### Milestone 10: Discount Code & Coupon Promotion Engine (v0.11.0) — [COMPLETED]
- **Goal:** Build a promotion and discount code engine supporting percentage-off and fixed PKR discounts with minimum order thresholds and usage limits.
- **Status:** Completed on 2026-07-30 (`v0.11.0`). All type checking, linting, unit tests, integration tests, and E2E discount tests passing.
- **Features included:**
  - D1 schema: `discounts` (`id`, `code`, `type`: `PERCENTAGE` | `FIXED_PKR`, `value`, `min_order_pkr`, `max_discount_pkr`, `start_time`, `end_time`, `usage_limit`, `used_count`, `is_active`).
  - API endpoint: `POST /api/v1/discounts/validate` (evaluates coupon validity against subtotal PKR, expiration, and usage counts).
  - Admin UI: Coupon Management table, create discount form, and usage tracker.
  - Storefront UI: "Apply Coupon" input field inside the Cart Drawer and Checkout Summary.
- **Dependencies:** Milestone 9 (v0.10.0 - Evaluates against shopping cart subtotal).
- **Expected files/modules affected:**
  - `migrations/0009_discounts.sql`
  - `src/features/discounts/api/*`, `src/features/discounts/components/*`, `src/features/discounts/db/*`, `src/features/discounts/utils/*`
- **Risks:**
  - Coupon stacking or negative subtotal calculations if discount value exceeds order subtotal.
- **Testing requirements:**
  - Unit tests verifying percentage caps, max discount PKR ceiling, expired code rejection, and minimum order amount rules.
  - Integration tests verifying atomic increment of `used_count` when an order is finalized.
  - Playwright E2E tests applying a valid coupon code and verifying total PKR reduction.
- **Definition of completion:**
  - Discount validation rules covered by unit and integration tests.
  - Tagged Git release `v0.11.0`.

---

### Milestone 11: Cash on Delivery (COD) Checkout Engine (v0.12.0)
- **Goal:** Build a frictionless, conversion-optimized Cash on Delivery checkout flow specifically tailored for the Pakistani market with Turnstile bot verification and automated COD shipping rate calculation.
- **Features included:**
  - COD Checkout Form (Guest or Logged-in Customer): Full Name, Pakistani Mobile (`03XX...`), City selector, Street Address, Optional Order Notes.
  - Shipping fee calculation engine: reads free-shipping threshold from `store_settings` and calculates shipping PKR.
  - Cloudflare Turnstile token challenge required before order submission.
  - API endpoint: `POST /api/v1/checkout/cod`
    - Executes atomic D1 transaction:
      1. Verifies Turnstile token.
      2. Validates coupon code if provided.
      3. Verifies stock and decrements `quantity_available`, increments `quantity_reserved`.
      4. Inserts `orders` header (`status`: `PENDING_VERIFICATION` if over high-value threshold, else `CONFIRMED`).
      5. Inserts line items in `order_items`.
      6. Writes initial `order_timeline` entry.
  - Storefront UI: Single-page COD checkout view and "Order Confirmed" thank-you page with Order Number (`#PK-10045`).
- **Dependencies:** Milestone 2 (v0.3.0 - COD Settings), Milestone 7 (v0.8.0 - Pakistani Address), Milestone 9 (v0.10.0 - Cart), Milestone 10 (v0.11.0 - Discounts).
- **Expected files/modules affected:**
  - `migrations/0010_orders.sql`
  - `src/features/checkout/api/*`, `src/features/checkout/components/*`, `src/features/checkout/db/*`, `src/features/checkout/validation/*`
  - `src/features/orders/db/*`
- **Risks:**
  - Partial transaction failure leaving reserved stock locked without a created order header if D1 batch queries are not structured correctly.
- **Testing requirements:**
  - Unit tests for COD shipping rate math (free shipping over threshold vs. standard PKR shipping fee).
  - Integration tests verifying `POST /api/v1/checkout/cod` atomic D1 batch transaction (order header + items + stock reservation + discount usage increment).
  - Playwright E2E full checkout journey: Guest cart -> enter Lahore COD address -> Turnstile verify -> confirm order -> see Order Confirmation page.
- **Definition of completion:**
  - 100% atomic D1 transaction checkout verified.
  - High-value COD verification rule tested.
  - Tagged Git release `v0.12.0`.

---

### Milestone 12: Order Lifecycle Management & Audit Timeline (v0.13.0)
- **Goal:** Implement complete order lifecycle management for Pakistani COD workflows with an immutable audit timeline and staff status tracking.
- **Features included:**
  - COD Order State Machine:
    - `PENDING_VERIFICATION` -> `CONFIRMED` -> `PROCESSING` -> `SHIPPED` -> `DELIVERED`
    - `CANCELLED` (releases reserved stock back to `quantity_available`).
    - `RETURNED` (logs return reason and optional inventory restock).
  - API endpoints:
    - `GET /api/v1/orders/:orderNumber` (Customer/Guest order tracking by number + phone verification).
    - `GET /api/v1/admin/orders` (Filtered by status, date, city, customer).
    - `PATCH /api/v1/admin/orders/:id/status` (Updates status, writes mandatory `order_timeline` audit record).
  - Admin UI: Order Management Kanban/Table view, Order Detail View with itemized bill PKR, and Status Change modal with comment log.
  - Storefront UI: Order Tracking Page (`/track-order`) for checking COD delivery status.
- **Dependencies:** Milestone 11 (v0.12.0).
- **Expected files/modules affected:**
  - `migrations/0011_order_timeline.sql`
  - `src/features/orders/api/*`, `src/features/orders/components/*`, `src/features/orders/db/*`, `src/features/orders/types/*`
- **Risks:**
  - Stock leak if cancelling an order fails to release `quantity_reserved` back to `quantity_available`.
- **Testing requirements:**
  - Unit tests for order state machine valid transitions (preventing a `DELIVERED` order from jumping back to `PENDING_VERIFICATION`).
  - Integration tests verifying order cancellation transaction automatically restores SKU `quantity_available`.
  - Playwright E2E tests for admin changing order status from Confirmed to Shipped to Delivered and checking customer order tracking page.
- **Definition of completion:**
  - State machine transition rules and inventory restock on cancellation verified.
  - Tagged Git release `v0.13.0`.

---

### Milestone 13: Admin Dashboard & Core E-Commerce Analytics (v0.14.0)
- **Goal:** Build the executive Admin Dashboard overview summarizing key Pakistani e-commerce metrics and store health indicators.
- **Features included:**
  - Aggregation SQL queries in D1:
    - Total Gross Revenue PKR (for Delivered orders).
    - Total Orders count & COD Pending Verification count.
    - Low-stock SKU alerts count.
    - Top 5 best-selling clothing products by revenue and volume.
    - Recent orders feed.
  - API endpoint: `GET /api/v1/admin/analytics/overview?timeframe=30d`.
  - Admin UI: Chart/Metric Card dashboard overview, quick-action links to pending COD orders, and inventory alert banner.
- **Dependencies:** Milestone 12 (v0.13.0 - Requires active order data).
- **Expected files/modules affected:**
  - `src/features/admin/components/AdminDashboardOverview.tsx`
  - `src/features/analytics/api/*`, `src/features/analytics/db/*`, `src/features/analytics/types/*`
- **Risks:**
  - Full table scans on `orders` table for analytics queries causing worker CPU timeouts on large datasets (mitigated by indexed status and date columns).
- **Testing requirements:**
  - Unit tests for metric calculation aggregators.
  - Integration tests running analytics queries against a seeded D1 database to verify performance (<20ms execution time).
  - Playwright E2E test verifying Admin Dashboard overview renders correct total PKR after test order completion.
- **Definition of completion:**
  - Analytics SQL query execution time verified.
  - Tagged Git release `v0.14.0`.

---

### Milestone 14: Version 1 Production Hardening, Audit & Stable Release (v1.0.0)
- **Goal:** Perform a comprehensive end-to-end security, performance, accessibility, SEO, and edge deployment audit to certify Version 1 as a stable, production-grade reusable commerce framework.
- **Features included:**
  - End-to-end security review: SQL injection, XSS, CSRF, Turnstile rate limiting, cookie security.
  - Storefront performance optimization: Lighthouse score verification (Performance > 90, Accessibility > 95, SEO > 95).
  - Dynamic SEO metadata and `sitemap.xml` / `robots.txt` edge generator for categories and product lookbooks.
  - Final synchronization of all 10 core documentation files.
  - Production deployment verification on Cloudflare Pages, Workers, D1, R2, and KV.
- **Dependencies:** All previous Milestones (v0.1.0 through v0.14.0).
- **Expected files/modules affected:**
  - `README.md`, `CHANGELOG.md`, `DEPLOYMENT.md`, `API.md`, `DATABASE.md`
  - `src/app/sitemap.ts`, `public/robots.txt`
- **Risks:**
  - Undiscovered edge runtime differences between local `miniflare` emulation and live Cloudflare production workers.
- **Testing requirements:**
  - Complete execution of automated Unit, Integration, and Playwright E2E test suites (100% pass required).
  - Production verification deployment test on Cloudflare Pages + D1 + R2 staging environment.
- **Definition of completion:**
  - All 10 mandatory documentation files updated and verified.
  - 100% test suite passing.
  - Zero critical/high security findings.
  - Tagged stable Git release `v1.0.0`.

---

## Current Engineering Status

- **Roadmap & Architectural Blueprint:** Approved by User (2026-07-30).
- **Milestone 0 (`v0.1.0`):** Complete & Verified (2026-07-30).
- **Milestone 1 (`v0.2.0`):** Complete & Verified (2026-07-30).
- **Milestone 2 (`v0.3.0`):** Complete & Verified (2026-07-30).
- **Milestone 3 (`v0.4.0`):** Complete & Verified (2026-07-30).
- **Milestone 4 (`v0.5.0`):** Complete & Verified (2026-07-30).
- **Milestone 5 (`v0.6.0`):** Complete & Verified (2026-07-30).
- **Milestone 6 (`v0.7.0`):** Complete & Verified (2026-07-30).
- **Milestone 7 (`v0.8.0`):** Complete & Verified (2026-07-30).
- **Milestone 8 (`v0.9.0`):** Complete & Verified (2026-07-30).
- **Milestone 9 (`v0.10.0`):** Complete & Verified (2026-07-30).
- **Milestone 10 (`v0.11.0`):** Complete & Verified (2026-07-30).
- **Next Planned Release:** Milestone 11 (`v0.12.0`) — Cash on Delivery (COD) Checkout Engine.
  - In accordance with the **Project Constitution**: *"Never continue implementing additional features until the current milestone is fully complete. Build only the approved milestone."*
  - Ready to commence Milestone 11 (`v0.12.0`) upon user command.
