import { type Env } from '../../../core/db';
import {
  createSuccessResponse,
  handleZodError,
} from '../../../core/api';
import { requireRole } from '../../../core/security/auth';
import { analyticsQuerySchema } from '../validation';
import { getAnalyticsOverview } from '../db/analyticsRepository';
import { ZodError } from 'zod';

/**
 * GET /api/v1/admin/analytics/overview?timeframe=30d
 * Admin RBAC protected endpoint returning executive Pakistani e-commerce metrics in <20ms
 */
export async function handleGetAnalyticsOverview(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    const authResult = await requireRole(request, env, 'ADMIN');
    if ('errorResponse' in authResult) {
      return authResult.errorResponse;
    }

    const url = new URL(request.url);
    const timeframeParam = url.searchParams.get('timeframe') ?? undefined;

    const input = analyticsQuerySchema.parse({
      timeframe: timeframeParam,
    });

    const overview = await getAnalyticsOverview(env, input.timeframe);

    return createSuccessResponse(overview, {}, 200);
  } catch (err) {
    if (err instanceof ZodError) {
      return handleZodError(err);
    }
    throw err;
  }
}
