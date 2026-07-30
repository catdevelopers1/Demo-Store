import { describe, it, expect, vi } from 'vitest';
import { getOrderByNumber } from '../../src/features/checkout/db/checkoutRepository';
import type { Env } from '../../src/core/db';
import type { D1Database, KVNamespace, R2Bucket } from '@cloudflare/workers-types';

describe('COD Checkout & Atomic D1 Batch Transaction Integration', () => {
  it('retrieves an existing order by its executive order number (#PK-XXXXX)', async () => {
    const mockOrderRow = {
      id: 'ord_1',
      order_number: '#PK-10001',
      customer_id: 'usr_1',
      guest_email: 'ahmed@lahore.pk',
      guest_phone: '0300-1234567',
      status: 'CONFIRMED',
      payment_method: 'COD',
      subtotal_pkr: 6500,
      discount_pkr: 0,
      shipping_pkr: 0,
      total_pkr: 6500,
      shipping_address_json:
        '{"recipientName":"Ahmed Khan","phone":"0300-1234567","city":"Lahore","provinceState":"Punjab","streetAddress":"Gulberg III"}',
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const mockItemRows = [
      {
        id: 'item_1',
        order_id: 'ord_1',
        product_id: 'prod_1',
        variant_id: 'var_1',
        sku: 'PK-LWN-GB-GRN',
        product_name: 'Gul-e-Bahar Lawn',
        variant_name: 'PK-LWN-GB-GRN',
        unit_price_pkr: 6500,
        quantity: 1,
        total_pkr: 6500,
      },
    ];

    const mockTimelineRows = [
      {
        id: 'tl_1',
        order_id: 'ord_1',
        old_status: null,
        new_status: 'CONFIRMED',
        changed_by_user_id: 'usr_1',
        comment: 'Order placed via COD',
        created_at: new Date().toISOString(),
      },
    ];

    const mockFirst = vi.fn().mockResolvedValue(mockOrderRow);
    const mockAll = vi
      .fn()
      .mockResolvedValueOnce({ success: true, results: mockItemRows })
      .mockResolvedValueOnce({ success: true, results: mockTimelineRows });

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

    const order = await getOrderByNumber(mockEnv, '#PK-10001');
    expect(order).not.toBeNull();
    expect(order?.orderNumber).toBe('#PK-10001');
    expect(order?.status).toBe('CONFIRMED');
    expect(order?.items).toHaveLength(1);
    expect(order?.timeline).toHaveLength(1);
  });
});
