import { describe, it, expect, vi } from 'vitest';
import { searchProducts } from '../../src/features/search/db/searchRepository';
import type { Env } from '../../src/core/db';
import type { D1Database, KVNamespace, R2Bucket } from '@cloudflare/workers-types';

describe('D1 FTS5 Search Repository & Filter Integration', () => {
  it('executes FTS5 MATCH query with sanitized keywords and returns paginated products', async () => {
    const mockFirst = vi.fn().mockResolvedValue({ total: 2 });
    const mockProducts = [
      {
        id: 'prod_lawn_01',
        name: 'Gul-e-Bahar Lawn 3-Piece',
        slug: 'gul-e-bahar',
        description: 'Lawn suit',
        base_price_pkr: 6500,
        category_id: 'cat_1',
        category_name: '3-Piece Lawn',
        is_active: 1,
        seo_title: null,
        seo_description: null,
        created_at: '2026-07-01T00:00:00Z',
        updated_at: '2026-07-01T00:00:00Z',
      },
    ];

    const mockAll = vi.fn().mockResolvedValue({ success: true, results: mockProducts });
    const mockPrepare = vi.fn().mockImplementation((_sql: string) => ({
      bind: () => ({
        first: mockFirst,
        all: mockAll,
      }),
    }));

    const mockEnv: Env = {
      DB: { prepare: mockPrepare } as unknown as D1Database,
      KV: {} as unknown as KVNamespace,
      BUCKET: {} as unknown as R2Bucket,
      ENVIRONMENT: 'development',
    };

    const result = await searchProducts(mockEnv, {
      q: 'lawn suit',
      category: '3-piece-lawn',
      minPrice: 3000,
      maxPrice: 10000,
      sort: 'price_asc',
      page: 1,
      limit: 12,
    });

    expect(result.products).toHaveLength(1);
    expect(result.products[0]?.name).toBe('Gul-e-Bahar Lawn 3-Piece');
    expect(result.meta.total).toBe(2);
    expect(result.meta.totalPages).toBe(1);
    expect(mockPrepare).toHaveBeenCalledTimes(2); // One COUNT query, one SELECT query
  });
});
