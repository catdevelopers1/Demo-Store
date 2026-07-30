-- Migration 0013: Complete Pakistani Clothing Brand Demo Store Seed Data
-- Enriches the D1 database with comprehensive categories, clothing products, sizes, colors, images, inventory, customers, COD orders, discounts, and store settings.

-- 1. Ensure Store Branding & Pakistani Settings
INSERT OR IGNORE INTO store_settings (key, value, description) VALUES
  ('brand_name', 'KHAADI & CO. LUXURY APPAREL', 'Main Brand Title for demo store'),
  ('brand_tagline', 'Exquisite Pakistani Lawn, Khaddar & Ready to Wear Collections', 'Storefront Tagline'),
  ('support_phone_pk', '0300-1234567', 'Primary customer helpline'),
  ('whatsapp_pk', '0300-1234567', 'WhatsApp customer support'),
  ('free_shipping_threshold_pkr', '5000', 'Free Cash on Delivery across Pakistan above 5000 PKR');

-- 2. Add Luxury Pret Product (3rd Signature Pakistani Clothing Collection)
INSERT OR IGNORE INTO products (id, name, slug, description, base_price_pkr, category_id, is_active, seo_title, seo_description) VALUES
  ('prod_pret_01', 'Zaha Luxury Embroidered Velvet Kurta', 'zaha-luxury-embroidered-velvet-kurta', 'Exquisite black velvet kurta featuring traditional tilla and zardozi embroidery work around the neckline and borders.', 12500, 'cat_ready', 1, 'Zaha Luxury Velvet Kurta — Pakistani Pret', 'Shop stitched black luxury velvet kurta with tilla embroidery and Cash on Delivery across Pakistan.');

-- Options for Luxury Pret
INSERT OR IGNORE INTO product_options (id, product_id, name, sort_order) VALUES
  ('opt_prt_size', 'prod_pret_01', 'Size', 1),
  ('opt_prt_col', 'prod_pret_01', 'Color', 2);

INSERT OR IGNORE INTO product_option_values (id, option_id, value, sort_order) VALUES
  ('val_prt_size_s', 'opt_prt_size', 'Small', 1),
  ('val_prt_size_m', 'opt_prt_size', 'Medium', 2),
  ('val_prt_size_l', 'opt_prt_size', 'Large', 3),
  ('val_prt_col_blk', 'opt_prt_col', 'Midnight Black', 1);

-- Variants for Luxury Pret
INSERT OR IGNORE INTO product_variants (id, product_id, sku, price_override_pkr, is_active) VALUES
  ('var_prt_01_s', 'prod_pret_01', 'PK-PRT-VEL-S', 12500, 1),
  ('var_prt_01_m', 'prod_pret_01', 'PK-PRT-VEL-M', 12500, 1),
  ('var_prt_01_l', 'prod_pret_01', 'PK-PRT-VEL-L', 12800, 1);

INSERT OR IGNORE INTO product_variant_options (variant_id, option_value_id) VALUES
  ('var_prt_01_s', 'val_prt_size_s'),
  ('var_prt_01_s', 'val_prt_col_blk'),
  ('var_prt_01_m', 'val_prt_size_m'),
  ('var_prt_01_m', 'val_prt_col_blk'),
  ('var_prt_01_l', 'val_prt_size_l'),
  ('var_prt_01_l', 'val_prt_col_blk');

-- 3. Lookbook Image for Luxury Pret
INSERT OR IGNORE INTO product_images (id, product_id, r2_key, url, alt_text, sort_order, is_primary) VALUES
  ('img_prt_01', 'prod_pret_01', 'products/prod_pret_01/zaha-velvet-1.webp', 'https://images.pakistaniclothing.pk/products/prod_pret_01/zaha-velvet-1.webp', 'Zaha Luxury Embroidered Velvet Kurta Midnight Black Front Lookbook', 1, 1);

-- 4. Inventory Ledger & Stock Levels for new SKU variants
INSERT OR IGNORE INTO inventory_items (variant_id, quantity_available, quantity_reserved, low_stock_threshold) VALUES
  ('var_prt_01_s', 15, 0, 5),
  ('var_prt_01_m', 12, 0, 5),
  ('var_prt_01_l', 8, 0, 5);

INSERT OR IGNORE INTO inventory_logs (id, variant_id, change_qty, reason, reference_id, comment) VALUES
  ('log_demo_1', 'var_prt_01_s', 15, 'RESTOCK', 'sys_demo_seed', 'Initial stock seed for Zaha Velvet Kurta Small'),
  ('log_demo_2', 'var_prt_01_m', 12, 'RESTOCK', 'sys_demo_seed', 'Initial stock seed for Zaha Velvet Kurta Medium'),
  ('log_demo_3', 'var_prt_01_l', 8, 'RESTOCK', 'sys_demo_seed', 'Initial stock seed for Zaha Velvet Kurta Large');

-- 5. Add Demo Promotional Campaign Coupon
INSERT OR IGNORE INTO discounts (id, code, type, value, min_order_pkr, max_discount_pkr, start_time, end_time, usage_limit, used_count, is_active) VALUES
  ('dsc_demo_eid', 'EID2026', 'FIXED_PKR', 1500, 10000, 1500, '2026-06-01T00:00:00Z', '2026-08-31T23:59:59Z', 500, 12, 1);

-- 6. Seed Additional COD Order (#PK-10010) for Luxury Pret
INSERT OR IGNORE INTO orders (id, order_number, customer_id, guest_email, guest_phone, status, payment_method, subtotal_pkr, discount_pkr, shipping_pkr, total_pkr, shipping_address_json, notes, created_at, updated_at) VALUES
  ('ord_test_10010', '#PK-10010', 'usr_demo_customer', 'zoya@lahore.pk', '0300-8889900', 'CONFIRMED', 'COD', 12500, 1500, 0, 11000, '{"recipientName":"Zoya Khan","phone":"0300-8889900","city":"Lahore","provinceState":"Punjab","streetAddress":"21-C Gulberg II","postalCode":"54660"}', 'Please deliver in evening', '2026-07-30T08:00:00Z', '2026-07-30T08:30:00Z');

INSERT OR IGNORE INTO order_items (id, order_id, product_id, variant_id, sku, product_name, variant_name, unit_price_pkr, quantity, total_pkr) VALUES
  ('orditem_10_1', 'ord_test_10010', 'prod_pret_01', 'var_prt_01_m', 'PK-PRT-VEL-M', 'Zaha Luxury Embroidered Velvet Kurta', 'PK-PRT-VEL-M', 12500, 1, 12500);

INSERT OR IGNORE INTO order_timeline (id, order_id, old_status, new_status, comment, created_at) VALUES
  ('tl_demo_10_1', 'ord_test_10010', NULL, 'CONFIRMED', 'Order placed via Cash on Delivery (COD). Promo EID2026 applied (-PKR 1500)', '2026-07-30T08:00:00Z');

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0013_demo_clothing_store_seed');
