# API Architecture & Endpoint Reference — Reusable Pakistani Commerce Framework

This document is the authoritative reference for the Edge-first REST API built on Cloudflare Workers / Pages Functions. All endpoints serve structured JSON and execute natively on Cloudflare Edge locations.

---

## 1. Architectural Rules & Standards
- **Edge Runtime Compatibility:** APIs must use Web Standard APIs (`Request`, `Response`, `WebCrypto`, `fetch`). No Node.js-specific modules (`fs`, `path`, `crypto`) are permitted.
- **Base Prefix:** All API endpoints are prefixed with `/api/v1/`.
- **Validation Mandate:** Every request body, query parameter, and URL param must be validated against strict **Zod** schemas before business logic executes.
- **Standardized Error Codes:** Standard error codes (`VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `OUT_OF_STOCK`, `COD_LIMIT_EXCEEDED`, `RATE_LIMITED`, `INTERNAL_ERROR`) must be used.

---

## 2. Standardized JSON Response Envelopes

Every API response must use one of the two envelopes below:

### 2.1 Success Response (`HTTP 200 / 201`)
```json
{
  "success": true,
  "data": {
    "orderNumber": "#PK-10045",
    "status": "CONFIRMED",
    "totalPkr": 8500
  },
  "meta": {
    "timestamp": "2026-07-30T10:00:00.000Z",
    "page": 1,
    "limit": 20,
    "total": 1
  }
}
```

### 2.2 Error Response (`HTTP 400 / 401 / 403 / 404 / 429 / 500`)
```json
{
  "success": false,
  "error": {
    "code": "OUT_OF_STOCK",
    "message": "The requested quantity for SKU 'LWN-26-S-RED' exceeds available stock.",
    "details": [
      {
        "sku": "LWN-26-S-RED",
        "requested": 3,
        "available": 1
      }
    ]
  },
  "meta": {
    "timestamp": "2026-07-30T10:00:00.000Z",
    "requestId": "req_88f9a2b"
  }
}
```

---

## 3. Version 1 Complete Endpoint Catalog

| Feature | Method | Route | Description | Auth Required | Edge Caching |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth** | POST | `/api/v1/auth/register` | Register customer account (with Turnstile challenge) | No | None |
| | POST | `/api/v1/auth/login` | Login user/admin (sets HttpOnly cookie + Turnstile) | No | None (KV rate-limit) |
| | POST | `/api/v1/auth/logout` | Clear session cookie and invalidate token | No | None |
| | GET | `/api/v1/auth/session` | Get current user identity & role claims | Yes | None |
| **Settings**| GET | `/api/v1/settings` | Retrieve store branding, colors & COD rules | No | KV Cache (`3600s`) |
| | PUT | `/api/v1/admin/settings` | Update store settings (purges KV cache) | Yes (`ADMIN`) | None |
| **Categories**| GET | `/api/v1/categories` | Retrieve hierarchical category tree (`?tree=true`) | No | KV Cache (`3600s`) |
| | GET | `/api/v1/categories/:slug` | Get single category by slug | No | KV Cache (`3600s`) |
| | POST | `/api/v1/admin/categories` | Create new category (purges KV cache) | Yes (`ADMIN`) | None |
| | PUT | `/api/v1/admin/categories/:id`| Update existing category (cycle detection enforced) | Yes (`ADMIN`) | None |
| | DELETE| `/api/v1/admin/categories/:id`| Delete category (children re-parented safely) | Yes (`ADMIN`) | None |
| **Products**| GET | `/api/v1/products` | Retrieve paginated products with filters | No | Edge Cache (`60s`) |
| | GET | `/api/v1/products/:slug` | Get single product & variants by slug | No | Edge Cache (`60s`) |
| | POST | `/api/v1/admin/products` | Create product, options, values & SKUs in D1 batch| Yes (`ADMIN`) | None |
| | PUT | `/api/v1/admin/products/:id` | Update product details & variant matrix | Yes (`ADMIN`) | None |
| **Images** | GET | `/api/v1/products/:id/images`| Retrieve lookbook image list for product | No | Edge Cache (`60s`) |
| | POST | `/api/v1/admin/images/upload`| Upload lookbook image to R2 & save D1 reference | Yes (`ADMIN`) | None |
| | PATCH | `/api/v1/admin/images/:id/primary`| Set primary cover image in atomic D1 batch | Yes (`ADMIN`) | None |
| | DELETE| `/api/v1/admin/images/:id` | Delete image from R2 bucket & D1 database | Yes (`ADMIN`) | None |
| **Inventory**| GET | `/api/v1/inventory/check` | Public storefront SKU availability check | No | None |
| | GET | `/api/v1/admin/inventory` | Retrieve stock ledger & low-stock alerts | Yes (`ADMIN`) | None |
| | GET | `/api/v1/admin/inventory/:id/logs`| Retrieve audit log trail for SKU variant | Yes (`ADMIN`) | None |
| | PATCH | `/api/v1/admin/inventory/:id`| Manual stock adjustment with reason audit log | Yes (`ADMIN`) | None |
| **Customers**| GET | `/api/v1/customer/profile`| Get customer profile & default address | Yes | None |
| | GET | `/api/v1/customer/addresses`| List saved Pakistani shipping addresses | Yes | None |
| | POST | `/api/v1/customer/addresses`| Add new Pakistani address (`03XX...`, city, province) | Yes | None |
| | PUT | `/api/v1/customer/addresses/:id`| Update existing address & toggle default | Yes | None |
| | DELETE| `/api/v1/customer/addresses/:id`| Delete address & promote remaining address atomically| Yes | None |
| **Search** | GET | `/api/v1/search?q=...` | Keyword search via D1 FTS5 virtual table | No | Edge Cache (`30s`) |
| **Cart** | POST | `/api/v1/cart/validate` | Authoritative D1 server-side price & stock check | No | None |
| **Discounts**| POST | `/api/v1/discounts/validate`| Evaluate promotional coupon against order subtotal PKR| No | None |
| | GET | `/api/v1/admin/discounts` | Retrieve all registered promotional codes | Yes (`ADMIN`) | None |
| | POST | `/api/v1/admin/discounts` | Register new promotional coupon code in D1 | Yes (`ADMIN`) | None |
| | PUT | `/api/v1/admin/discounts/:id` | Update coupon rules or toggle active status | Yes (`ADMIN`) | None |
| | DELETE| `/api/v1/admin/discounts/:id` | Delete promotional coupon code | Yes (`ADMIN`) | None |
| **Checkout** | POST | `/api/v1/checkout/cod` | Execute atomic COD checkout transaction (Turnstile) | No (Guest/Auth) | KV rate-limit |
| **Orders** | GET | `/api/v1/orders/:number` | Customer order tracking by `#PK-XXXXX` + phone | No | None |
| | GET | `/api/v1/admin/orders` | Admin orders Kanban/table with status filters | Yes (`ADMIN`) | None |
| | PATCH | `/api/v1/admin/orders/:id/status`| Transition order state & log timeline comment | Yes (`ADMIN`) | None |
| **Analytics**| GET | `/api/v1/admin/analytics/overview`| Retrieve total PKR revenue, orders & top SKUs | Yes (`ADMIN`) | None |

---

## 4. Authentication Endpoints Detail (Milestone 1 — `v0.2.0`)

### 4.1 Register Account (`POST /api/v1/auth/register`)
Creates a new customer or administrator account with Turnstile challenge verification and Pakistani phone number validation.
- **Request Body:**
  ```json
  {
    "email": "customer@lahore.pk",
    "phone": "0300-1234567",
    "password": "StrongPassword123!",
    "role": "CUSTOMER",
    "turnstileToken": "0x4AAAAAA..."
  }
  ```
- **Success Response (`201 Created`):** Returns user profile and sets an `HttpOnly`, `Secure`, `SameSite=Strict` `Set-Cookie: auth_session=...` header.

### 4.2 Login Account (`POST /api/v1/auth/login`)
Authenticates existing active user and issues session token.
- **Request Body:**
  ```json
  {
    "email": "customer@lahore.pk",
    "password": "StrongPassword123!",
    "turnstileToken": "0x4AAAAAA..."
  }
  ```
- **Success Response (`200 OK`):** Sets HttpOnly session cookie and returns user claims.

### 4.3 Get Active Session (`GET /api/v1/auth/session`)
Validates cookie or `Authorization: Bearer <token>` against WebCrypto signature and D1 database.
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "authenticated": true,
      "user": {
        "id": "usr_1753800000000",
        "email": "customer@lahore.pk",
        "phone": "0300-1234567",
        "role": "CUSTOMER",
        "isActive": true
      }
    }
  }
  ```

---

## 5. Store Settings Endpoints Detail (Milestone 2 — `v0.3.0`)

### 5.1 Get Store Configuration (`GET /api/v1/settings`)
Public endpoint returning the active store configuration. Low-latency responses are served from Cloudflare KV cache (`3600s` TTL) with fallback to D1 database.
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "brandName": "PAKISTANI CLOTHING",
      "brandTagline": "Next-Generation Pakistani Apparel Commerce",
      "supportPhonePk": "0300-1234567",
      "whatsappPk": "0300-1234567",
      "primaryColorHex": "#065f46",
      "secondaryColorHex": "#047857",
      "codShippingBasePkr": 250,
      "freeShippingThresholdPkr": 5000,
      "seoTitle": "Pakistani Clothing Commerce Framework — Edge-First COD Foundation",
      "seoDescription": "Production-ready, Cloudflare-native e-commerce framework optimized for Pakistani clothing brands and Cash on Delivery (COD)."
    }
  }
  ```

