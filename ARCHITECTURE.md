# Architectural Blueprint — Reusable Pakistani Commerce Framework

This document defines the authoritative system architecture for the Cloudflare-native e-commerce framework. Every module, feature, and line of code must comply with the design patterns, security rules, and structural boundaries documented below.

---

## 1. Recommended Project Folder Structure (Feature-First Architecture)

The repository strictly implements a **Feature-First Architecture**. Every domain feature is fully self-contained in `src/features/<feature_name>/` and owns its UI presentation, database queries, API handlers, Zod validation schemas, business logic, unit/integration tests, and internal documentation.

```
/
├── .github/                      # CI/CD workflows, PR templates, automated testing rules
├── .vscode/                      # Shared workspace editor rules, biome/eslint settings
├── docs/                         # Additional architectural diagrams and schema notes
├── migrations/                   # Cloudflare D1 SQLite migrations (0001_initial.sql, etc.)
├── public/                       # Static public assets (default favicon, robots.txt)
├── scripts/                      # Seed scripts, DB reset utilities, development automation
├── src/
│   ├── app/                      # Application root, React Router 7 routes, global layouts
│   ├── config/                   # Store configuration schemas, default fallbacks, env types
│   ├── core/                     # Cross-cutting infrastructure primitives (no domain logic)
│   │   ├── api/                  # Standard API response builders, error handlers, middleware
│   │   ├── db/                   # D1 database client wrapper, query builder, schema types
│   │   ├── events/               # Event dispatcher for decoupling cross-feature events
│   │   ├── kv/                   # Cloudflare KV edge cache client and TTL helpers
│   │   └── security/             # WebCrypto password hashing, CSRF protection, Turnstile
│   ├── features/                 # FEATURE-FIRST MODULES (Self-contained domain engines)
│   │   ├── admin/                # Admin Dashboard UI, aggregate reporting, nav layout
│   │   ├── analytics/            # Basic analytics metrics (Revenue PKR, orders, COD stats)
│   │   ├── authentication/       # User/Admin login, registration, session management, RBAC
│   │   ├── cart/                 # Shopping cart state, real-time stock checks, drawer UI
│   │   ├── categories/           # Nested category taxonomy, SEO slugs, breadcrumb tree
│   │   ├── checkout/             # COD Checkout flow, Pakistani address/phone validation
│   │   ├── customers/            # Customer profile, Pakistani address book, order history
│   │   ├── discounts/            # Percentage & fixed PKR coupon code evaluation engine
│   │   ├── inventory/            # SKU stock tracking, stock reservation, audit logs
│   │   ├── orders/               # Order lifecycle management, status updates, audit timeline
│   │   ├── products/             # Product catalog, grid/card components, variant picker
│   │   ├── search/               # Edge D1 FTS5 search engine, filter queries, pagination
│   │   ├── settings/             # Store configuration, branding rules, COD shipping rates
│   │   └── variants/             # Variant matrices (Size, Color, Fabric, SKU mappings)
│   ├── shared/                   # Generic UI primitives and utilities (zero business logic!)
│   │   ├── components/           # Accessible UI components (Button, Modal, Table, Badge)
│   │   ├── hooks/                # Generic React hooks (useDebounce, useMediaQuery)
│   │   ├── types/                # Generic TypeScript types and utility interfaces
│   │   └── utils/                # Pure formatters (PKR currency, Pakistani date formatters)
│   ├── worker/                   # Cloudflare Workers API backend entry (fetch handler/Hono)
│   ├── client.tsx                # Frontend React 19 hydration entry
│   └── index.html                # Main HTML shell
├── tests/
│   ├── e2e/                      # Playwright E2E customer checkout & admin order flows
│   ├── integration/              # API & D1 database integration test suites
│   └── unit/                     # Unit test suites for cross-cutting core/shared utilities
├── ARCHITECTURE.md               # This document (System architecture blueprint)
├── CHANGELOG.md                  # Semantic version release log (v0.1.0 -> v1.0.0)
├── CONTRIBUTING.md               # Developer workflow, AI rules & code review standards
├── DATABASE.md                   # Cloudflare D1 schema, indexes & COD rules
├── DEPLOYMENT.md                 # Cloudflare deployment configuration guide
├── ENVIRONMENT_SETUP.md          # Local Wrangler & Vitest dev setup
├── PROJECT_CHARTER.md            # Vision, mission, Pakistani market focus & scope
├── PROJECT_CONSTITUTION.md       # Core authority & governance principles
├── README.md                     # Framework overview & navigation
├── ROADMAP.md                    # Complete 15-milestone roadmap
├── package.json                  # Dependencies & scripts (only stable releases!)
├── tsconfig.json                 # Strict TypeScript configuration
├── vite.config.ts                # Vite 7 build configuration
└── wrangler.json                 # Cloudflare Wrangler configuration (D1, R2, KV, Turnstile)
```

