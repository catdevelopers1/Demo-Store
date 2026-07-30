import { getDb, type Env } from '../../../core/db';
import type { SitemapEntry } from '../types';

interface SlugRow {
  slug: string;
  updated_at: string | null;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates edge robots.txt directive string for Pakistani E-Commerce Storefront
 */
export function generateRobotsTxt(
  baseUrl = 'https://pakistani-commerce.edge.app'
): string {
  const cleanBase = baseUrl.replace(/\/$/, '');
  return `# Robots.txt for Reusable Pakistani Clothing Commerce Framework
User-agent: *
Allow: /
Allow: /categories
Allow: /products
Allow: /product/*
Allow: /search
Allow: /track-order

# Protect private checkout, admin, and customer account routes
Disallow: /admin
Disallow: /admin/*
Disallow: /account
Disallow: /account/*
Disallow: /checkout
Disallow: /api/*

# Allow public discovery API endpoints for search engine indexing
Allow: /api/v1/products
Allow: /api/v1/categories
Allow: /api/v1/search

Sitemap: ${cleanBase}/sitemap.xml
`;
}

/**
 * Generates complete dynamic XML sitemap from Cloudflare D1 categories and products
 */
export async function generateSitemapXml(
  env: Env,
  baseUrl = 'https://pakistani-commerce.edge.app'
): Promise<string> {
  const cleanBase = baseUrl.replace(/\/$/, '');
  const nowIso = new Date().toISOString();

  const entries: SitemapEntry[] = [
    {
      loc: `${cleanBase}/`,
      lastmod: nowIso,
      changefreq: 'daily',
      priority: 1.0,
    },
    {
      loc: `${cleanBase}/search`,
      lastmod: nowIso,
      changefreq: 'daily',
      priority: 0.9,
    },
    {
      loc: `${cleanBase}/categories`,
      lastmod: nowIso,
      changefreq: 'weekly',
      priority: 0.8,
    },
    {
      loc: `${cleanBase}/products`,
      lastmod: nowIso,
      changefreq: 'daily',
      priority: 0.8,
    },
    {
      loc: `${cleanBase}/track-order`,
      lastmod: nowIso,
      changefreq: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    const db = getDb(env);

    const [categoryRows, productRows] = await Promise.all([
      db.query<SlugRow>(
        'SELECT slug, updated_at FROM categories WHERE is_active = 1'
      ),
      db.query<SlugRow>(
        'SELECT slug, updated_at FROM products WHERE is_active = 1'
      ),
    ]);

    for (const cat of categoryRows.results) {
      entries.push({
        loc: `${cleanBase}/search?category=${encodeURIComponent(cat.slug)}`,
        lastmod: cat.updated_at ?? nowIso,
        changefreq: 'weekly',
        priority: 0.8,
      });
    }

    for (const prod of productRows.results) {
      entries.push({
        loc: `${cleanBase}/product/${encodeURIComponent(prod.slug)}`,
        lastmod: prod.updated_at ?? nowIso,
        changefreq: 'daily',
        priority: 0.9,
      });
    }
  } catch {
    // If D1 is unreachable or during static build, return core static routes
  }

  const urlElements = entries
    .map((e) => {
      const parts = [`    <loc>${escapeXml(e.loc)}</loc>`];
      if (e.lastmod) {
        parts.push(`    <lastmod>${e.lastmod}</lastmod>`);
      }
      if (e.changefreq) {
        parts.push(`    <changefreq>${e.changefreq}</changefreq>`);
      }
      if (e.priority !== undefined) {
        parts.push(`    <priority>${e.priority.toFixed(1)}</priority>`);
      }
      return `  <url>\n${parts.join('\n')}\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
}
