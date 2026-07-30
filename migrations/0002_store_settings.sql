-- Migration 0002: Store Configuration and Brand Customization Schema
CREATE TABLE IF NOT EXISTS store_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Default Pakistani Clothing Brand Configuration
INSERT OR IGNORE INTO store_settings (key, value, description) VALUES
  ('brand_name', 'PAKISTANI CLOTHING', 'Main Brand Title displayed in storefront navigation'),
  ('brand_tagline', 'Next-Generation Pakistani Apparel Commerce', 'Subheading and SEO tagline'),
  ('support_phone_pk', '0300-1234567', 'Primary Pakistani customer support number'),
  ('whatsapp_pk', '0300-1234567', 'WhatsApp support number for order inquiries'),
  ('primary_color_hex', '#065f46', 'Primary brand color hex (default Emerald 800)'),
  ('secondary_color_hex', '#047857', 'Secondary brand color hex (default Emerald 700)'),
  ('cod_shipping_base_pkr', '250', 'Standard Cash on Delivery (COD) shipping charge across Pakistan in PKR'),
  ('free_shipping_threshold_pkr', '5000', 'Order total PKR threshold above which COD shipping is free'),
  ('seo_title', 'Pakistani Clothing Commerce Framework — Edge-First COD Foundation', 'Default storefront SEO Title'),
  ('seo_description', 'Production-ready, Cloudflare-native e-commerce framework optimized for Pakistani clothing brands and Cash on Delivery (COD).', 'Default storefront SEO Description');

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0002_store_settings');
