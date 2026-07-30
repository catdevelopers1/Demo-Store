import { z } from 'zod';

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Category Name must be at least 2 characters long'),
  slug: z
    .string()
    .regex(
      SLUG_REGEX,
      'Slug must contain only lowercase letters, numbers, and hyphens (e.g., unstitched-lawn)'
    )
    .optional(),
  description: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
  imageR2Key: z.string().nullable().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
