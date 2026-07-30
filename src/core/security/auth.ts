import type { Env } from '../db';
import { getDb } from '../db';
import {
  verifySessionToken,
  parseSessionCookie,
  type SessionPayload,
  type UserRole,
} from './crypto';
import { createErrorResponse } from '../api/response';
import { defaultLogger } from '../api/logger';

export interface AuthenticatedUser {
  id: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  isActive: boolean;
}

const DEFAULT_DEV_SECRET = 'dev_secret_key_change_in_prod_64_bytes_00000000000000000000000000';

/**
 * Returns the effective HMAC secret key from env or fallback for local dev
 */
export function getEffectiveAuthSecret(env: Env): string {
  if (env.AUTH_JWT_SECRET) {
    return env.AUTH_JWT_SECRET;
  }
  if (env.ENVIRONMENT === 'production') {
    defaultLogger.error('AUTH_JWT_SECRET is missing in production environment');
  }
  return DEFAULT_DEV_SECRET;
}

/**
 * Extracts the raw session token from the Request Cookie header or Authorization Bearer header
 */
export function extractTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie');
  const cookieToken = parseSessionCookie(cookieHeader);
  if (cookieToken) {
    return cookieToken;
  }

  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  return null;
}

/**
 * Validates session token and returns the current user from D1 database.
 * Returns null if unauthenticated or inactive.
 */
export async function getAuthenticatedUser(
  request: Request,
  env: Env
): Promise<AuthenticatedUser | null> {
  const token = extractTokenFromRequest(request);
  if (!token) {
    return null;
  }

  const secret = getEffectiveAuthSecret(env);
  const payload: SessionPayload | null = await verifySessionToken(token, secret);
  if (!payload) {
    return null;
  }

  try {
    const db = getDb(env);
    const row = await db.first<{
      id: string;
      email: string;
      phone?: string | null;
      role: UserRole;
      is_active: number;
    }>(
      'SELECT id, email, phone, role, is_active FROM users WHERE id = ? AND is_active = 1',
      [payload.sub]
    );

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      email: row.email,
      phone: row.phone,
      role: row.role,
      isActive: Boolean(row.is_active),
    };
  } catch (err) {
    defaultLogger.error('Database query failed in getAuthenticatedUser', {
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

/**
 * Middleware: Requires a valid authenticated session.
 * Returns null if authorized, or a 401 Unauthorized Response if not.
 */
export async function requireAuth(
  request: Request,
  env: Env
): Promise<{ user: AuthenticatedUser } | { errorResponse: Response }> {
  const user = await getAuthenticatedUser(request, env);
  if (!user) {
    return {
      errorResponse: createErrorResponse(
        'UNAUTHORIZED',
        'Authentication required. Please log in to access this endpoint.',
        undefined,
        401
      ),
    };
  }

  return { user };
}

/**
 * Middleware: Requires a valid authenticated session with specific Role-Based Access Control (RBAC).
 */
export async function requireRole(
  request: Request,
  env: Env,
  requiredRole: UserRole
): Promise<{ user: AuthenticatedUser } | { errorResponse: Response }> {
  const authResult = await requireAuth(request, env);
  if ('errorResponse' in authResult) {
    return authResult;
  }

  if (authResult.user.role !== requiredRole) {
    return {
      errorResponse: createErrorResponse(
        'FORBIDDEN',
        `Access denied. Required role '${requiredRole}' was not present on your user account.`,
        undefined,
        403
      ),
    };
  }

  return authResult;
}