### Internal Feature Directory Anatomy (`src/features/<feature>/`)
Every feature module enforces strict internal separation of concerns:
```
src/features/products/
├── api/                  # Edge API handlers (e.g., getProducts, getProductBySlug, createProduct)
├── components/           # UI components (ProductCard, ProductGrid, ProductDetailView)
├── db/                   # D1 query functions & schema interfaces for products
├── hooks/                # React query/state hooks for product data fetching
├── types/                # TypeScript interfaces for products and options
├── utils/                # Pure feature-specific formatting & calculation helpers
├── validation/           # Zod validation schemas for API inputs & forms
├── __tests__/            # Unit and integration tests for this feature
├── README.md             # Documentation of feature public API and exports
└── index.ts              # Strict public interface export (ONLY export what other features need)
```

---

## 2. Database Architecture (Cloudflare D1 - Serverless SQLite)

The database engine is built on **Cloudflare D1**, leveraging SQLite at the Edge. The schema is designed for Pakistani Cash on Delivery (COD) workflows, robust inventory tracking, and full-text search without requiring external search engines.

### Relational Entity-Relationship Outline
- `store_settings`: Key-value configuration for brand name, logo URL, color palette, typography, default currency (`PKR`), COD order limits, and contact numbers.
- `users`: Core authentication identity table (`id`, `email`, `phone`, `password_hash`, `role`: `ADMIN` | `CUSTOMER`, `created_at`).
- `customer_profiles`: Extended customer data (`user_id`, `default_address_id`, `created_at`).
- `customer_addresses`: Pakistani address book (`id`, `customer_id`, `recipient_name`, `phone`, `city`, `province_state`, `street_address`, `postal_code`, `is_default`).
- `categories`: Hierarchical categories (`id`, `parent_id`, `name`, `slug`, `description`, `image_r2_key`, `sort_order`).
- `products`: Product parent entity (`id`, `name`, `slug`, `description`, `base_price_pkr`, `category_id`, `is_active`, `seo_title`, `seo_description`).
- `product_options`: Option names for a product (`id`, `product_id`, `name` e.g., "Size", "Color", "Fabric", `sort_order`).
- `product_option_values`: Discrete values (`id`, `option_id`, `value` e.g., "Small", "Medium", "Lawn", "Khaddar").
- `product_variants`: Discrete sellable SKUs (`id`, `product_id`, `sku`, `price_override_pkr`, `compare_at_price_pkr`, `weight_grams`, `is_active`).
- `product_variant_options`: Join table linking `product_variant_id` to `product_option_value_id`.
- `product_images`: Cloudflare R2 image references (`id`, `product_id`, `variant_id`, `r2_key`, `url`, `alt_text`, `sort_order`, `is_primary`).
- `inventory_items`: Variant stock ledger (`id`, `variant_id`, `quantity_available`, `quantity_reserved`, `low_stock_threshold`, `updated_at`).
- `inventory_logs`: Audit trail for stock adjustments (`id`, `variant_id`, `change_qty`, `reason`: `SALE` | `RETURN` | `RESTOCK` | `ADJUSTMENT`, `reference_id`, `created_at`).
- `discounts`: Promotional coupons (`id`, `code`, `type`: `PERCENTAGE` | `FIXED_PKR`, `value`, `min_order_pkr`, `max_discount_pkr`, `start_time`, `end_time`, `usage_limit`, `used_count`, `is_active`).
- `orders`: Core COD order header (`id`, `order_number`, `customer_id`, `guest_email`, `guest_phone`, `status`, `payment_method`: `COD`, `subtotal_pkr`, `discount_pkr`, `shipping_pkr`, `total_pkr`, `shipping_address_json`, `notes`, `created_at`).
- `order_items`: Snapshot line items (`id`, `order_id`, `product_id`, `variant_id`, `sku`, `product_name`, `variant_name`, `unit_price_pkr`, `quantity`, `total_pkr`).
- `order_timeline`: Immutable order lifecycle audit log (`id`, `order_id`, `old_status`, `new_status`, `changed_by_user_id`, `comment`, `created_at`).

