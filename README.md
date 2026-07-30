# Reusable Pakistani Commerce Framework (Cloudflare-Native)

> **An open-source, enterprise-grade, edge-first e-commerce framework specifically engineered for Pakistani Clothing Brands operating on Cash on Delivery (COD).**

---

## Executive Overview
This repository provides the reusable foundation that will generate hundreds or thousands of future Pakistani clothing brand stores. It is **not** a one-time client website. Every architectural decision prioritizes long-term maintainability, modularity, simplicity, Edge-first performance, and multi-tenant reusability.

### Primary Market & Features
- **Primary Market:** Pakistan (Clothing Brands, Small/Medium Businesses).
- **Core Checkout Model:** Cash on Delivery (COD) with Turnstile bot protection and SMS/WhatsApp-ready verification thresholds.
- **Pakistani Standardization:** Built-in validation for Pakistani mobile formats (`03XX-XXXXXXX` / `+923XXXXXXXXX`) and city/province address books.
- **Zero Hardcoding:** 100% database/KV-driven store configuration (branding, colors, contact info, shipping rules, tax rules, and homepage layouts).

---

## Technology Stack (Latest Stable Versions)
- **Frontend:** React 19, TypeScript 5.x, Tailwind CSS 4, Vite 7, React Router 7
- **Serverless Edge Backend:** Cloudflare Workers / Pages Functions (`/api/v1/*`), Wrangler CLI
- **Edge Data & Storage:**
  - **Database:** Cloudflare D1 (Serverless SQLite at the Edge with FTS5 Full-Text Search)
  - **Asset Storage:** Cloudflare R2 (Apparel lookbook imagery)
  - **Configuration Caching:** Cloudflare KV (Low-latency cache for store settings & rate limits)
  - **Security & Anti-Spam:** Cloudflare Turnstile
- **Automated Testing:** Vitest (Unit & Integration) + Playwright (End-to-End browser tests)

---

## Core Documentation Suite (Project Memory)

In accordance with the **Project Constitution**, the following documentation suite is continuously maintained and serves as the highest authority for system architecture and roadmap planning:

| Document | Description |
| :--- | :--- |
| **[`PROJECT_CONSTITUTION.md`](./PROJECT_CONSTITUTION.md)** | **Supreme Authority:** Rules of engagement, engineering philosophy, AI behavior rules, and constraints. |
| **[`PROJECT_CHARTER.md`](./PROJECT_CHARTER.md)** | Executive vision, Pakistani market COD focus, target audience, and Version 1 scope vs non-goals. |
| **[`ARCHITECTURE.md`](./ARCHITECTURE.md)** | Complete System Architecture: Feature-First folder structure, database, API, auth, testing & security. |
| **[`ROADMAP.md`](./ROADMAP.md)** | **The Detailed Roadmap:** All 15 development milestones (v0.1.0 to v1.0.0) with full technical specifications. |
| **[`DATABASE.md`](./DATABASE.md)** | Cloudflare D1 SQLite relational schema, FTS5 search index, and ACID batch transaction rules for COD. |
| **[`API.md`](./API.md)** | Edge REST API conventions, standard success/error JSON envelopes, and complete endpoint reference. |
| **[`DEPLOYMENT.md`](./DEPLOYMENT.md)** | Cloudflare Pages, Workers, D1, R2, KV, and Turnstile deployment configuration and `wrangler.json` guide. |
| **[`ENVIRONMENT_SETUP.md`](./ENVIRONMENT_SETUP.md)** | Guide for setting up local Wrangler, Miniflare D1/R2/KV emulation, Vitest, and Playwright. |
| **[`CONTRIBUTING.md`](./CONTRIBUTING.md)** | Developer rules, Feature-First architecture boundaries, security checklist, and Definition of Completion. |
| **[`CHANGELOG.md`](./CHANGELOG.md)** | Semantic version release log (v0.1.0 through v1.0.0). |

---

## Engineering Status & Current Release

- **Roadmap & Architecture:** Fully approved by User.
- **Current Version:** `v0.11.0` (Milestone 10: Discount Code & Coupon Promotion Engine).
- **Next Milestone:** `v0.12.0` (Milestone 11: Cash on Delivery (COD) Checkout Engine).

In accordance with the **Project Constitution**, each milestone is built, tested, audited, and tagged independently before moving to the next.