### 5.2 Update Store Configuration (`PUT /api/v1/admin/settings`)
Protected endpoint requiring `ADMIN` Role-Based Access Control claim. Updates D1 `store_settings` table atomically and invalidates/refreshes the KV cache key.
- **Headers Required:** `Cookie: auth_session=<admin_token>` or `Authorization: Bearer <admin_token>`
- **Request Body:**
  ```json
  {
    "brandName": "GUL AHMED COD",
    "brandTagline": "Original Pakistani Lawn Collections",
    "supportPhonePk": "0300-9999999",
    "whatsappPk": "0300-9999999",
    "primaryColorHex": "#047857",
    "secondaryColorHex": "#065f46",
    "codShippingBasePkr": 250,
    "freeShippingThresholdPkr": 6000,
    "seoTitle": "Gul Ahmed COD Official Store",
    "seoDescription": "Authentic Pakistani Lawn and Unstitched Clothing with Free Cash on Delivery across Pakistan."
  }
  ```
- **Success Response (`200 OK`):** Returns updated `StoreSettings` object.

---

## 6. Category & Taxonomy Endpoints Detail (Milestone 3 — `v0.4.0`)

### 6.1 Get All Categories (`GET /api/v1/categories`)
Public endpoint returning all collection categories ordered by `sort_order ASC, name ASC`. Supports optional query parameter `?tree=true` which formats the flat list into a recursive `CategoryNode[]` hierarchy.
- **Query Parameters:** `?tree=true` (optional boolean)
- **Success Response (`200 OK`, `?tree=true`):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "cat_lawn",
        "parentId": null,
        "name": "Unstitched Lawn",
        "slug": "unstitched-lawn",
        "description": "Premium Unstitched 3-Piece and 2-Piece Lawn Suits for Summer",
        "sortOrder": 10,
        "isActive": true,
        "children": [
          {
            "id": "cat_lawn_3p",
            "parentId": "cat_lawn",
            "name": "3-Piece Lawn Suits",
            "slug": "3-piece-lawn",
            "sortOrder": 1,
            "isActive": true,
            "children": []
          }
        ]
      }
    ],
    "meta": { "total": 5 }
  }
  ```

### 6.2 Get Category Detail by Slug (`GET /api/v1/categories/:slug`)
Public endpoint returning a single collection category by its unique SEO slug.
- **Success Response (`200 OK`):** Returns `Category` object.
- **Error Response (`404 Not Found`):** Returns standard error envelope if slug does not exist.

### 6.3 Create Category (`POST /api/v1/admin/categories`)
Protected endpoint requiring `ADMIN` role claim. Creates a new category in D1 and purges the KV cache key `'categories_cache'`.
- **Request Body:**
  ```json
  {
    "name": "3-Piece Lawn Suits",
    "slug": "3-piece-lawn",
    "description": "Complete embroidered shirt, dupatta, and trouser lawn fabrics",
    "parentId": "cat_lawn",
    "sortOrder": 1,
    "isActive": true
  }
  ```
- **Success Response (`201 Created`):** Returns newly created `Category` object.

### 6.4 Update Category (`PUT /api/v1/admin/categories/:id`)
Protected endpoint requiring `ADMIN` role claim. Enforces **cycle-detection algorithm** to prevent a category from being set as its own parent or descendant.
- **Request Body:** Partial update fields (`name`, `slug`, `parentId`, `description`, `sortOrder`, `isActive`).
- **Success Response (`200 OK`):** Returns updated `Category` object.
- **Error Response (`400 Validation Error`):** Returns error if circular reference cycle is detected.

### 6.5 Delete Category (`DELETE /api/v1/admin/categories/:id`)
Protected endpoint requiring `ADMIN` role claim. Deletes category from D1. Because of `ON DELETE SET NULL` foreign key constraint, child subcategories are safely re-parented to root (`NULL`) without losing catalog data.
- **Success Response (`200 OK`):**
  ```json
  { "success": true, "data": { "deleted": true, "id": "cat_lawn" } }
  ```

---

## 7. Product Catalog & Variant Matrix Endpoints Detail (Milestone 4 — `v0.5.0`)

### 7.1 Get Filtered Product Catalog (`GET /api/v1/products`)
Public endpoint returning a filtered, sorted list of catalog clothing items. Supports filtering by collection category, keyword search, and min/max PKR price.
- **Query Parameters:** `?category=<slug>`, `?q=<search_keyword>`, `?minPrice=<pkr>`, `?maxPrice=<pkr>`
- **Success Response (`200 OK`):** Returns `Product[]` with Edge `Cache-Control: public, max-age=60, s-maxage=300, stale-while-revalidate=600`.

### 7.2 Get Complete Product Detail by Slug (`GET /api/v1/products/:slug`)
Public endpoint returning a complete clothing product including its options (`ProductOption[]`), option values (`ProductOptionValue[]`), and discrete sellable SKUs (`ProductVariant[]`) with their PKR price overrides.
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "id": "prod_lawn_01",
      "name": "Gul-e-Bahar Unstitched Lawn 3-Piece",
      "slug": "gul-e-bahar-unstitched-lawn-3-piece",
      "basePricePkr": 6500,
      "categoryName": "3-Piece Lawn Suits",
      "options": [
        {
          "name": "Color",
          "values": [
            { "id": "val_grn", "value": "Emerald Green" },
            { "id": "val_blu", "value": "Royal Blue" }
          ]
        }
      ],
      "variants": [
        {
          "id": "var_lwn_01_grn",
          "sku": "PK-LWN-GB-GRN",
          "priceOverridePkr": null,
          "optionValues": [{ "id": "val_grn", "value": "Emerald Green" }]
        }
      ]
    }
  }
  ```

