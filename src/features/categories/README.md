# Category & Taxonomy Feature Module (`v0.4.0`)

Self-contained category taxonomy engine for the Pakistani Clothing Commerce Framework.

## 1. Capabilities
- Hierarchical parent/child category relationships for apparel collections (e.g. Lawn > 3-Piece Lawn).
- Automated SEO slug normalizer (`slugify()`).
- Recursive category tree builder (`buildCategoryTree()`) with cycle-detection prevention (`wouldCreateCycle()`).
- Cloudflare KV low-latency caching (`3600s` TTL) with automatic D1 database fallback.
- Dynamic storefront navigation menu (`<CategoryNavbarMenu />`), collections grid (`<CategoryGrid />`), and SEO breadcrumbs (`<CategoryBreadcrumbs />`).
- Admin UI Category Manager (`<AdminCategoryManager />` at `/admin/categories`) protected by `ADMIN` RBAC claim.

## 2. API Endpoints
- `GET /api/v1/categories?tree=true` (Public, Edge Cache-Control, KV cached)
- `GET /api/v1/categories/:slug` (Public, single category detail)
- `POST /api/v1/admin/categories` (`ADMIN` RBAC required)
- `PUT /api/v1/admin/categories/:id` (`ADMIN` RBAC required, cycle detection enforced)
- `DELETE /api/v1/admin/categories/:id` (`ADMIN` RBAC required, child parent_id set to null)

## 3. Public Interface (`src/features/categories/index.ts`)
Only import from the main index file when consuming this feature in other modules.
