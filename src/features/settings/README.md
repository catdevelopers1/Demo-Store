# Store Settings & Dynamic Configuration Feature Module (`v0.3.0`)

Self-contained store configuration engine for the Pakistani Clothing Commerce Framework.

## 1. Capabilities
- 100% database (D1) and low-latency edge KV caching (`3600s` TTL) of store branding, color palette, SEO metadata, and COD shipping rules.
- Dynamic CSS variable injection (`--brand-primary-hex`, `--brand-secondary-hex`).
- Admin UI panel (`/admin/settings`) protected by Role-Based Access Control (`ADMIN`).
- Eliminates hardcoded brand names, shipping thresholds, and support numbers from storefront layouts.

## 2. API Endpoints
- `GET /api/v1/settings` (Public, Edge Cache-Control, KV cached)
- `PUT /api/v1/admin/settings` (Requires `ADMIN` RBAC, updates D1 and invalidates KV cache)

## 3. Public Interface (`src/features/settings/index.ts`)
Only import from the main index file when consuming this feature in other modules.