### 7.3 Create Product with Cartesian SKU Matrix (`POST /api/v1/admin/products`)
Protected endpoint requiring `ADMIN` role claim. Atomically inserts the product header, option names, option values, variant rows, and variant-to-option mappings inside a single Cloudflare D1 batch transaction (`db.batch()`).
- **Request Body:**
  ```json
  {
    "name": "Luxury Embroidered Lawn Suit",
    "slug": "luxury-embroidered-lawn-suit",
    "basePricePkr": 7500,
    "categoryId": "cat_lawn_3p",
    "options": [
      { "name": "Size", "values": ["Small", "Medium"] }
    ],
    "variants": [
      { "sku": "PK-LUX-S", "priceOverridePkr": null, "optionValues": ["Small"] },
      { "sku": "PK-LUX-M", "priceOverridePkr": 7800, "optionValues": ["Medium"] }
    ]
  }
  ```
- **Success Response (`201 Created`):** Returns complete `ProductWithVariants` object.

---

## 8. R2 Product Image & Lookbook Endpoints Detail (Milestone 5 — `v0.6.0`)

### 8.1 Get Product Lookbook Images (`GET /api/v1/products/:id/images`)
Public endpoint returning all lookbook images for a catalog product sorted by `is_primary DESC, sort_order ASC`.
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "img_lwn_01",
        "productId": "prod_lawn_01",
        "variantId": null,
        "r2Key": "products/prod_lawn_01/gul-e-bahar-1.webp",
        "url": "https://images.pakistaniclothing.pk/products/prod_lawn_01/gul-e-bahar-1.webp",
        "altText": "Gul-e-Bahar Unstitched Lawn 3-Piece Front Embroidered Lookbook",
        "sortOrder": 1,
        "isPrimary": true
      }
    ]
  }
  ```

### 8.2 Upload Lookbook Image (`POST /api/v1/admin/images/upload`)
Protected endpoint requiring `ADMIN` role claim. Uploads image payload to Cloudflare R2 bucket (`env.BUCKET`) and saves metadata to D1 `product_images` table. Includes automatic **Orphan Defense**: if D1 insertion fails, the R2 object is deleted immediately.
- **Request Body:**
  ```json
  {
    "productId": "prod_lawn_01",
    "filename": "gul-e-bahar-front.webp",
    "contentType": "image/webp",
    "base64Data": "UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASo...",
    "altText": "Gul-e-Bahar Front Lookbook",
    "sortOrder": 1,
    "isPrimary": true
  }
  ```
- **Success Response (`201 Created`):** Returns created `ProductImage` record.

### 8.3 Set Primary Lookbook Cover (`PATCH /api/v1/admin/images/:id/primary?productId=<prod_id>`)
Protected endpoint requiring `ADMIN` role claim. Executes an atomic D1 batch transaction setting `is_primary = 0` for all existing images of the product and `is_primary = 1` for the target image.
- **Success Response (`200 OK`):** Returns updated `ProductImage[]` for the product.

### 8.4 Delete Lookbook Image (`DELETE /api/v1/admin/images/:id`)
Protected endpoint requiring `ADMIN` role claim. Deletes the object from Cloudflare R2 bucket (`BUCKET.delete(r2_key)`) and deletes the metadata record from D1 `product_images` table.
- **Success Response (`200 OK`):**
  ```json
  { "success": true, "data": { "success": true, "id": "img_lwn_01" } }
  ```

---

## 9. Inventory & Stock Management Endpoints Detail (Milestone 6 — `v0.7.0`)

### 9.1 Get Inventory Stock Ledger (`GET /api/v1/admin/inventory`)
Protected endpoint requiring `ADMIN` role claim. Retrieves stock ledger across all SKU variants, joining product title, available stock, reserved stock, low-stock threshold, and stock status (`IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`).
- **Query Parameters:** `?lowStock=true` (filters only items where `quantity_available <= low_stock_threshold`), `?q=<keyword>` (search by SKU or product name)
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": [
      {
        "variantId": "var_lwn_01_grn",
        "sku": "PK-LWN-GB-GRN",
        "productId": "prod_lawn_01",
        "productName": "Gul-e-Bahar Lawn",
        "quantityAvailable": 25,
        "quantityReserved": 0,
        "lowStockThreshold": 5,
        "status": "IN_STOCK"
      }
    ]
  }
  ```

