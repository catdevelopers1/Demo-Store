-- Migration 0016: Khaadi Official Pakistan Taxonomy & Collection Purge
-- Wipes outdated synthetic collections and establishes authentic Khaadi root collections.

-- 1. Insert official Khaadi Pakistan collections
INSERT OR REPLACE INTO categories (id, parent_id, name, slug, description, sort_order, is_active) VALUES
  ('cat_new_in', NULL, 'NEW IN', 'new-in', 'Latest Summer Lawn 2026 and Ready to Wear Arrivals', 1, 1),
  ('cat_unstitched', NULL, 'UNSTITCHED', 'unstitched', 'Unstitched 3-Piece, 2-Piece, and Printed Lawn Suits', 2, 1),
  ('cat_ready', NULL, 'READY TO WEAR', 'ready-to-wear', 'Stitched Velvet, Silk, and Embroidered Kurtas', 3, 1),
  ('cat_western', NULL, 'WESTERN', 'western', 'Modern Fusion and Contemporary Western Wear', 4, 1),
  ('cat_fabrics', NULL, 'FABRICS', 'fabrics', 'Unstitched Single Shirts and Embroidered Dupattas', 5, 1),
  ('cat_sale', NULL, 'SALE', 'sale', 'Exclusively Online 30% to 50% OFF Sale Collection', 6, 1);

-- 2. Realign existing products in D1 to official Khaadi root collections
UPDATE products SET category_id = 'cat_unstitched'
WHERE category_id IN ('cat_lawn', 'cat_lawn_3p', 'cat_lawn_2p') OR name LIKE '%Lawn%' OR name LIKE '%3-Piece%';

UPDATE products SET category_id = 'cat_ready'
WHERE category_id IN ('cat_ready', 'cat_kurtas') OR name LIKE '%Kurta%' OR name LIKE '%Pret%' OR name LIKE '%Stitched%';

UPDATE products SET category_id = 'cat_fabrics'
WHERE category_id IN ('cat_khaddar', 'cat_daily') OR name LIKE '%Khaddar%' OR name LIKE '%Cambric%' OR name LIKE '%Karandi%';

UPDATE products SET category_id = 'cat_sale'
WHERE category_id IN ('cat_festive', 'cat_chiffon') OR name LIKE '%Chiffon%' OR name LIKE '%Velvet%';

-- Standardize remaining unassigned products
UPDATE products SET category_id = 'cat_new_in' WHERE category_id IS NULL OR category_id NOT IN ('cat_new_in', 'cat_unstitched', 'cat_ready', 'cat_western', 'cat_fabrics', 'cat_sale');

-- 3. Delete old synthetic category records
DELETE FROM categories WHERE id NOT IN ('cat_new_in', 'cat_unstitched', 'cat_ready', 'cat_western', 'cat_fabrics', 'cat_sale');

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0016_khaadi_official_taxonomy_purge');
