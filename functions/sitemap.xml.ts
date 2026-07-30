import { handleGetSitemapXml } from '../src/features/seo/api/handlers';
import type { Env } from '../src/core/db';

interface PagesContext {
  request: Request;
  env: Env;
}

/**
 * Cloudflare Pages dynamic sitemap.xml Edge handler
 */
export async function onRequest(context: PagesContext): Promise<Response> {
  return handleGetSitemapXml(context.request, context.env);
}
