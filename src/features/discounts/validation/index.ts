import { z } from 'zod';

export const COUPON_CODE_REGEX = /^[A-Z0-9_-]+$/;

export const validateCouponSchema = z.object({
  code: z.string().min(2, 'Coupon code is required'),
  subtotalPkr: z.number().int().min(0, 'Subtotal must be a non-negative PKR integer'),
});

export const createDiscountSchema = z.object({
  code: z
    .string()
    .min(2, 'Promo code must be at least 2 characters long')
    .regex(
      COUPON_CODE_REGEX,
      'Promo code must contain only uppercase letters, numbers, hyphens, or underscores (e.g. AZADI14)'
    ),
  type: z.enum(['PERCENTAGE', 'FIXED_PKR'], {
    message: 'Type must be PERCENTAGE or FIXED_PKR',
  }),
  value: z.number().int().min(1, 'Discount value must be at least 1'),
  minOrderPkr: z.number().int().min(0).default(0),
  maxDiscountPkr: z.number().int().min(1).nullable().optional(),
  startTime: z.string().min(10, 'Valid ISO start time is required'),
  endTime: z.string().min(10, 'Valid ISO end time is required'),
  usageLimit: z.number().int().min(1).nullable().optional(),
  isActive: z.boolean().default(true),
});

export const updateDiscountSchema = createDiscountSchema.partial();

export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;
export type CreateDiscountInput = z.infer<typeof createDiscountSchema>;
export type UpdateDiscountInput = z.infer<typeof updateDiscountSchema>;
