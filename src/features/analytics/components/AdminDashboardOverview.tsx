import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  Clock,
  ArrowUpRight,
  Package,
  Calendar,
  CheckCircle2,
  Truck,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPkr } from '../../variants/utils';
import type { AnalyticsOverview, Timeframe } from '../types';
import { formatTimeframeLabel } from '../utils/calculator';
import {
  STATUS_LABELS,
  STATUS_BADGE_CLASSES,
} from '../../orders/utils/stateMachine';

export const AdminDashboardOverview: React.FC = () => {
  const [timeframe, setTimeframe] = useState<Timeframe>('30d');
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (tf: Timeframe) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/v1/admin/analytics/overview?timeframe=${tf}`
      );
      const data = (await response.json()) as {
        success?: boolean;
        data?: AnalyticsOverview;
        error?: { message?: string };
      };

      if (!response.ok || !data.success || !data.data) {
        throw new Error(
          data.error?.message ?? 'Failed to load executive analytics overview.'
        );
      }

      setOverview(data.data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to fetch analytics metrics.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAnalytics(timeframe);
  }, [timeframe, fetchAnalytics]);

  const timeframes: Timeframe[] = ['7d', '30d', '90d', 'all'];

  // Compute maximum daily revenue for bar graph scaling
  const maxDailyRevenue = overview?.dailyRevenue?.length
    ? Math.max(...overview.dailyRevenue.map((d) => d.revenuePkr), 1000)
    : 1000;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header with Timeframe Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 dark:border-gray-700 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Executive Pakistani Commerce Analytics
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Real-time D1 SQLite aggregation of Gross Revenue, COD Verification Alerts, Inventory Health, and Top Collections.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-600 p-0.5 bg-gray-50 dark:bg-gray-800">
            {timeframes.map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  timeframe === tf
                    ? 'bg-[var(--brand-primary-hex,#047857)] text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {formatTimeframeLabel(tf)}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => void fetchAnalytics(timeframe)}
            disabled={loading}
            aria-label="Refresh metrics"
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-sm flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Error Loading Analytics Overview</p>
            <p className="mt-0.5 text-xs text-rose-700 dark:text-rose-300">{error}</p>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !overview && (
        <div className="py-20 text-center text-gray-500 dark:text-gray-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-[var(--brand-primary-hex,#047857)]" />
          <p className="text-sm">Aggregating Cloudflare D1 commerce metrics...</p>
        </div>
      )}

      {/* Main Overview Dashboard Hydration */}
      {overview && (
        <div className="space-y-8">
          {/* 4 Executive KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* KPI 1: Gross Revenue */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-2xl p-6 border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Gross Revenue (PKR)
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  {formatPkr(overview.totalGrossRevenuePkr)}
                </p>
              </div>
              <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <span>AOV: {formatPkr(overview.averageOrderValuePkr)}</span>
                <span className="text-gray-400 dark:text-gray-500">
                  ({overview.deliveredOrdersCount} delivered)
                </span>
              </p>
            </div>

            {/* KPI 2: Total Orders */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-2xl p-6 border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Total Order Volume
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  {overview.totalOrdersCount}
                </p>
              </div>
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 font-medium">
                {overview.statusBreakdown.CONFIRMED + overview.statusBreakdown.PROCESSING}{' '}
                orders active &amp; processing
              </p>
            </div>

            {/* KPI 3: Pending COD Verifications */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-2xl p-6 border border-gray-100 dark:border-gray-700 flex flex-col justify-between relative overflow-hidden">
              {overview.pendingVerificationCount > 0 && (
                <div className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-amber-500 m-3 animate-pulse" />
              )}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    COD Phone Verification
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  {overview.pendingVerificationCount}
                </p>
              </div>
              <div className="mt-3">
                <Link
                  to="/admin/orders"
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-300 hover:underline"
                >
                  <span>Review Pending COD Orders</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* KPI 4: Inventory Alerts */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-2xl p-6 border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Inventory Stock Alerts
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  {overview.lowStockAlertsCount + overview.outOfStockAlertsCount}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {overview.lowStockAlertsCount} low &middot;{' '}
                  {overview.outOfStockAlertsCount} empty
                </span>
                <Link
                  to="/admin/inventory"
                  className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 dark:text-rose-300 hover:underline"
                >
                  <span>Manage</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* COD Lifecycle State Breakdown Bar */}
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-4">
              COD Lifecycle Status Distribution
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {(
                [
                  'PENDING_VERIFICATION',
                  'CONFIRMED',
                  'PROCESSING',
                  'SHIPPED',
                  'DELIVERED',
                  'CANCELLED',
                  'RETURNED',
                ] as const
              ).map((st) => {
                const count = overview.statusBreakdown[st];
                return (
                  <div
                    key={st}
                    className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        {STATUS_LABELS[st]}
                      </span>
                      {st === 'PENDING_VERIFICATION' && (
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                      )}
                      {st === 'CONFIRMED' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                      )}
                      {st === 'PROCESSING' && (
                        <Package className="w-3.5 h-3.5 text-indigo-500" />
                      )}
                      {st === 'SHIPPED' && (
                        <Truck className="w-3.5 h-3.5 text-purple-500" />
                      )}
                      {st === 'DELIVERED' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                      {st === 'CANCELLED' && (
                        <XCircle className="w-3.5 h-3.5 text-rose-500" />
                      )}
                      {st === 'RETURNED' && (
                        <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </div>
                    <p className="text-xl font-extrabold text-gray-900 dark:text-white mt-1">
                      {count}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Daily Revenue Bar Chart / Visual Graph */}
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[var(--brand-primary-hex,#047857)]" />
                  <span>Daily Revenue &amp; Order Trend ({formatTimeframeLabel(overview.timeframe)})</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Gross Delivered COD revenue by Pakistani local date
                </p>
              </div>

              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                Peak Day: {formatPkr(maxDailyRevenue)}
              </span>
            </div>

            {overview.dailyRevenue.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">
                No delivered order revenue recorded in this timeframe.
              </div>
            ) : (
              <div className="flex items-end gap-2 h-44 pt-6 pb-2 px-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                {overview.dailyRevenue.map((day) => {
                  const heightPercent = Math.max(
                    12,
                    Math.round((day.revenuePkr / maxDailyRevenue) * 100)
                  );
                  return (
                    <div
                      key={day.date}
                      className="flex-1 min-w-[36px] flex flex-col items-center group relative"
                    >
                      {/* Tooltip */}
                      <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-gray-900 text-white text-[10px] py-1 px-2 rounded shadow-lg whitespace-nowrap z-10">
                        <p className="font-bold">{day.date}</p>
                        <p>{formatPkr(day.revenuePkr)} &middot; {day.orderCount} order(s)</p>
                      </div>

                      {/* Bar */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full max-w-[28px] rounded-t-md bg-gradient-to-t from-[var(--brand-primary-hex,#047857)] to-emerald-400 group-hover:from-emerald-700 group-hover:to-emerald-300 transition-all shadow-sm"
                      />

                      {/* Date label */}
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 font-mono truncate max-w-[44px]">
                        {day.date.substring(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Two Columns: Top 5 Best-Selling Products & Recent Orders Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Top 5 Best-Selling Products */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[var(--brand-primary-hex,#047857)]" />
                  <span>Top 5 Best-Selling Pakistani Apparel SKUs</span>
                </h3>
                <Link
                  to="/admin/products"
                  className="text-xs font-semibold text-[var(--brand-primary-hex,#047857)] hover:underline"
                >
                  Catalog &rarr;
                </Link>
              </div>

              {overview.topProducts.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-sm">
                  No product sale data available for this timeframe.
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {overview.topProducts.map((prod, index) => (
                    <div
                      key={prod.sku}
                      className="py-3 flex items-center justify-between gap-4 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold flex items-center justify-center shrink-0">
                          #{index + 1}
                        </span>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">
                            {prod.productName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            SKU: {prod.sku} &middot; {prod.unitsSold} unit(s) sold
                          </p>
                        </div>
                      </div>

                      <span className="font-extrabold text-gray-900 dark:text-white shrink-0">
                        {formatPkr(prod.revenuePkr)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Recent COD Orders Feed */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-[var(--brand-primary-hex,#047857)]" />
                  <span>Recent Pakistani COD Orders</span>
                </h3>
                <Link
                  to="/admin/orders"
                  className="text-xs font-semibold text-[var(--brand-primary-hex,#047857)] hover:underline"
                >
                  View all orders &rarr;
                </Link>
              </div>

              {overview.recentOrders.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-sm">
                  No orders placed yet.
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {overview.recentOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="py-3 flex items-center justify-between gap-3 text-sm"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-gray-900 dark:text-white">
                            {ord.orderNumber}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              STATUS_BADGE_CLASSES[ord.status]
                            }`}
                          >
                            {STATUS_LABELS[ord.status]}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {ord.shippingAddress?.recipientName} &middot;{' '}
                          {ord.shippingAddress?.city},{' '}
                          {ord.shippingAddress?.provinceState}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-extrabold text-gray-900 dark:text-white block">
                          {formatPkr(ord.totalPkr)}
                        </span>
                        <Link
                          to="/admin/orders"
                          className="text-[11px] text-[var(--brand-primary-hex,#047857)] hover:underline"
                        >
                          Manage
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
