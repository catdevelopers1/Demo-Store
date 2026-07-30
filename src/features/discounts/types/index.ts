export type DiscountType = 'PERCENTAGE' | 'FIXED_PKR';

export interface Discount {
  id: string;
  code: string;
  type: DiscountType;
  value: number;
  minOrderPkr: number;
  maxDiscountPkr?: number | null;
  startTime: string;
  endTime: string;
  usageLimit?: number | null;
  usedCount: number;
  isActive: boolean;
  createdAt?: string;
}

export interface DiscountEvaluationResult {
  code: string;
  type: DiscountType;
  value: number;
  subtotalPkr: number;
  discountPkr: number;
  newSubtotalPkr: number;
  isValid: boolean;
  error?: string;
}