### 9.2 Get SKU Audit Log Trail (`GET /api/v1/admin/inventory/:id/logs`)
Protected endpoint requiring `ADMIN` role claim. Retrieves the immutable audit log history for an individual SKU variant.
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "log_init_1",
        "variantId": "var_lwn_01_grn",
        "changeQty": 25,
        "reason": "RESTOCK",
        "referenceId": "PO-2026-081",
        "comment": "Initial inventory seed",
        "createdAt": "2026-07-30T10:00:00.000Z"
      }
    ]
  }
  ```

### 9.3 Manual Stock Adjustment (`PATCH /api/v1/admin/inventory/:id`)
Protected endpoint requiring `ADMIN` role claim. Executes a manual stock adjustment inside an **atomic D1 batch transaction**: updates `quantity_available` in `inventory_items` and inserts an audit trail record into `inventory_logs`. Enforces zero negative stock: throws an error if `quantity_available + changeQty < 0`.
- **Request Body:**
  ```json
  {
    "changeQty": 10,
    "reason": "RESTOCK",
    "referenceId": "PO-2026-081",
    "comment": "Received shipment from Lahore warehouse"
  }
  ```
- **Success Response (`200 OK`):** Returns updated `item` and created audit `log`.
- **Error Response (`400 Validation Error`):** Returns error if adjustment would cause negative stock.

### 9.4 Check Storefront SKU Stock Status (`GET /api/v1/inventory/check?variantId=<id>`)
Public endpoint used by the storefront and shopping cart to check real-time stock availability and low-stock status before adding an item to the COD cart.
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "variantId": "var_lwn_01_grn",
      "sku": "PK-LWN-GB-GRN",
      "quantityAvailable": 25,
      "lowStockThreshold": 5,
      "status": "IN_STOCK"
    }
  }
  ```

