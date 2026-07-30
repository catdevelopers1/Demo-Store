# Changelog — Reusable Pakistani Commerce Framework

All notable changes to this project are documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [v1.0.0] - 2026-07-30 — Milestone 14: Version 1 Production Hardening, Audit & Stable Release
### Added
- Implemented enterprise-grade HTTP security headers middleware (`src/core/security/securityHeaders.ts`):
  - Automatically attaches `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `Strict-Transport-Security` (`HSTS`), and `Content-Security-Policy` (`CSP` including Turnstile `frame-src https://challenges.cloudflare.com`) to all Cloudflare Worker responses.
- Implemented dynamic Edge SEO & Sitemap generator module (`src/features/seo/`):
  - `generateRobotsTxt`: generates dynamic robots directives allowing discovery indexing while shielding `/admin`, `/account`, and `/checkout` private routes.
  - `generateSitemapXml`: queries Cloudflare D1 for active collections and product lookbooks (`SELECT slug, updated_at FROM ... WHERE is_active = 1`) to generate an XML sitemap (`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`).
  - Edge Worker API endpoints in `src/features/seo/api/handlers.ts`:
    - `GET /robots.txt` (serves dynamic robots text with `Cache-Control: max-age=86400`).
    - `GET /sitemap.xml` (serves XML sitemap document with `Cache-Control: max-age=3600`).
  - React 19 `<SeoHead />` component (`src/features/seo/components/SeoHead.tsx`):
    - Synchronizes document `<title>`, `<meta name="description">`, OpenGraph tags, canonical links, and Schema.org structured data JSON-LD scripts (`"WebSite"` and `"Product"` schemas with PKR currency pricing and stock availability).
    - Integrated `<SeoHead />` across `<Home />`, `<ProductDetailView />`, `<CatalogDiscoveryPage />`, and `<OrderTrackingPage />`.
  - Added static fallbacks `public/robots.txt` and `src/app/sitemap.ts`.
- Certified complete 100% test suite passing across all 145 automated tests (46 test suites):
  - 16 Unit Test Suites (84 unit tests passing, including SEO generator and security headers tests).
  - 15 Integration Test Suites (36 integration tests passing, including dynamic XML sitemap D1 queries).
  - 15 Playwright E2E User-Journey Test Suites (25 E2E tests passing, including metadata and Schema.org DOM injection).
- Audited and synchronized all 10 root Project Memory documentation files (`PROJECT_CONSTITUTION.md`, `PROJECT_CHARTER.md`, `ARCHITECTURE.md`, `ROADMAP.md`, `DATABASE.md`, `API.md`, `DEPLOYMENT.md`, `ENVIRONMENT_SETUP.md`, `CONTRIBUTING.md`, and `README.md`) for Version 1.0.0 Stable Enterprise Release.

---

## [v0.14.0] - 2026-07-30 — Milestone 13: Admin Dashboard & Core E-Commerce Analytics
### Added
- Created D1 SQLite migration `migrations/0012_analytics.sql` establishing composite indexes `idx_orders_status_created ON orders(status, created_at)` and `idx_order_items_order_total ON order_items(order_id, total_pkr)` for high-speed aggregations, and seeding historical COD orders (`#PK-10007` through `#PK-10009`) across multiple dates.
- Implemented analytics calculation utilities (`src/features/analytics/utils/calculator.ts`):
  - `calculateAverageOrderValue`: computes Average Order Value (AOV) in PKR.
  - `calculateGrowthRate`: calculates percentage growth between timeframes.
  - `getTimeframeStartDateIso`: computes ISO 8601 UTC timestamp start boundaries for SQLite query filtering (`'7d'`, `'30d'`, `'90d'`, `'all'`).
- Implemented Feature-First Executive Analytics module (`src/features/analytics/` & `src/features/admin/`):
  - Zod validation schema (`analyticsQuerySchema`) validating `timeframe` evaluation windows.
  - Index-backed parallel D1 repository (`src/features/analytics/db/analyticsRepository.ts`):
    - `getAnalyticsOverview`: executes 5 index-backed SQLite aggregation queries concurrently (`Promise.all` across order counts/revenue, inventory low-stock alerts, top 5 best-selling apparel products, daily revenue series, and recent order feeds). Total execution time across all 5 queries consistently averages `< 20 milliseconds`.
  - Edge Worker API endpoint (`src/features/analytics/api/handlers.ts`):
    - `GET /api/v1/admin/analytics/overview?timeframe=30d` (RBAC Protected Admin endpoint).
  - Executive Admin Dashboard UI (`<AdminDashboardOverview />` mounted in `src/app/Admin.tsx`):
    - Timeframe switcher (`Last 7 Days`, `Last 30 Days`, `Last 90 Days`, `All Time`) and manual refresh trigger.
    - 4 Primary KPI metric cards: Total Gross Revenue PKR (+ AOV), Total Order Volume, COD Phone Verification Alerts (with quick-link to `/admin/orders`), and Inventory Stock Alerts (with quick-link to `/admin/inventory`).
    - COD Lifecycle Status Distribution progress grid across all 7 COD states.
    - Responsive Daily Revenue & Order Trend visual bar graph with tooltips.
    - Two-column grid featuring Top 5 Best-Selling Pakistani Apparel SKUs and Recent Pakistani COD Orders feed.
- Added 5 unit tests in `tests/unit/analyticsCalculator.test.ts`, 1 integration test in `tests/integration/analyticsApi.test.ts` verifying that D1 parallel aggregation executes in `<20ms` and computes accurate revenue/AOV, and 2 E2E tests in `tests/e2e/analytics.test.tsx` verifying KPI card rendering and data hydration.

---

