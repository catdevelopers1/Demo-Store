import { describe, it, expect, vi } from 'vitest';
import { getStoreSettings, updateStoreSettings } from '../../src/features/settings/db/settingsRepository';
import { DEFAULT_STORE_SETTINGS } from '../../src/features/settings/types';
import type { Env } from '../../src/core/db';
import type { D1Database, KVNamespace, R2Bucket } from '@cloudflare/workers-types';

describe('Store Settings Repository Integration', () => {
  it('reads cached settings from KV cache first without querying D1', async () => {
    const cachedSettings = {
      ...DEFAULT_STORE_SETTINGS,
      brandName: 'GUL AHMED COD',
      codShippingBasePkr: 300,
    };

    const mockGet = vi.fn().mockResolvedValue(JSON.stringify(cachedSettings));
    const mockPrepare = vi.fn();

    const mockEnv: Env = {
      DB: { prepare: mockPrepare } as unknown as D1Database,
      KV: { get: mockGet } as unknown as KVNamespace,
      BUCKET: {} as unknown as R2Bucket,
      ENVIRONMENT: 'development',
    };

    const settings = await getStoreSettings(mockEnv);
    expect(settings.brandName).toBe('GUL AHMED COD');
    expect(settings.codShippingBasePkr).toBe(300);
    expect(mockGet).toHaveBeenCalledWith('store_settings_cache', 'text');
    expect(mockPrepare).not.toHaveBeenCalled();
  });

  it('queries D1 database when KV cache is empty and populates cache', async () => {
    const mockGet = vi.fn().mockResolvedValue(null);
    const mockPut = vi.fn().mockResolvedValue(undefined);

    const mockResults = [
      { key: 'brand_name', value: 'KHAADI STYLE' },
      { key: 'cod_shipping_base_pkr', value: '200' },
      { key: 'free_shipping_threshold_pkr', value: '6000' },
    ];

    const mockPrepare = vi.fn().mockReturnValue({
      bind: () => ({
        all: vi.fn().mockResolvedValue({ success: true, results: mockResults }),
      }),
    });

    const mockEnv: Env = {
      DB: { prepare: mockPrepare } as unknown as D1Database,
      KV: { get: mockGet, put: mockPut } as unknown as KVNamespace,
      BUCKET: {} as unknown as R2Bucket,
      ENVIRONMENT: 'development',
    };

    const settings = await getStoreSettings(mockEnv);
    expect(settings.brandName).toBe('KHAADI STYLE');
    expect(settings.codShippingBasePkr).toBe(200);
    expect(settings.freeShippingThresholdPkr).toBe(6000);
    expect(mockPut).toHaveBeenCalledTimes(1);
  });

  it('atomically updates store settings in D1 batch transaction and refreshes KV cache', async () => {
    const mockBatch = vi.fn().mockResolvedValue([]);
    const mockPut = vi.fn().mockResolvedValue(undefined);
    const mockPrepare = vi.fn().mockImplementation((_sql: string) => ({
      bind: () => ({}),
    }));

    const mockEnv: Env = {
      DB: { prepare: mockPrepare, batch: mockBatch } as unknown as D1Database,
      KV: { put: mockPut } as unknown as KVNamespace,
      BUCKET: {} as unknown as R2Bucket,
      ENVIRONMENT: 'development',
    };

    const updated = await updateStoreSettings(mockEnv, {
      ...DEFAULT_STORE_SETTINGS,
      brandName: 'SAPPHIRE COD',
      codShippingBasePkr: 250,
    });

    expect(mockPrepare).toHaveBeenCalledTimes(10);
    expect(mockBatch).toHaveBeenCalledTimes(1);
    expect(mockPut).toHaveBeenCalledTimes(1);
    expect(updated.brandName).toBe('SAPPHIRE COD');
  });
});
