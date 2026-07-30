import { type Env } from '../../../core/db';
import {
  createSuccessResponse,
  handleZodError,
} from '../../../core/api';
import { validateCartSchema } from '../validation';
import { validateCartItems } from '../db/cartRepository';
import { ZodError } from 'zod';

/**
 * POST /api/v1/cart/validate
 * Validates cart SKU item availability & calculates server-side PKR prices
 */
export async function handleValidateCart(request: Request, env: Env): Promise<Response> {
  try {
    const rawBody = await request.json();
    const input = validateCartSchema.parse(rawBody);

    const result = await validateCartItems(env, input.items);
    return createSuccessResponse(result, {}, 200);
  } catch (err) {
    if (err instanceof ZodError) {
      return handleZodError(err);
    }
    throw err;
  }
}
