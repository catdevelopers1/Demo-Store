import { type Env } from '../../../core/db';
import {
  createSuccessResponse,
  handleZodError,
} from '../../../core/api';
import { requireRole } from '../../../core/security/auth';
import { updateSettingsSchema } from '../validation';
import { getStoreSettings, updateStoreSettings } from '../db/settingsRepository';
import { ZodError } from 'zod';

/**
 * GET /api/v1/settings
 * Retrieves store branding, colors & COD rules (cached in KV)
 */
export async function handleGetSettings(env: Env): Promise<Response> {
  const settings = await getStoreSettings(env);
  const response = createSuccessResponse(settings, {}, 200);

  // Set edge Cache-Control headers for high-speed storefront delivery
  response.headers.set(
    'Cache-Control',
    'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
  );
  return response;
}

/**
 * PUT /api/v1/admin/settings
 * Updates store configuration in D1 and invalidates/refreshes KV cache (Requires ADMIN role)
 */
export async function handleUpdateSettings(request: Request, env: Env): Promise<Response> {
  // Enforce Role-Based Access Control (RBAC) -> ADMIN required
  const authResult = await requireRole(request, env, 'ADMIN');
  if ('errorResponse' in authResult) {
    return authResult.errorResponse;
  }

  try {
    const rawBody = await request.json();
    const validatedInput = updateSettingsSchema.parse(rawBody);

    const updated = await updateStoreSettings(env, validatedInput);
    return createSuccessResponse(updated, {}, 200);
  } catch (err) {
    if (err instanceof ZodError) {
      return handleZodError(err);
    }
    throw err;
  }
}
