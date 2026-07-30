import type { Discount, DiscountEvaluationResult } from '../types';
import { formatPkr } from '../../variants/utils';

/**
 * Evaluates a promotional coupon code against an order subtotal in PKR
 */
export function evaluateDiscount(
  discount: Discount,
  subtotalPkr: number,
  nowIso = new Date().toISOString()
): DiscountEvaluationResult {
  const baseResult: DiscountEvaluationResult = {
    code: discount.code,
    type: discount.type,
    value: discount.value,
    subtotalPkr,
    discountPkr: 0,
    newSubtotalPkr: subtotalPkr,
    isValid: false,
  };

  if (!discount.isActive) {
    return {
      ...baseResult,
      error: `Coupon code '${discount.code}' is no longer active.`,
    };
  }

  const nowMs = new Date(nowIso).getTime();
  const startMs = new Date(discount.startTime).getTime();
  const endMs = new Date(discount.endTime).getTime();

  if (nowMs < startMs || nowMs > endMs) {
    return {
      ...baseResult,
      error: `Coupon code '${discount.code}' has expired or is not yet valid.`,
    };
  }

  if (discount.usageLimit !== undefined && discount.usageLimit !== null) {
    if (discount.usedCount >= discount.usageLimit) {
      return {
        ...baseResult,
        error: `Coupon code '${discount.code}' usage limit has been reached.`,
      };
    }
  }

  if (subtotalPkr < discount.minOrderPkr) {
    return {
      ...baseResult,
      error: `A minimum order value of ${formatPkr(discount.minOrderPkr)} is required to apply '${discount.code}'.`,
    };
  }

  let calculatedDiscountPkr = 0;
  if (discount.type === 'PERCENTAGE') {
    calculatedDiscountPkr = Math.floor((subtotalPkr * discount.value) / 100);
    if (
      discount.maxDiscountPkr !== undefined &&
      discount.maxDiscountPkr !== null &&
      calculatedDiscountPkr > discount.maxDiscountPkr
    ) {
      calculatedDiscountPkr = discount.maxDiscountPkr;
    }
  } else {
    calculatedDiscountPkr = Math.min(subtotalPkr, discount.value);
  }

  const newSubtotalPkr = Math.max(0, subtotalPkr - calculatedDiscountPkr);

  return {
    code: discount.code,
    type: discount.type,
    value: discount.value,
    subtotalPkr,
    discountPkr: calculatedDiscountPkr,
    newSubtotalPkr,
    isValid: true,
  };
}
