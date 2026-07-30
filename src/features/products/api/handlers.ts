import { type Env } from '../../../core/db';
import {
  createSuccessResponse,
  createErrorResponse,
  handleZodError,
} from '../../../core/api';
import { requireRole } from '../../../core/security/auth';
import { createProductSchema } from '../validation';
import {
  getProducts,
  getProductBySlug,
  createProductWithVariants,
} from '../db/productRepository';
import { ZodError } from 'zod';

/**
 * GET /api/v1/products
 * Retrieves a filtered list of clothing products
 */
export async function handleGetProducts(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const categorySlug = url.searchParams.get('category') ?? undefined;
  const search = url.searchParams.get('q') ?? undefined;
  const minPriceStr = url.searchParams.get('minPrice');
  const maxPriceStr = url.searchParams.get('maxPrice');

  const minPrice = minPriceStr ? Number(minPriceStr) : undefined;
  const maxPrice = maxPriceStr ? Number(maxPriceStr) : undefined;

  const products = await getProducts(env, {
    categorySlug,
    search,
    minPrice,
    maxPrice,
  });

  const response = createSuccessResponse(products, { total: products.length }, 200);
  response.headers.set(
    'Cache-Control',
    'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
  );
  return response;
}

/**
 * GET /api/v1/products/:slug
 * Retrieves a single clothing product with all options, values & SKUs
 */
export async function handleGetProductBySlug(env: Env, slug: string): Promise<Response> {
  const product = await getProductBySlug(env, slug);
  if (!product) {
    return createErrorResponse(
      'NOT_FOUND',
      `Product with slug '${slug}' was not found in the catalog.`,
      undefined,
      404
    );
  }

  const response = createSuccessResponse(product, {}, 200);
  response.headers.set(
    'Cache-Control',
    'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
  );
  return response;
}

/**
 * POST /api/v1/admin/products
 * Creates a product with all options and SKUs in an atomic D1 batch transaction (Requires ADMIN role claim)
 */
export async function handleCreateProduct(request: Request, env: Env): Promise<Response> {
  const authResult = await requireRole(request, env, 'ADMIN');
  if ('errorResponse' in authResult) {
    return authResult.errorResponse;
  }

  try {
    const rawBody = await request.json();
    const validatedInput = createProductSchema.parse(rawBody);

    const result = await createProductWithVariants(env, validatedInput);
    if ('error' in result) {
      return createErrorResponse('VALIDATION_ERROR', result.error, undefined, 400);
    }

    return createSuccessResponse(result.product, {}, 201);
  } catch (err) {
    if (err instanceof ZodError) {
      return handleZodError(err);
    }
    throw err;
  }
}
