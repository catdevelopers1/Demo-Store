-- Migration 0011: Order Timeline, Indexes, and Extended Pakistani COD Lifecycle Seed Data

CREATE INDEX IF NOT EXISTS idx_orders_tracking ON orders(order_number, guest_phone);
CREATE INDEX IF NOT EXISTS idx_order_timeline_created ON order_timeline(created_at DESC);

-- Seed Additional Demo COD Orders across all Lifecycle States for Admin & Customer Tracking Verification

-- Order #PK-10002: PENDING_VERIFICATION (High-value order > 25,000 PKR, Lahore)
INSERT OR IGNORE INTO orders (id, order_number, customer_id, guest_email, guest_phone, status, payment_method, subtotal_pkr, discount_pkr, shipping_pkr, total_pkr, shipping_address_json, notes) VALUES
  ('ord_test_10002', '#PK-10002', 'usr_demo_customer', 'fatima@lahore.pk', '0301-2345678', 'PENDING_VERIFICATION', 'COD', 28500, 0, 0, 28500, '{"recipientName":"Fatima Ali","phone":"0301-2345678","city":"Lahore","provinceState":"Punjab","streetAddress":"House 45, Street 10, DHA Phase 5","postalCode":"54792"}', 'High-value COD order requiring verification');

INSERT OR IGNORE INTO order_items (id, order_id, product_id, variant_id, sku, product_name, variant_name, unit_price_pkr, quantity, total_pkr) VALUES
  ('orditem_2_1', 'ord_test_10002', 'prod_lawn_01', 'var_lwn_01_grn', 'PK-LWN-GB-GRN', 'Gul-e-Bahar Unstitched Lawn 3-Piece', 'PK-LWN-GB-GRN', 6500, 2, 13000),
  ('orditem_2_2', 'ord_test_10002', 'prod_khaddar_01', 'var_khd_01_l', 'PK-KHD-KSH-L', 'Kashmiri Khaddar 3-Piece Suit', 'PK-KHD-KSH-L', 8900, 2, 17800);

INSERT OR IGNORE INTO order_timeline (id, order_id, old_status, new_status, comment) VALUES
  ('tl_test_2_1', 'ord_test_10002', NULL, 'PENDING_VERIFICATION', 'Order placed via COD (High-value verification required > 25,000 PKR)');

-- Order #PK-10003: PROCESSING (Rawalpindi order, confirmed and processing)
INSERT OR IGNORE INTO orders (id, order_number, customer_id, guest_email, guest_phone, status, payment_method, subtotal_pkr, discount_pkr, shipping_pkr, total_pkr, shipping_address_json, notes) VALUES
  ('ord_test_10003', '#PK-10003', NULL, 'usman@rwp.pk', '0333-9876543', 'PROCESSING', 'COD', 6800, 0, 0, 6800, '{"recipientName":"Usman Tariq","phone":"0333-9876543","city":"Rawalpindi","provinceState":"Punjab","streetAddress":"23-B, Satellite Town","postalCode":"46000"}', 'Please deliver in afternoon');

INSERT OR IGNORE INTO order_items (id, order_id, product_id, variant_id, sku, product_name, variant_name, unit_price_pkr, quantity, total_pkr) VALUES
  ('orditem_3_1', 'ord_test_10003', 'prod_lawn_01', 'var_lwn_01_blu', 'PK-LWN-GB-BLU', 'Gul-e-Bahar Unstitched Lawn 3-Piece', 'PK-LWN-GB-BLU', 6800, 1, 6800);

INSERT OR IGNORE INTO order_timeline (id, order_id, old_status, new_status, comment) VALUES
  ('tl_test_3_1', 'ord_test_10003', NULL, 'CONFIRMED', 'Order placed via Cash on Delivery (COD)'),
  ('tl_test_3_2', 'ord_test_10003', 'CONFIRMED', 'PROCESSING', 'Order confirmed via SMS and sent to warehouse stitching/packing');

-- Order #PK-10004: SHIPPED (Karachi order, dispatched via TCS)
INSERT OR IGNORE INTO orders (id, order_number, customer_id, guest_email, guest_phone, status, payment_method, subtotal_pkr, discount_pkr, shipping_pkr, total_pkr, shipping_address_json, notes) VALUES
  ('ord_test_10004', '#PK-10004', NULL, 'zainab@khi.pk', '0321-4567890', 'SHIPPED', 'COD', 8500, 0, 0, 8500, '{"recipientName":"Zainab Sheikh","phone":"0321-4567890","city":"Karachi","provinceState":"Sindh","streetAddress":"Apt 502, Clifton Block 4","postalCode":"75600"}', 'Call before delivery');

