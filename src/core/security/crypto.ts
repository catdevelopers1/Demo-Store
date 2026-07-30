/**
 * Edge-compatible WebCrypto PBKDF2 password hashing & HMAC-SHA256 session token utilities.
 * Uses Web Standard APIs exclusively for Cloudflare Workers compatibility.
 */

export type UserRole = 'ADMIN' | 'CUSTOMER';

export interface SessionPayload {
  sub: string;
  email: string;
  role: UserRole;
  exp: number;
  iat: number;
}

// Internal hex encoding / decoding helpers
function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuffer(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error('Invalid hex string');
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// Base64URL encoding / decoding helpers
function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlToBytes(base64Url: string): Uint8Array {
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Hashes a plaintext password using PBKDF2 with HMAC-SHA256 (100,000 iterations).
 * Returns: "pbkdf2:sha256:100000:<saltHex>:<hashHex>"
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as unknown as ArrayBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  const saltHex = bufferToHex(salt.buffer);
  const hashHex = bufferToHex(derivedBits);
  return `pbkdf2:sha256:100000:${saltHex}:${hashHex}`;
}

/**
 * Verifies a plaintext password against a stored PBKDF2 hash using constant-time comparison.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split(':');
  if (parts.length !== 5 || parts[0] !== 'pbkdf2' || parts[1] !== 'sha256') {
    return false;
  }

  const iterations = parseInt(parts[2]!, 10);
  const saltHex = parts[3]!;
  const expectedHashHex = parts[4]!;

  const salt = hexToBuffer(saltHex);
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as unknown as ArrayBuffer,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  const computedHashHex = bufferToHex(derivedBits);

  // Constant-time string comparison to prevent timing attacks
  if (computedHashHex.length !== expectedHashHex.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < computedHashHex.length; i++) {
    diff |= computedHashHex.charCodeAt(i) ^ expectedHashHex.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Signs a session payload using HMAC-SHA256 WebCrypto.
 * Format: "<base64UrlPayload>.<base64UrlSignature>"
 */
export async function signSessionToken(
  payload: SessionPayload,
  secretKey: string
): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secretKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const serializedPayload = JSON.stringify(payload);
  const payloadBytes = enc.encode(serializedPayload);
  const payloadBase64 = bytesToBase64Url(payloadBytes);

  const signatureBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(payloadBase64));
  const signatureBytes = new Uint8Array(signatureBuffer);
  const signatureBase64 = bytesToBase64Url(signatureBytes);

  return `${payloadBase64}.${signatureBase64}`;
}

/**
 * Verifies and decodes an HMAC-SHA256 signed session token.
 * Returns null if signature is invalid or token is expired.
 */
export async function verifySessionToken(
  token: string,
  secretKey: string
): Promise<SessionPayload | null> {
  const parts = token.split('.');
  if (parts.length !== 2) {
    return null;
  }

  const payloadBase64 = parts[0]!;
  const signatureBase64 = parts[1]!;

  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secretKey),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureBytes = base64UrlToBytes(signatureBase64);
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes as unknown as ArrayBuffer,
      enc.encode(payloadBase64)
    );

    if (!isValid) {
      return null;
    }

    const payloadBytes = base64UrlToBytes(payloadBase64);
    const payloadJson = new TextDecoder().decode(payloadBytes);
    const payload = JSON.parse(payloadJson) as SessionPayload;

    // Check expiration timestamp (in seconds)
    const nowSec = Math.floor(Date.now() / 1000);
    if (payload.exp < nowSec) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Serializes an HttpOnly, Secure, SameSite=Strict cookie for Edge session storage.
 */
export function serializeSessionCookie(
  token: string,
  maxAgeSeconds = 604800,
  isSecure = true
): string {
  const secureFlag = isSecure ? '; Secure' : '';
  return `auth_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAgeSeconds}${secureFlag}`;
}

/**
 * Generates an expired cookie header to clear a user session.
 */
export function clearSessionCookie(isSecure = true): string {
  const secureFlag = isSecure ? '; Secure' : '';
  return `auth_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secureFlag}`;
}

/**
 * Parses the "auth_session" value from a standard Cookie HTTP header string.
 */
export function parseSessionCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'auth_session' && value) {
      return decodeURIComponent(value);
    }
  }
  return null;
}
