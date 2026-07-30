import { z } from 'zod';

export const searchQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.number().int().min(0).optional(),
  maxPrice: z.number().int().min(0).optional(),
  sort: z.enum(['relevance', 'price_asc', 'price_desc', 'newest']).default('relevance'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(12),
});

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
