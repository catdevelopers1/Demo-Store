-- Migration 0004: Product Catalog and Variant SKU Matrix Schema
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  base_price_pkr INTEGER NOT NULL, -- Stored in whole PKR (e.g. 6500 = Rs 6,500)
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
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

CREATE TABLE IF NOT EXISTS product_options (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  name TEXT NOT NULL, -- "Size", "Color", "Fabric"
  sort_order INTEGER DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_options_product ON product_options(product_id);

CREATE TABLE IF NOT EXISTS product_option_values (
  id TEXT PRIMARY KEY,
  option_id TEXT NOT NULL,
  value TEXT NOT NULL, -- "Small", "Medium", "Emerald Green", "Lawn"
  sort_order INTEGER DEFAULT 0,
  FOREIGN KEY (option_id) REFERENCES product_options(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_values_option ON product_option_values(option_id);

CREATE TABLE IF NOT EXISTS product_variants (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL, -- e.g., "PK-LWN-GB-GRN"
  price_override_pkr INTEGER, -- NULL = fallback to product.base_price_pkr
  compare_at_price_pkr INTEGER,
  weight_grams INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_sku ON product_variants(sku);

CREATE TABLE IF NOT EXISTS product_variant_options (
  variant_id TEXT NOT NULL,
  option_value_id TEXT NOT NULL,
  PRIMARY KEY (variant_id, option_value_id),
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
  FOREIGN KEY (option_value_id) REFERENCES product_option_values(id) ON DELETE CASCADE
);

-- Seed Initial Pakistani Clothing Brand Catalog & Variant SKUs
INSERT OR IGNORE INTO products (id, name, slug, description, base_price_pkr, category_id, is_active) VALUES
  ('prod_lawn_01', 'Gul-e-Bahar Unstitched Lawn 3-Piece', 'gul-e-bahar-unstitched-lawn-3-piece', 'Luxury embroidered lawn suit with pure silk dupatta and cambric trousers. Ideal for Pakistani summer gatherings.', 6500, 'cat_lawn_3p', 1),
  ('prod_khaddar_01', 'Kashmiri Khaddar Winter Embroidered Suit', 'kashmiri-khaddar-winter-embroidered-suit', 'Warm winter khaddar suit featuring traditional Kashmiri embroidery patterns.', 8500, 'cat_khaddar', 1);

-- Product 1 Options: Color & Fabric
INSERT OR IGNORE INTO product_options (id, product_id, name, sort_order) VALUES
  ('opt_lwn_col', 'prod_lawn_01', 'Color', 1),
  ('opt_lwn_fab', 'prod_lawn_01', 'Fabric', 2);

INSERT OR IGNORE INTO product_option_values (id, option_id, value, sort_order) VALUES
  ('val_lwn_col_grn', 'opt_lwn_col', 'Emerald Green', 1),
  ('val_lwn_col_blu', 'opt_lwn_col', 'Royal Blue', 2),
  ('val_lwn_fab_lwn', 'opt_lwn_fab', 'Lawn 3-Piece', 1);

-- Product 1 Variants
INSERT OR IGNORE INTO product_variants (id, product_id, sku, price_override_pkr, is_active) VALUES
  ('var_lwn_01_grn', 'prod_lawn_01', 'PK-LWN-GB-GRN', NULL, 1),
  ('var_lwn_01_blu', 'prod_lawn_01', 'PK-LWN-GB-BLU', 6800, 1);

INSERT OR IGNORE INTO product_variant_options (variant_id, option_value_id) VALUES
  ('var_lwn_01_grn', 'val_lwn_col_grn'),
  ('var_lwn_01_grn', 'val_lwn_fab_lwn'),
  ('var_lwn_01_blu', 'val_lwn_col_blu'),
  ('var_lwn_01_blu', 'val_lwn_fab_lwn');

-- Product 2 Options: Size
INSERT OR IGNORE INTO product_options (id, product_id, name, sort_order) VALUES
  ('opt_khd_size', 'prod_khaddar_01', 'Size', 1);

INSERT OR IGNORE INTO product_option_values (id, option_id, value, sort_order) VALUES
  ('val_khd_size_s', 'opt_khd_size', 'Small', 1),
  ('val_khd_size_m', 'opt_khd_size', 'Medium', 2),
  ('val_khd_size_l', 'opt_khd_size', 'Large', 3);

-- Product 2 Variants
INSERT OR IGNORE INTO product_variants (id, product_id, sku, price_override_pkr, is_active) VALUES
  ('var_khd_01_s', 'prod_khaddar_01', 'PK-KHD-KSH-S', NULL, 1),
  ('var_khd_01_m', 'prod_khaddar_01', 'PK-KHD-KSH-M', NULL, 1),
  ('var_khd_01_l', 'prod_khaddar_01', 'PK-KHD-KSH-L', 8900, 1);

INSERT OR IGNORE INTO product_variant_options (variant_id, option_value_id) VALUES
  ('var_khd_01_s', 'val_khd_size_s'),
  ('var_khd_01_m', 'val_khd_size_m'),
  ('var_khd_01_l', 'val_khd_size_l');

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0004_products_variants');
