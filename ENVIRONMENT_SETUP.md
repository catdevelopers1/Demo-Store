# Local Environment & Testing Setup — Reusable Pakistani Commerce Framework

This guide provides instructions for setting up a local development environment with Cloudflare Workers edge emulation, D1 serverless SQLite, R2 object storage, and automated test execution.

---

## 1. Prerequisites (Latest Stable Editions)
- **Node.js:** v22.x LTS or latest stable (enforces Web Standard compatibility).
- **Package Manager:** `npm` (v10+).
- **Cloudflare CLI:** Wrangler (`npm install -g wrangler@latest`).
- **Browser Automation:** Playwright CLI for end-to-end tests.

---

## 2. Local Repository Installation

```bash
# 1. Clone repository
git clone https://github.com/your-org/pakistani-commerce-framework.git
cd pakistani-commerce-framework

# 2. Install dependencies (only stable releases)
npm install

# 3. Copy example environment file
cp .env.example .env.local
```

---

## 3. Local Cloudflare Edge Emulation (Miniflare / D1 / R2 / KV)

Wrangler automatically emulates Cloudflare D1, R2, and KV bindings locally using Miniflare.

```bash
# Apply SQL migrations to the local D1 SQLite test database
npx wrangler d1 migrations apply DB --local

# Seed initial test data (Admin user, Pakistan clothing categories & test Lawn suits)
npm run db:seed -- --local

# Start the full-stack Vite 7 + Cloudflare Workers local development server
npm run dev
```
- Frontend Storefront UI: `http://localhost:5173`
- Local Edge Workers API: `http://localhost:5173/api/v1/*`

---

## 4. Automated Testing Execution (Vitest & Playwright)

Every milestone requires passing 100% of unit, integration, and E2E tests before completion.

### 4.1 Run Unit & Integration Tests (Vitest + Miniflare D1)
```bash
# Execute unit tests for Pakistani phone validation, Zod schemas, and PKR price calculations
npm run test:unit

# Execute integration tests against in-memory D1 database and FTS5 search
npm run test:integration

# Run all tests in watch mode during development
npm run test:watch

# Generate code coverage report
npm run test:coverage
```

### 4.2 Run End-to-End Tests (Playwright)
```bash
# Install Playwright browser binaries (Chromium, Firefox, WebKit)
npx playwright install --with-deps

# Run complete customer COD checkout and admin workflows in headless browser
npm run test:e2e

# Run E2E tests with UI trace inspector
npm run test:e2e -- --ui
```

---

## 5. Pre-Commit Verification Checklist
Before submitting a pull request for any milestone, execute:
```bash
# 1. Strict TypeScript type check (zero errors allowed)
npx tsc --noEmit

# 2. Linter check
npm run lint

# 3. Complete test suite verification
npm run test:all
```

---

## 6. Version 1.0.0 Stable Release Certification
Before tagging a stable major release (`v1.0.0`), verify:
1. `npm run typecheck`: 0 errors.
2. `npm run lint`: 0 errors, 0 warnings.
3. `npm run test:all`: 100% test suite passing across Unit, Integration, and Playwright E2E suites (46 suites, 145 tests).
4. `npm run build`: Clean Vite production bundle.
5. Sitemaps & Security: Verify `/sitemap.xml`, `/robots.txt`, and HTTP CSP/HSTS security headers.
