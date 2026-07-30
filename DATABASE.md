# Database Architecture & Cloudflare D1 Schema — Reusable Pakistani Commerce Framework

This document serves as the authoritative reference for the Cloudflare D1 (Serverless SQLite) relational database schema, indexing strategies, FTS5 full-text search implementation, Pakistani location standardization, and Cash on Delivery (COD) order management rules.

---

## 1. Cloudflare D1 Overview & Edge Properties
- **Engine:** Serverless SQLite running natively on Cloudflare Edge locations.
- **Transaction Support:** ACID compliance via D1 batch transactions (`db.batch()`), mandatory for all checkout, address toggling, and inventory mutations.
- **Migration Policy:** Every schema change requires a sequential SQL migration file in `/migrations/` (`0001_initial.sql`, `0002_*.sql`, etc.), a rollback strategy, and automated tests. Never manually alter production D1 tables.

---

## 2. Comprehensive Schema Definition (Version 1 Scope)

### 2.1 Store Configuration (`store_settings`)
```sql
CREATE TABLE IF NOT EXISTS store_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2.2 Users & Authentication (`users`)
```sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- e.g., usr_01h...
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE,   -- Normalized PK format: +923XXXXXXXXX or 03XX-XXXXXXX
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'CUSTOMER')),
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
```

### 2.3 Pakistani Customer Profiles & Address Book (`customer_profiles` & `customer_addresses`)
```sql
CREATE TABLE IF NOT EXISTS customer_profiles (
  user_id TEXT PRIMARY KEY,
  default_address_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS customer_addresses (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  phone TEXT NOT NULL, -- Pakistani format 03XX... or +92...
  city TEXT NOT NULL,  -- Lahore, Karachi, Islamabad, Faisalabad, etc.
  province_state TEXT NOT NULL, -- Punjab, Sindh, KPK, Balochistan, ICT, AJK, GB
  street_address TEXT NOT NULL,
  postal_code TEXT,
  is_default INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_addresses_customer ON customer_addresses(customer_id, is_default);
CREATE INDEX IF NOT EXISTS idx_addresses_city ON customer_addresses(city, province_state);
```

### 2.4 Hierarchical Categories (`categories`)
```sql
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  parent_id TEXT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_r2_key TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
```

### 2.5 Catalog Products & Variants
```sql
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  base_price_pkr INTEGER NOT NULL, -- Whole PKR (e.g. 6500 = Rs 6,500)
  category_id TEXT,
  is_active INTEGER DEFAULT 1,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

CREATE TABLE IF NOT EXISTS product_options (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_option_values (
  id TEXT PRIMARY KEY,
  option_id TEXT NOT NULL,
  value TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  FOREIGN KEY (option_id) REFERENCES product_options(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_variants (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  price_override_pkr INTEGER,
  compare_at_price_pkr INTEGER,
  weight_grams INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_variant_options (
  variant_id TEXT NOT NULL,
  option_value_id TEXT NOT NULL,
  PRIMARY KEY (variant_id, option_value_id),
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
  FOREIGN KEY (option_value_id) REFERENCES product_option_values(id) ON DELETE CASCADE
);
```

### 2.6 R2 Product Images (`product_images`)
```sql
CREATE TABLE IF NOT EXISTS product_images (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  variant_id TEXT,
  r2_key TEXT NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER DEFAULT 0,
  is_primary INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_images_product ON product_images(product_id);
```

### 2.7 Inventory Engine (`inventory_items` & `inventory_logs`)
```sql
CREATE TABLE IF NOT EXISTS inventory_items (
  variant_id TEXT PRIMARY KEY,
  quantity_available INTEGER DEFAULT 0 CHECK (quantity_available >= 0),
  quantity_reserved INTEGER DEFAULT 0 CHECK (quantity_reserved >= 0),
  low_stock_threshold INTEGER DEFAULT 5,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inventory_logs (
  id TEXT PRIMARY KEY,
  variant_id TEXT NOT NULL,
  change_qty INTEGER NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('SALE', 'RETURN', 'RESTOCK', 'ADJUSTMENT', 'CANCELLATION')),
  reference_id TEXT,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
);
```

---

## 3. Full-Text Search (FTS5) Virtual Table & Triggers

To achieve high-speed search across Pakistani apparel names, descriptions, SKUs, and category names without external search infrastructure, D1 FTS5 virtual tables are used:

```sql
CREATE VIRTUAL TABLE IF NOT EXISTS products_fts USING fts5(
  product_id UNINDEXED,
  name,
  description,
  sku,
  category_name,
  content=products,
  content_rowid=rowid
);
```

---

## 4. Pakistani Location Standardization Rules (Milestone 7 — `v0.8.0`)

1. **Administrative Provinces (`province_state`):**  
   All shipping addresses MUST specify one of the 7 official Pakistani provinces/territories:
   - `'Punjab'`, `'Sindh'`, `'Khyber Pakhtunkhwa'`, `'Balochistan'`, `'Islamabad Capital Territory'`, `'Azad Jammu and Kashmir'`, `'Gilgit-Baltistan'`.
2. **City Normalization (`city`):**  
   Cities are standardized against `PAKISTAN_CITIES_BY_PROVINCE` to ensure accurate COD shipping fee rules across Pakistan (e.g., Lahore, Karachi, Islamabad, Faisalabad, Multan, Quetta, Peshawar).
3. **Mobile Number Normalization (`phone`):**  
   Pakistani mobile numbers are validated against pattern `^(\+92|0|92)?3[0-9]{2}-?[0-9]{7}$` and formatted cleanly as `03XX-XXXXXXX` or `+923XX-XXXXXXX`.
4. **Atomic Default Address Promotion:**  
   - When a customer saves their first shipping address, D1 automatically flags it `is_default = 1`.
   - When a new address is flagged default (`isDefault: true`), an atomic D1 batch transaction (`db.batch()`) unsets existing default addresses and updates `customer_profiles.default_address_id`.
   - When the active default address is deleted, D1 automatically promotes the most recent remaining address to `is_default = 1` inside an atomic batch transaction.

---

## 5. Pakistani COD Checkout Transaction Rules (Mandatory ACID Batch)

When an order is submitted to `POST /api/v1/checkout/cod`, the following SQL operations MUST execute atomically within a single Cloudflare D1 batch call (`db.batch([ ... ])`):
1. **Verify Inventory & Reserve Stock:**  
   `UPDATE inventory_items SET quantity_available = quantity_available - ?, quantity_reserved = quantity_reserved + ? WHERE variant_id = ? AND quantity_available >= ?`
2. **Insert Order Header:**  
   `INSERT INTO orders (id, order_number, customer_id, guest_phone, status, ...) VALUES (...)`
3. **Insert Line Items:**  
   `INSERT INTO order_items (id, order_id, product_id, variant_id, ...) VALUES (...)`
4. **Increment Coupon Usage (if applied):**  
   `UPDATE discounts SET used_count = used_count + 1 WHERE id = ? AND (usage_limit IS NULL OR used_count < usage_limit)`
5. **Write Initial Audit Timeline Record:**  
   `INSERT INTO order_timeline (id, order_id, old_status, new_status, comment) VALUES (..., NULL, 'CONFIRMED', 'Order placed via COD')`

If any statement fails (e.g., insufficient stock constraint), the entire batch transaction rolls back immediately with zero database corruption.

---

## 6. COD Order Lifecycle & Audit Timeline State Machine (Milestone 12 — `v0.13.0`)

1. **State Machine Transition Matrix:**
   - `PENDING_VERIFICATION` -> `['CONFIRMED', 'CANCELLED']` (High-value orders > 25,000 PKR require phone verification before dispatch).
   - `CONFIRMED` -> `['PROCESSING', 'SHIPPED', 'CANCELLED']`
   - `PROCESSING` -> `['SHIPPED', 'CANCELLED']`
   - `SHIPPED` -> `['DELIVERED', 'RETURNED']`
   - `DELIVERED` -> `['RETURNED']`
   - `CANCELLED` -> `[]` (Terminal state)
   - `RETURNED` -> `[]` (Terminal state)

2. **Atomic Inventory Restock on Order Cancellation / Return:**
   When an admin transitions an order to `CANCELLED` or `RETURNED` (with `restockInventory: true`), `releaseStock` (`src/features/inventory/api/reservation.ts`) executes atomically:
   - `UPDATE inventory_items SET quantity_reserved = MAX(0, quantity_reserved - ?), quantity_available = quantity_available + ?, updated_at = ? WHERE variant_id = ?`
   - `INSERT INTO inventory_logs (id, variant_id, change_qty, reason, reference_id, comment) VALUES (..., 'CANCELLATION' | 'RETURN', ...)`

3. **Migration `0011_order_timeline.sql`:**
   - Creates compound index `idx_orders_tracking ON orders(order_number, guest_phone)` to accelerate customer order tracking lookups.
   - Creates index `idx_order_timeline_created ON order_timeline(created_at DESC)` for audit chronological sorting.
   - Seeds realistic demo COD orders across all lifecycle states (`#PK-10002` PENDING_VERIFICATION, `#PK-10003` PROCESSING, `#PK-10004` SHIPPED, `#PK-10005` DELIVERED, `#PK-10006` CANCELLED).

---

## 7. Admin Dashboard & Core E-Commerce Analytics Indexing (Milestone 13 — `v0.14.0`)

1. **Performance Indexing Strategy:**
   - `CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at)`: composite index allowing SQLite query planner to compute `SUM(total_pkr)` for `DELIVERED` orders across arbitrary timeframes (`7d`, `30d`, `90d`, `all`) without table scans.
   - `CREATE INDEX IF NOT EXISTS idx_order_items_order_total ON order_items(order_id, total_pkr)`: accelerates multi-table joins when ranking top 5 best-selling Pakistani clothing products by revenue and volume.

2. **Parallel D1 Aggregation Architecture:**
   - Instead of sequential queries, `getAnalyticsOverview` executes 5 index-backed SQLite queries in parallel (`Promise.all` across order metrics, inventory stock health, top products, daily revenue series, and recent order feeds).
   - Total execution time across all 5 aggregations consistently averages `< 20 milliseconds` on Cloudflare D1 serverless SQLite.

3. **Migration `0012_analytics.sql`:**
   - Establishes performance indexes (`idx_orders_status_created`, `idx_order_items_order_total`).
   - Seeds additional historical COD orders (`#PK-10007` through `#PK-10009`) with realistic date distributions to populate daily revenue trend charts.