### Indexing & FTS5 Edge Search Strategy
- **FTS5 Virtual Table (`products_fts`)**: Indexed over `product.name`, `product.description`, `product_variants.sku`, and `category.name` for sub-millisecond keyword search across Pakistani apparel terminology.
- **Relational Indexes**: Explicit B-tree indexes on foreign keys (`product_id`, `category_id`, `variant_id`, `customer_id`, `order_id`) and high-frequency lookup columns (`slug`, `sku`, `order_number`, `phone`).
- **ACID Transaction Rules**: Checkout order creation and stock reservation MUST be wrapped inside a Cloudflare D1 batch transaction (`db.batch()`) to ensure atomic execution and prevent race conditions.

---

## 3. API Architecture (Edge REST / RPC over Cloudflare Workers)

The backend API is implemented as a lightweight, zero-cold-start Edge API running on Cloudflare Workers / Pages Functions.

### Base URL & Versioning
All framework API routes are versioned under `/api/v1/`.

### Mandatory API Standard Response Envelopes
Every endpoint must return a JSON response adhering to one of two strict envelopes:

#### 1. Success Envelope (`2xx HTTP Status`)
```json
{
  "success": true,
  "data": {
    "id": "prod_01h...",
    "name": "Classic Lawn Suit - 3 Piece",
    "basePricePkr": 6500
  },
  "meta": {
    "timestamp": "2026-07-30T10:00:00.000Z",
    "page": 1,
    "limit": 20,
    "totalCount": 145
  }
}
```

