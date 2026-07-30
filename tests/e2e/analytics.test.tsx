import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/dom';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../src/features/authentication';
import { SettingsProvider } from '../../src/features/settings';
import { AdminDashboardOverview } from '../../src/features/analytics';
import type { AnalyticsOverview } from '../../src/features/analytics/types';

describe('Milestone 13 Admin Dashboard & Core E-Commerce Analytics E2E Test', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the Executive Analytics Overview header and timeframe selector buttons', async () => {
    render(
      <AuthProvider>
        <SettingsProvider>
          <MemoryRouter initialEntries={['/admin']}>
            <AdminDashboardOverview />
          </MemoryRouter>
        </SettingsProvider>
      </AuthProvider>
    );

    const heading = screen.getByRole('heading', {
      name: /Executive Pakistani Commerce Analytics/i,
    });
    expect(heading).toBeDefined();

    const tf7Button = screen.getByText(/Last 7 Days/i);
    expect(tf7Button).toBeDefined();

    const tf30Button = screen.getByText(/Last 30 Days/i);
    expect(tf30Button).toBeDefined();

    const tf90Button = screen.getByText(/Last 90 Days/i);
    expect(tf90Button).toBeDefined();

    const tfAllButton = screen.getByText(/All Time/i);
    expect(tfAllButton).toBeDefined();

    const loadingText = screen.getByText(/Aggregating Cloudflare D1 commerce metrics/i);
    expect(loadingText).toBeDefined();
  });

  it('hydrates KPI metric cards, COD status distribution, and top apparel SKUs when data is loaded', async () => {
    const mockOverview: AnalyticsOverview = {
      timeframe: '30d',
      totalGrossRevenuePkr: 500000,
      totalOrdersCount: 20,
      deliveredOrdersCount: 10,
      averageOrderValuePkr: 50000,
      pendingVerificationCount: 3,
      lowStockAlertsCount: 2,
      outOfStockAlertsCount: 1,
      statusBreakdown: {
        PENDING_VERIFICATION: 3,
        CONFIRMED: 5,
        PROCESSING: 2,
        SHIPPED: 0,
        DELIVERED: 10,
        CANCELLED: 0,
        RETURNED: 0,
      },
      topProducts: [
        {
          productId: 'prod_1',
          sku: 'PK-LWN-GB-GRN',
          productName: 'Gul-e-Bahar Unstitched Lawn 3-Piece',
          revenuePkr: 300000,
          unitsSold: 30,
        },
      ],
      dailyRevenue: [
        {
          date: '2026-07-29',
          revenuePkr: 150000,
          orderCount: 3,
        },
      ],
      recentOrders: [],
      generatedAt: '2026-07-30T12:00:00Z',
    };

    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: mockOverview,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    render(
      <AuthProvider>
        <SettingsProvider>
          <MemoryRouter initialEntries={['/admin']}>
            <AdminDashboardOverview />
          </MemoryRouter>
        </SettingsProvider>
      </AuthProvider>
    );

    const revenueKpi = await screen.findByText(/Gross Revenue \(PKR\)/i);
    expect(revenueKpi).toBeDefined();

    const orderVolumeKpi = await screen.findByText(/Total Order Volume/i);
    expect(orderVolumeKpi).toBeDefined();

    const codPhoneKpi = await screen.findByText(/COD Phone Verification/i);
    expect(codPhoneKpi).toBeDefined();

    const stockAlertsKpi = await screen.findByText(/Inventory Stock Alerts/i);
    expect(stockAlertsKpi).toBeDefined();

    const distHeading = await screen.findByText(/COD Lifecycle Status Distribution/i);
    expect(distHeading).toBeDefined();

    const skuText = await screen.findByText(/Gul-e-Bahar Unstitched Lawn 3-Piece/i);
    expect(skuText).toBeDefined();
  });
});
