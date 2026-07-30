import { describe, it, expect, vi } from 'vitest';
import {
  createProductImageRecord,
  setPrimaryImage,
  deleteProductImageRecord,
} from '../../src/features/products/db/imageRepository';
import type { Env } from '../../src/core/db';
import type { D1Database, KVNamespace, R2Bucket } from '@cloudflare/workers-types';

describe('R2 Image Asset & Metadata Repository Integration', () => {
  it('creates an image record in D1 and returns formatted ProductImage', async () => {
    const mockRun = vi.fn().mockResolvedValue({ success: true });
    const mockPrepare = vi.fn().mockImplementation(() => ({
      bind: () => ({
        run: mockRun,
        all: vi.fn().mockResolvedValue({ success: true, results: [] }),
      }),
    }));

    const mockEnv: Env = {
      DB: { prepare: mockPrepare } as unknown as D1Database,
      KV: {} as unknown as KVNamespace,
      BUCKET: {} as unknown as R2Bucket,
      ENVIRONMENT: 'development',
    };

    const image = await createProductImageRecord(mockEnv, {
      id: 'img_test_1',
      productId: 'prod_lawn_01',
      r2Key: 'products/prod_lawn_01/test.webp',
      url: 'https://images.pakistaniclothing.pk/products/prod_lawn_01/test.webp',
      altText: 'Test lookbook',
      sortOrder: 1,
      isPrimary: true,
    });

    expect(image.id).toBe('img_test_1');
    expect(image.isPrimary).toBe(true);
    expect(mockPrepare).toHaveBeenCalledTimes(2); // One UPDATE to unset old primary, one INSERT
  });

  it('atomically sets an image as primary cover inside a D1 batch transaction', async () => {
    const mockBatch = vi.fn().mockResolvedValue([]);
    const mockFirst = vi.fn().mockResolvedValue({ id: 'img_2' });
    const mockAll = vi.fn().mockResolvedValue({
      success: true,
      results: [
        { id: 'img_2', product_id: 'prod_1', is_primary: 1, sort_order: 1 },
        { id: 'img_1', product_id: 'prod_1', is_primary: 0, sort_order: 2 },
      ],
    });

    const mockPrepare = vi.fn().mockImplementation(() => ({
      bind: () => ({
        first: mockFirst,
        all: mockAll,
      }),
    }));

    const mockEnv: Env = {
      DB: { prepare: mockPrepare, batch: mockBatch } as unknown as D1Database,
      KV: {} as unknown as KVNamespace,
      BUCKET: {} as unknown as R2Bucket,
      ENVIRONMENT: 'development',
    };

    const result = await setPrimaryImage(mockEnv, 'prod_1', 'img_2');
    expect('images' in result).toBe(true);
    if ('images' in result) {
      expect(result.images[0]?.id).toBe('img_2');
      expect(result.images[0]?.isPrimary).toBe(true);
    }
    expect(mockBatch).toHaveBeenCalledTimes(1);
    const batchArg = mockBatch.mock.calls[0]![0] as unknown[];
    expect(batchArg.length).toBe(2);
  });

  it('deletes lookbook asset from Cloudflare R2 bucket and removes D1 database metadata', async () => {
    const mockFirst = vi.fn().mockResolvedValue({
      id: 'img_del_1',
      product_id: 'prod_lawn_01',
      r2_key: 'products/prod_lawn_01/delete-me.webp',
      url: 'https://images.pakistaniclothing.pk/products/prod_lawn_01/delete-me.webp',
    });
    const mockRun = vi.fn().mockResolvedValue({ success: true });
    const mockPrepare = vi.fn().mockImplementation(() => ({
      bind: () => ({
        first: mockFirst,
        run: mockRun,
        all: vi.fn().mockResolvedValue({ success: true, results: [] }),
      }),
    }));

    const mockDeleteR2 = vi.fn().mockResolvedValue(undefined);
    const mockBucket = { delete: mockDeleteR2 } as unknown as R2Bucket;

    const mockEnv: Env = {
      DB: { prepare: mockPrepare } as unknown as D1Database,
      KV: {} as unknown as KVNamespace,
      BUCKET: mockBucket,
      ENVIRONMENT: 'development',
    };

    const result = await deleteProductImageRecord(mockEnv, 'img_del_1');
    expect(result).toEqual({ success: true, id: 'img_del_1' });
    expect(mockDeleteR2).toHaveBeenCalledWith('products/prod_lawn_01/delete-me.webp');
  });
});
