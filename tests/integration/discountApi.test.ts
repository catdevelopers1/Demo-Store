import { describe, it, expect, vi } from 'vitest';
import {
  getDiscountByCode,
  incrementDiscountUsage,
} from '../../src/features/discounts/db/discountRepository';
import type { Env } from '../../src/core/db';
import type { D1Database, KVNamespace, R2Bucket } from '@cloudflare/workers-types';

describe('Promotional Discount Repository & Atomic Usage Integration', () => {
  it('retrieves an active promo code by case-insensitive code matching', async () => {
    const mockRow = {
      id: 'disc_azadi',
      code: 'AZADI14',
      type: 'PERCENTAGE',
      value: 15,
      min_order_pkr: 5000,
      max_discount_pkr: 2000,
      start_time: '2026-07-01T00:00:00Z',
      end_time: '2026-12-31T23:59:59Z',
      usage_limit: 500,
      used_count: 0,
      is_active: 1,
      created_at: new Date().toISOString(),
    };

    const mockFirst = vi.fn().mockResolvedValue(mockRow);
    const mockPrepare = vi.fn().mockImplementation(() => ({
      bind: () => ({ first: mockFirst }),
    }));

    const mockEnv: Env = {
      DB: { prepare: mockPrepare } as unknown as D1Database,
      KV: {} as unknown as KVNamespace,
      BUCKET: {} as unknown as R2Bucket,
      ENVIRONMENT: 'development',
    };

    const discount = await getDiscountByCode(mockEnv, 'azadi14');
    expect(discount).not.toBeNull();
    expect(discount?.code).toBe('AZADI14');
    expect(discount?.value).toBe(15);
  });

  it('atomically increments used_count when an order is finalized', async () => {
    const mockAll = vi.fn().mockResolvedValue({ success: true, meta: { changes: 1 }, results: [] });
    const mockPrepare = vi.fn().mockImplementation(() => ({
      bind: () => ({ all: mockAll }),
    }));

    const mockEnv: Env = {
      DB: { prepare: mockPrepare } as unknown as D1Database,
      KV: {} as unknown as KVNamespace,
      BUCKET: {} as unknown as R2Bucket,
      ENVIRONMENT: 'development',
    };

    const ok = await incrementDiscountUsage(mockEnv, 'AZADI14');
    expect(ok).toBe(true);
    expect(mockPrepare).toHaveBeenCalledWith(
      'UPDATE discounts SET used_count = used_count + 1 WHERE LOWER(code) = LOWER(?) AND is_active = 1 AND (usage_limit IS NULL OR used_count < usage_limit)'
    );
  });
});