## [v0.13.0] - 2026-07-30 — Milestone 12: Order Lifecycle Management & Audit Timeline
### Added
- Created D1 SQLite migration `migrations/0011_order_timeline.sql` establishing compound index `idx_orders_tracking ON orders(order_number, guest_phone)` and timeline chronological index `idx_order_timeline_created`, and seeding demo COD orders across all Pakistani lifecycle states (`#PK-10002` through `#PK-10006`).
- Implemented COD order lifecycle state machine & phone normalization utilities (`src/features/orders/utils/`):
  - `stateMachine.ts`: defines valid COD transition paths (`PENDING_VERIFICATION` -> `CONFIRMED` -> `PROCESSING` -> `SHIPPED` -> `DELIVERED`, plus `CANCELLED` and `RETURNED`), transition validator (`isValidStatusTransition`), and Tailwind badge design tokens.
  - `phone.ts`: implements Pakistani mobile number normalization (`normalizePakistaniPhone`) handling `0300-1234567`, `03001234567`, `+923001234567`, and `0092300...`, and safe equality matching (`matchesPakistaniPhone`).
- Implemented Feature-First Order Lifecycle Management module (`src/features/orders/`):
  - Zod schemas (`orderTrackingSchema`, `updateOrderStatusSchema`, `orderFilterSchema`) enforcing 11-digit Pakistani mobile verification for public order tracking and mandatory audit comments (`min(3)`) for staff state changes.
  - Order repository (`src/features/orders/db/orderRepository.ts`):
    - `getOrderByNumberAndPhone`: secure tracking lookup verifying phone number matches `orders.guest_phone` before returning order confirmation and timeline.
    - `getAdminOrders`: paginated admin query filtered by status (`PENDING_VERIFICATION`, `CONFIRMED`, etc.) and search string.
    - `updateOrderStatus`: atomic D1 batch transaction updating order status and recording an immutable audit trail entry in `order_timeline`. Automatically calls `releaseStock` from `src/features/inventory/api/reservation.ts` when transitioning to `CANCELLED` or `RETURNED` (`restockInventory: true`), restoring SKU `quantity_available` from reserved inventory.
  - Edge Worker API endpoints (`src/features/orders/api/handlers.ts`):
    - `GET /api/v1/orders/track?orderNumber=#PK-XXXXX&phone=03XX...` (Public Customer/Guest order tracking endpoint).
    - `GET /api/v1/admin/orders` (RBAC Protected Admin listing endpoint).
    - `PATCH /api/v1/admin/orders/:id/status` (RBAC Protected Admin state transition endpoint).
  - React 19 Storefront and Admin UI components:
    - `<OrderTrackingPage />` (`/track-order`) for public customers to track delivery progress, view itemized PKR bills, and check their timeline trail.
    - `<AdminOrderManager />` (`/admin/orders`) with dual Table View and Kanban Board View, status filter dropdowns, Order Detail view modal, and Update Status modal requiring mandatory audit comment and inventory restock toggle.
- Added 11 unit tests in `tests/unit/orderStateMachine.test.ts`, 4 integration tests in `tests/integration/orderApi.test.ts` (including atomic cancellation restock verification), and 2 E2E user-journey tests in `tests/e2e/orders.test.tsx`.

---

## [v0.12.0] - 2026-07-30 — Milestone 11: Cash on Delivery (COD) Checkout Engine
### Added
- Created D1 SQLite migration `migrations/0010_orders.sql` establishing `orders`, `order_items`, and `order_timeline` tables indexed on customer, order number, and status, and seeding initial demo COD order (`#PK-10001`).
- Implemented Pakistani COD calculation utilities (`src/features/checkout/utils/cod.ts`):
  - `calculateCodShippingPkr`: calculates shipping fee in PKR based on store free-shipping threshold (`5000 PKR`).
  - `generateOrderNumber`: generates executive Pakistani order identifiers (`#PK-XXXXX`).
  - `evaluateOrderInitialStatus`: evaluates high-value orders (`> 25,000 PKR`), setting status to `PENDING_VERIFICATION` requiring manual SMS/WhatsApp customer confirmation before dispatch.
- Implemented Feature-First Cash on Delivery (COD) Checkout module (`src/features/checkout/`):
  - Zod validation schema (`codCheckoutSchema`) validating non-empty cart items, Pakistani shipping address (`03XX...` format, province, city), optional coupon code, and Turnstile challenge token.
  - Authoritative D1 COD repository (`src/features/checkout/db/checkoutRepository.ts`):
    - `executeCodCheckout`: executes a **single atomic D1 batch transaction** (`db.batch()`) across cart re-validation, coupon evaluation, COD shipping math, inventory reservation via conditional SQL constraints (`WHERE quantity_available >= ?`), order header insertion, line item insertion, coupon usage count incrementing, and initial order timeline audit logging.
    - `getOrderByNumber`: retrieves complete order summary and lifecycle timeline by `#PK-XXXXX`.
  - Edge Worker API endpoints in `src/features/checkout/api/handlers.ts`:
    - `POST /api/v1/checkout/cod` (Public endpoint for guest and logged-in customers with Turnstile challenge).
    - `GET /api/v1/orders/:orderNumber` (Public endpoint for order confirmation and tracking).
  - React 19 Storefront COD components:
    - `<CodCheckoutPage />` interactive checkout form (`/checkout`) with automatic default address pre-filling for logged-in customers, Pakistani province/city selectors, promo code input box, COD shipping progress, and high-value verification notice.
    - `<OrderConfirmationPage />` thank-you page (`/order-confirmation/:orderNumber`) with `#PK-XXXXX` header badge, status notification, itemized bill PKR, delivery address snapshot, and audit timeline trail.
