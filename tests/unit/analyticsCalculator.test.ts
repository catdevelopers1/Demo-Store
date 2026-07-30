import { describe, it, expect } from 'vitest';
import {
  calculateAverageOrderValue,
  calculateGrowthRate,
  formatTimeframeLabel,
  getTimeframeStartDateIso,
} from '../../src/features/analytics/utils/calculator';
import { analyticsQuerySchema } from '../../src/features/analytics/validation';

describe('Pakistani E-Commerce Analytics Calculator Unit Tests', () => {
  it('calculates Average Order Value (AOV) in PKR correctly', () => {
    expect(calculateAverageOrderValue(150000, 10)).toBe(15000);
    expect(calculateAverageOrderValue(12345, 3)).toBe(4115);
    expect(calculateAverageOrderValue(1000, 0)).toBe(0);
    expect(calculateAverageOrderValue(0, 10)).toBe(0);
  });

  it('calculates percentage growth rate between timeframes', () => {
    expect(calculateGrowthRate(150, 100)).toBe(50);
    expect(calculateGrowthRate(80, 100)).toBe(-20);
    expect(calculateGrowthRate(100, 0)).toBe(100);
    expect(calculateGrowthRate(0, 0)).toBe(0);
  });

  it('formats human-readable timeframe labels', () => {
    expect(formatTimeframeLabel('7d')).toBe('Last 7 Days');
    expect(formatTimeframeLabel('30d')).toBe('Last 30 Days');
    expect(formatTimeframeLabel('90d')).toBe('Last 90 Days');
    expect(formatTimeframeLabel('all')).toBe('All Time');
  });

  it('computes ISO 8601 UTC start boundaries for D1 timestamp queries', () => {
    const now = new Date('2026-07-30T12:00:00.000Z').getTime();
    const iso7d = getTimeframeStartDateIso('7d', now);
    expect(iso7d).toBe('2026-07-23T12:00:00.000Z');

    const iso30d = getTimeframeStartDateIso('30d', now);
    expect(iso30d).toBe('2026-06-30T12:00:00.000Z');

    const isoAll = getTimeframeStartDateIso('all', now);
    expect(isoAll).toBe('2020-01-01T00:00:00.000Z');
  });

  it('validates analytics query Zod schema defaults and allowed enum values', () => {
    const defaultQuery = analyticsQuerySchema.parse({});
    expect(defaultQuery.timeframe).toBe('30d');

    const customQuery = analyticsQuerySchema.parse({ timeframe: '7d' });
    expect(customQuery.timeframe).toBe('7d');

    expect(() =>
      analyticsQuerySchema.parse({ timeframe: '365d' })
    ).toThrow();
  });
});
