import { z } from 'zod';

/**
 * Pakistani Mobile Number Regex pattern supporting formats:
 * 0300-1234567, 03001234567, +923001234567, 923001234567, 3001234567
 */
export const PAKISTAN_PHONE_REGEX = /^(\+92|0|92)?3[0-9]{2}-?[0-9]{7}$/;

export const registerSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  phone: z
    .string()
    .regex(
      PAKISTAN_PHONE_REGEX,
      'Please provide a valid Pakistani mobile number (e.g., 03001234567 or +923001234567)'
    )
    .optional(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  role: z.enum(['ADMIN', 'CUSTOMER']).default('CUSTOMER'),
  turnstileToken: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
  turnstileToken: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