- Updated `<CartDrawer />` (`src/features/cart/components/CartDrawer.tsx`) to link "Proceed to COD Checkout" button directly to `/checkout`.
- Added `/checkout` and `/order-confirmation/:orderNumber` routes to `src/app/Router.tsx`.
- Created comprehensive test suite for Milestone 11:
  - Unit tests: `tests/unit/checkoutValidation.test.ts` (7 tests covering COD shipping threshold math, high-value order verification flags, `#PK-XXXXX` formatting, and Zod checkout payloads).
  - Integration tests: `tests/integration/checkoutApi.test.ts` (1 test covering atomic D1 order retrieval and timeline assembly).
  - Storefront E2E tests: `tests/e2e/checkout.test.tsx` (2 tests covering empty checkout fallback and Order Confirmation Page loading state).

---

## [v0.11.0] - 2026-07-30 — Milestone 10: Discount Code & Coupon Promotion Engine
### Added
- Created D1 SQLite migration `migrations/0009_discounts.sql` establishing the `discounts` promotional table (`code`, `type`, `value`, `min_order_pkr`, `max_discount_pkr`, `start_time`, `end_time`, `usage_limit`, `used_count`, `is_active`) indexed on code and status, and seeding initial Pakistani clothing sales coupons (`AZADI14`, `LAWNSALE500`, `EXPIRED10`).
- Implemented Feature-First Discount Code & Coupon Promotion module (`src/features/discounts/`):
  - Pure promotion calculation engine (`src/features/discounts/utils/calculator.ts`):
    - `evaluateDiscount`: evaluates percentage (`PERCENTAGE`) and fixed PKR (`FIXED_PKR`) coupons against order subtotals.
    - Enforces 5 strict promotion rules: active status, start/end timestamps, usage limit ceilings (`usedCount < usageLimit`), minimum order threshold (`subtotal >= minOrderPkr`), and maximum percentage discount cap (`maxDiscountPkr`).
    - Enforces non-negative subtotal safeguard (`Math.max(0, subtotal - discountPkr)`).
  - Zod validation schemas (`validateCouponSchema`, `createDiscountSchema`) validating coupon code formatting (`/^[A-Z0-9_-]+$/`), positive values, and valid ISO date ranges.
  - Authoritative D1 discount repository (`discountRepository.ts`):
    - `getDiscountByCode`: case-insensitive promo code lookup.
    - `createDiscount`, `updateDiscount`, `deleteDiscount`, `getAllDiscounts`.
    - `incrementDiscountUsage`: atomic D1 SQL query incrementing `used_count` when COD checkout completes.
  - Edge Worker API endpoints in `src/features/discounts/api/handlers.ts`:
    - `POST /api/v1/discounts/validate` (Public endpoint for evaluating coupon codes against subtotal PKR).
    - `GET /api/v1/admin/discounts`, `POST /api/v1/admin/discounts`, `PUT /api/v1/admin/discounts/:id`, `DELETE /api/v1/admin/discounts/:id` (`ADMIN` RBAC protected).
  - React 19 Storefront & Admin promotion components:
    - `DiscountProvider` context and `useDiscount()` hook.
    - `<AdminDiscountManager />` comprehensive coupon management interface (`/admin/discounts`) with create/edit/delete tools, type selector, usage tracking, and safeguard notice.
- Updated Cart Drawer (`CartDrawer.tsx` in `src/features/cart/components/`) to integrate promo code input, real-time `/api/v1/discounts/validate` evaluation, applied coupon badge (`Coupon AZADI14 applied -PKR 975`), and subtotal discount reduction.
- Added `/admin/discounts` route protected by `<AdminGuard />` to `src/app/Router.tsx`.
- Created comprehensive test suite for Milestone 10:
  - Unit tests: `tests/unit/discountCalculator.test.ts` (6 tests covering percentage calculation, max cap ceiling, fixed PKR safeguard, min order threshold, usage limit, and expiration date rules).
  - Integration tests: `tests/integration/discountApi.test.ts` (2 tests covering case-insensitive D1 lookup and atomic usage count incrementation).
  - Storefront E2E tests: `tests/e2e/discounts.test.tsx` (1 test covering Admin Discount Manager and promo code creation form).

---

## [v0.10.0] - 2026-07-30 — Milestone 9: Shopping Cart & Stock Validation Engine
### Added
- Implemented Feature-First Shopping Cart & Stock Validation module (`src/features/cart/`):
  - Zod validation schemas (`cartItemInputSchema`, `validateCartSchema`) verifying item quantities (1 to 100 per SKU) and variant ID presence.
  - Authoritative server-side cart validator (`validateCartItems` in `src/features/cart/db/cartRepository.ts`):
    - Re-calculates authoritative unit prices in PKR directly from D1 (`v.price_override_pkr ?? p.base_price_pkr`) so client-side price tampering is impossible.
    - Evaluates SKU stock against `inventory_items` (`quantity_available`), automatically clipping requested quantities if stock is insufficient (`verifiedQuantity = Math.min(requested, available)`).
    - Generates actionable stock warning notices (`"Only X units left in stock — quantity adjusted"` or `"SKU is out of stock"`).
    - Computes verified line totals, overall subtotal PKR, and total item counts.
  - Edge Worker API endpoint in `src/features/cart/api/handlers.ts`:
    - `POST /api/v1/cart/validate` (Public endpoint for server-side cart pricing and inventory verification).
  - React 19 Storefront cart components & state providers:
    - `CartProvider` context and `useCart()` hook with automatic local storage persistence (`pakistani_cart_v1`) and D1 server-side validation on every modification.
    - `<CartDrawer />` sliding storefront shopping bag (`COD Shopping Bag`) featuring verified item list, lookbook thumbnail, unit price PKR, `+` / `-` quantity incrementors, line removal, inventory warning banner, and Free COD Shipping threshold progress bar ("Add PKR X more to unlock Free COD Shipping across Pakistan").
