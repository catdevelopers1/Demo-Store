-- Migration 0010: Cash on Delivery (COD) Orders, Line Items, and Timeline Schema
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL, -- e.g., "#PK-10045"
  customer_id TEXT,
  guest_email TEXT,
  guest_phone TEXT NOT NULL, -- Mandatory for Pakistani COD (03XX...)
  status TEXT NOT NULL CHECK (status IN (
    'PENDING_VERIFICATION',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'RETURNED'
  )),
  payment_method TEXT NOT NULL DEFAULT 'COD',
  subtotal_pkr INTEGER NOT NULL,
  discount_pkr INTEGER DEFAULT 0,
  shipping_pkr INTEGER NOT NULL,
  total_pkr INTEGER NOT NULL,
  shipping_address_json TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  variant_id TEXT NOT NULL,
  sku TEXT NOT NULL,
  product_name TEXT NOT NULL,
  variant_name TEXT NOT NULL,
  unit_price_pkr INTEGER NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  total_pkr INTEGER NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

CREATE TABLE IF NOT EXISTS order_timeline (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by_user_id TEXT,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_order_timeline_order ON order_timeline(order_id);

-- Seed Initial Test COD Order (#PK-10001)
INSERT OR IGNORE INTO orders (id, order_number, customer_id, guest_email, guest_phone, status, payment_method, subtotal_pkr, discount_pkr, shipping_pkr, total_pkr, shipping_address_json, notes) VALUES
  ('ord_test_10001', '#PK-10001', 'usr_demo_customer', 'ahmed@lahore.pk', '0300-1234567', 'CONFIRMED', 'COD', 6500, 0, 0, 6500, '{"recipientName":"Ahmed Khan","phone":"0300-1234567","city":"Lahore","provinceState":"Punjab","streetAddress":"House 12, Street 4, Gulberg III","postalCode":"54660"}', 'Initial seeded demo COD order');

INSERT OR IGNORE INTO order_items (id, order_id, product_id, variant_id, sku, product_name, variant_name, unit_price_pkr, quantity, total_pkr) VALUES
  ('orditem_1', 'ord_test_10001', 'prod_lawn_01', 'var_lwn_01_grn', 'PK-LWN-GB-GRN', 'Gul-e-Bahar Unstitched Lawn 3-Piece', 'PK-LWN-GB-GRN', 6500, 1, 6500);

INSERT OR IGNORE INTO order_timeline (id, order_id, old_status, new_status, comment) VALUES
  ('tl_test_1', 'ord_test_10001', NULL, 'CONFIRMED', 'Order placed via Cash on Delivery (COD)');

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0010_orders');