---

## 10. Customer Profile & Pakistani Address Book Endpoints Detail (Milestone 7 — `v0.8.0`)

### 10.1 Get Customer Profile & Addresses (`GET /api/v1/customer/profile`)
Protected endpoint requiring active authentication session. Retrieves the customer's email, Pakistani mobile line, active default address ID, and complete Address Book.
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "userId": "usr_demo_customer",
      "email": "ahmed@lahore.pk",
      "phone": "0300-1234567",
      "defaultAddressId": "addr_lahore_01",
      "addresses": [
        {
          "id": "addr_lahore_01",
          "customerId": "usr_demo_customer",
          "recipientName": "Ahmed Khan",
          "phone": "0300-1234567",
          "city": "Lahore",
          "provinceState": "Punjab",
          "streetAddress": "House 12, Street 4, Gulberg III",
          "postalCode": "54660",
          "isDefault": true
        }
      ]
    }
  }
  ```

### 10.2 Get Saved Address Book (`GET /api/v1/customer/addresses`)
Protected endpoint returning all saved shipping addresses ordered by `is_default DESC, created_at DESC`.

### 10.3 Add New Pakistani Shipping Address (`POST /api/v1/customer/addresses`)
Protected endpoint adding a shipping address to the customer's account. Validates Pakistani province/city locations and mobile number pattern `^(\+92|0|92)?3[0-9]{2}-?[0-9]{7}$`.
- **Request Body:**
  ```json
  {
    "recipientName": "Ahmed Khan",
    "phone": "0300-1234567",
    "provinceState": "Punjab",
    "city": "Lahore",
    "streetAddress": "House 12, Street 4, Gulberg III",
    "postalCode": "54660",
    "isDefault": true
  }
  ```
- **Success Response (`201 Created`):** Returns created `CustomerAddress` object. If `isDefault` is true (or if it is the customer's very first address), an atomic D1 batch transaction unsets existing default addresses and updates `customer_profiles.default_address_id`.

### 10.4 Update Shipping Address (`PUT /api/v1/customer/addresses/:id`)
Protected endpoint updating an existing address and atomically toggling default status if requested.

### 10.5 Delete Shipping Address (`DELETE /api/v1/customer/addresses/:id`)
Protected endpoint deleting an address from the address book. If the deleted address was the active default (`is_default = 1`), an atomic D1 batch transaction automatically promotes the most recent remaining address to `is_default = 1` and updates `customer_profiles.default_address_id`.

---

## 11. Storefront Product Discovery & FTS5 Edge Search Endpoints Detail (Milestone 8 — `v0.9.0`)

### 11.1 Full-Text Search Catalog Items (`GET /api/v1/search`)
Public endpoint executing keyword search against Cloudflare D1 FTS5 virtual table (`products_fts`), combined with category filtering, PKR price range filtering, sorting, and pagination.
- **Query Parameters:**
  - `?q=<keyword>` (optional keyword string, e.g. `"Lawn suit"`; automatically sanitized with prefix matching wildcard `'lawn* suit*'`)
  - `?category=<slug>` (optional collection slug, e.g. `"3-piece-lawn"`)
  - `?minPrice=<pkr>` (optional minimum whole PKR amount)
  - `?maxPrice=<pkr>` (optional maximum whole PKR amount)
  - `?sort=relevance|price_asc|price_desc|newest` (sort ordering, default `'relevance'`)
  - `?page=<number>` (1-based page number, default `1`)
  - `?limit=<number>` (items per page, max `50`, default `12`)
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "prod_lawn_01",
        "name": "Gul-e-Bahar Unstitched Lawn 3-Piece",
        "slug": "gul-e-bahar-unstitched-lawn-3-piece",
        "basePricePkr": 6500,
        "categoryName": "3-Piece Lawn Suits",
        "isActive": true
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "limit": 12,
      "totalPages": 1
    }
  }
  ```
