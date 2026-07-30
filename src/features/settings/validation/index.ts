import { z } from 'zod';
import { PAKISTAN_PHONE_REGEX } from '../../authentication/validation';

export const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

export const updateSettingsSchema = z.object({
  brandName: z.string().min(2, 'Brand Name must be at least 2 characters long'),
  brandTagline: z.string().min(2, 'Brand Tagline is required'),
  supportPhonePk: z
    .string()
    .regex(
      PAKISTAN_PHONE_REGEX,
      'Support phone must be a valid Pakistani mobile number (e.g., 0300-1234567 or +923001234567)'
    ),
  whatsappPk: z
    .string()
    .regex(
      PAKISTAN_PHONE_REGEX,
      'WhatsApp number must be a valid Pakistani mobile number (e.g., 0300-1234567 or +923001234567)'
    ),
  primaryColorHex: z
    .string()
    .regex(HEX_COLOR_REGEX, 'Primary color must be a valid 6-character hex code (e.g., #065f46)'),
  secondaryColorHex: z
    .string()
    .regex(HEX_COLOR_REGEX, 'Secondary color must be a valid 6-character hex code (e.g., #047857)'),
  codShippingBasePkr: z
    .number()
    .int('COD Shipping Base Rate must be an integer amount in PKR')
    .min(0, 'Shipping rate cannot be negative'),
  freeShippingThresholdPkr: z
    .number()
    .int('Free Shipping Threshold must be an integer amount in PKR')
    .min(0, 'Threshold cannot be negative'),
  seoTitle: z.string().min(5, 'SEO Title must be at least 5 characters long'),
  seoDescription: z.string().min(10, 'SEO Description must be at least 10 characters long'),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
