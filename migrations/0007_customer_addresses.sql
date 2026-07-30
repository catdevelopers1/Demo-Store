-- Migration 0007: Customer Account Profile & Pakistani Address Book Schema
CREATE TABLE IF NOT EXISTS customer_profiles (
  user_id TEXT PRIMARY KEY,
  default_address_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS customer_addresses (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  phone TEXT NOT NULL, -- Pakistani format 03XX... or +92...
  city TEXT NOT NULL,  -- Lahore, Karachi, Islamabad, Faisalabad, etc.
  province_state TEXT NOT NULL, -- Punjab, Sindh, KPK, Balochistan, ICT, AJK, GB
  street_address TEXT NOT NULL,
  postal_code TEXT,
  is_default INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_addresses_customer ON customer_addresses(customer_id, is_default);
CREATE INDEX IF NOT EXISTS idx_addresses_city ON customer_addresses(city, province_state);

-- Seed Initial Test Customer Profile & Lahore Default Shipping Address
INSERT OR IGNORE INTO users (id, email, phone, password_hash, role, is_active) VALUES
  ('usr_demo_customer', 'ahmed@lahore.pk', '0300-1234567', 'pbkdf2:sha256:100000:00:00', 'CUSTOMER', 1);

INSERT OR IGNORE INTO customer_profiles (user_id, default_address_id) VALUES
  ('usr_demo_customer', 'addr_lahore_01');

INSERT OR IGNORE INTO customer_addresses (id, customer_id, recipient_name, phone, city, province_state, street_address, postal_code, is_default) VALUES
  ('addr_lahore_01', 'usr_demo_customer', 'Ahmed Khan', '0300-1234567', 'Lahore', 'Punjab', 'House 12, Street 4, Gulberg III', '54660', 1);

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0007_customer_addresses');