- **Edge Cache Headers:** `Cache-Control: public, max-age=30, s-maxage=120, stale-while-revalidate=300`.

---

## 12. Shopping Cart & Stock Validation Endpoints Detail (Milestone 9 — `v0.10.0`)

### 12.1 Validate Cart Items & Server-Side Prices (`POST /api/v1/cart/validate`)
Public endpoint that takes an array of SKU items and checks Cloudflare D1 database inventory ledgers and catalog prices. **Never trusts client-side price totals:** unit prices in PKR are read exclusively from `product_variants.price_override_pkr` or `products.base_price_pkr`.
- **Request Body:**
  ```json
  {
    "items": [
      { "variantId": "var_lwn_01_grn", "quantity": 2 }
    ]
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "variantId": "var_lwn_01_grn",
          "productId": "prod_lawn_01",
          "sku": "PK-LWN-GB-GRN",
          "productName": "Gul-e-Bahar Unstitched Lawn 3-Piece",
          "variantName": "PK-LWN-GB-GRN",
          "unitPricePkr": 6500,
          "requestedQuantity": 2,
          "verifiedQuantity": 2,
          "lineTotalPkr": 13000,
          "isAvailable": true,
          "warning": null,
          "imageUrl": "https://images.pakistaniclothing.pk/products/prod_lawn_01/gul-e-bahar-1.webp"
        }
      ],
      "subtotalPkr": 13000,
      "totalCount": 2,
      "isValid": true,
      "warnings": []
    }
  }
  ```
