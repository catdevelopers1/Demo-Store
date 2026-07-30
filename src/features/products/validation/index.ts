import { z } from 'zod';
import { SLUG_REGEX } from '../../categories/validation';

const baseCreateProductSchema = z.object({
  name: z.string().min(2, 'Product Name must be at least 2 characters long'),
  slug: z
    .string()
    .regex(
      SLUG_REGEX,
      'Slug must contain only lowercase letters, numbers, and hyphens (e.g., lawn-suit)'
    )
    .optional(),
  description: z.string().nullable().optional(),
  basePricePkr: z
    .number()
    .int('Base price must be a whole PKR amount')
    .min(0, 'Price cannot be negative'),
  categoryId: z.string().nullable().optional(),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  options: z
    .array(
      z.object({
        name: z.string().min(1, 'Option name is required (e.g., Size)'),
        values: z.array(z.string().min(1)).min(1, 'At least one option value is required'),
      })
    )
    .default([]),
  variants: z
    .array(
      z.object({
        sku: z.string().min(2, 'SKU must be at least 2 characters long'),
        priceOverridePkr: z.number().int().min(0).nullable().optional(),
        optionValues: z.array(z.string()),
      })
    )
    .default([]),
});

export const createProductSchema = baseCreateProductSchema.refine(
  (data) => {
    const skus = data.variants.map((v) => v.sku.toUpperCase());
    return new Set(skus).size === skus.length;
  },
  {
    message: 'Duplicate SKUs detected inside variant list. Each SKU must be unique.',
    path: ['variants'],
  }
);

export const updateProductSchema = baseCreateProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
