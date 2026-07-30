import { describe, it, expect, vi } from 'vitest';
import {
  handleGetRobotsTxt,
  handleGetSitemapXml,
} from '../../src/features/seo/api/handlers';
import type { Env } from '../../src/core/db';
import type { D1Database } from '@cloudflare/workers-types';

describe('Edge SEO API Endpoints Integration Tests', () => {
  it('serves dynamic robots.txt with correct Content-Type and Cache-Control headers', async () => {
    const mockRequest = new Request('https://pakistani-commerce.edge.app/robots.txt');
    const response = await handleGetRobotsTxt(mockRequest, {} as unknown as Env);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('text/plain');
    expect(response.headers.get('Cache-Control')).toContain('max-age=86400');

    const bodyText = await response.text();
    expect(bodyText).toContain('User-agent: *');
    expect(bodyText).toContain(
      'Sitemap: https://pakistani-commerce.edge.app/sitemap.xml'
    );
  });

  it('serves dynamic XML sitemap with D1 category and product URLs', async () => {
    const mockCategories = [
      { slug: 'lawn-suits', updated_at: '2026-07-30T10:00:00Z' },
    ];
    const mockProducts = [
      { slug: 'gul-e-bahar-lawn', updated_at: '2026-07-30T11:00:00Z' },
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

    const mockRequest = new Request('https://pakistani-commerce.edge.app/sitemap.xml');
    const response = await handleGetSitemapXml(mockRequest, env);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('application/xml');
    expect(response.headers.get('Cache-Control')).toContain('max-age=3600');

    const xml = await response.text();
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain('<loc>https://pakistani-commerce.edge.app/search?category=lawn-suits</loc>');
    expect(xml).toContain('<loc>https://pakistani-commerce.edge.app/product/gul-e-bahar-lawn</loc>');
  });
});
