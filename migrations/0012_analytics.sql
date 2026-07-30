-- Migration 0012: Analytics Performance Indexes and Historical COD Order Seed Data for Dashboard Charts

-- Composite index to accelerate analytics aggregations by status and timestamp
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at);

-- Composite index to accelerate top products revenue & volume grouping
CREATE INDEX IF NOT EXISTS idx_order_items_order_total ON order_items(order_id, total_pkr);

-- Seed Additional Historical Demo COD Orders across multiple dates to populate 30d/7d analytics charts
-- Order #PK-10007: DELIVERED (3 days ago - Lahore)
INSERT OR IGNORE INTO orders (id, order_number, customer_id, guest_email, guest_phone, status, payment_method, subtotal_pkr, discount_pkr, shipping_pkr, total_pkr, shipping_address_json, notes, created_at, updated_at) VALUES
  ('ord_test_10007', '#PK-10007', 'usr_demo_customer', 'saad@lahore.pk', '0303-1112233', 'DELIVERED', 'COD', 13000, 0, 0, 13000, '{"recipientName":"Saad Rafique","phone":"0303-1112233","city":"Lahore","provinceState":"Punjab","streetAddress":"92 Model Town","postalCode":"54700"}', 'Delivered on time', '2026-07-27T10:00:00Z', '2026-07-29T14:00:00Z');

INSERT OR IGNORE INTO order_items (id, order_id, product_id, variant_id, sku, product_name, variant_name, unit_price_pkr, quantity, total_pkr) VALUES
  ('orditem_7_1', 'ord_test_10007', 'prod_lawn_01', 'var_lwn_01_grn', 'PK-LWN-GB-GRN', 'Gul-e-Bahar Unstitched Lawn 3-Piece', 'PK-LWN-GB-GRN', 6500, 2, 13000);

-- Order #PK-10008: DELIVERED (5 days ago - Karachi)
INSERT OR IGNORE INTO orders (id, order_number, customer_id, guest_email, guest_phone, status, payment_method, subtotal_pkr, discount_pkr, shipping_pkr, total_pkr, shipping_address_json, notes, created_at, updated_at) VALUES
  ('ord_test_10008', '#PK-10008', NULL, 'maham@khi.pk', '0331-4445566', 'DELIVERED', 'COD', 17800, 500, 0, 17300, '{"recipientName":"Maham Tariq","phone":"0331-4445566","city":"Karachi","provinceState":"Sindh","streetAddress":"45-A DHA Phase 6","postalCode":"75500"}', 'Payment received', '2026-07-25T11:30:00Z', '2026-07-28T16:00:00Z');

INSERT OR IGNORE INTO order_items (id, order_id, product_id, variant_id, sku, product_name, variant_name, unit_price_pkr, quantity, total_pkr) VALUES
  ('orditem_8_1', 'ord_test_10008', 'prod_khaddar_01', 'var_khd_01_l', 'PK-KHD-KSH-L', 'Kashmiri Khaddar 3-Piece Suit', 'PK-KHD-KSH-L', 8900, 2, 17800);

-- Order #PK-10009: DELIVERED (6 days ago - Islamabad)
INSERT OR IGNORE INTO orders (id, order_number, customer_id, guest_email, guest_phone, status, payment_method, subtotal_pkr, discount_pkr, shipping_pkr, total_pkr, shipping_address_json, notes, created_at, updated_at) VALUES
  ('ord_test_10009', '#PK-10009', NULL, 'bilal@isb.pk', '0341-7778899', 'DELIVERED', 'COD', 8500, 0, 0, 8500, '{"recipientName":"Bilal Ahmed","phone":"0341-7778899","city":"Islamabad","provinceState":"Islamabad Capital Territory","streetAddress":"House 14 Sector G-11/2","postalCode":"44000"}', 'Delivered', '2026-07-24T09:15:00Z', '2026-07-26T15:30:00Z');

INSERT OR IGNORE INTO order_items (id, order_id, product_id, variant_id, sku, product_name, variant_name, unit_price_pkr, quantity, total_pkr) VALUES
  ('orditem_9_1', 'ord_test_10009', 'prod_khaddar_01', 'var_khd_01_s', 'PK-KHD-KSH-S', 'Kashmiri Khaddar 3-Piece Suit', 'PK-KHD-KSH-S', 8500, 1, 8500);

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0012_analytics');
