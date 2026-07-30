import { type Env } from '../../../core/db';
import {
  createSuccessResponse,
  createErrorResponse,
  handleZodError,
} from '../../../core/api';
import { requireRole } from '../../../core/security/auth';
import {
  orderTrackingSchema,
  updateOrderStatusSchema,
  orderFilterSchema,
} from '../validation';
import {
  getOrderByNumberAndPhone,
  getAdminOrders,
  updateOrderStatus,
} from '../db/orderRepository';
import { ZodError } from 'zod';

/**
 * GET /api/v1/orders/track?orderNumber=#PK-XXXXX&phone=03XX...
 * Public Customer/Guest tracking endpoint with mobile number verification
 */
export async function handleTrackOrder(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const orderNumberParam = url.searchParams.get('orderNumber') ?? '';
    const phoneParam = url.searchParams.get('phone') ?? '';

    const input = orderTrackingSchema.parse({
      orderNumber: orderNumberParam,
      phone: phoneParam,
    });

    const order = await getOrderByNumberAndPhone(
      env,
      input.orderNumber,
      input.phone
    );

    if (!order) {
      return createErrorResponse(
        'NOT_FOUND',
        'No COD order found matching this order number and mobile number.',
        undefined,
        404
      );
    }

    return createSuccessResponse(order, {}, 200);
  } catch (err) {
    if (err instanceof ZodError) {
      return handleZodError(err);
    }
    throw err;
  }
}

/**
 * GET /api/v1/admin/orders
 * Admin RBAC protected endpoint supporting status, search, and pagination filters
 */
export async function handleGetAdminOrders(request: Request, env: Env): Promise<Response> {
  try {
    const authResult = await requireRole(request, env, 'ADMIN');
    if ('errorResponse' in authResult) {
      return authResult.errorResponse;
    }

    const url = new URL(request.url);
    const statusParam = url.searchParams.get('status') ?? undefined;
    const searchParam = url.searchParams.get('search') ?? undefined;
    const pageParam = url.searchParams.get('page') ?? '1';
    const limitParam = url.searchParams.get('limit') ?? '20';

    const filters = orderFilterSchema.parse({
      status: statusParam,
      search: searchParam,
      page: pageParam,
      limit: limitParam,
    });

    const result = await getAdminOrders(env, filters);

    return createSuccessResponse(
      result.orders,
      {
        page: result.page,
        limit: result.limit,
        total: result.total,
      },
      200
    );
  } catch (err) {
    if (err instanceof ZodError) {
      return handleZodError(err);
    }
    throw err;
  }
}

/**
 * PATCH /api/v1/admin/orders/:id/status
 * Admin RBAC protected endpoint that updates order status and writes an immutable timeline audit record
 */
export async function handleUpdateOrderStatus(
  request: Request,
  env: Env,
  orderId: string
): Promise<Response> {
  try {
    const authResult = await requireRole(request, env, 'ADMIN');
    if ('errorResponse' in authResult) {
      return authResult.errorResponse;
    }

    const rawBody = await request.json();
    const input = updateOrderStatusSchema.parse(rawBody);

    const updatedOrder = await updateOrderStatus(
      env,
      orderId,
      input,
      authResult.user.id
    );

    return createSuccessResponse(updatedOrder, {}, 200);
  } catch (err) {
    if (err instanceof ZodError) {
      return handleZodError(err);
    }
    if (err instanceof Error) {
      return createErrorResponse('VALIDATION_ERROR', err.message, undefined, 400);
    }
    throw err;
  }
}
