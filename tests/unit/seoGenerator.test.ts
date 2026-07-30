import { describe, it, expect, vi } from 'vitest';
import {
  generateRobotsTxt,
  generateSitemapXml,
} from '../../src/features/seo/utils/generator';
import { attachSecurityHeaders } from '../../src/core/security/securityHeaders';
import type { Env } from '../../src/core/db';
import type { D1Database } from '@cloudflare/workers-types';

describe('Edge SEO Sitemap & Robots.txt Generator Unit Tests', () => {
  it('generates robots.txt with sitemap reference and protected route rules', () => {
    const robots = generateRobotsTxt('https://pakistani-commerce.edge.app');
    expect(robots).toContain('User-agent: *');
    expect(robots).toContain('Disallow: /admin');
    expect(robots).toContain('Disallow: /checkout');
    expect(robots).toContain('Allow: /api/v1/products');
    expect(robots).toContain(
      'Sitemap: https://pakistani-commerce.edge.app/sitemap.xml'
    );
  });

  it('generates complete XML sitemap with dynamic D1 category and product URLs', async () => {
    const mockCategories = [
      { slug: 'lawn-suits-2026', updated_at: '2026-07-30T10:00:00Z' },
    ];
    const mockProducts = [
      {
        slug: 'gul-e-bahar-lawn-3-piece',
        updated_at: '2026-07-30T11:00:00Z',
      },
    ];

    const mockQuery = vi.fn().mockImplementation((sql: string) => {
      if (sql.includes('FROM categories')) {
        return Promise.resolve({ results: mockCategories });
      }
      if (sql.includes('FROM products')) {
        return Promise.resolve({ results: mockProducts });
      }
      return Promise.resolve({ results: [] });
    });

    const mockPrepare = vi.fn().mockImplementation((sql: string) => ({
      bind: (..._args: unknown[]) => ({
        all: () => mockQuery(sql),
      }),
    }));

    const env = {
      DB: {
        prepare: mockPrepare,
      } as unknown as D1Database,
    } as unknown as Env;

    const xml = await generateSitemapXml(
      env,
      'https://pakistani-commerce.edge.app'
    );

    expect(xml).toContain(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    );
    expect(xml).toContain('<loc>https://pakistani-commerce.edge.app/</loc>');
    expect(xml).toContain(
      '<loc>https://pakistani-commerce.edge.app/search?category=lawn-suits-2026</loc>'
    );
    expect(xml).toContain(
      '<loc>https://pakistani-commerce.edge.app/product/gul-e-bahar-lawn-3-piece</loc>'
    );
    expect(xml).toContain('<priority>1.0</priority>');
    expect(xml).toContain('<priority>0.9</priority>');
  });

  it('returns core static routes if D1 database query fails during build', async () => {
    const env = {} as unknown as Env;
    const xml = await generateSitemapXml(
      env,
      'https://pakistani-commerce.edge.app'
    );

    expect(xml).toContain('<loc>https://pakistani-commerce.edge.app/</loc>');
    expect(xml).toContain('<loc>https://pakistani-commerce.edge.app/search</loc>');
    expect(xml).toContain('<loc>https://pakistani-commerce.edge.app/track-order</loc>');
  });
});

describe('Enterprise HTTP Security Headers Middleware', () => {
  it('attaches all 6 mandatory HTTP security hardening headers to Edge responses', () => {
    const rawResponse = new Response('{"success":true}', {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    const secureResponse = attachSecurityHeaders(rawResponse);

    expect(secureResponse.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(secureResponse.headers.get('X-Frame-Options')).toBe('DENY');
    expect(secureResponse.headers.get('Referrer-Policy')).toBe(
      'strict-origin-when-cross-origin'
    );
    expect(secureResponse.headers.get('Permissions-Policy')).toBe(
      'camera=(), microphone=(), geolocation=()'
    );
    expect(secureResponse.headers.get('Strict-Transport-Security')).toContain(
      'max-age=31536000'
    );
    expect(secureResponse.headers.get('Content-Security-Policy')).toContain(
      "frame-src 'self' https://challenges.cloudflare.com"
    );
  });
});
