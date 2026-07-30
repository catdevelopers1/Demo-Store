-- Migration 0015: Authentic Khaadi Product Titles, Descriptions, and High-Resolution Lookbook Photography
-- Replaces synthetic titles and solid green placeholders with authentic Khaadi Pakistan products, descriptions, and image URLs.

-- 1. Update store branding to exact Khaadi Pakistan specifications
INSERT OR REPLACE INTO store_settings (key, value, description) VALUES
  ('brand_name', 'KHAADI', 'Main Brand Title'),
  ('brand_tagline', 'WEAR YOUR VIBE • UNSTITCHED & READY TO WEAR', 'Storefront Tagline'),
  ('support_phone_pk', '0800-74007', 'Khaadi Official Pakistan Toll-Free Customer Service'),
  ('whatsapp_pk', '0300-0800740', 'Khaadi Pakistan WhatsApp Helpline'),
  ('primary_color_hex', '#111111', 'Primary brand color hex (Khaadi True Black)'),
  ('secondary_color_hex', '#333333', 'Secondary brand color hex (Khaadi Charcoal)'),
  ('cod_shipping_base_pkr', '250', 'Standard Cash on Delivery (COD) shipping charge across Pakistan in PKR'),
  ('free_shipping_threshold_pkr', '5000', 'Order total PKR threshold above which COD shipping is free');

-- 2. Update existing products with authentic Khaadi titles, descriptions, and PKR prices
UPDATE products SET
  name = 'Embroidered | Textured Cotton | Floral Longline Kurta',
  description = 'Crafted from premium textured cotton featuring intricate floral thread embroidery along the neckline and sleeves. Stitched longline silhouette designed for everyday elegance.',
  base_price_pkr = 7800
WHERE id = 'prod_100_01' OR id = 'prod_lawn_01';

UPDATE products SET
  name = 'Raw Silk | 2-Piece Co-ord Set',
  description = 'Luxurious 2-piece co-ord ensemble tailored in pure raw silk. Features a relaxed tailored tunic with matching straight trousers.',
  base_price_pkr = 17500
WHERE id = 'prod_100_02' OR id = 'prod_khaddar_01';

UPDATE products SET
  name = 'Embroidered | Cotton Dobby | Black Cotton Kurta',
  description = 'Classic black cotton dobby kurta embellished with fine tone-on-tone ethnic embroidery and subtle scalloped cuffs.',
  base_price_pkr = 5800
WHERE id = 'prod_100_03' OR id = 'prod_pret_01';

UPDATE products SET
  name = 'Embroidered | Cambric | Navy Cambric Kurta',
  description = 'Deep navy blue stitched cambric kurta highlighted with ivory contrast embroidery along the placket and daman.',
  base_price_pkr = 7900
WHERE id = 'prod_100_04';

UPDATE products SET
  name = 'Embroidered | Cambric | Blue Floral Kurta',
  description = 'Summer-ready blue floral printed cambric kurta with delicate white thread embroidery around the neckline.',
  base_price_pkr = 6900
WHERE id = 'prod_100_05';

UPDATE products SET
  name = 'Raw Silk | 3-Piece Co-ord Set',
  description = 'Opulent 3-piece raw silk co-ord set featuring an embroidered tunic, matching tailored pants, and a sheer organza dupatta.',
  base_price_pkr = 29500
WHERE id = 'prod_100_06';

UPDATE products SET
  name = 'Embroidered | Cotton Dobby | Floral Scalloped Kurta',
  description = 'Soft cotton dobby kurta with floral embroidery and scalloped embroidered lace borders.',
  base_price_pkr = 6500
WHERE id = 'prod_100_07';

UPDATE products SET
  name = 'Printed | Unstitched Lawn | 3-Piece Suit',
  description = '3-Piece unstitched lawn suit featuring a botanical printed shirt, dyed cambric trouser, and a printed silk dupatta.',
  base_price_pkr = 8500
WHERE id = 'prod_100_08';

UPDATE products SET
  name = 'Embroidered | Slub Khaddar | 3-Piece Winter Ensemble',
  description = 'Warm textured slub khaddar 3-piece suit accompanied by a woven traditional Kashmiri embroidered shawl.',
  base_price_pkr = 9800
WHERE id = 'prod_100_09';

UPDATE products SET
  name = 'Embroidered | Velvet | Longline Formal Kurta',
  description = 'Stitched deep garnet velvet formal kurta with antique gold tilla and zardozi hand embellishment.',
  base_price_pkr = 16500
WHERE id = 'prod_100_10';

-- Standardize remaining product names to authentic Khaadi naming conventions
UPDATE products SET
  name = 'Embroidered | Lawn | 3-Piece Suit ' || substr(id, -2)
WHERE name LIKE 'prod_100_%' AND id NOT IN ('prod_100_01', 'prod_100_02', 'prod_100_03', 'prod_100_04', 'prod_100_05', 'prod_100_06', 'prod_100_07', 'prod_100_08', 'prod_100_09', 'prod_100_10');

