import { type Env } from '../../../core/db';
import { generateRobotsTxt, generateSitemapXml } from '../utils/generator';

/**
 * GET /robots.txt
 * Serves dynamic Edge robots.txt directives with sitemap link
 */
export async function handleGetRobotsTxt(
  request: Request,
  _env: Env
): Promise<Response> {
  const url = new URL(request.url);
  const content = generateRobotsTxt(url.origin);

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}

/**
 * GET /sitemap.xml
 * Serves dynamic XML sitemap generated from Cloudflare D1 categories and products
 */
export async function handleGetSitemapXml(
  request: Request,
  env: Env
): Promise<Response> {
  const url = new URL(request.url);
  const content = await generateSitemapXml(env, url.origin);

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