- Updated storefront layout (`src/app/Layout.tsx`, `src/app/Home.tsx`, `src/app/Router.tsx`):
  - Wired shopping bag header icon to toggle `<CartDrawer />` and display real-time total item count badge.
  - Wrapped `<BrowserRouter>` in `<CartProvider />`.
- Updated Product Detail Page (`ProductDetailView.tsx`):
  - Wired `"Add to COD Cart — PKR X"` button to `addItem(variantId, 1)` which validates against D1 and opens the Cart Drawer automatically.
- Created comprehensive test suite for Milestone 9:
  - Unit tests: `tests/unit/cartValidation.test.ts` (4 tests covering item input schemas, quantity bounds 1-100, and negative quantity rejection).
  - Integration tests: `tests/integration/cartApi.test.ts` (2 tests covering authoritative server-side price overrides, stock quantity clipping, and out-of-stock validation).
  - Storefront E2E tests: `tests/e2e/cart.test.tsx` (1 test covering COD Shopping Bag drawer mounting and context integration).

---

## [v0.9.0] - 2026-07-30 — Milestone 8: Storefront Product Discovery & FTS5 Edge Search
### Added
- Created D1 SQLite migration `migrations/0008_fts5_search.sql` establishing the `products_fts` full-text search virtual table (`tokenize='porter unicode61'`) and synchronization triggers (`trg_products_ai`, `trg_products_au`, `trg_products_ad`) that automatically mirror catalog items into the search index.
- Implemented Feature-First Storefront Product Discovery & FTS5 Edge Search module (`src/features/search/`):
  - FTS5 query sanitization (`sanitizeFtsQuery`): safely strips control characters and formats prefix keyword matching (`"lawn suit"` -> `"lawn* suit*"`) to prevent SQL syntax errors.
  - Standardized pagination calculator (`calculatePagination`) computing safe `totalPages`, `offset`, and bounds clamping.
  - Zod validation schema (`searchQuerySchema`) validating keyword queries, category filters, non-negative PKR price ranges, sorting enums (`relevance`, `price_asc`, `price_desc`, `newest`), and pagination limits.
  - Authoritative D1 FTS5 repository (`src/features/search/db/searchRepository.ts`): executes high-speed `MATCH` queries over `products_fts` joined with relational category and PKR price range filters.
  - Edge Worker API endpoint in `src/features/search/api/handlers.ts`:
    - `GET /api/v1/search` (Public endpoint with Edge `Cache-Control: public, max-age=30, s-maxage=120, stale-while-revalidate=300`).
  - React 19 Storefront discovery components:
    - `SearchProvider` context and `useSearch()` hook with URL query parameter synchronization.
    - `<StorefrontSearchBar />` responsive search input bar integrated into the navigation header.
    - `<CatalogDiscoveryPage />` full discovery page (`/search`) with category filter pills ("All Collections", "Unstitched Lawn", "3-Piece"), PKR price range inputs, sorting dropdown, result count header, and pagination controls.
- Updated storefront layout (`src/app/Layout.tsx`, `src/app/Home.tsx`) to render `<StorefrontSearchBar />` in the header and link to `/search`.
- Added `/search` public route to `src/app/Router.tsx`.
- Created comprehensive test suite for Milestone 8:
  - Unit tests: `tests/unit/searchUtils.test.ts` (4 tests covering FTS5 sanitization, prefix wildcards, and pagination math).
  - Integration tests: `tests/integration/searchApi.test.ts` (1 test covering D1 FTS5 MATCH query execution and pagination metadata).
  - Storefront E2E tests: `tests/e2e/search.test.tsx` (1 test covering Catalog Discovery Page, category pills, price filter inputs, and sorting).

---

## [v0.8.0] - 2026-07-30 — Milestone 7: Customer Profile & Pakistani Address Book
### Added
- Created D1 SQLite migration `migrations/0007_customer_addresses.sql` establishing `customer_profiles` (`default_address_id` foreign key) and `customer_addresses` tables (`recipient_name`, `phone`, `city`, `province_state`, `street_address`, `postal_code`, `is_default`), indexed on customer and city/province, and seeding default Lahore/Punjab shipping address for demo customer.
- Implemented Pakistani Location Standardization utilities (`src/features/customers/utils/pakistanLocations.ts`):
  - `PAKISTAN_PROVINCES`: 7 administrative provinces/territories (`Punjab`, `Sindh`, `Khyber Pakhtunkhwa`, `Balochistan`, `Islamabad Capital Territory`, `Azad Jammu and Kashmir`, `Gilgit-Baltistan`).
  - `PAKISTAN_CITIES_BY_PROVINCE`: comprehensive city lists per province for accurate COD shipping rate rules.
  - `formatPakistanPhone`: formats Pakistani mobile numbers cleanly (`0300-1234567` / `+923XX-XXXXXXX`).
- Implemented Feature-First Customer Profile & Address Book module (`src/features/customers/`):
  - Zod validation schema (`addressSchema`) enforcing Pakistani mobile regex, province allowlist, 5-digit postal code (`54660`), and detailed street addresses for COD couriers.
  - Authoritative D1 repository (`customerRepository.ts`):
    - `getCustomerProfileWithAddresses`: joins user identity, active default address, and address book list.
    - `createCustomerAddress`: inserts shipping address with automatic default promotion: if it is the customer's first address or flagged default, executes atomic D1 batch transaction (`db.batch()`) unsetting other defaults and updating `customer_profiles.default_address_id`.
    - `updateCustomerAddress`: updates address and toggles default atomically.
    - `deleteCustomerAddress`: deletes address. If the deleted address was active default, executes atomic D1 batch transaction promoting the most recent remaining address to default.
  - Edge Worker API endpoints in `src/features/customers/api/handlers.ts`:
    - `GET /api/v1/customer/profile` (Protected by `requireAuth`).
    - `GET /api/v1/customer/addresses` (Protected by `requireAuth`).
    - `POST /api/v1/customer/addresses` (Protected by `requireAuth`, atomic default toggle).
    - `PUT /api/v1/customer/addresses/:id` (Protected by `requireAuth`).
    - `DELETE /api/v1/customer/addresses/:id` (Protected by `requireAuth`, atomic promotion of remaining address).
  - React 19 Storefront customer account components:
    - `CustomerProvider` context and `useCustomer()` hook.
    - `<CustomerAccountDashboard />` full Customer Dashboard (`/account`) with profile summary header, Pakistani Address Book list, "Add Pakistani Shipping Address" modal with interactive Province/City dropdowns, default badge, and quick default promotion.
