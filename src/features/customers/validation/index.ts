import { z } from 'zod';
import { PAKISTAN_PHONE_REGEX } from '../../authentication/validation';
import { PAKISTAN_PROVINCES } from '../utils/pakistanLocations';

export const PAKISTAN_POSTAL_REGEX = /^[0-9]{5}$/;

export const addressSchema = z.object({
  recipientName: z.string().min(2, 'Recipient name is required'),
  phone: z
    .string()
    .regex(
      PAKISTAN_PHONE_REGEX,
      'Must be a valid Pakistani mobile number (e.g. 0300-1234567 or 03001234567)'
    ),
  provinceState: z.enum(PAKISTAN_PROVINCES, {
    message: 'Province must be a valid Pakistani administrative province',
  }),
  city: z.string().min(2, 'City is required'),
  streetAddress: z
    .string()
    .min(5, 'Detailed street/house address is required for Cash on Delivery (COD) shipping'),
  postalCode: z
    .string()
    .regex(PAKISTAN_POSTAL_REGEX, 'Must be a 5-digit Pakistani postal code (e.g. 54660)')
    .optional()
    .nullable(),
  isDefault: z.boolean().default(false),
});

export const updateAddressSchema = addressSchema.partial();

export type CreateAddressInput = z.infer<typeof addressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
