import { z } from 'zod';

export const cartItemInputSchema = z.object({
  variantId: z.string().min(1, 'Variant ID is required'),
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1')
    .max(100, 'Maximum 100 items per SKU per order'),
});

export const validateCartSchema = z.object({
  items: z.array(cartItemInputSchema).default([]),
});

export type CartItemInputPayload = z.infer<typeof cartItemInputSchema>;
export type ValidateCartInput = z.infer<typeof validateCartSchema>;
