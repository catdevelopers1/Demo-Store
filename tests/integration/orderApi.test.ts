import { describe, it, expect, vi } from 'vitest';
import {
  getOrderByNumberAndPhone,
  getAdminOrders,
  updateOrderStatus,
} from '../../src/features/orders/db/orderRepository';
import type { Env } from '../../src/core/db';
import type { D1Database } from '@cloudflare/workers-types';

describe('Order Lifecycle & Timeline Repository Integration Tests', () => {
  it('verifies Pakistani phone number match before returning tracking order details', async () => {
    const mockOrderRow = {
      id: 'ord_test_10001',
      order_number: '#PK-10001',
      customer_id: 'usr_demo_customer',
      guest_email: 'ahmed@lahore.pk',
      guest_phone: '0300-1234567',
      status: 'CONFIRMED',
      payment_method: 'COD',
      subtotal_pkr: 6500,
      discount_pkr: 0,
      shipping_pkr: 0,
      total_pkr: 6500,
      shipping_address_json:
        '{"recipientName":"Ahmed Khan","phone":"0300-1234567","city":"Lahore","provinceState":"Punjab","streetAddress":"House 12","postalCode":"54660"}',
      notes: 'Initial order',
      created_at: '2026-07-30T10:00:00Z',
      updated_at: '2026-07-30T10:00:00Z',
    };

    const mockItems = [
      {
        id: 'orditem_1',
        order_id: 'ord_test_10001',
        product_id: 'prod_lawn_01',
        variant_id: 'var_lwn_01_grn',
        sku: 'PK-LWN-GB-GRN',
        product_name: 'Gul-e-Bahar Unstitched Lawn 3-Piece',
        variant_name: 'PK-LWN-GB-GRN',
        unit_price_pkr: 6500,
        quantity: 1,
        total_pkr: 6500,
      },
    ];

    const mockTimeline = [
      {
        id: 'tl_test_1',
        order_id: 'ord_test_10001',
        old_status: null,
        new_status: 'CONFIRMED',
        changed_by_user_id: null,
        comment: 'Order placed via COD',
        created_at: '2026-07-30T10:00:00Z',
      },
    ];

    const mockFirst = vi
      .fn()
      .mockImplementation((sql: string) => {
        if (sql.includes('SELECT id, order_number')) {
          return Promise.resolve(mockOrderRow);
        }
        return Promise.resolve(null);
      });

    const mockQuery = vi.fn().mockImplementation((sql: string) => {
      if (sql.includes('FROM order_items')) {
        return Promise.resolve({ results: mockItems });
      }
      if (sql.includes('FROM order_timeline')) {
        return Promise.resolve({ results: mockTimeline });
      }
      return Promise.resolve({ results: [] });
    });

    const mockPrepare = vi.fn().mockImplementation((sql: string) => ({
      bind: (..._args: unknown[]) => ({
        first: () => mockFirst(sql),
        all: () => mockQuery(sql),
      }),
    }));

    const env = {
      DB: {
        prepare: mockPrepare,
      } as unknown as D1Database,
    } as unknown as Env;

    // Successful lookup when phone matches (even with different formatting +923001234567 vs 0300-1234567)
    const validLookup = await getOrderByNumberAndPhone(
      env,
      '#PK-10001',
      '+923001234567'
    );
    expect(validLookup).not.toBeNull();
    expect(validLookup?.orderNumber).toBe('#PK-10001');
    expect(validLookup?.status).toBe('CONFIRMED');
    expect(validLookup?.items).toHaveLength(1);

    // Mismatched phone returns null (privacy defense)
    const invalidPhoneLookup = await getOrderByNumberAndPhone(
      env,
      '#PK-10001',
      '0301-9999999'
    );
    expect(invalidPhoneLookup).toBeNull();
  });

  it('retrieves paginated admin orders with status and search filtering', async () => {
    const mockOrderRow = {
      id: 'ord_test_10002',
      order_number: '#PK-10002',
      customer_id: null,
      guest_email: 'fatima@lahore.pk',
      guest_phone: '0301-2345678',
      status: 'PENDING_VERIFICATION',
      payment_method: 'COD',
      subtotal_pkr: 28500,
      discount_pkr: 0,
      shipping_pkr: 0,
      total_pkr: 28500,
      shipping_address_json:
        '{"recipientName":"Fatima Ali","phone":"0301-2345678","city":"Lahore","provinceState":"Punjab","streetAddress":"House 45","postalCode":"54792"}',
      notes: 'High value',
      created_at: '2026-07-30T11:00:00Z',
      updated_at: '2026-07-30T11:00:00Z',
    };

    const mockFirst = vi.fn().mockResolvedValue({ total: 1 });
    const mockQuery = vi.fn().mockImplementation((sql: string) => {
      if (sql.includes('SELECT id, order_number')) {
        return Promise.resolve({ results: [mockOrderRow] });
      }
      if (sql.includes('FROM order_items')) {
        return Promise.resolve({
          results: [
            {
              id: 'orditem_2_1',
              order_id: 'ord_test_10002',
              product_id: 'prod_lawn_01',
              variant_id: 'var_lwn_01_grn',
              sku: 'PK-LWN-GB-GRN',
              product_name: 'Lawn Suit',
              variant_name: 'Green',
              unit_price_pkr: 28500,
              quantity: 1,
              total_pkr: 28500,
            },
          ],
        });
      }
      if (sql.includes('FROM order_timeline')) {
        return Promise.resolve({
          results: [
            {
              id: 'tl_2_1',
              order_id: 'ord_test_10002',
              old_status: null,
              new_status: 'PENDING_VERIFICATION',
              changed_by_user_id: null,
              comment: 'Order placed',
              created_at: '2026-07-30T11:00:00Z',
            },
          ],
        });
      }
      return Promise.resolve({ results: [] });
    });

    const mockPrepare = vi.fn().mockImplementation((sql: string) => ({
      bind: (..._args: unknown[]) => ({
        first: () => mockFirst(sql),
        all: () => mockQuery(sql),
      }),
    }));

    const env = {
      DB: {
        prepare: mockPrepare,
      } as unknown as D1Database,
    } as unknown as Env;

    const result = await getAdminOrders(env, {
      status: 'PENDING_VERIFICATION',
      page: 1,
      limit: 10,
    });
    expect(result.total).toBe(1);
    expect(result.orders).toHaveLength(1);
    expect(result.orders[0]?.orderNumber).toBe('#PK-10002');
  });

  it('updates order status atomically and releases reserved stock when order is CANCELLED', async () => {
    const mockOrderRow = {
      id: 'ord_test_10003',
      order_number: '#PK-10003',
      customer_id: null,
      guest_email: 'usman@rwp.pk',
      guest_phone: '0333-9876543',
      status: 'CONFIRMED',
      payment_method: 'COD',
      subtotal_pkr: 6800,
      discount_pkr: 0,
      shipping_pkr: 0,
      total_pkr: 6800,
      shipping_address_json:
        '{"recipientName":"Usman Tariq","phone":"0333-9876543","city":"Rawalpindi","provinceState":"Punjab","streetAddress":"23-B","postalCode":"46000"}',
      notes: null,
      created_at: '2026-07-30T10:00:00Z',
      updated_at: '2026-07-30T10:00:00Z',
    };

    const mockItems = [
      {
        id: 'orditem_3_1',
        order_id: 'ord_test_10003',
        product_id: 'prod_lawn_01',
        variant_id: 'var_lwn_01_blu',
        sku: 'PK-LWN-GB-BLU',
        product_name: 'Gul-e-Bahar Unstitched Lawn',
        variant_name: 'Blue',
        unit_price_pkr: 6800,
        quantity: 2,
        total_pkr: 13600,
      },
    ];

    let queryCount = 0;
    const mockFirst = vi.fn().mockImplementation((sql: string) => {
      if (sql.includes('SELECT id, order_number')) {
        queryCount++;
        // On second lookup (after status update), return updated status CANCELLED
        return Promise.resolve({
          ...mockOrderRow,
          status: queryCount > 1 ? 'CANCELLED' : 'CONFIRMED',
        });
      }
      return Promise.resolve(null);
    });

    const mockQuery = vi.fn().mockImplementation((sql: string) => {
      if (sql.includes('FROM order_items')) {
        return Promise.resolve({ results: mockItems });
      }
      if (sql.includes('FROM order_timeline')) {
        return Promise.resolve({
          results: [
            {
              id: 'tl_1',
              order_id: 'ord_test_10003',
              old_status: 'CONFIRMED',
              new_status: 'CANCELLED',
              changed_by_user_id: 'admin_1',
              comment: 'Customer requested cancellation',
              created_at: '2026-07-30T12:00:00Z',
            },
          ],
        });
      }
      return Promise.resolve({ results: [] });
    });

    const mockBatch = vi.fn().mockResolvedValue([
      { success: true },
      { success: true },
    ]);

    const mockPrepare = vi.fn().mockImplementation((sql: string) => ({
      bind: (..._args: unknown[]) => ({
        first: () => mockFirst(sql),
        all: () => mockQuery(sql),
      }),
    }));

    const env = {
      DB: {
        prepare: mockPrepare,
        batch: mockBatch,
      } as unknown as D1Database,
    } as unknown as Env;

    const updatedOrder = await updateOrderStatus(
      env,
      'ord_test_10003',
      {
        status: 'CANCELLED',
        comment: 'Customer requested cancellation via WhatsApp',
        restockInventory: true,
      },
      'usr_admin_1'
    );

    // Verify D1 batch transaction was executed for status update + timeline record AND for releasing stock
    expect(mockBatch).toHaveBeenCalledTimes(2); // First batch: order update + timeline insert. Second batch: releaseStock (inventory update + inventory log insert).
    expect(updatedOrder.status).toBe('CANCELLED');
    expect(updatedOrder.timeline).toHaveLength(1);
    expect(updatedOrder.timeline[0]?.newStatus).toBe('CANCELLED');
  });

  it('rejects invalid state transitions (e.g. DELIVERED to CONFIRMED)', async () => {
    const mockOrderRow = {
      id: 'ord_test_10005',
      order_number: '#PK-10005',
      customer_id: null,
      guest_email: 'hamza@isb.pk',
      guest_phone: '0345-6789012',
      status: 'DELIVERED',
      payment_method: 'COD',
      subtotal_pkr: 14900,
      discount_pkr: 0,
      shipping_pkr: 0,
      total_pkr: 14900,
      shipping_address_json: '{}',
      notes: null,
      created_at: '2026-07-30T10:00:00Z',
      updated_at: '2026-07-30T10:00:00Z',
    };

    const mockFirst = vi.fn().mockResolvedValue(mockOrderRow);
    const mockQuery = vi.fn().mockResolvedValue({ results: [] });

    const mockPrepare = vi.fn().mockImplementation((sql: string) => ({
      bind: (..._args: unknown[]) => ({
        first: () => mockFirst(sql),
        all: () => mockQuery(sql),
      }),
    }));

    const env = {
      DB: {
        prepare: mockPrepare,
      } as unknown as D1Database,
    } as unknown as Env;

    await expect(
      updateOrderStatus(
        env,
        'ord_test_10005',
        {
          status: 'CONFIRMED',
          comment: 'Invalid rollback attempt',
        },
        'usr_admin_1'
      )
    ).rejects.toThrow(/Invalid status transition from 'DELIVERED' to 'CONFIRMED'/);
  });
});
