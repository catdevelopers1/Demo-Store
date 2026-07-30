import { type Env } from '../../../core/db';
import {
  createSuccessResponse,
  createErrorResponse,
  handleZodError,
} from '../../../core/api';
import { verifyTurnstileToken, getAuthenticatedUser } from '../../../core/security';
import { codCheckoutSchema } from '../validation';
import { executeCodCheckout, getOrderByNumber } from '../db/checkoutRepository';
import { ZodError } from 'zod';

/**
 * POST /api/v1/checkout/cod
 * Executes atomic Cash on Delivery (COD) checkout transaction with Turnstile challenge
 */
export async function handleCodCheckout(request: Request, env: Env): Promise<Response> {
  try {
    const rawBody = await request.json();
    const input = codCheckoutSchema.parse(rawBody);

    // Turnstile challenge verification
    if (env.ENVIRONMENT === 'production' && !input.turnstileToken) {
      return createErrorResponse(
        'FORBIDDEN',
        'Turnstile bot verification challenge token is required.',
        undefined,
        403
      );
    }
    if (input.turnstileToken) {
      const isHuman = await verifyTurnstileToken(input.turnstileToken, env);
      if (!isHuman) {
        return createErrorResponse(
          'FORBIDDEN',
          'Turnstile bot verification challenge failed. Please try again.',
          undefined,
          403
        );
      }
    }

    // Check optional authenticated user
    const user = await getAuthenticatedUser(request, env);

    const result = await executeCodCheckout(env, input, user?.id);
    if ('error' in result) {
      return createErrorResponse('VALIDATION_ERROR', result.error, undefined, 400);
    }

    return createSuccessResponse(result.order, {}, 201);
  } catch (err) {
    if (err instanceof ZodError) {
      return handleZodError(err);
    }
    throw err;
  }
}

/**
 * GET /api/v1/orders/:orderNumber
 * Retrieves COD order details and timeline by executive order number (#PK-XXXXX)
 */
export async function handleGetOrderByNumber(
  env: Env,
  orderNumber: string
): Promise<Response> {
  const order = await getOrderByNumber(env, orderNumber);
  if (!order) {
    return createErrorResponse(
      'NOT_FOUND',
      `Order number '${orderNumber}' was not found.`,
      undefined,
      404
    );
  }

  return createSuccessResponse(order, {}, 200);
}
