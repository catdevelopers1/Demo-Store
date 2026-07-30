import { type Env } from '../../../core/db';
import {
  createSuccessResponse,
  createErrorResponse,
  handleZodError,
} from '../../../core/api';
import { requireRole } from '../../../core/security/auth';
import { createCategorySchema, updateCategorySchema } from '../validation';
import {
  getAllCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../db/categoryRepository';
import { buildCategoryTree } from '../utils';
import { ZodError } from 'zod';

/**
 * GET /api/v1/categories
 * Optional Query Param: ?tree=true (returns nested CategoryNode[] hierarchy)
 */
export async function handleGetCategories(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const wantTree = url.searchParams.get('tree') === 'true';

  const flatList = await getAllCategories(env);
  const data = wantTree ? buildCategoryTree(flatList) : flatList;

  const response = createSuccessResponse(data, { total: flatList.length }, 200);
  response.headers.set(
    'Cache-Control',
    'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
  );
  return response;
}

/**
 * GET /api/v1/categories/:slug
 * Retrieves a single category by slug
 */
export async function handleGetCategoryBySlug(env: Env, slug: string): Promise<Response> {
  const category = await getCategoryBySlug(env, slug);
  if (!category) {
    return createErrorResponse(
      'NOT_FOUND',
      `Category with slug '${slug}' was not found.`,
      undefined,
      404
    );
  }

  const response = createSuccessResponse(category, {}, 200);
  response.headers.set(
    'Cache-Control',
    'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
  );
  return response;
}

/**
 * POST /api/v1/admin/categories
 * Creates a new collection category (Requires ADMIN role claim)
 */
export async function handleCreateCategory(request: Request, env: Env): Promise<Response> {
  const authResult = await requireRole(request, env, 'ADMIN');
  if ('errorResponse' in authResult) {
    return authResult.errorResponse;
  }

  try {
    const rawBody = await request.json();
    const validatedInput = createCategorySchema.parse(rawBody);

    const result = await createCategory(env, validatedInput);
    if ('error' in result) {
      return createErrorResponse('VALIDATION_ERROR', result.error, undefined, 400);
    }

    return createSuccessResponse(result.category, {}, 201);
  } catch (err) {
    if (err instanceof ZodError) {
      return handleZodError(err);
    }
    throw err;
  }
}

/**
 * PUT /api/v1/admin/categories/:id
 * Updates category details and enforces cycle detection (Requires ADMIN role claim)
 */
export async function handleUpdateCategory(
  request: Request,
  env: Env,
  id: string
): Promise<Response> {
  const authResult = await requireRole(request, env, 'ADMIN');
  if ('errorResponse' in authResult) {
    return authResult.errorResponse;
  }

  try {
    const rawBody = await request.json();
    const validatedInput = updateCategorySchema.parse(rawBody);

    const result = await updateCategory(env, id, validatedInput);
    if ('error' in result) {
      return createErrorResponse('VALIDATION_ERROR', result.error, undefined, 400);
    }

    return createSuccessResponse(result.category, {}, 200);
  } catch (err) {
    if (err instanceof ZodError) {
      return handleZodError(err);
    }
    throw err;
  }
}

/**
 * DELETE /api/v1/admin/categories/:id
 * Deletes category and sets child parent_id to null (Requires ADMIN role claim)
 */
export async function handleDeleteCategory(
  request: Request,
  env: Env,
  id: string
): Promise<Response> {
  const authResult = await requireRole(request, env, 'ADMIN');
  if ('errorResponse' in authResult) {
    return authResult.errorResponse;
  }

  const result = await deleteCategory(env, id);
  if ('error' in result) {
    return createErrorResponse('NOT_FOUND', result.error, undefined, 404);
  }

  return createSuccessResponse({ deleted: true, id }, {}, 200);
}
