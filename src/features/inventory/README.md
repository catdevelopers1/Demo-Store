# Inventory & Stock Management Feature Module (`v0.7.0`)

Self-contained stock ledger and reservation engine for the Pakistani Clothing Commerce Framework.

## 1. Capabilities
- Real-time stock ledger tracking (`inventory_items`) and immutable audit history (`inventory_logs`).
- Automatic low-stock and out-of-stock evaluation.
- Concurrency-safe stock reservation (`reserveStock` and `releaseStock`) using SQL conditional constraints (`WHERE quantity_available >= ?`).
- Admin UI Inventory Manager (`<AdminInventoryManager />` at `/admin/inventory`) protected by `ADMIN` RBAC claim.

## 2. API Endpoints
- `GET /api/v1/admin/inventory` (`ADMIN` RBAC required)
- `GET /api/v1/admin/inventory/:id/logs` (`ADMIN` RBAC required)
- `PATCH /api/v1/admin/inventory/:id` (`ADMIN` RBAC required, manual adjustment with mandatory reason & comment)
- `GET /api/v1/inventory/check?variantId=<id>` (Public storefront SKU availability check)

## 3. Public Interface (`src/features/inventory/index.ts`)
Only import from the main index file when consuming this feature in other modules.
