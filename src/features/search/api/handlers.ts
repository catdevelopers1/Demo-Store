import { type Env } from '../../../core/db';
import {
  createSuccessResponse,
  handleZodError,
} from '../../../core/api';
import { searchQuerySchema } from '../validation';
import { searchProducts } from '../db/searchRepository';
import { ZodError } from 'zod';
import type { SearchSortOrder } from '../types';

/**
 * GET /api/v1/search
 * Keyword search across catalog items via D1 FTS5 with category & price filtering
 */
export async function handleSearchProducts(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get('q') ?? undefined;
    const category = url.searchParams.get('category') ?? undefined;
    const minPriceStr = url.searchParams.get('minPrice');
    const maxPriceStr = url.searchParams.get('maxPrice');
    const sort = (url.searchParams.get('sort') as SearchSortOrder) ?? 'relevance';
    const pageStr = url.searchParams.get('page');
    const limitStr = url.searchParams.get('limit');

    const input = searchQuerySchema.parse({
      q,
      category,
      minPrice: minPriceStr ? Number(minPriceStr) : undefined,
      maxPrice: maxPriceStr ? Number(maxPriceStr) : undefined,
      sort,
      page: pageStr ? Number(pageStr) : 1,
      limit: limitStr ? Number(limitStr) : 12,
    });

    const result = await searchProducts(env, input);
    const response = createSuccessResponse(
      result.products,
      {
        page: result.meta.page,
        limit: result.meta.limit,
        total: result.meta.total,
      },
      200
    );

    response.headers.set(
      'Cache-Control',
      'public, max-age=30, s-maxage=120, stale-while-revalidate=300'
    );
    return response;
  } catch (err) {
    if (err instanceof ZodError) {
      return handleZodError(err);
    }
    throw err;
  }
}
