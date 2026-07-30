-- Migration 0008: Cloudflare D1 FTS5 Full-Text Search Virtual Table and Triggers
CREATE VIRTUAL TABLE IF NOT EXISTS products_fts USING fts5(
  product_id UNINDEXED,
  name,
  description,
  category_name,
  tokenize='porter unicode61'
);

-- SQLite Triggers to keep products_fts synchronized with products table
CREATE TRIGGER IF NOT EXISTS trg_products_ai AFTER INSERT ON products BEGIN
  INSERT INTO products_fts (product_id, name, description, category_name)
  SELECT new.id, new.name, coalesce(new.description, ''), coalesce(c.name, '')
  FROM categories c WHERE c.id = new.category_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_products_au AFTER UPDATE ON products BEGIN
  DELETE FROM products_fts WHERE product_id = old.id;
  INSERT INTO products_fts (product_id, name, description, category_name)
  SELECT new.id, new.name, coalesce(new.description, ''), coalesce(c.name, '')
  FROM categories c WHERE c.id = new.category_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_products_ad AFTER DELETE ON products BEGIN
  DELETE FROM products_fts WHERE product_id = old.id;
END;

-- Seed initial FTS5 index from existing catalog products
INSERT INTO products_fts (product_id, name, description, category_name)
SELECT p.id, p.name, coalesce(p.description, ''), coalesce(c.name, '')
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_active = 1;

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0008_fts5_search');
