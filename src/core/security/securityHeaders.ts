/**
 * Attaches enterprise-grade HTTP security headers to Edge Worker responses
 */
export function attachSecurityHeaders(response: Response): Response {
  const newHeaders = new Headers(response.headers);

  newHeaders.set('X-Content-Type-Options', 'nosniff');
  newHeaders.set('X-Frame-Options', 'DENY');
  newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  newHeaders.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  newHeaders.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  newHeaders.set(
    'Content-Security-Policy',
    "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval'; frame-src 'self' https://challenges.cloudflare.com; connect-src 'self' https:"
  );

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
