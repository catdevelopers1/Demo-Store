# Customer Profile & Pakistani Address Book Feature Module (`v0.8.0`)

Self-contained customer profile and address book engine for the Pakistani Clothing Commerce Framework.

## 1. Capabilities
- Pakistani standardization: 7 administrative provinces (`PAKISTAN_PROVINCES`) and major city mapping (`PAKISTAN_CITIES_BY_PROVINCE`).
- Pakistani mobile number formatting and validation (`03XX-XXXXXXX` / `+923XXXXXXXXX`).
- 5-digit Pakistani postal code regex validation (`PAKISTAN_POSTAL_REGEX`).
- Atomic D1 batch transaction default address toggling and deletion promotion (`createCustomerAddress`, `updateCustomerAddress`, `deleteCustomerAddress`).
- Customer Account Dashboard (`<CustomerAccountDashboard />` at `/account`) protected by `CUSTOMER` RBAC claim.

## 2. API Endpoints
- `GET /api/v1/customer/profile` (Protected by `requireAuth`)
- `GET /api/v1/customer/addresses` (Protected by `requireAuth`)
- `POST /api/v1/customer/addresses` (Protected by `requireAuth`, atomic default toggle)
- `PUT /api/v1/customer/addresses/:id` (Protected by `requireAuth`)
- `DELETE /api/v1/customer/addresses/:id` (Protected by `requireAuth`, atomic promotion of remaining address)

## 3. Public Interface (`src/features/customers/index.ts`)
Only import from the main index file when consuming this feature in other modules.
