import { z } from 'zod';
import { cartItemInputSchema } from '../../cart/validation';
import { addressSchema } from '../../customers/validation';
import { PAKISTAN_PHONE_REGEX } from '../../authentication/validation';

export const codCheckoutSchema = z.object({
  items: z
    .array(cartItemInputSchema)
    .min(1, 'Your shopping bag is empty. Add at least 1 item to checkout.'),
  couponCode: z.string().nullable().optional(),
  shippingAddress: addressSchema,
  guestPhone: z
    .string()
    .regex(
      PAKISTAN_PHONE_REGEX,
      'Must be a valid Pakistani mobile number (e.g. 0300-1234567 or 03001234567)'
    )
    .optional(),
  guestEmail: z.string().email('Please provide a valid email address').optional(),
  notes: z.string().nullable().optional(),
  turnstileToken: z.string().optional(),
});

export type CodCheckoutInput = z.infer<typeof codCheckoutSchema>;
