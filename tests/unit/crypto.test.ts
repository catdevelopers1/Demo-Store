import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  signSessionToken,
  verifySessionToken,
  serializeSessionCookie,
  clearSessionCookie,
  parseSessionCookie,
} from '../../src/core/security/crypto';

describe('WebCrypto PBKDF2 Password Hashing', () => {
  it('hashes a plaintext password and verifies it successfully', async () => {
    const password = 'SuperSecretPakistanPassword123!';
    const hash = await hashPassword(password);

    expect(hash).toContain('pbkdf2:sha256:100000:');
    const isMatch = await verifyPassword(password, hash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await verifyPassword('WrongPassword123!', hash);
    expect(isWrongMatch).toBe(false);
  });
});

describe('WebCrypto HMAC-SHA256 Session Token Signing', () => {
  const secretKey = 'test_secret_key_for_hmac_sha256_signing_64_bytes_000000000000000';

  it('signs and verifies a valid session token', async () => {
    const payload = {
      sub: 'usr_123',
      email: 'customer@lahore.pk',
      role: 'CUSTOMER' as const,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    };

    const token = await signSessionToken(payload, secretKey);
    expect(token).toContain('.');

    const verified = await verifySessionToken(token, secretKey);
    expect(verified).not.toBeNull();
    expect(verified?.sub).toBe('usr_123');
    expect(verified?.email).toBe('customer@lahore.pk');
    expect(verified?.role).toBe('CUSTOMER');
  });

  it('returns null when verifying a token with an incorrect secret key', async () => {
    const payload = {
      sub: 'usr_123',
      email: 'customer@lahore.pk',
      role: 'CUSTOMER' as const,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    };

    const token = await signSessionToken(payload, secretKey);
    const verified = await verifySessionToken(token, 'different_wrong_secret_key_0000000000000000');
    expect(verified).toBeNull();
  });

  it('returns null for an expired session token', async () => {
    const payload = {
      sub: 'usr_expired',
      email: 'expired@lahore.pk',
      role: 'CUSTOMER' as const,
      iat: Math.floor(Date.now() / 1000) - 7200,
      exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
    };

    const token = await signSessionToken(payload, secretKey);
    const verified = await verifySessionToken(token, secretKey);
    expect(verified).toBeNull();
  });
});

describe('Cookie Parsing & Serialization', () => {
  it('serializes a standard HttpOnly session cookie', () => {
    const cookie = serializeSessionCookie('token_abc_123', 3600, true);
    expect(cookie).toContain('auth_session=token_abc_123;');
    expect(cookie).toContain('HttpOnly;');
    expect(cookie).toContain('SameSite=Strict;');
    expect(cookie).toContain('Max-Age=3600;');
    expect(cookie).toContain('Secure');
  });

  it('generates a clear session cookie string', () => {
    const clearCookie = clearSessionCookie(true);
    expect(clearCookie).toContain('auth_session=;');
    expect(clearCookie).toContain('Max-Age=0');
  });

  it('parses auth_session from an HTTP Cookie header string', () => {
    const header = 'theme=dark; auth_session=my_session_token_123; tracking=on';
    const parsed = parseSessionCookie(header);
    expect(parsed).toBe('my_session_token_123');
  });
});
