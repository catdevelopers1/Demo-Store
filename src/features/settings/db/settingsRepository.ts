import { getDb, getKv, type Env } from '../../../core';
import { type StoreSettings, DEFAULT_STORE_SETTINGS } from '../types';
import { defaultLogger } from '../../../core/api/logger';

const KV_SETTINGS_CACHE_KEY = 'store_settings_cache';
const CACHE_TTL_SECONDS = 3600; // 1 hour edge cache

export interface SettingRow {
  key: string;
  value: string;
}

/**
 * Reads store settings from KV cache or D1 database with automatic fallback
 */
export async function getStoreSettings(env: Env): Promise<StoreSettings> {
  // 1. Try low-latency edge cache first
  try {
    if (env.KV) {
      const kv = getKv(env);
      const cached = await kv.getJson<StoreSettings>(KV_SETTINGS_CACHE_KEY);
      if (cached) {
        return cached;
      }
    }
  } catch (err) {
    defaultLogger.warn('KV cache lookup failed for store settings, falling back to D1', {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  // 2. Query authoritative D1 database
  try {
    const db = getDb(env);
    const rows = await db.query<SettingRow>('SELECT key, value FROM store_settings');
    const map = new Map<string, string>();
    for (const row of rows.results) {
      map.set(row.key, row.value);
    }

    const settings: StoreSettings = {
      brandName: map.get('brand_name') ?? DEFAULT_STORE_SETTINGS.brandName,
      brandTagline: map.get('brand_tagline') ?? DEFAULT_STORE_SETTINGS.brandTagline,
      supportPhonePk: map.get('support_phone_pk') ?? DEFAULT_STORE_SETTINGS.supportPhonePk,
      whatsappPk: map.get('whatsapp_pk') ?? DEFAULT_STORE_SETTINGS.whatsappPk,
      primaryColorHex: map.get('primary_color_hex') ?? DEFAULT_STORE_SETTINGS.primaryColorHex,
      secondaryColorHex:
        map.get('secondary_color_hex') ?? DEFAULT_STORE_SETTINGS.secondaryColorHex,
      codShippingBasePkr: Number(map.get('cod_shipping_base_pkr')) || DEFAULT_STORE_SETTINGS.codShippingBasePkr,
      freeShippingThresholdPkr:
        Number(map.get('free_shipping_threshold_pkr')) ||
        DEFAULT_STORE_SETTINGS.freeShippingThresholdPkr,
      seoTitle: map.get('seo_title') ?? DEFAULT_STORE_SETTINGS.seoTitle,
      seoDescription: map.get('seo_description') ?? DEFAULT_STORE_SETTINGS.seoDescription,
      updatedAt: new Date().toISOString(),
    };

    // 3. Populate edge KV cache
    try {
      if (env.KV) {
        const kv = getKv(env);
        await kv.putJson(KV_SETTINGS_CACHE_KEY, settings, {
          expirationTtl: CACHE_TTL_SECONDS,
        });
      }
    } catch (err) {
      defaultLogger.warn('Failed to populate KV cache for store settings', {
        error: err instanceof Error ? err.message : String(err),
      });
    }

    return settings;
  } catch (err) {
    defaultLogger.error('D1 query failed for store settings, returning default fallback', {
      error: err instanceof Error ? err.message : String(err),
    });
    return DEFAULT_STORE_SETTINGS;
  }
}

/**
 * Atomically updates store configuration in D1 and invalidates/refreshes KV cache
 */
export async function updateStoreSettings(
  env: Env,
  updates: StoreSettings
): Promise<StoreSettings> {
  const db = getDb(env);

  const entries = [
    { key: 'brand_name', value: updates.brandName, description: 'Main Brand Title' },
    { key: 'brand_tagline', value: updates.brandTagline, description: 'Subheading and SEO tagline' },
    { key: 'support_phone_pk', value: updates.supportPhonePk, description: 'Primary Pakistani customer support number' },
    { key: 'whatsapp_pk', value: updates.whatsappPk, description: 'WhatsApp support number' },
    { key: 'primary_color_hex', value: updates.primaryColorHex, description: 'Primary brand color hex' },
    { key: 'secondary_color_hex', value: updates.secondaryColorHex, description: 'Secondary brand color hex' },
    { key: 'cod_shipping_base_pkr', value: String(updates.codShippingBasePkr), description: 'COD shipping charge PKR' },
    { key: 'free_shipping_threshold_pkr', value: String(updates.freeShippingThresholdPkr), description: 'Free COD shipping threshold PKR' },
    { key: 'seo_title', value: updates.seoTitle, description: 'Default storefront SEO Title' },
    { key: 'seo_description', value: updates.seoDescription, description: 'Default storefront SEO Description' },
  ];

  const queries = entries.map((entry) => ({
    sql: 'INSERT OR REPLACE INTO store_settings (key, value, description, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
    params: [entry.key, entry.value, entry.description],
  }));

  // 1. Execute atomic D1 batch transaction
  await db.batch(queries);

  const updatedSettings: StoreSettings = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  // 2. Refresh / invalidate KV cache
  try {
    if (env.KV) {
      const kv = getKv(env);
      await kv.putJson(KV_SETTINGS_CACHE_KEY, updatedSettings, {
        expirationTtl: CACHE_TTL_SECONDS,
      });
    }
  } catch (err) {
    defaultLogger.warn('Failed to refresh KV cache after settings update', {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  return updatedSettings;
}
