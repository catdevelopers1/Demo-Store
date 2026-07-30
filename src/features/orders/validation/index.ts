import { z } from 'zod';
import { normalizePakistaniPhone } from '../utils/phone';

export const orderTrackingSchema = z.object({
  orderNumber: z
    .string()
    .min(1, 'Order number is required.')
    .trim(),
  phone: z
    .string()
    .min(1, 'Mobile number is required.')
    .trim()
    .refine(
      (val) => {
        const norm = normalizePakistaniPhone(val);
        return norm.length === 11 && norm.startsWith('03');
      },
      {
        message:
          'Please enter a valid 11-digit Pakistani mobile number (e.g., 0300-1234567).',
      }
    ),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'PENDING_VERIFICATION',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'RETURNED',
  ]),
  comment: z
    .string()
    .min(3, 'Audit comment is mandatory for order status changes.')
    .trim(),
  restockInventory: z.boolean().optional().default(true),
});

export const orderFilterSchema = z.object({
  status: z
    .enum([
      'PENDING_VERIFICATION',
      'CONFIRMED',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
      'RETURNED',
    ])
    .optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type OrderTrackingSchemaInput = z.infer<typeof orderTrackingSchema>;
export type UpdateOrderStatusSchemaInput = z.infer<typeof updateOrderStatusSchema>;
export type OrderFilterSchemaInput = z.infer<typeof orderFilterSchema>;
