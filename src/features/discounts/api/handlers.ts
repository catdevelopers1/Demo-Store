import { type Env } from '../../../core/db';
import {
  createSuccessResponse,
  createErrorResponse,
  handleZodError,
} from '../../../core/api';
import { requireRole } from '../../../core/security/auth';
import {
  validateCouponSchema,
  createDiscountSchema,
  updateDiscountSchema,
} from '../validation';
import {
  getDiscountByCode,
  getAllDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount,
} from '../db/discountRepository';
import { evaluateDiscount } from '../utils/calculator';
import { ZodError } from 'zod';

/**
 * POST /api/v1/discounts/validate
 * Evaluates a promotional coupon code against an order subtotal in PKR
 */
export async function handleValidateCoupon(request: Request, env: Env): Promise<Response> {
  try {
    const rawBody = await request.json();
    const input = validateCouponSchema.parse(rawBody);

    const discount = await getDiscountByCode(env, input.code);
    if (!discount) {
      return createErrorResponse(
        'NOT_FOUND',
        `Promo code '${input.code}' was not found.`,
        undefined,
        404
      );
    }

    const evaluation = evaluateDiscount(discount, input.subtotalPkr);
    if (!evaluation.isValid) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        evaluation.error ?? 'Coupon is not valid for this order.',
        undefined,
        400
      );
    }

    return createSuccessResponse(evaluation, {}, 200);
  } catch (err) {
    if (err instanceof ZodError) {
      return handleZodError(err);
    }
    throw err;
  }
}

/**
 * GET /api/v1/admin/discounts
 * Retrieves all promo codes (Requires ADMIN role claim)
 */
export async function handleGetDiscounts(request: Request, env: Env): Promise<Response> {
  const authResult = await requireRole(request, env, 'ADMIN');
  if ('errorResponse' in authResult) {
    return authResult.errorResponse;
  }

  const discounts = await getAllDiscounts(env);
  return createSuccessResponse(discounts, { total: discounts.length }, 200);
}

/**
 * POST /api/v1/admin/discounts
 * Creates a new promotional code (Requires ADMIN role claim)
 */
export async function handleCreateDiscount(request: Request, env: Env): Promise<Response> {
  const authResult = await requireRole(request, env, 'ADMIN');
  if ('errorResponse' in authResult) {
    return authResult.errorResponse;
  }

  try {
    const rawBody = await request.json();
    const validatedInput = createDiscountSchema.parse(rawBody);

    const result = await createDiscount(env, validatedInput);
    if ('error' in result) {
      return createErrorResponse('VALIDATION_ERROR', result.error, undefined, 400);
    }

    return createSuccessResponse(result.discount, {}, 201);
  } catch (err) {
    if (err instanceof ZodError) {
      return handleZodError(err);
    }
    throw err;
  }
}

/**
 * PUT /api/v1/admin/discounts/:id
 * Updates promo code details (Requires ADMIN role claim)
 */
export async function handleUpdateDiscount(
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
    const validatedInput = updateDiscountSchema.parse(rawBody);

    const result = await updateDiscount(env, id, validatedInput);
    if ('error' in result) {
      return createErrorResponse('NOT_FOUND', result.error, undefined, 404);
    }

    return createSuccessResponse(result.discount, {}, 200);
  } catch (err) {
    if (err instanceof ZodError) {
      return handleZodError(err);
    }
    throw err;
  }
}

/**
 * DELETE /api/v1/admin/discounts/:id
 * Deletes a promo code (Requires ADMIN role claim)
 */
export async function handleDeleteDiscount(
  request: Request,
  env: Env,
  id: string
): Promise<Response> {
  const authResult = await requireRole(request, env, 'ADMIN');
  if ('errorResponse' in authResult) {
    return authResult.errorResponse;
  }

  const result = await deleteDiscount(env, id);
  if ('error' in result) {
    return createErrorResponse('NOT_FOUND', result.error, undefined, 404);
  }

  return createSuccessResponse({ deleted: true, id }, {}, 200);
}
