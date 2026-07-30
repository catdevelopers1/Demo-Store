import type { Env } from '../db';
import { defaultLogger } from '../api/logger';

export interface TurnstileVerificationResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
}

/**
 * Validates a Cloudflare Turnstile token on the Edge Worker
 */
export async function verifyTurnstileToken(
  token: string,
  env: Env,
  remoteIp?: string
): Promise<boolean> {
  const secretKey = env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    defaultLogger.warn('TURNSTILE_SECRET_KEY is not set. Skipping verification in dev environment.');
    return env.ENVIRONMENT === 'development';
  }

  try {
    const formData = new FormData();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      return false;
    }

    const result = (await response.json()) as TurnstileVerificationResponse;
    return Boolean(result.success);
  } catch (err) {
    defaultLogger.error('Turnstile verification request failed', {
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}
