# Project Charter — Reusable Pakistani Commerce Framework

## 1. Vision & Mission
To build a production-ready, Cloudflare-native, reusable e-commerce framework specifically engineered and optimized for **Pakistani Clothing Brands** operating primarily on **Cash on Delivery (COD)**.

This is **not** a one-time client website. It is an enterprise-grade, open-source commerce engine designed to serve as the reusable foundation for hundreds or thousands of future clothing brand stores. Every architectural decision prioritizes long-term maintainability, modularity, simplicity, Edge-first performance, and multi-tenant reusability.

---

## 2. Target Market & Primary Use Case
- **Primary Market:** Pakistan (Clothing & Apparel Brands, Small-to-Medium Businesses, COD-dominant transactions).
- **Core Market Realities Addressed:**
  - **Cash on Delivery (COD) Primacy:** Over 90% of Pakistani e-commerce transactions rely on COD. The checkout, order lifecycle, and address verification flows are architected specifically around COD workflows.
  - **Pakistani Address & Phone Formats:** Built-in validation for Pakistani mobile numbers (`03XX-XXXXXXX` / `+923XXXXXXXXX`), postal codes, and provincial/city-based shipping calculations.
  - **COD Fraud Prevention & Verification:** Integrated verification rules (high-value COD SMS/WhatsApp alert thresholds, Turnstile bot defense, address normalization).
- **Future Expansion Ready (Zero-Rewrite Architecture):**
  - Online Payment Gateways (Stripe, Easypaisa, JazzCash, Bank Transfers)
  - International Stores & Multi-Currency (PKR primary, USD/GBP/EUR/AED ready)
  - Multi-Language Support (English primary, Urdu RTL ready)
  - Enterprise Physical Retail & POS Integration
  - Native Mobile Applications (React Native / iOS / Android)

---

## 3. Technology Stack (Latest Stable Editions)
- **Frontend / UI:** React 19, TypeScript 5.x, Tailwind CSS 4, Vite 7, React Router 7
- **Edge Backend / Serverless Runtime:** Cloudflare Workers, Cloudflare Pages (Full-stack Edge routing), Wrangler CLI
- **Data & Assets:**
  - **Database:** Cloudflare D1 (Serverless SQLite at the Edge with FTS5 Full-Text Search)
  - **Asset Storage:** Cloudflare R2 (Zero-egress object storage for apparel imagery)
  - **Configuration Cache:** Cloudflare KV (Low-latency edge caching for store settings & branding)
  - **Security & Bot Protection:** Cloudflare Turnstile
  - **Background Processing:** Cloudflare Queues & Cron Triggers (where scheduled/async jobs are required)

---

## 4. Version 1 Scope & Non-Goals

### Included in Version 1 (v1.0.0 Target Scope)
1. **Authentication & RBAC:** Admin & Customer authentication, PBKDF2/WebCrypto edge hashing, Turnstile bot verification, Role-Based Access Control (`ADMIN`, `CUSTOMER`).
2. **Admin Dashboard:** Overview metrics (PKR Revenue, Pending COD orders, Low-Stock items, Top SKUs).
3. **Product & Catalog Management:** Products, hierarchical categories, product variants (Size, Color, Fabric, SKUs), dynamic pricing, and SEO slugs.
4. **Product Images Pipeline:** Multi-image uploads via Cloudflare R2 with ordering and alt tags.
5. **Inventory Engine:** Real-time stock tracking per SKU variant, reservation rules during checkout, and audit logs.
6. **Customer Accounts:** Profile management, Pakistani address book, and order history.
7. **Shopping Cart Engine:** Persistent cart state, item quantity manipulation, and stock availability checks.
8. **COD Checkout Engine:** Frictionless COD checkout, Pakistani phone/address validation, and Turnstile challenge.
9. **Order Management & Timeline:** Full order lifecycle (`PENDING_VERIFICATION`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `RETURNED`) with immutable audit timeline.
10. **Discount & Coupon Engine:** Percentage and fixed PKR coupon codes with minimum order rules and usage limits.
11. **Storefront Search & Discovery:** D1 FTS5 full-text search across apparel titles, SKUs, fabrics, and categories.
12. **Store Configuration & Reusability:** 100% database-driven branding, colors, typography, contact info, and COD shipping rules (zero hardcoding).

### Non-Goals for Version 1
- **Online Payment Gateways:** (Easypaisa, JazzCash, Stripe will be introduced in v2.x via modular payment provider interfaces without refactoring the COD engine).
- **Multi-Vendor Marketplace:** This framework models dedicated, branded D2C stores.
- **Complex Multi-Warehouse Routing:** Version 1 assumes centralized inventory allocation per store instance.

---

## 5. Core Architectural Commandments
1. **Zero Hardcoding:** Brand name, colors, typography, shipping rates, and homepage sections must be read from the Database/KV configuration.
2. **Feature-First Modularity:** All features own their presentation, backend API, database schema, Zod validation, and tests.
3. **Edge-First Execution:** No Node.js-specific runtime dependencies that fail on Cloudflare Workers.
4. **No Unreviewed Code:** No application code is written until the Roadmap is reviewed and explicitly approved.
