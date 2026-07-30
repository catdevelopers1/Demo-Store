import { type Env } from '../../../core/db';
import {
  createSuccessResponse,
  createErrorResponse,
  handleZodError,
} from '../../../core/api';
import {
  hashPassword,
  verifyPassword,
  signSessionToken,
  serializeSessionCookie,
  clearSessionCookie,
  verifyTurnstileToken,
  getEffectiveAuthSecret,
  getAuthenticatedUser,
} from '../../../core/security';
import { registerSchema, loginSchema } from '../validation';
import {
  findUserByEmail,
  checkUserExists,
  createUser,
} from '../db/userRepository';
import { ZodError } from 'zod';

function generateUserId(): string {
  const randomBytes = crypto.getRandomValues(new Uint8Array(8));
  const hex = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `usr_${Date.now()}_${hex}`;
}

/**
 * POST /api/v1/auth/register
 * Registers a new Customer or Admin account with Turnstile challenge
 */
export async function handleRegister(request: Request, env: Env): Promise<Response> {
  try {
    const rawBody = await request.json();
    const input = registerSchema.parse(rawBody);

    // Verify Turnstile challenge if provided or required in production
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

    // Check for duplicate email or phone number
    const existing = await checkUserExists(env, input.email, input.phone);
    if (existing.exists) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        `The provided ${existing.field} is already registered on another account.`,
        [{ field: existing.field, issue: 'Already registered' }],
        400
      );
    }

    // Hash password & create record
    const passwordHash = await hashPassword(input.password);
    const userId = generateUserId();
    const user = await createUser(env, {
      id: userId,
      email: input.email,
      phone: input.phone,
      passwordHash,
      role: input.role,
    });

    // Generate session token & cookie
    const nowSec = Math.floor(Date.now() / 1000);
    const maxAgeSeconds = 604800; // 7 days
    const secret = getEffectiveAuthSecret(env);
    const token = await signSessionToken(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        iat: nowSec,
        exp: nowSec + maxAgeSeconds,
      },
      secret
    );

    const cookieHeader = serializeSessionCookie(
      token,
      maxAgeSeconds,
      env.ENVIRONMENT === 'production'
    );

    const response = createSuccessResponse(user, {}, 201);
    response.headers.set('Set-Cookie', cookieHeader);
    return response;
  } catch (err) {
    if (err instanceof ZodError) {
      return handleZodError(err);
    }
    throw err;
  }
}

/**
 * POST /api/v1/auth/login
 * Authenticates user and issues signed HttpOnly session cookie
 */
export async function handleLogin(request: Request, env: Env): Promise<Response> {
  try {
    const rawBody = await request.json();
    const input = loginSchema.parse(rawBody);

    if (input.turnstileToken) {
      const isHuman = await verifyTurnstileToken(input.turnstileToken, env);
      if (!isHuman) {
        return createErrorResponse(
          'FORBIDDEN',
          'Turnstile bot verification challenge failed.',
          undefined,
          403
        );
      }
    }

    const userRecord = await findUserByEmail(env, input.email);
    if (!userRecord || !userRecord.is_active) {
      return createErrorResponse(
        'UNAUTHORIZED',
        'Invalid email or password. Please verify your credentials.',
        undefined,
        401
      );
    }

    const isValidPassword = await verifyPassword(input.password, userRecord.password_hash);
    if (!isValidPassword) {
      return createErrorResponse(
        'UNAUTHORIZED',
        'Invalid email or password. Please verify your credentials.',
        undefined,
        401
      );
    }

    const userProfile = {
      id: userRecord.id,
      email: userRecord.email,
      phone: userRecord.phone,
      role: userRecord.role,
      isActive: Boolean(userRecord.is_active),
      createdAt: userRecord.created_at,
    };

    const nowSec = Math.floor(Date.now() / 1000);
    const maxAgeSeconds = 604800; // 7 days
    const secret = getEffectiveAuthSecret(env);
    const token = await signSessionToken(
      {
        sub: userProfile.id,
        email: userProfile.email,
        role: userProfile.role,
        iat: nowSec,
        exp: nowSec + maxAgeSeconds,
      },
      secret
    );

    const cookieHeader = serializeSessionCookie(
      token,
      maxAgeSeconds,
      env.ENVIRONMENT === 'production'
    );

    const response = createSuccessResponse(userProfile, {}, 200);
    response.headers.set('Set-Cookie', cookieHeader);
    return response;
  } catch (err) {
    if (err instanceof ZodError) {
      return handleZodError(err);
    }
    throw err;
  }
}

/**
 * POST /api/v1/auth/logout
 * Clears the session cookie
 */
export async function handleLogout(env: Env): Promise<Response> {
  const cookieHeader = clearSessionCookie(env.ENVIRONMENT === 'production');
  const response = createSuccessResponse({ loggedOut: true }, {}, 200);
  response.headers.set('Set-Cookie', cookieHeader);
  return response;
}

/**
 * GET /api/v1/auth/session
 * Returns current authenticated user session claims
 */
export async function handleGetSession(request: Request, env: Env): Promise<Response> {
  const user = await getAuthenticatedUser(request, env);
  if (!user) {
    return createErrorResponse(
      'UNAUTHORIZED',
      'No active session found.',
      undefined,
      401
    );
  }

  return createSuccessResponse({
    authenticated: true,
    user,
  });
}
