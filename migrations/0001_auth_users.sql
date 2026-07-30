-- Migration 0001: Authentication Identity and Role Schema
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- e.g., usr_01h...
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE,   -- Normalized PK format: +923XXXXXXXXX
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'CUSTOMER')),
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0001_auth_users');
