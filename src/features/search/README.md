# Storefront Product Discovery & FTS5 Edge Search Module (`v0.9.0`)

Self-contained keyword search and catalog discovery engine for the Pakistani Clothing Commerce Framework.

## 1. Capabilities
- Cloudflare D1 SQLite FTS5 full-text search (`products_fts`) synchronized via SQL triggers (`INSERT`, `UPDATE`, `DELETE`).
- Query sanitization (`sanitizeFtsQuery()`) preventing syntax errors on special characters and enabling prefix keyword search (`"lawn suit"` -> `"lawn* suit*"`).
- Multi-dimensional filtering by category slug (`?category=...`), PKR price range (`?minPrice=...`, `?maxPrice=...`), and sorting (`relevance`, `price_asc`, `price_desc`, `newest`).
- Standardized pagination math (`calculatePagination()`) with offset calculation.
- Storefront navigation bar search bar (`<StorefrontSearchBar />`) and comprehensive Product Discovery page (`<CatalogDiscoveryPage />` at `/search`).

## 2. API Endpoints
- `GET /api/v1/search?q=...&category=...&minPrice=...&maxPrice=...&sort=...&page=...&limit=...` (Public, Edge Cache-Control)

## 3. Public Interface (`src/features/search/index.ts`)
Only import from the main index file when consuming this feature in other modules.
