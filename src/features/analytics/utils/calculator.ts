import type { Timeframe } from '../types';

/**
 * Calculates Average Order Value (AOV) in PKR rounded to the nearest integer
 */
export function calculateAverageOrderValue(
  totalRevenuePkr: number,
  deliveredOrdersCount: number
): number {
  if (deliveredOrdersCount <= 0 || totalRevenuePkr <= 0) {
    return 0;
  }
  return Math.round(totalRevenuePkr / deliveredOrdersCount);
}

/**
 * Calculates percentage growth rate between current and previous metrics
 */
export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Human-readable display label for selected timeframe
 */
export function formatTimeframeLabel(timeframe: Timeframe): string {
  switch (timeframe) {
    case '7d':
      return 'Last 7 Days';
    case '30d':
      return 'Last 30 Days';
    case '90d':
      return 'Last 90 Days';
    case 'all':
      return 'All Time';
    default:
      return 'Last 30 Days';
  }
}

/**
 * Computes ISO 8601 UTC start date boundary for SQLite query filtering
 */
export function getTimeframeStartDateIso(
  timeframe: Timeframe,
  now = Date.now()
): string {
  switch (timeframe) {
    case '7d':
      return new Date(now - 7 * 86400 * 1000).toISOString();
    case '30d':
      return new Date(now - 30 * 86400 * 1000).toISOString();
    case '90d':
      return new Date(now - 90 * 86400 * 1000).toISOString();
    case 'all':
      return '2020-01-01T00:00:00.000Z';
    default:
      return new Date(now - 30 * 86400 * 1000).toISOString();
  }
}