- **Quantity Clipping & Stock Warnings:**  
  If requested quantity exceeds `quantity_available`, `verifiedQuantity` is clipped to available stock and a notice is appended to `warnings` (`"Only X units of '...' left in stock — quantity adjusted."`). If an item has `quantity_available <= 0`, `isAvailable` is set to `false` and `isValid` becomes `false`.

---

## 13. Discount Code & Coupon Promotion Endpoints Detail (Milestone 10 — `v0.11.0`)

### 13.1 Validate & Apply Promo Coupon (`POST /api/v1/discounts/validate`)
Public endpoint that evaluates a promotional coupon code against an order subtotal in PKR. Validates coupon active flag, start/end timestamps, usage caps (`used_count < usage_limit`), and minimum order threshold (`min_order_pkr`).
- **Request Body:**
  ```json
  {
    "code": "AZADI14",
    "subtotalPkr": 6500
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "code": "AZADI14",
      "type": "PERCENTAGE",
      "value": 15,
      "subtotalPkr": 6500,
      "discountPkr": 975,
      "newSubtotalPkr": 5525,
      "isValid": true
    }
  }
  ```
- **Error Response (`400 Validation Error`):** Returns clear error message if coupon is inactive, expired, usage limit exceeded, or if `subtotalPkr < min_order_pkr`.

### 13.2 List All Promo Coupons (`GET /api/v1/admin/discounts`)
Protected endpoint requiring `ADMIN` role claim. Returns all registered promotional coupons ordered by `created_at DESC`.