- Replaced placeholder `/account` view in `src/app/Account.tsx` and updated `src/app/Layout.tsx` version badge.
- Created comprehensive test suite for Milestone 7:
  - Unit tests: `tests/unit/customerValidation.test.ts` (5 tests covering Pakistani province/city location lists, phone hyphen formatting, and 5-digit postal code check).
  - Integration tests: `tests/integration/customerApi.test.ts` (3 tests covering automatic first address default setting, atomic D1 batch default toggling, and deletion promotion).
  - Storefront E2E tests: `tests/e2e/customers.test.tsx` (1 test covering Customer Account Dashboard and Address Book tab).

---

## [v0.7.0] - 2026-07-30 — Milestone 6: Inventory & Stock Management Engine
### Added
- Created D1 SQLite migration `migrations/0006_inventory.sql` establishing `inventory_items` (`quantity_available`, `quantity_reserved`, `low_stock_threshold`) and `inventory_logs` audit tables with non-negative constraints (`CHECK (quantity_available >= 0)`) and seeding initial stock ledger for existing catalog SKUs.
- Implemented internal atomic reservation engine (`src/features/inventory/api/reservation.ts`):
  - `reserveStock`: atomically reserves stock during COD checkout using conditional SQL constraints (`WHERE quantity_available >= ?`), guaranteeing zero negative stock under race conditions.
  - `releaseStock`: atomically restores `quantity_available` from `quantity_reserved` when an order is cancelled or returned.
- Implemented Feature-First Inventory & Stock Management module (`src/features/inventory/`):
  - Zod validation schema (`adjustStockSchema`) requiring non-zero integer adjustments, strict reasons (`RESTOCK`, `ADJUSTMENT`, `RETURN`), and mandatory audit comment (`min 3 chars`).
  - Authoritative D1 inventory repository (`src/features/inventory/db/inventoryRepository.ts`):
    - `getInventoryLedger`: retrieves full stock ledger with `IN_STOCK`, `LOW_STOCK`, and `OUT_OF_STOCK` evaluations.
    - `getInventoryLogs`: retrieves immutable audit log history for SKUs.
    - `adjustStockManual`: executes manual adjustments inside an atomic D1 batch transaction (`UPDATE inventory_items` + `INSERT INTO inventory_logs`).
    - `getPublicVariantStock`: public helper returning stock availability for storefront SKU selection.
  - Edge Worker API endpoints in `src/features/inventory/api/handlers.ts`:
    - `GET /api/v1/admin/inventory` (`ADMIN` RBAC protected, supports `?lowStock=true` and search filters).
    - `GET /api/v1/admin/inventory/:id/logs` (`ADMIN` RBAC protected).
    - `PATCH /api/v1/admin/inventory/:id` (`ADMIN` RBAC protected, executes atomic adjustment).
    - `GET /api/v1/inventory/check?variantId=<id>` (Public storefront availability lookup).
  - React 19 Storefront & Admin inventory components:
    - `InventoryProvider` context and `useInventory()` hook.
    - `<AdminInventoryManager />` comprehensive stock ledger interface (`/admin/inventory`) with KPI overview cards (Total SKUs, Low Stock Alerts, Out of Stock), filter toolbar, manual adjustment modal, and audit log drawer.
- Updated Product Detail Page (`ProductDetailView.tsx`) to check real-time stock on variant selection, dynamically rendering `"Out of Stock"` badges and disabling COD cart buttons when `quantityAvailable === 0`, or showing amber `"Only X left in stock!"` warning badges when low stock.
- Added `/admin/inventory` route protected by `<AdminGuard />` to `src/app/Router.tsx`.
- Created comprehensive test suite for Milestone 6:
  - Unit tests: `tests/unit/inventoryValidation.test.ts` (4 tests covering Zod adjustment schema and audit comment mandate).
  - Integration tests: `tests/integration/inventoryApi.test.ts` (4 tests covering atomic D1 batch adjustments, negative stock blocking, and conditional SQL concurrency reservation protection).
  - Storefront E2E tests: `tests/e2e/inventory.test.tsx` (1 test covering Admin Inventory Manager KPI cards and low-stock filter).

---

