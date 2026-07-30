# Product Catalog & Variant Matrix Feature Module (`v0.5.0`)

Self-contained catalog and SKU variant engine for the Pakistani Clothing Commerce Framework.

## 1. Capabilities
- Full relational D1 schema (`products`, `product_options`, `product_option_values`, `product_variants`, `product_variant_options`).
- Atomic D1 batch transaction creation of apparel products and Cartesian variant SKU combinations (`createProductWithVariants`).
- Dynamic SKU generation (`generateSku`) and PKR currency formatting (`formatPkr`).
- Storefront Product Detail Page (`<ProductDetailView />` at `/product/:slug`) with interactive option selectors and real-time PKR price calculation.
- Admin UI Product Matrix Wizard (`<AdminProductWizard />` at `/admin/products`) protected by `ADMIN` RBAC claim.

## 2. API Endpoints
- `GET /api/v1/products` (Public, paginated/filtered list with Edge Cache-Control)
- `GET /api/v1/products/:slug` (Public, single product detail with all options and SKUs)
- `POST /api/v1/admin/products` (`ADMIN` RBAC required, executes atomic D1 batch transaction)

## 3. Public Interface (`src/features/products/index.ts`)
Only import from the main index file when consuming this feature in other modules.