### 13.3 Register Promo Coupon (`POST /api/v1/admin/discounts`)
Protected endpoint requiring `ADMIN` role claim. Registers a new coupon code in D1 (`discounts` table).
- **Request Body:**
  ```json
  {
    "code": "AZADI14",
    "type": "PERCENTAGE",
    "value": 15,
    "minOrderPkr": 5000,
    "maxDiscountPkr": 2000,
    "startTime": "2026-07-01T00:00:00Z",
    "endTime": "2026-12-31T23:59:59Z",
    "usageLimit": 500,
    "isActive": true
  }
  ```

### 13.4 Update Promo Coupon (`PUT /api/v1/admin/discounts/:id`)
Protected endpoint requiring `ADMIN` role claim. Updates coupon rules or toggles active status.

### 13.5 Delete Promo Coupon (`DELETE /api/v1/admin/discounts/:id`)
Protected endpoint requiring `ADMIN` role claim. Deletes coupon code from D1.

---

## 14. Cash on Delivery (COD) Checkout Endpoints Detail (Milestone 11 — `v0.12.0`)

### 14.1 Place Cash on Delivery Order (`POST /api/v1/checkout/cod`)
Public checkout endpoint (supporting guest and logged-in customers) that places an order specifically architected for Pakistani Cash on Delivery. Enforces **Turnstile challenge verification** and executes an **ACID atomic Cloudflare D1 batch transaction**:
1. Authoritatively re-validates cart items, server-side prices, and inventory availability (`validateCartItems`).
2. Evaluates promotional coupon if provided (`evaluateDiscount`).
3. Computes COD shipping charge in PKR (`calculateCodShippingPkr`).
4. Reserves SKU stock via atomic conditional SQL constraints (`WHERE quantity_available >= ?`).
5. Inserts order header (`orders`), line items (`order_items`), and initial audit log record (`order_timeline`).
6. Flags orders over PKR 25,000 threshold as `PENDING_VERIFICATION` for manual SMS/WhatsApp verification.

- **Request Body:**
  ```json
  {
    "items": [
      { "variantId": "var_lwn_01_grn", "quantity": 1 }
    ],
    "couponCode": "AZADI14",
    "shippingAddress": {
      "recipientName": "Ahmed Khan",
      "phone": "0300-1234567",
      "provinceState": "Punjab",
      "city": "Lahore",
      "streetAddress": "House 12, Street 4, Gulberg III",
      "postalCode": "54660",
      "isDefault": false
    },
    "guestPhone": "0300-1234567",
    "guestEmail": "ahmed@lahore.pk",
    "notes": "Please call before arrival",
    "turnstileToken": "0x4AAAAAA..."
  }
  ```
- **Success Response (`201 Created`):**
  ```json
  {
    "success": true,
    "data": {
      "id": "ord_1753800000000",
      "orderNumber": "#PK-10482",
      "status": "CONFIRMED",
      "paymentMethod": "COD",
      "subtotalPkr": 6500,
      "discountPkr": 975,
      "shippingPkr": 0,
      "totalPkr": 5525,
      "shippingAddress": {
        "recipientName": "Ahmed Khan",
        "phone": "0300-1234567",
        "city": "Lahore",
        "provinceState": "Punjab",
        "streetAddress": "House 12, Street 4, Gulberg III",
        "postalCode": "54660"
      },
      "items": [
        {
          "sku": "PK-LWN-GB-GRN",
          "productName": "Gul-e-Bahar Unstitched Lawn 3-Piece",
          "unitPricePkr": 6500,
          "quantity": 1,
          "totalPkr": 6500
        }
      ],
      "timeline": [
        {
          "oldStatus": null,
          "newStatus": "CONFIRMED",
          "comment": "Order placed via Pakistani Cash on Delivery (COD)"
        }
      ]
    }
  }
  ```

### 14.2 Get Order Confirmation & Status by Number (`GET /api/v1/orders/:orderNumber`)
Public endpoint returning complete order confirmation details and lifecycle audit timeline by executive order identifier (e.g. `#PK-10001`).
- **Success Response (`200 OK`):** Returns `CodOrder` object.
- **Error Response (`404 Not Found`):** Returns error envelope if `#PK-XXXXX` identifier does not exist.
