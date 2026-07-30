# Cash on Delivery (COD) Checkout Engine Feature Module (`v0.12.0`)

Self-contained Pakistani Cash on Delivery checkout and order confirmation engine for the Pakistani Clothing Commerce Framework.

## 1. Capabilities
- Single atomic D1 batch transaction (`db.batch()`) for placing COD orders:
  - Re-validates server-side PKR prices and inventory stock limits (`validateCartItems`).
  - Evaluates promotional coupons (`evaluateDiscount`) and increments usage count.
  - Computes COD shipping charges in PKR (`calculateCodShippingPkr`).
  - Reserves inventory across line items using conditional SQL constraints (`WHERE quantity_available >= ?`).
  - Writes order header (`orders`), line items (`order_items`), and initial audit log record (`order_timeline`).
- High-value order flagging: automatically sets status to `PENDING_VERIFICATION` for orders exceeding PKR 25,000 threshold.
- Cloudflare Turnstile bot verification challenge integration.
- Storefront `<CodCheckoutPage />` (`/checkout`) and `<OrderConfirmationPage />` (`/order-confirmation/:orderNumber`).

## 2. API Endpoints
- `POST /api/v1/checkout/cod` (Public, executes atomic D1 batch transaction)
- `GET /api/v1/orders/:orderNumber` (Public, retrieves order confirmation and timeline)

## 3. Public Interface (`src/features/checkout/index.ts`)
Only import from the main index file when consuming this feature in other modules.