#### 2. Error Envelope (`4xx / 5xx HTTP Status`)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid Pakistani mobile phone format. Use 03XX-XXXXXXX or +923XXXXXXXXX.",
    "details": [
      {
        "field": "phone",
        "issue": "Regex pattern mismatch"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-07-30T10:00:00.000Z",
    "requestId": "req_a1b2c3d4"
  }
}
```

### Edge Caching & KV Strategy
- **Store Configuration & Categories:** Highly static read endpoints (`GET /api/v1/settings`, `GET /api/v1/categories`) are cached in **Cloudflare KV** with a 3600s TTL and invalidated immediately upon admin update.
- **Storefront Products:** `GET /api/v1/products` utilizes Edge `Cache-Control: public, max-age=60, s-maxage=300, stale-while-revalidate=600`.

---

## 4. Authentication & Security Architecture

### Edge-Compatible Authentication (No Node-specific modules)
- **Password Hashing:** Native browser/Edge `WebCrypto API` using PBKDF2 with SHA-256 (100,000 iterations) and 16-byte cryptographically secure random salts.
- **Session Tokens:** Stateless, signed HMAC-SHA256 tokens stored in secure, HttpOnly, SameSite=Strict cookies.
- **Cloudflare Turnstile:** Mandatory challenge verification on:
  - Customer Registration (`POST /api/v1/auth/register`)
  - Admin/Customer Login (`POST /api/v1/auth/login`)
  - COD Checkout (`POST /api/v1/checkout/cod`) to block automated bot spam.

### Role-Based Access Control (RBAC)
- Strict TypeScript enums: `ADMIN`, `CUSTOMER`.
- Every protected endpoint passes through an Edge Auth Middleware checking role claims before executing database queries.

### Pakistani COD Specific Fraud Prevention
- **Address & Phone Number Normalization:** Automated regex validation for valid Pakistani mobile numbers (`^(\+92|0|92)?3[0-9]{9}$`).
- **High-Value Order Flagging:** Orders exceeding configurable PKR thresholds (e.g., >25,000 PKR) are flagged as `PENDING_VERIFICATION` requiring explicit staff verification before stock dispatch.

---

## 5. Cloudflare Deployment Architecture

The framework is natively architected for zero-server Cloudflare edge deployment:
- **Cloudflare Pages / Workers:** Frontend Vite SPA/SSR static assets served from edge CDN nodes; `/api/v1/*` routes executed as edge serverless workers.
- **Cloudflare D1:** Primary relational database binding (`DB`).
- **Cloudflare R2:** Product image and static asset bucket binding (`BUCKET`).
- **Cloudflare KV:** Configuration and rate-limiting cache binding (`KV`).
- **Cloudflare Turnstile:** Bot defense site-key and secret verification.
- **Cloudflare Queues / Cron Triggers:** Background webhook dispatches and scheduled nightly inventory reconciliation.

---

## 6. Testing Strategy

No feature is considered complete without passing all five mandatory test tiers:
1. **Unit Tests (`Vitest`)**: Isolates pure domain logic—PKR price calculation, shipping rule evaluators, Zod schemas, coupon math, and phone validators.
2. **Integration Tests (`Vitest` + local D1 test database)**: Exercises SQL migrations, D1 prepared statements, transaction rollbacks, and RBAC middleware.
3. **End-to-End Tests (`Playwright`)**: Automated real-browser journeys for:
   - Full customer COD checkout (Browse -> Filter -> Size Select -> Add to Cart -> Pakistani Address Form -> COD Submission -> Confirmation).
   - Admin lifecycle workflow (Login -> Create Product -> Set SKUs -> Update Order Status).
4. **Edge Case Tests**: Concurrency tests verifying that simultaneous orders for a single remaining item do not cause negative inventory.
5. **Security Regression Tests**: Validating SQL injection immunity, XSS sanitization, and Turnstile token expiration handling.

---

## 7. Security Strategy (Mandatory Defense-in-Depth)

- **Input Validation:** 100% of API payloads validated via strict Zod schemas before entering domain handlers.
- **SQL Injection Prevention:** Exclusive use of D1 prepared statements with parameter binding; zero raw SQL string concatenation.
- **XSS Prevention:** React 19 auto-escaping and strict Content Security Policy (CSP) headers.
- **CSRF Protection:** SameSite=Strict HttpOnly cookies + mandatory custom headers on API mutations.
- **Enterprise Security Headers (`securityHeaders.ts`):** Automatically attaches `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Strict-Transport-Security`, and edge `Content-Security-Policy` to every Worker response.
- **Turnstile Bot Defense:** Protects public checkout, authentication, and registration against automated spam checkouts.
- **Secret Management:** Sensitive credentials stored via `wrangler secret put`; zero plaintext secrets in code or git history.

---

## 8. Documentation Strategy

The following 10 root documentation files represent the continuous **Project Memory** and must be updated with every completed milestone:
1. `PROJECT_CONSTITUTION.md` - Supreme authority and development philosophy.
2. `PROJECT_CHARTER.md` - Executive vision, Pakistani market focus, and v1 scope.
3. `ARCHITECTURE.md` - This architectural blueprint.
4. `ROADMAP.md` - Complete 15-milestone roadmap with full goal/features/dependencies/files/risks/testing/completion specs.
5. `DATABASE.md` - Comprehensive D1 schema, indexes, FTS5 search, and COD rules.
6. `API.md` - Edge REST API documentation and response envelopes.
7. `DEPLOYMENT.md` - Cloudflare Pages, Workers, D1, R2, KV deployment guide.
8. `CONTRIBUTING.md` - Feature-First rules, AI Behavior Rules, and completion checklist.
9. `ENVIRONMENT_SETUP.md` - Developer setup instructions for local Wrangler & Vitest.
10. `CHANGELOG.md` - Versioned release notes from v0.1.0 to v1.0.0.
