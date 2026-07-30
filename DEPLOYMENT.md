# Cloudflare Deployment Architecture & Guide — Reusable Pakistani Commerce Framework

This document covers the production-grade Cloudflare-native deployment architecture and Wrangler configuration for the e-commerce framework.

---

## 1. Edge Infrastructure Topology

```
             +------------------------------------------------------+
             |             Cloudflare Global Anycast CDN            |
             |  - SSL / TLS Termination                             |
             |  - WAF & DDoS Prevention                             |
             |  - Turnstile Bot Verification Challenge              |
             +--------------------------+---------------------------+
                                        |
                 +----------------------+----------------------+
                 |                                             |
     +-----------v-----------+                     +-----------v-----------+
     |   Cloudflare Pages    |                     |  Cloudflare Workers   |
     |   (Static Storefront  |                     |  (/api/v1/* Edge API  |
     |    Vite 7 UI Assets)  |                     |   Serverless Backend) |
     +-----------------------+                     +-----+-----+-----+-----+
                                                         |     |     |
                         +-------------------------------+     |     +-------------------------------+
                         |                                     |                                     |
               +---------v---------+                 +---------v---------+                 +---------v---------+
               |   Cloudflare D1   |                 |   Cloudflare KV   |                 |   Cloudflare R2   |
               | (Serverless SQLite|                 | (Low-Latency Cache|                 | (Apparel Lookbook |
               |  & FTS5 Search)   |                 |  Store Settings)  |                 |  Image Storage)   |
               +-------------------+                 +-------------------+                 +-------------------+
```

---

## 2. Service Responsibilities & Edge Bindings
1. **Cloudflare Pages / Workers (`fetch` Handler):**
   - Serves Vite 7 frontend React 19 bundles and routes all API calls (`/api/v1/*`) to lightweight serverless edge workers.
2. **Cloudflare D1 (`DB` Binding):**
   - Relational SQLite database at the edge. Hosts `users`, `products`, `orders`, `inventory_items`, and `products_fts` FTS5 virtual search tables.
3. **Cloudflare R2 (`BUCKET` Binding):**
   - Zero-egress fee object storage bucket (`apparel-media-production`) storing optimized WebP clothing lookbooks and category cover imagery.
4. **Cloudflare KV (`KV` Binding):**
   - Distributed edge cache for `store_settings`, category trees, and per-IP rate limit counters.
5. **Cloudflare Turnstile:**
   - Bot mitigation widget integrated into Customer Registration, Admin Login, and Cash on Delivery (COD) Checkout forms.
6. **Cloudflare Queues & Cron Triggers (Prepared for future expansion):**
   - Background SMS/WhatsApp order confirmation webhook processing and nightly automated inventory reconciliation.

---

## 3. Wrangler Configuration Reference (`wrangler.json`)

The following authoritative configuration defines production and local development bindings:

```json
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "pakistani-commerce-framework",
  "main": "src/worker/index.ts",
  "compatibility_date": "2026-07-30",
  "compatibility_flags": [
    "nodejs_compat"
  ],
  "pages_build_output_dir": "dist",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "commerce_db_production",
      "database_id": "YOUR_D1_DATABASE_ID",
      "migrations_dir": "migrations"
    }
  ],
  "kv_namespaces": [
    {
      "binding": "KV",
      "id": "YOUR_KV_NAMESPACE_ID"
    }
  ],
  "r2_buckets": [
    {
      "binding": "BUCKET",
      "bucket_name": "apparel-media-production"
    }
  ],
  "vars": {
    "ENVIRONMENT": "production",
    "DEFAULT_CURRENCY": "PKR",
    "DEFAULT_COUNTRY": "PK",
    "TURNSTILE_SITE_KEY": "0x4AAAAAAAYOURSITEKEY"
  }
}
```

---

## 4. Production Secrets Configuration
Secrets must NEVER be stored in `wrangler.json`, codebase files, or git commits. Set secrets via Wrangler CLI:

```bash
# Set Turnstile Secret Key
npx wrangler secret put TURNSTILE_SECRET_KEY

# Set WebCrypto JWT Master Secret (64-byte random hex string)
npx wrangler secret put AUTH_JWT_SECRET
```

---

## 5. Deployment Commands

### 5.1 Execute D1 Migrations
```bash
# Apply migrations to local SQLite D1
npx wrangler d1 migrations apply DB --local

# Apply migrations to remote production D1
npx wrangler d1 migrations apply DB --remote
```

### 5.2 Build & Deploy to Cloudflare Pages
```bash
# Type check and build Vite frontend + Workers backend
npm run build

# Deploy output to Cloudflare Pages production
npx wrangler pages deploy dist --project-name=pakistani-commerce-framework
```

---

## 6. Production SEO, Security Headers, and Sitemap Certification (`v1.0.0`)

### 6.1 Enterprise HTTP Security Headers
Every Cloudflare Worker Edge response automatically includes:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `Content-Security-Policy: default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval'; frame-src 'self' https://challenges.cloudflare.com; connect-src 'self' https:`

### 6.2 Edge SEO Sitemaps & Robots.txt
- `GET /robots.txt`: Serves dynamic robots rules with sitemap link and protected checkout/admin exclusions.
- `GET /sitemap.xml`: Serves dynamic XML sitemap generated live from Cloudflare D1 categories and products (`SELECT slug, updated_at FROM ... WHERE is_active = 1`).
