import { describe, it, expect, vi } from 'vitest';
import { validateCartItems } from '../../src/features/cart/db/cartRepository';
import type { Env } from '../../src/core/db';
import type { D1Database, KVNamespace, R2Bucket } from '@cloudflare/workers-types';

describe('Authoritative Server-Side Cart Validation Integration', () => {
  it('returns server-side PKR prices and clips quantity when requested exceeds available inventory', async () => {
    const mockRows = [
      {
        variant_id: 'var_lwn_01_blu',
        sku: 'PK-LWN-GB-BLU',
        product_id: 'prod_1',
        product_name: 'Gul-e-Bahar Lawn',
        base_price_pkr: 6500,
        price_override_pkr: 6800, // Authoritative price override
        quantity_available: 3,    // Only 3 available!
        image_url: 'https://images.pakistaniclothing.pk/test.webp',
      },
    ];

    const mockAll = vi.fn().mockResolvedValue({ success: true, results: mockRows });
    const mockPrepare = vi.fn().mockImplementation(() => ({
      bind: () => ({ all: mockAll }),
    }));

    const mockEnv: Env = {
      DB: { prepare: mockPrepare } as unknown as D1Database,
      KV: {} as unknown as KVNamespace,
      BUCKET: {} as unknown as R2Bucket,
      ENVIRONMENT: 'development',
    };

    const result = await validateCartItems(mockEnv, [
      { variantId: 'var_lwn_01_blu', quantity: 5 }, // Customer asks for 5!
    ]);

    expect(result.items).toHaveLength(1);
    const item = result.items[0]!;
    expect(item.unitPricePkr).toBe(6800); // Uses server-side database price override!
    expect(item.requestedQuantity).toBe(5);
    expect(item.verifiedQuantity).toBe(3);  // Automatically clipped to available stock!
    expect(item.lineTotalPkr).toBe(20400);  // 6800 * 3
    expect(result.warnings[0]).toContain('Only 3 units');
    expect(result.subtotalPkr).toBe(20400);
  });

  it('marks items as out of stock when quantity_available is 0', async () => {
    const mockRows = [
      {
        variant_id: 'var_khd_01_m',
        sku: 'PK-KHD-KSH-M',
        product_id: 'prod_2',
        product_name: 'Kashmiri Khaddar',
        base_price_pkr: 8500,
        price_override_pkr: null,
        quantity_available: 0,
        image_url: null,
      },
    ];

    const mockAll = vi.fn().mockResolvedValue({ success: true, results: mockRows });
    const mockPrepare = vi.fn().mockImplementation(() => ({
      bind: () => ({ all: mockAll }),
    }));

    const mockEnv: Env = {
      DB: { prepare: mockPrepare } as unknown as D1Database,
      KV: {} as unknown as KVNamespace,
      BUCKET: {} as unknown as R2Bucket,
      ENVIRONMENT: 'development',
    };

    const result = await validateCartItems(mockEnv, [
      { variantId: 'var_khd_01_m', quantity: 1 },
    ]);

    expect(result.items[0]?.verifiedQuantity).toBe(0);
    expect(result.items[0]?.isAvailable).toBe(false);
    expect(result.isValid).toBe(false);
    expect(result.warnings[0]).toContain('out of stock');
  });
});
