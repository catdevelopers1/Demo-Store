-- Migration 0009: Promotional Coupons and Discount Engine Schema
CREATE TABLE IF NOT EXISTS discounts (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('PERCENTAGE', 'FIXED_PKR')),
  value INTEGER NOT NULL CHECK (value > 0),
  min_order_pkr INTEGER DEFAULT 0 CHECK (min_order_pkr >= 0),
  max_discount_pkr INTEGER CHECK (max_discount_pkr > 0),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  usage_limit INTEGER CHECK (usage_limit > 0),
  used_count INTEGER DEFAULT 0 CHECK (used_count >= 0),
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_discounts_code ON discounts(code, is_active);

-- Seed Initial Pakistani Clothing Promotional Coupons
INSERT OR IGNORE INTO discounts (id, code, type, value, min_order_pkr, max_discount_pkr, start_time, end_time, usage_limit, used_count, is_active) VALUES
  ('disc_azadi_14', 'AZADI14', 'PERCENTAGE', 15, 5000, 2000, '2026-07-01T00:00:00Z', '2026-12-31T23:59:59Z', 500, 0, 1),
  ('disc_lawn_500', 'LAWNSALE500', 'FIXED_PKR', 500, 3000, 500, '2026-07-01T00:00:00Z', '2026-12-31T23:59:59Z', 100, 0, 1),
  ('disc_exp_10', 'EXPIRED10', 'PERCENTAGE', 10, 0, 500, '2025-01-01T00:00:00Z', '2025-12-31T23:59:59Z', 50, 0, 1);

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0009_discounts');
