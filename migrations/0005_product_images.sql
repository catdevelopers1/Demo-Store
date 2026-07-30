-- Migration 0005: Cloudflare R2 Product and Variant Image Lookbook Schema
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
CREATE INDEX IF NOT EXISTS idx_images_sort ON product_images(product_id, is_primary, sort_order);

-- Seed Initial Pakistani Clothing Lookbook Image References
INSERT OR IGNORE INTO product_images (id, product_id, r2_key, url, alt_text, sort_order, is_primary) VALUES
  ('img_lwn_01', 'prod_lawn_01', 'products/prod_lawn_01/gul-e-bahar-1.webp', 'https://images.pakistaniclothing.pk/products/prod_lawn_01/gul-e-bahar-1.webp', 'Gul-e-Bahar Unstitched Lawn 3-Piece Front Embroidered Lookbook', 1, 1),
  ('img_lwn_02', 'prod_lawn_01', 'products/prod_lawn_01/gul-e-bahar-2.webp', 'https://images.pakistaniclothing.pk/products/prod_lawn_01/gul-e-bahar-2.webp', 'Gul-e-Bahar Unstitched Lawn Pure Silk Dupatta Detail', 2, 0),
  ('img_khd_01', 'prod_khaddar_01', 'products/prod_khaddar_01/kashmiri-khaddar-1.webp', 'https://images.pakistaniclothing.pk/products/prod_khaddar_01/kashmiri-khaddar-1.webp', 'Kashmiri Khaddar Winter Embroidered Suit Maroon Front', 1, 1);

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0005_product_images');
