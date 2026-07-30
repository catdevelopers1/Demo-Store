import { type Env } from '../../../core/db';
import {
  createSuccessResponse,
  createErrorResponse,
  handleZodError,
} from '../../../core/api';
import { requireAuth } from '../../../core/security/auth';
import { addressSchema, updateAddressSchema } from '../validation';
import {
  getCustomerProfileWithAddresses,
  getCustomerAddresses,
  createCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
} from '../db/customerRepository';
import { ZodError } from 'zod';

/**
 * GET /api/v1/customer/profile
 * Retrieves authenticated customer profile and default shipping address
 */
export async function handleGetProfile(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if ('errorResponse' in authResult) {
    return authResult.errorResponse;
  }

  const profile = await getCustomerProfileWithAddresses(env, authResult.user.id);
  if (!profile) {
    return createErrorResponse('NOT_FOUND', 'Customer profile record was not found.', undefined, 404);
  }

  return createSuccessResponse(profile, {}, 200);
}

/**
 * GET /api/v1/customer/addresses
 * Retrieves saved Pakistani shipping addresses for authenticated customer
 */
export async function handleGetAddresses(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if ('errorResponse' in authResult) {
    return authResult.errorResponse;
  }

  const addresses = await getCustomerAddresses(env, authResult.user.id);
  return createSuccessResponse(addresses, { total: addresses.length }, 200);
}

/**
 * POST /api/v1/customer/addresses
 * Adds a new Pakistani shipping address to customer address book
 */
export async function handleCreateAddress(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if ('errorResponse' in authResult) {
    return authResult.errorResponse;
  }

  try {
    const rawBody = await request.json();
    const validatedInput = addressSchema.parse(rawBody);

    const address = await createCustomerAddress(env, authResult.user.id, validatedInput);
    return createSuccessResponse(address, {}, 201);
  } catch (err) {
    if (err instanceof ZodError) {
      return handleZodError(err);
    }
    throw err;
  }
}

/**
 * PUT /api/v1/customer/addresses/:id
 * Updates an existing shipping address and toggles default address status
 */
export async function handleUpdateAddress(
  request: Request,
  env: Env,
  addressId: string
): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if ('errorResponse' in authResult) {
    return authResult.errorResponse;
  }

  try {
    const rawBody = await request.json();
    const validatedInput = updateAddressSchema.parse(rawBody);

    const result = await updateCustomerAddress(env, authResult.user.id, addressId, validatedInput);
    if ('error' in result) {
      return createErrorResponse('NOT_FOUND', result.error, undefined, 404);
    }

    return createSuccessResponse(result.address, {}, 200);
  } catch (err) {
    if (err instanceof ZodError) {
      return handleZodError(err);
    }
    throw err;
  }
}

/**
 * DELETE /api/v1/customer/addresses/:id
 * Deletes address from address book and promotes remaining address to default
 */
export async function handleDeleteAddress(
  request: Request,
  env: Env,
  addressId: string
): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if ('errorResponse' in authResult) {
    return authResult.errorResponse;
  }

  const result = await deleteCustomerAddress(env, authResult.user.id, addressId);
  if ('error' in result) {
    return createErrorResponse('NOT_FOUND', result.error, undefined, 404);
  }

  return createSuccessResponse(result, {}, 200);
}