## [v0.6.0] - 2026-07-30 — Milestone 5: R2 Product Image & Asset Pipeline
### Added
- Created D1 SQLite migration `migrations/0005_product_images.sql` establishing the `product_images` lookbook schema (`r2_key`, `url`, `alt_text`, `sort_order`, `is_primary`) with foreign key cascade rules on `product_id` and `variant_id` and seeding initial Pakistani clothing lookbook image references.
- Created Cloudflare R2 object storage wrapper helper (`R2StorageClient` in `src/core/r2/index.ts`) providing `upload(key, data, options)`, `delete(key)`, and CDN URL formatting (`getPublicUrl`).
- Implemented Feature-First R2 Product Image & Lookbook module:
  - Zod validation schemas (`imageUploadSchema`) enforcing allowed MIME formats (`image/webp`, `image/jpeg`, `image/png`, `image/avif`), 5 MB file size limit, and structured R2 key generation (`products/{productId}/{timestamp}-{filename}`).
  - Authoritative D1 image repository (`src/features/products/db/imageRepository.ts`):
    - `getProductImages`: retrieves lookbook imagery sorted by `is_primary DESC, sort_order ASC`.
    - `createProductImageRecord`: inserts metadata into D1 `product_images` table.
    - `deleteProductImageRecord`: deletes object from Cloudflare R2 bucket (`BUCKET.delete(r2_key)`) and deletes D1 metadata.
    - `setPrimaryImage`: executes atomic D1 batch transaction unsetting existing primary covers and setting target image as primary lookbook cover.
  - Edge Worker API endpoints in `src/features/products/api/imageUpload.ts`:
    - `GET /api/v1/products/:id/images` (Public endpoint with Edge `Cache-Control`).
    - `POST /api/v1/admin/images/upload` (`ADMIN` RBAC protected, uploads to R2 bucket and D1 with automatic **Orphan Defense**: if D1 insertion fails, deletes R2 object immediately).
    - `PATCH /api/v1/admin/images/:id/primary` (`ADMIN` RBAC protected, atomically toggles primary cover).
    - `DELETE /api/v1/admin/images/:id` (`ADMIN` RBAC protected, removes R2 asset and D1 metadata).
  - React 19 Storefront & Admin lookbook components:
    - `<ProductImageGallery />` interactive lookbook viewer inside Product Detail Page (`/product/:slug`) with primary badge, thumbnail row switcher, COD ready tag, and zoom-in preview modal.
    - `<AdminImageManager />` comprehensive lookbook management interface (`/admin/images`) allowing store administrators to upload images, set primary covers, and delete assets from R2.
- Updated storefront layout (`src/app/Layout.tsx`, `src/app/Home.tsx`, `src/app/Admin.tsx`) and PDP (`ProductDetailView.tsx`) to render R2 lookbook galleries.
- Added `/admin/images` route protected by `<AdminGuard />` to `src/app/Router.tsx`.
- Created comprehensive test suite for Milestone 5:
  - Unit tests: `tests/unit/imageValidation.test.ts` (4 tests covering MIME format allowlist, 5 MB size ceiling check, and R2 storage key formatting).
  - Integration tests: `tests/integration/imageApi.test.ts` (3 tests covering D1 image record creation, atomic primary cover batch toggling, and R2 object deletion cleanup).
  - Storefront E2E tests: `tests/e2e/images.test.tsx` (2 tests covering lookbook gallery fallback and Admin Image Manager format notice).

---

## [v0.5.0] - 2026-07-30 — Milestone 4: Product Catalog & Variant Matrix Engine
### Added
- Created D1 SQLite migration `migrations/0004_products_variants.sql` establishing the relational catalog schema (`products`, `product_options`, `product_option_values`, `product_variants`, and `product_variant_options`) with foreign key cascade rules and seeding initial Pakistani clothing catalog items ("Gul-e-Bahar Lawn 3-Piece" and "Kashmiri Khaddar Winter Suit").
- Implemented Feature-First Product Catalog & Variant Matrix modules (`src/features/products/` and `src/features/variants/`):
  - Pure domain utilities in `src/features/variants/utils/matrix.ts`:
    - `generateCartesianVariants`: computes Cartesian products of apparel options (`[S, M, L] × [Red, Blue] = 6 SKUs`).
    - `generateSku`: auto-generates structured uppercase SKUs (`PK-LWN-S-GRN`).
    - `formatPkr`: formats Pakistani Rupee prices (`"PKR 6,500"`).
  - Zod validation schemas (`createProductSchema`, `updateProductSchema`) with SKU uniqueness validation across the variant matrix payload.
  - Authoritative D1 repository (`productRepository.ts`):
    - `getProducts`: queries catalog with optional category, search keyword, and min/max PKR filters.
    - `getProductBySlug`: retrieves product header, options, values, and all discrete sellable SKUs with option linkages.
    - `createProductWithVariants`: executes atomic D1 batch transactions (`db.batch()`) across all 5 catalog tables so a product and its Cartesian variant matrix are created atomically or rolled back cleanly.
  - Edge Worker API endpoints in `src/features/products/api/handlers.ts`:
    - `GET /api/v1/products` (supports search and price filters with Edge `Cache-Control`).
    - `GET /api/v1/products/:slug` (retrieves single product with options, values, and SKU overrides).
    - `POST /api/v1/admin/products` (`ADMIN` RBAC protected, executes atomic D1 batch transaction).
  - React 19 Storefront & Admin catalog components:
    - `ProductsProvider` context and `useProducts()` hook.
    - `<ProductCard />` storefront clothing card with PKR formatting and COD ready badge.
    - `<ProductCatalogGrid />` catalog listing component (`/products`).
    - `<ProductDetailView />` storefront PDP (`/product/:slug`) with interactive size/color option selector pills, live SKU/price override updates, and COD free shipping notice.
    - `<AdminProductWizard />` interactive admin wizard (`/admin/products`) allowing store administrators to define options, generate Cartesian SKU matrices, set custom variant PKR prices, and save to D1.
- Updated storefront layout (`src/app/Layout.tsx`, `src/app/Home.tsx`, `src/app/Admin.tsx`) to link to `/products`, `/product/:slug`, and `/admin/products`.
- Added `/products` and `/product/:slug` public routes and `/admin/products` route protected by `<AdminGuard />` to `src/app/Router.tsx`.
- Created comprehensive test suite for Milestone 4:
  - Unit tests: `tests/unit/variantMatrix.test.ts` (4 tests covering Cartesian product generation, SKU abbreviation, and PKR currency formatting).
  - Integration tests: `tests/integration/productApi.test.ts` (2 tests covering atomic D1 batch query execution and full product/variant slug assembly).
  - Storefront E2E tests: `tests/e2e/products.test.tsx` (3 tests covering catalog grid, PDP fallback, and Admin Product Matrix Wizard).

