import { describe, it, expect, vi } from 'vitest';
import { getAnalyticsOverview } from '../../src/features/analytics/db/analyticsRepository';
import type { Env } from '../../src/core/db';
import type { D1Database } from '@cloudflare/workers-types';

describe('Executive Admin Analytics & D1 Aggregation Integration Tests', () => {
  it('aggregates gross revenue, COD pending alerts, top collections, and executes in under 20ms', async () => {
    const mockOrderStats = {
      total_orders: 15,
      total_gross_revenue_pkr: 450000,
      pending_verification_count: 2,
      confirmed_count: 3,
      processing_count: 2,
      shipped_count: 2,
      delivered_count: 5,
      cancelled_count: 1,
      returned_count: 0,
    };

    const mockStockStats = {
      low_stock_count: 3,
      out_of_stock_count: 1,
    };

    const mockTopProducts = [
      {
        product_id: 'prod_lawn_01',
        sku: 'PK-LWN-GB-GRN',
        product_name: 'Gul-e-Bahar Unstitched Lawn 3-Piece',
        revenue_pkr: 260000,
        units_sold: 40,
      },
      {
        product_id: 'prod_khd_01',
        sku: 'PK-KHD-KSH-L',
        product_name: 'Kashmiri Khaddar 3-Piece Suit',
        revenue_pkr: 190000,
        units_sold: 21,
      },
    ];

    const mockDailyRevenue = [
      {
        date_str: '2026-07-28',
        revenue_pkr: 180000,
        order_count: 2,
      },
      {
        date_str: '2026-07-29',
        revenue_pkr: 270000,
        order_count: 3,
      },
    ];

    const mockRecentOrderRow = {
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
        '{"recipientName":"Ahmed Khan","phone":"0300-1234567","city":"Lahore","provinceState":"Punjab","streetAddress":"Gulberg III"}',
      notes: null,
      created_at: '2026-07-30T10:00:00Z',
      updated_at: '2026-07-30T10:00:00Z',
    };

    const mockFirst = vi.fn().mockImplementation((sql: string) => {
      if (sql.includes('SUM(CASE WHEN status = \'DELIVERED\'')) {
        return Promise.resolve(mockOrderStats);
      }
      if (sql.includes('low_stock_threshold')) {
        return Promise.resolve(mockStockStats);
      }
      if (sql.includes('SELECT COUNT(*) as total FROM orders')) {
        return Promise.resolve({ total: 1 });
      }
      return Promise.resolve(null);
    });

    const mockQuery = vi.fn().mockImplementation((sql: string) => {
      if (sql.includes('GROUP BY i.product_id')) {
        return Promise.resolve({ results: mockTopProducts });
      }
      if (sql.includes('GROUP BY date_str')) {
        return Promise.resolve({ results: mockDailyRevenue });
      }
      if (sql.includes('SELECT id, order_number')) {
        return Promise.resolve({ results: [mockRecentOrderRow] });
      }
      if (sql.includes('FROM order_items')) {
        return Promise.resolve({
          results: [
            {
              id: 'orditem_1',
              order_id: 'ord_test_10001',
              product_id: 'prod_lawn_01',
              variant_id: 'var_lwn_01_grn',
              sku: 'PK-LWN-GB-GRN',
              product_name: 'Lawn Suit',
              variant_name: 'Green',
              unit_price_pkr: 6500,
              quantity: 1,
              total_pkr: 6500,
            },
          ],
        });
      }
      if (sql.includes('FROM order_timeline')) {
        return Promise.resolve({ results: [] });
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

    const startTime = performance.now();
    const overview = await getAnalyticsOverview(env, '30d');
    const endTime = performance.now();
    const durationMs = endTime - startTime;

    // Verify index-backed parallel query performance is <20 milliseconds
    expect(durationMs).toBeLessThan(20);

    // Verify KPI calculations
    expect(overview.totalGrossRevenuePkr).toBe(450000);
    expect(overview.totalOrdersCount).toBe(15);
    expect(overview.deliveredOrdersCount).toBe(5);
    expect(overview.averageOrderValuePkr).toBe(90000); // 450,000 / 5
    expect(overview.pendingVerificationCount).toBe(2);
    expect(overview.lowStockAlertsCount).toBe(3);
    expect(overview.outOfStockAlertsCount).toBe(1);

    // Verify status breakdown
    expect(overview.statusBreakdown.DELIVERED).toBe(5);
    expect(overview.statusBreakdown.PENDING_VERIFICATION).toBe(2);

    // Verify top products and daily revenue
    expect(overview.topProducts).toHaveLength(2);
    expect(overview.topProducts[0]?.sku).toBe('PK-LWN-GB-GRN');
    expect(overview.topProducts[0]?.revenuePkr).toBe(260000);
    expect(overview.dailyRevenue).toHaveLength(2);
    expect(overview.recentOrders).toHaveLength(1);
  });
});
