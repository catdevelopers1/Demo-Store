# Discount Code & Coupon Promotion Engine Feature Module (`v0.11.0`)

Self-contained promotional coupon code engine for the Pakistani Clothing Commerce Framework.

## 1. Capabilities
- Percentage-off (`PERCENTAGE`) and fixed PKR (`FIXED_PKR`) discount codes.
- Minimum order value PKR threshold (`min_order_pkr`) and maximum percentage discount cap (`max_discount_pkr`).
- ISO timestamp expiration checks (`startTime`, `endTime`) and usage limit enforcement (`usedCount < usageLimit`).
- Non-negative subtotal safeguard (`Math.max(0, subtotal - discount)`).
- Cart Drawer coupon apply/remove interface.
- Admin UI Discount Manager (`<AdminDiscountManager />` at `/admin/discounts`) protected by `ADMIN` RBAC claim.

## 2. API Endpoints
- `POST /api/v1/discounts/validate` (Public, evaluates code against subtotal PKR)
- `GET /api/v1/admin/discounts` (`ADMIN` RBAC required)
- `POST /api/v1/admin/discounts` (`ADMIN` RBAC required)
- `PUT /api/v1/admin/discounts/:id` (`ADMIN` RBAC required)
- `DELETE /api/v1/admin/discounts/:id` (`ADMIN` RBAC required)

## 3. Public Interface (`src/features/discounts/index.ts`)
Only import from the main index file when consuming this feature in other modules.
