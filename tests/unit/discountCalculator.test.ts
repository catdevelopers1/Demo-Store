import { describe, it, expect } from 'vitest';
import { evaluateDiscount } from '../../src/features/discounts/utils/calculator';
import type { Discount } from '../../src/features/discounts/types';

describe('Promotional Coupon Evaluation Engine', () => {
  const baseDiscount: Discount = {
    id: 'disc_1',
    code: 'AZADI14',
    type: 'PERCENTAGE',
    value: 15,
    minOrderPkr: 5000,
    maxDiscountPkr: 2000,
    startTime: '2026-07-01T00:00:00Z',
    endTime: '2026-12-31T23:59:59Z',
    usageLimit: 500,
    usedCount: 0,
    isActive: true,
  };

  it('calculates 15% percentage discount correctly', () => {
    const res = evaluateDiscount(baseDiscount, 6500, '2026-07-30T12:00:00Z');
    expect(res.isValid).toBe(true);
    expect(res.discountPkr).toBe(975); // 15% of 6500 = 975
    expect(res.newSubtotalPkr).toBe(5525);
  });

  it('caps percentage discount at maxDiscountPkr ceiling', () => {
    // 15% of 20000 = 3000, but maxDiscountPkr is 2000!
    const res = evaluateDiscount(baseDiscount, 20000, '2026-07-30T12:00:00Z');
    expect(res.isValid).toBe(true);
    expect(res.discountPkr).toBe(2000);
    expect(res.newSubtotalPkr).toBe(18000);
  });

  it('calculates fixed PKR discount and prevents negative subtotal', () => {
    const fixedDiscount: Discount = {
      ...baseDiscount,
      type: 'FIXED_PKR',
      value: 1000,
      minOrderPkr: 500,
      maxDiscountPkr: null,
    };

    const res = evaluateDiscount(fixedDiscount, 800, '2026-07-30T12:00:00Z');
    expect(res.isValid).toBe(true);
    expect(res.discountPkr).toBe(800); // Capped at subtotal
    expect(res.newSubtotalPkr).toBe(0);
  });

  it('rejects order subtotal below minOrderPkr threshold', () => {
    const res = evaluateDiscount(baseDiscount, 3000, '2026-07-30T12:00:00Z');
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('minimum order value');
  });

  it('rejects coupon if usage limit has been reached', () => {
    const maxedDiscount: Discount = {
      ...baseDiscount,
      usedCount: 500,
    };
    const res = evaluateDiscount(maxedDiscount, 6500, '2026-07-30T12:00:00Z');
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('usage limit');
  });

  it('rejects expired coupons', () => {
    const res = evaluateDiscount(baseDiscount, 6500, '2027-01-01T12:00:00Z');
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('expired');
  });
});