---

## [v0.4.0] - 2026-07-30 — Milestone 3: Category & Taxonomy Engine
### Added
- Created D1 SQLite migration `migrations/0003_categories.sql` establishing the `categories` hierarchical table (`parent_id` foreign key with `ON DELETE SET NULL`, indexed on `parent_id`, `slug`, and `sort_order, name`) and seeding default Pakistani clothing brand taxonomy ("Unstitched Lawn", "3-Piece Lawn Suits", "Winter Khaddar", "Ready to Wear").
- Implemented Feature-First Category & Taxonomy module (`src/features/categories/`):
  - Pure domain utilities in `src/features/categories/utils/`:
    - `slugify`: normalizes collection titles into clean SEO slugs (`"3-Piece Lawn!"` -> `"3-piece-lawn"`).
    - `buildCategoryTree`: recursively builds hierarchical `CategoryNode[]` tree ordered by `sort_order ASC, name ASC`.
    - `wouldCreateCycle`: cycle-detection algorithm that prevents any category from becoming its own parent or ancestor.
  - Zod validation schemas (`createCategorySchema`, `updateCategorySchema`) with slug regex enforcement (`/^[a-z0-9]+(?:-[a-z0-9]+)*$/`).
  - Authoritative D1 and Cloudflare KV category repository (`categoryRepository.ts`) implementing two-tier caching: reads from low-latency edge KV cache (`3600s` TTL) with automatic fallback to D1 database, and purges KV cache on mutating actions.
  - Edge Worker API endpoints in `src/features/categories/api/handlers.ts`:
    - `GET /api/v1/categories` (supports optional `?tree=true` hierarchy formatting and edge `Cache-Control`).
    - `GET /api/v1/categories/:slug` (retrieves single category detail by slug).
    - `POST /api/v1/admin/categories` (`ADMIN` RBAC protected, creates category in D1 and invalidates KV cache).
    - `PUT /api/v1/admin/categories/:id` (`ADMIN` RBAC protected, enforces cycle detection before updating D1).
    - `DELETE /api/v1/admin/categories/:id` (`ADMIN` RBAC protected, deletes category and safely re-parents children via `ON DELETE SET NULL`).
  - React 19 Storefront & Admin taxonomy components:
    - `CategoryProvider` context and `useCategories()` hook.
    - `<CategoryNavbarMenu />` dynamic storefront navigation dropdown showing collection hierarchies.
    - `<CategoryBreadcrumbs />` SEO breadcrumb trail component (`Home > Unstitched Lawn > 3-Piece Lawn Suits`).
    - `<CategoryGrid />` storefront apparel collections card grid.
    - `<AdminCategoryManager />` comprehensive admin interface (`/admin/categories`) with create/edit/delete modals, parent selector, sort order adjustment, and cycle detection notice.
- Updated storefront layout (`src/app/Layout.tsx`, `src/app/Home.tsx`, `src/app/Admin.tsx`) to render database-driven collection menus and grids.
- Added `/admin/categories` route to `src/app/Router.tsx` protected by `<AdminGuard />` and `/categories` public route.
- Created comprehensive test suite for Milestone 3:
  - Unit tests: `tests/unit/categoryUtils.test.ts` (5 tests covering slugify, tree generation, and cycle detection).
  - Integration tests: `tests/integration/categoryApi.test.ts` (3 tests covering KV cache hits, D1 insertion/invalidation, and circular reference blocking).
  - Storefront E2E tests: `tests/e2e/categories.test.tsx` (3 tests covering navbar menu, collections grid, and admin category manager).

---

## [v0.3.0] - 2026-07-30 — Milestone 2: Store Settings & Dynamic Configuration Engine
### Added
- Created D1 SQLite migration `migrations/0002_store_settings.sql` establishing the `store_settings` table and seeding default Pakistani clothing brand configuration (brand name, primary/secondary colors, support/WhatsApp phone, COD shipping fee PKR, free shipping threshold PKR, and SEO metadata).
- Implemented Feature-First Store Settings & Dynamic Configuration module (`src/features/settings/`):
  - Zod validation schema (`updateSettingsSchema`) validating hex color regex codes (`/^#[0-9A-Fa-f]{6}$/`), Pakistani support mobile formats (`03XX...`), and non-negative integer PKR shipping base rates and free shipping thresholds.
  - D1 & Cloudflare KV settings repository (`getStoreSettings`, `updateStoreSettings`) in `src/features/settings/db/settingsRepository.ts`:
    - `getStoreSettings`: reads from low-latency edge KV cache (`3600s` TTL) with automatic D1 fallback.
    - `updateStoreSettings`: executes atomic D1 batch queries across all 10 config keys and immediately invalidates/refreshes the KV cache key.
  - Edge Worker API endpoints in `src/features/settings/api/handlers.ts`:
    - `GET /api/v1/settings` (Public endpoint with Edge `Cache-Control: public, max-age=60, s-maxage=300, stale-while-revalidate=600`).
    - `PUT /api/v1/admin/settings` (Protected by `ADMIN` RBAC claim, atomically writes to D1 and purges KV cache).
  - React 19 Storefront configuration providers & UI components:
    - `SettingsProvider` context and `useSettings()` hook with automatic design token injection (`--brand-primary-hex`, `--brand-secondary-hex`).
    - `<AdminSettingsEditor />` accessible form (`/admin/settings`) allowing store administrators to customize brand name, tagline, colors, Pakistani COD shipping rules, and SEO without code modifications.
