# Shopping Cart & Stock Validation Feature Module (`v0.10.0`)

Self-contained shopping cart and server-side stock validation engine for the Pakistani Clothing Commerce Framework.

## 1. Capabilities
- Local storage persistence (`pakistani_cart_v1`) for guest users and D1 synchronization for authenticated customers.
- Authoritative server-side PKR price re-calculation (`POST /api/v1/cart/validate`): prevents client-side price tampering by verifying `v.price_override_pkr ?? p.base_price_pkr` against D1 database.
- Automatic quantity clipping and stock warning generation when requested quantity exceeds available inventory (`quantity_available`).
- Free Cash on Delivery (COD) shipping threshold progress calculator.
- Sliding storefront `<CartDrawer />` component accessible from anywhere in the storefront.

## 2. API Endpoints
- `POST /api/v1/cart/validate` (Public, authoritative D1 price and inventory check)

## 3. Public Interface (`src/features/cart/index.ts`)
Only import from the main index file when consuming this feature in other modules.
