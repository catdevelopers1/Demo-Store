-- Migration 0003: Hierarchical Categories and Collection Taxonomy Schema
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
CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(sort_order, name);

-- Seed Initial Pakistani Clothing Brand Taxonomy
INSERT OR IGNORE INTO categories (id, parent_id, name, slug, description, sort_order, is_active) VALUES
  ('cat_lawn', NULL, 'Unstitched Lawn', 'unstitched-lawn', 'Premium Unstitched 3-Piece and 2-Piece Lawn Suits for Summer', 10, 1),
  ('cat_lawn_3p', 'cat_lawn', '3-Piece Lawn Suits', '3-piece-lawn', 'Complete embroidered shirt, dupatta, and trouser lawn fabrics', 1, 1),
  ('cat_lawn_2p', 'cat_lawn', '2-Piece Lawn Suits', '2-piece-lawn', 'Printed and dyed 2-Piece lawn combinations', 2, 1),
  ('cat_khaddar', NULL, 'Winter Khaddar & Cambric', 'winter-khaddar', 'Warm winter fabrics, khaddar, and cambric collections', 20, 1),
  ('cat_ready', NULL, 'Ready to Wear', 'ready-to-wear', 'Stitched kurtas and suits ready for instant wear', 30, 1);

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0003_categories');
