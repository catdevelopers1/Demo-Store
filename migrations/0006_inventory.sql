-- Migration 0006: Inventory & Stock Ledger Tracking Schema
CREATE TABLE IF NOT EXISTS inventory_items (
  variant_id TEXT PRIMARY KEY,
  quantity_available INTEGER DEFAULT 0 CHECK (quantity_available >= 0),
  quantity_reserved INTEGER DEFAULT 0 CHECK (quantity_reserved >= 0),
  low_stock_threshold INTEGER DEFAULT 5,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inventory_logs (
  id TEXT PRIMARY KEY,
  variant_id TEXT NOT NULL,
  change_qty INTEGER NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('SALE', 'RETURN', 'RESTOCK', 'ADJUSTMENT', 'CANCELLATION')),
  reference_id TEXT,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_inv_logs_variant ON inventory_logs(variant_id);
CREATE INDEX IF NOT EXISTS idx_inv_items_low ON inventory_items(quantity_available, low_stock_threshold);

-- Seed Initial Pakistani Clothing SKU Stock Ledger
INSERT OR IGNORE INTO inventory_items (variant_id, quantity_available, quantity_reserved, low_stock_threshold) VALUES
  ('var_lwn_01_grn', 25, 0, 5),
  ('var_lwn_01_blu', 3, 0, 5),
  ('var_khd_01_s', 15, 0, 5),
  ('var_khd_01_m', 0, 0, 5),
  ('var_khd_01_l', 10, 0, 5);

INSERT OR IGNORE INTO inventory_logs (id, variant_id, change_qty, reason, reference_id, comment) VALUES
  ('log_init_1', 'var_lwn_01_grn', 25, 'RESTOCK', 'sys_seed', 'Initial inventory seed for Gul-e-Bahar Emerald Green'),
  ('log_init_2', 'var_lwn_01_blu', 3, 'RESTOCK', 'sys_seed', 'Initial inventory seed for Gul-e-Bahar Royal Blue'),
  ('log_init_3', 'var_khd_01_s', 15, 'RESTOCK', 'sys_seed', 'Initial inventory seed for Kashmiri Khaddar Small'),
  ('log_init_4', 'var_khd_01_l', 10, 'RESTOCK', 'sys_seed', 'Initial inventory seed for Kashmiri Khaddar Large');

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0006_inventory');