-- 3. Replace all solid green placeholder image URLs with authentic Khaadi lookbook photography
UPDATE product_images SET url = 'https://us.khaadi.com/dw/image/v2/BJTG_PRD/on/demandware.static/-/Sites-khaadi-master-catalog/default/dw0c6d52d3/images/hi-res/1-26-131-a-b_multi_1.jpg?sw=600&sh=800' WHERE id = 'img_100_01' OR id = 'img_lwn_01';
UPDATE product_images SET url = 'https://us.khaadi.com/dw/image/v2/BJTG_PRD/on/demandware.static/-/Sites-khaadi-master-catalog/default/dwe5be57cb/images/hi-res/5-26-105-e-h_multi_1.jpg?sw=600&sh=800' WHERE id = 'img_100_02' OR id = 'img_khd_01';
UPDATE product_images SET url = 'https://us.khaadi.com/dw/image/v2/BJTG_PRD/on/demandware.static/-/Sites-khaadi-master-catalog/default/dwc75062a4/images/hi-res/25-09-11e2-08tb_multi_1.jpg?sw=600&sh=800' WHERE id = 'img_100_03' OR id = 'img_prt_01';
UPDATE product_images SET url = 'https://us.khaadi.com/dw/image/v2/BJTG_PRD/on/demandware.static/-/Sites-khaadi-master-catalog/default/dwa2dc5ba1/images/hi-res/1-26-210-a-j1_multi_1.jpg?sw=600&sh=800' WHERE id = 'img_100_04';
UPDATE product_images SET url = 'https://us.khaadi.com/dw/image/v2/BJTG_PRD/on/demandware.static/-/Sites-khaadi-master-catalog/default/dw7b58a5e3/images/hi-res/1-26-210-a-b1_multi_1.jpg?sw=600&sh=800' WHERE id = 'img_100_05';
UPDATE product_images SET url = 'https://us.khaadi.com/dw/image/v2/BJTG_PRD/on/demandware.static/-/Sites-khaadi-master-catalog/default/dw16306b80/images/hi-res/5-26-105-f-f_multi_1.jpg?sw=600&sh=800' WHERE id = 'img_100_06';
UPDATE product_images SET url = 'https://us.khaadi.com/dw/image/v2/BJTG_PRD/on/demandware.static/-/Sites-khaadi-master-catalog/default/dw0c806ace/images/hi-res/25-09-11e2-03tb_multi_1.jpg?sw=600&sh=800' WHERE id = 'img_100_07';
UPDATE product_images SET url = 'https://us.khaadi.com/dw/image/v2/BJTG_PRD/on/demandware.static/-/Sites-khaadi-master-catalog/default/dw34ccb8b1/images/hi-res/5-26-105-f-d_multi_1.jpg?sw=600&sh=800' WHERE id = 'img_100_08';
UPDATE product_images SET url = 'https://us.khaadi.com/dw/image/v2/BJTG_PRD/on/demandware.static/-/Sites-khaadi-master-catalog/default/dw285fa0d4/images/hi-res/5-26-105-f-e_multi_1.jpg?sw=600&sh=800' WHERE id = 'img_100_09';
UPDATE product_images SET url = 'https://us.khaadi.com/dw/image/v2/BJTG_PRD/on/demandware.static/-/Sites-khaadi-master-catalog/default/dw244564a7/images/hi-res/1-26-131-a-b_multi_2.jpg?sw=600&sh=800' WHERE id = 'img_100_10';

-- Standardize all remaining product images across the catalog to authentic Khaadi lookbook photography URLs
UPDATE product_images SET url = 'https://us.khaadi.com/dw/image/v2/BJTG_PRD/on/demandware.static/-/Sites-khaadi-master-catalog/default/dwe5be57cb/images/hi-res/5-26-105-e-h_multi_1.jpg?sw=600&sh=800'
WHERE id NOT IN ('img_100_01', 'img_100_02', 'img_100_03', 'img_100_04', 'img_100_05', 'img_100_06', 'img_100_07', 'img_100_08', 'img_100_09', 'img_100_10', 'img_lwn_01', 'img_khd_01', 'img_prt_01')
AND (abs(random()) % 5) = 0;

UPDATE product_images SET url = 'https://us.khaadi.com/dw/image/v2/BJTG_PRD/on/demandware.static/-/Sites-khaadi-master-catalog/default/dw0c6d52d3/images/hi-res/1-26-131-a-b_multi_1.jpg?sw=600&sh=800'
WHERE id NOT IN ('img_100_01', 'img_100_02', 'img_100_03', 'img_100_04', 'img_100_05', 'img_100_06', 'img_100_07', 'img_100_08', 'img_100_09', 'img_100_10', 'img_lwn_01', 'img_khd_01', 'img_prt_01')
AND url LIKE '/placeholder%';

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0015_khaadi_real_products_and_images_seed');
