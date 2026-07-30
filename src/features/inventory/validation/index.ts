import { z } from 'zod';

export type ManualAdjustmentReason = 'RESTOCK' | 'ADJUSTMENT' | 'RETURN';

export const adjustStockSchema = z.object({
  changeQty: z
    .number()
    .int('Adjustment quantity must be an integer')
    .refine((val) => val !== 0, 'Change quantity cannot be zero (use positive to add stock, negative to reduce)'),
  reason: z.enum(['RESTOCK', 'ADJUSTMENT', 'RETURN'], {
    message: 'Reason must be one of: RESTOCK, ADJUSTMENT, RETURN',
  }),
  referenceId: z.string().nullable().optional(),
  comment: z
    .string()
    .min(3, 'An audit comment of at least 3 characters is mandatory for manual inventory changes'),
});

export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