INSERT OR IGNORE INTO order_items (id, order_id, product_id, variant_id, sku, product_name, variant_name, unit_price_pkr, quantity, total_pkr) VALUES
  ('orditem_4_1', 'ord_test_10004', 'prod_khaddar_01', 'var_khd_01_s', 'PK-KHD-KSH-S', 'Kashmiri Khaddar 3-Piece Suit', 'PK-KHD-KSH-S', 8500, 1, 8500);

INSERT OR IGNORE INTO order_timeline (id, order_id, old_status, new_status, comment) VALUES
  ('tl_test_4_1', 'ord_test_10004', NULL, 'CONFIRMED', 'Order placed via Cash on Delivery (COD)'),
  ('tl_test_4_2', 'ord_test_10004', 'CONFIRMED', 'PROCESSING', 'Sent to packaging'),
  ('tl_test_4_3', 'ord_test_10004', 'PROCESSING', 'SHIPPED', 'Dispatched via TCS Courier. Tracking ID: TCS-78901234');

-- Order #PK-10005: DELIVERED (Islamabad order, completed)
INSERT OR IGNORE INTO orders (id, order_number, customer_id, guest_email, guest_phone, status, payment_method, subtotal_pkr, discount_pkr, shipping_pkr, total_pkr, shipping_address_json, notes) VALUES
  ('ord_test_10005', '#PK-10005', 'usr_demo_customer', 'hamza@isb.pk', '0345-6789012', 'DELIVERED', 'COD', 15400, 500, 0, 14900, '{"recipientName":"Hamza Mehmood","phone":"0345-6789012","city":"Islamabad","provinceState":"Islamabad Capital Territory","streetAddress":"House 18, Street 25, Sector F-10/1","postalCode":"44000"}', 'Delivered successfully');

INSERT OR IGNORE INTO order_items (id, order_id, product_id, variant_id, sku, product_name, variant_name, unit_price_pkr, quantity, total_pkr) VALUES
  ('orditem_5_1', 'ord_test_10005', 'prod_lawn_01', 'var_lwn_01_grn', 'PK-LWN-GB-GRN', 'Gul-e-Bahar Unstitched Lawn 3-Piece', 'PK-LWN-GB-GRN', 6500, 1, 6500),
  ('orditem_5_2', 'ord_test_10005', 'prod_khaddar_01', 'var_khd_01_l', 'PK-KHD-KSH-L', 'Kashmiri Khaddar 3-Piece Suit', 'PK-KHD-KSH-L', 8900, 1, 8900);

INSERT OR IGNORE INTO order_timeline (id, order_id, old_status, new_status, comment) VALUES
  ('tl_test_5_1', 'ord_test_10005', NULL, 'CONFIRMED', 'Order placed via Cash on Delivery (COD)'),
  ('tl_test_5_2', 'ord_test_10005', 'CONFIRMED', 'PROCESSING', 'Packed and ready for courier'),
  ('tl_test_5_3', 'ord_test_10005', 'PROCESSING', 'SHIPPED', 'Dispatched via Leopards Courier. Tracking: LPR-554433'),
  ('tl_test_5_4', 'ord_test_10005', 'SHIPPED', 'DELIVERED', 'COD payment collected and parcel delivered');

-- Order #PK-10006: CANCELLED (Cancelled by customer)
INSERT OR IGNORE INTO orders (id, order_number, customer_id, guest_email, guest_phone, status, payment_method, subtotal_pkr, discount_pkr, shipping_pkr, total_pkr, shipping_address_json, notes) VALUES
  ('ord_test_10006', '#PK-10006', NULL, 'ayesha@fsd.pk', '0302-3456789', 'CANCELLED', 'COD', 6500, 0, 0, 6500, '{"recipientName":"Ayesha Bibi","phone":"0302-3456789","city":"Faisalabad","provinceState":"Punjab","streetAddress":"45 Civil Lines","postalCode":"38000"}', 'Customer requested cancellation via WhatsApp');

INSERT OR IGNORE INTO order_items (id, order_id, product_id, variant_id, sku, product_name, variant_name, unit_price_pkr, quantity, total_pkr) VALUES
  ('orditem_6_1', 'ord_test_10006', 'prod_lawn_01', 'var_lwn_01_grn', 'PK-LWN-GB-GRN', 'Gul-e-Bahar Unstitched Lawn 3-Piece', 'PK-LWN-GB-GRN', 6500, 1, 6500);

INSERT OR IGNORE INTO order_timeline (id, order_id, old_status, new_status, comment) VALUES
  ('tl_test_6_1', 'ord_test_10006', NULL, 'CONFIRMED', 'Order placed via Cash on Delivery (COD)'),
  ('tl_test_6_2', 'ord_test_10006', 'CONFIRMED', 'CANCELLED', 'Customer requested cancellation via WhatsApp. Stock released back to available inventory.');

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0011_order_timeline');
