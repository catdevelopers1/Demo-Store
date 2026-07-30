# Authentication & RBAC Feature Module (`v0.2.0`)

Self-contained authentication engine for the Pakistani Clothing Commerce Framework.

## 1. Capabilities
- Customer and Admin registration with Pakistani phone number validation (`03XX...` format).
- WebCrypto PBKDF2 password hashing (100,000 iterations, SHA-256) running natively on Cloudflare Edge.
- HMAC-SHA256 signed session token issuance stored in HttpOnly, Secure, SameSite=Strict cookies.
- Cloudflare Turnstile verification challenge validation.
- Role-Based Access Control (`ADMIN`, `CUSTOMER`) with `<AdminGuard />` and `<CustomerGuard />` route guards.

## 2. API Endpoints
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/session`

## 3. Public Interface (`src/features/authentication/index.ts`)
Only import from the main index file when consuming this feature in other modules.
