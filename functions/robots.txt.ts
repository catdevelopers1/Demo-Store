import { handleGetRobotsTxt } from '../src/features/seo/api/handlers';
import type { Env } from '../src/core/db';

interface PagesContext {
  request: Request;
  env: Env;
}

/**
 * Cloudflare Pages dynamic robots.txt Edge handler
 */
export async function onRequest(context: PagesContext): Promise<Response> {
  return handleGetRobotsTxt(context.request, context.env);
}
