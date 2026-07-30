import worker from '../../src/worker/index';
import type { Env } from '../../src/core/db';
import type { ExecutionContext } from '@cloudflare/workers-types';

interface PagesContext {
  request: Request;
  env: Env;
  waitUntil: (promise: Promise<unknown>) => void;
  next: () => Promise<Response>;
  data: Record<string, unknown>;
}

/**
 * Cloudflare Pages catch-all Edge API handler (/api/*)
 * Routes all storefront and admin REST requests to the core Edge Worker
 */
export async function onRequest(context: PagesContext): Promise<Response> {
  return worker.fetch(
    context.request,
    context.env,
    context as unknown as ExecutionContext
  );
}
