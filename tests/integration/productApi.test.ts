import { describe, it, expect, vi } from 'vitest';
import {
  createProductWithVariants,
  getProductBySlug,
} from '../../src/features/products/db/productRepository';
import type { Env } from '../../src/core/db';
import type { D1Database, KVNamespace, R2Bucket } from '@cloudflare/workers-types';

describe('Product Repository & Atomic D1 Batch Integration', () => {
  it('executes atomic D1 batch queries across products, options, values, variants, and inventory ledger', async () => {
    const mockBatch = vi.fn().mockResolvedValue([]);

    // No existing product with same slug
    const mockFirst = vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce({
      id: 'prod_test_100',
      name: 'Luxury Embroidered Lawn Suit',
      slug: 'luxury-embroidered-lawn-suit',
      description: 'Test suit',
      base_price_pkr: 7500,
      category_id: 'cat_lawn_3p',
      is_active: 1,
      seo_title: 'SEO',
      seo_description: 'DESC',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const mockPrepare = vi.fn().mockImplementation((_sql: string) => ({
      bind: () => ({
        first: mockFirst,
        all: vi.fn().mockResolvedValue({ success: true, results: [] }),
      }),
    }));

    const mockEnv: Env = {
      DB: { prepare: mockPrepare, batch: mockBatch } as unknown as D1Database,
      KV: {} as unknown as KVNamespace,
      BUCKET: {} as unknown as R2Bucket,
      ENVIRONMENT: 'development',
    };

    const result = await createProductWithVariants(mockEnv, {
      name: 'Luxury Embroidered Lawn Suit',
      slug: 'luxury-embroidered-lawn-suit',
      basePricePkr: 7500,
      categoryId: 'cat_lawn_3p',
      options: [{ name: 'Size', values: ['Small', 'Medium'] }],
      variants: [
        { sku: 'PK-LUX-S', priceOverridePkr: null, optionValues: ['Small'] },
        { sku: 'PK-LUX-M', priceOverridePkr: 7800, optionValues: ['Medium'] },
      ],
    });

    expect('product' in result).toBe(true);
    expect(mockBatch).toHaveBeenCalledTimes(1);
    // Verified 1 product + 1 option + 2 option values + 2 variants + 2 variant-option mappings + 2 inventory_items = 10 queries in 1 atomic batch!
    const batchArg = mockBatch.mock.calls[0]![0] as unknown[];
    expect(batchArg.length).toBe(10);
  });

  it('assembles ProductWithVariants including option values and SKU mappings on slug lookup', async () => {
    const productRow = {
      id: 'prod_lawn_01',
      name: 'Gul-e-Bahar Lawn 3-Piece',
      slug: 'gul-e-bahar',
      base_price_pkr: 6500,
      is_active: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const optionRows = [{ id: 'opt_col', product_id: 'prod_lawn_01', name: 'Color', sort_order: 1 }];
    const valRows = [
      { id: 'val_grn', option_id: 'opt_col', value: 'Emerald Green', sort_order: 1 },
      { id: 'val_blu', option_id: 'opt_col', value: 'Royal Blue', sort_order: 2 },
    ];
    const varRows = [
      {
        id: 'var_1',
        product_id: 'prod_lawn_01',
        sku: 'PK-GUL-GRN',
        price_override_pkr: null,
        compare_at_price_pkr: null,
        weight_grams: 0,
        is_active: 1,
      },
    ];
    const mapRows = [{ variant_id: 'var_1', option_value_id: 'val_grn' }];

    const mockFirst = vi.fn().mockResolvedValue(productRow);
    const mockAll = vi
      .fn()
      .mockResolvedValueOnce({ success: true, results: optionRows })
      .mockResolvedValueOnce({ success: true, results: valRows })
      .mockResolvedValueOnce({ success: true, results: varRows })
      .mockResolvedValueOnce({ success: true, results: mapRows });

    const mockPrepare = vi.fn().mockImplementation(() => ({
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

    const product = await getProductBySlug(mockEnv, 'gul-e-bahar');
    expect(product).not.toBeNull();
    expect(product?.name).toBe('Gul-e-Bahar Lawn 3-Piece');
    expect(product?.options).toHaveLength(1);
    expect(product?.options[0]?.values).toHaveLength(2);
    expect(product?.variants).toHaveLength(1);
    expect(product?.variants[0]?.sku).toBe('PK-GUL-GRN');
    expect(product?.variants[0]?.optionValues[0]?.value).toBe('Emerald Green');
  });
});
