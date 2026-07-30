# Contribution Guidelines & Engineering Governance — Reusable Pakistani Commerce Framework

This document defines the strict engineering standards, architectural governance, and review requirements for contributing to the commerce framework. All developers and AI assistants must abide by these rules.

---

## 1. Core Engineering Philosophy
- **Never attempt to build the complete project in one session.**
- **Never continue implementing additional features until the current milestone is fully complete.**
- **Never sacrifice architecture for speed.**
- **Never sacrifice maintainability for convenience.**
- **Never rewrite completed architecture unless absolutely necessary.**
- **Always extend existing architecture instead.**
- **Every decision should make the framework more reusable.**

---

## 2. Feature-First Modularity Rules
1. Every domain feature must reside in `src/features/<feature>/`.
2. Every feature owns its:
   - Presentation UI Components
   - Edge API Handlers
   - Cloudflare D1 Database Queries & Types
   - Zod Validation Schemas
   - Unit & Integration Tests
   - Local Documentation (`README.md`)
3. **Strict Interface Boundaries:** Features communicate only through well-defined exports in `src/features/<feature>/index.ts`. Never import private internal files across feature boundaries.
4. **No Circular Dependencies:** Never import a feature that imports the caller. Use `src/core/events` for decoupled cross-feature communication.
5. **No Business Logic in UI:** Presentation components must remain pure. All price calculations, inventory checks, and validation rules must reside in feature hooks, utilities, or server APIs.

---

## 3. Reusability & Zero Hardcoding Mandate
- Never hardcode Brand Name, Logo, Colors, Typography, Layouts, Contact Info, Shipping Rules, or Categories in component code.
- All store settings must be read dynamically from `store_settings` (D1) / KV configuration.

---

## 4. AI Behavior Rules (Mandatory for AI Assistants)
- **Never guess requirements.** If anything is unclear, **STOP** and **ASK** using clarifying questions.
- **Never invent hidden functionality.**
- **Never silently modify unrelated code.**
- **Never rewrite completed modules unless fixing defects or improving architecture.**
- **Always prefer maintainability over cleverness.**
- **Always explain major architectural decisions.**
- **Read Project Memory First:** At the start of every session, read `PROJECT_CONSTITUTION.md`, `PROJECT_CHARTER.md`, `ARCHITECTURE.md`, `ROADMAP.md`, and `CHANGELOG.md` before taking action.

---

## 5. Security Strategy Checklist
Every milestone must satisfy the following security controls before PR merge:
- [ ] **Input Validation:** 100% of API endpoints validated via strict Zod schemas.
- [ ] **SQL Injection Prevention:** 100% prepared statements in D1 SQL queries; zero string concatenation.
- [ ] **XSS Prevention:** React 19 auto-escaping enabled; zero unsanitized `dangerouslySetInnerHTML`.
- [ ] **CSRF Protection:** SameSite=Strict HttpOnly cookies and custom API headers enforced.
- [ ] **Enterprise Security Headers:** Verify `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `HSTS`, and `CSP` headers via `attachSecurityHeaders()`.
- [ ] **Bot Defense:** Turnstile token verification required on `/auth/*` and `/checkout/cod`.
- [ ] **Secret Management:** Secrets configured via Wrangler CLI (`wrangler secret put`); zero plaintext secrets in git.

---

## 6. Mandatory Definition of Completion Checklist
Before marking any milestone as complete, verify:
- [ ] `tsc --noEmit` Type Checking passes with 0 errors.
- [ ] Linting checks pass with 0 warnings.
- [ ] Unit Tests pass (Vitest).
- [ ] Integration Tests pass (Vitest + Miniflare D1).
- [ ] Playwright End-to-End Tests pass.
- [ ] Error Handling & Security Review completed.
- [ ] Documentation updated (`ROADMAP.md`, `API.md`, `DATABASE.md`, `CHANGELOG.md`).
- [ ] Git version tag created (`vX.Y.Z`).
