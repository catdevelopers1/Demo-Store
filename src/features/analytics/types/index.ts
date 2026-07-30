import type { CodOrder } from '../../orders/types';

export type Timeframe = '7d' | '30d' | '90d' | 'all';

export interface TopProductMetric {
  productId: string;
  sku: string;
  productName: string;
  revenuePkr: number;
  unitsSold: number;
}

export interface DailyRevenueMetric {
  date: string;
  revenuePkr: number;
  orderCount: number;
}

export interface CodStatusBreakdown {
  PENDING_VERIFICATION: number;
  CONFIRMED: number;
  PROCESSING: number;
  SHIPPED: number;
  DELIVERED: number;
  CANCELLED: number;
  RETURNED: number;
}

export interface AnalyticsOverview {
  timeframe: Timeframe;
  totalGrossRevenuePkr: number;
  totalOrdersCount: number;
  deliveredOrdersCount: number;
  averageOrderValuePkr: number;
  pendingVerificationCount: number;
  lowStockAlertsCount: number;
  outOfStockAlertsCount: number;
  statusBreakdown: CodStatusBreakdown;
  topProducts: TopProductMetric[];
  dailyRevenue: DailyRevenueMetric[];
  recentOrders: CodOrder[];
  generatedAt: string;
}