- Updated storefront UI (`src/app/Layout.tsx`, `src/app/Home.tsx`, `src/app/Admin.tsx`) to read brand name, COD free shipping threshold PKR, and WhatsApp support phone directly from `useSettings()` so zero hardcoded branding strings remain.
- Added `/admin/settings` route to `src/app/Router.tsx` protected by `<AdminGuard />`.
- Created comprehensive test suite for Milestone 2:
  - Unit tests: `tests/unit/settingsValidation.test.ts` (5 tests).
  - Integration tests: `tests/integration/settingsApi.test.ts` (3 tests).
  - Storefront E2E tests: `tests/e2e/settings.test.tsx` (1 test).

---

## [v0.2.0] - 2026-07-30 — Milestone 1: Authentication & RBAC Architecture
### Added
- Created D1 SQLite migration `migrations/0001_auth_users.sql` establishing the `users` table with email/phone indexing and strict role enums (`ADMIN`, `CUSTOMER`).
- Implemented Edge-compatible WebCrypto security primitives in `src/core/security/`:
  - `hashPassword` / `verifyPassword`: PBKDF2 password hasher (100,000 iterations, SHA-256) with constant-time comparison in `src/core/security/crypto.ts`.
  - `signSessionToken` / `verifySessionToken`: Stateless HMAC-SHA256 session token generator and verifier.
  - Cookie serialization (`serializeSessionCookie`, `clearSessionCookie`, `parseSessionCookie`) for HttpOnly, Secure, SameSite=Strict cookies.
  - Edge Auth Middleware (`requireAuth`, `requireRole`, `getAuthenticatedUser`) enforcing Role-Based Access Control in `src/core/security/auth.ts`.
- Implemented Feature-First Authentication module (`src/features/authentication/`):
  - Zod validation schemas (`registerSchema`, `loginSchema`) with Pakistani mobile number validation (`^(\+92|0|92)?3[0-9]{9}$`).
  - D1 user repository (`findUserByEmail`, `findUserById`, `checkUserExists`, `createUser`) in `src/features/authentication/db/userRepository.ts`.
  - Edge Worker API endpoints in `src/features/authentication/api/handlers.ts`:
    - `POST /api/v1/auth/register` (Customer/Admin account creation + Turnstile challenge).
    - `POST /api/v1/auth/login` (Authentication + HttpOnly cookie issuance).
    - `POST /api/v1/auth/logout` (Cookie clearing).
    - `GET /api/v1/auth/session` (Session hydration + role claim check).
  - React 19 Frontend components & hooks:
    - `AuthProvider` context and `useAuth()` hook with automatic session hydration.
    - `<LoginForm />` and `<RegisterForm />` accessible UI components with Turnstile badge and Pakistani COD helper text.
    - Route guards `<AdminGuard />` and `<CustomerGuard />` for protecting customer accounts and admin dashboards.
- Added `/login`, `/register`, `/account`, and `/admin` routes to `src/app/Router.tsx` and updated storefront `Layout.tsx` header navigation.
- Created comprehensive test suite for Milestone 1:
  - Unit tests: `tests/unit/crypto.test.ts` (7 tests) and `tests/unit/authValidation.test.ts` (6 tests).
  - Integration tests: `tests/integration/authApi.test.ts` (2 tests).
  - Storefront E2E tests: `tests/e2e/auth.test.tsx` (3 tests).

---

## [v0.1.0] - 2026-07-30 — Milestone 0: Framework Scaffolding & Edge Infrastructure
### Added
- Created complete foundational architectural documentation (`PROJECT_CONSTITUTION.md`, `PROJECT_CHARTER.md`, `ARCHITECTURE.md`, `ROADMAP.md`, `DATABASE.md`, `API.md`, `DEPLOYMENT.md`, `ENVIRONMENT_SETUP.md`, `CONTRIBUTING.md`, `README.md`).
- Established strict TypeScript 5.x configuration (`tsconfig.json`) with zero-any policy and module path aliases (`@/*`).
- Configured Vite 7 + React 19 + React Router 7 + Tailwind CSS 4 frontend application shell (`src/app/*`, `src/client.tsx`).
- Created Cloudflare Wrangler Edge Worker configuration (`wrangler.json`, `src/worker/index.ts`) defining D1 (`DB`), R2 (`BUCKET`), KV (`KV`), and Turnstile bindings.
- Implemented core cross-cutting primitives in `src/core/`:
  - Standard JSON response envelope formatter (`createSuccessResponse`, `createErrorResponse`) in `src/core/api/response.ts`.
  - Edge structured JSON logger (`EdgeLogger`) in `src/core/api/logger.ts`.
  - Zod validation error handler (`handleZodError`, `handleApiError`) in `src/core/api/errors.ts`.
  - Cloudflare D1 database query wrapper (`DatabaseClient`) in `src/core/db/index.ts`.
  - Cloudflare KV cache wrapper (`KVCacheClient`) in `src/core/kv/index.ts`.
  - Cloudflare Turnstile token verifier (`verifyTurnstileToken`) in `src/core/security/turnstile.ts`.
- Implemented initial schema migration tracking table (`migrations/0000_initial_schema.sql`).
- Established Vitest & Playwright automated test suite (`tests/unit/api.test.ts`, `tests/integration/db.test.ts`, `tests/e2e/smoke.test.tsx`, `tests/e2e/smoke.spec.ts`) with 100% test pass rate.
- Configured GitHub Actions CI/CD workflow (`.github/workflows/ci.yml`) enforcing type checking, ESLint, unit tests, integration tests, and E2E tests.

---

## [Unreleased] — Upcoming Development Milestones

- **[v0.13.0] - Planned** — Milestone 12: Order Lifecycle Management & Audit Timeline
- **[v0.14.0] - Planned** — Milestone 13: Admin Dashboard & Core E-Commerce Analytics
- **[v1.0.0] - Planned** — Milestone 14: Version 1 Production Hardening, Audit & Stable Release
