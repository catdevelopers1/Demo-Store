import { type Env } from '../../../core/db';
import {
  createSuccessResponse,
  createErrorResponse,
  handleZodError,
} from '../../../core/api';
import { requireRole } from '../../../core/security/auth';
import { adjustStockSchema } from '../validation';
import {
  getInventoryLedger,
  getInventoryLogs,
  adjustStockManual,
  getPublicVariantStock,
} from '../db/inventoryRepository';
import { ZodError } from 'zod';

/**
 * GET /api/v1/admin/inventory
 * Retrieves stock ledger across all SKU variants (Requires ADMIN role claim)
 */
export async function handleGetInventory(request: Request, env: Env): Promise<Response> {
  const authResult = await requireRole(request, env, 'ADMIN');
  if ('errorResponse' in authResult) {
    return authResult.errorResponse;
  }

  const url = new URL(request.url);
  const lowStockOnly = url.searchParams.get('lowStock') === 'true';
  const search = url.searchParams.get('q') ?? undefined;

  const items = await getInventoryLedger(env, { lowStockOnly, search });
  return createSuccessResponse(items, { total: items.length }, 200);
}

/**
 * GET /api/v1/admin/inventory/:variantId/logs
 * Retrieves audit log trail for a specific SKU variant (Requires ADMIN role claim)
 */
export async function handleGetInventoryLogs(
  request: Request,
  env: Env,
  variantId: string
): Promise<Response> {
  const authResult = await requireRole(request, env, 'ADMIN');
  if ('errorResponse' in authResult) {
    return authResult.errorResponse;
  }

  const logs = await getInventoryLogs(env, variantId);
  return createSuccessResponse(logs, { total: logs.length }, 200);
}

/**
 * PATCH /api/v1/admin/inventory/:variantId
 * Manually adjusts available stock in atomic D1 batch transaction (Requires ADMIN role claim)
 */
export async function handleAdjustInventory(
  request: Request,
  env: Env,
  variantId: string
): Promise<Response> {
  const authResult = await requireRole(request, env, 'ADMIN');
  if ('errorResponse' in authResult) {
    return authResult.errorResponse;
  }

  try {
    const rawBody = await request.json();
    const validatedInput = adjustStockSchema.parse(rawBody);

    const result = await adjustStockManual(env, variantId, validatedInput);
    if ('error' in result) {
      return createErrorResponse('VALIDATION_ERROR', result.error, undefined, 400);
    }

    return createSuccessResponse(result, {}, 200);
  } catch (err) {
    if (err instanceof ZodError) {
      return handleZodError(err);
    }
    throw err;
  }
}

/**
 * GET /api/v1/inventory/check?variantId=<id>
 * Public storefront endpoint returning stock availability status for SKU variants
 */
export async function handleCheckStock(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const variantId = url.searchParams.get('variantId');

  if (!variantId) {
    return createErrorResponse('VALIDATION_ERROR', 'variantId query parameter is required.', undefined, 400);
  }

  const status = await getPublicVariantStock(env, variantId);
  if (!status) {
    return createErrorResponse('NOT_FOUND', `Variant '${variantId}' was not found.`, undefined, 404);
  }

  return createSuccessResponse(status, {}, 200);
}
