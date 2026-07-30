import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/dom';
import { SeoHead } from '../../src/features/seo/components/SeoHead';

describe('Milestone 14 Storefront SEO & Structured Data E2E Test', () => {
  it('injects title, description, canonical link, and JSON-LD schema into document.head', async () => {
    render(
      <SeoHead
        title="Pakistani Apparel Commerce — Lawn & Khaddar"
        description="Shop unstitched Pakistani fashion with COD and fast FTS5 catalog search."
        canonicalUrl="https://pakistani-commerce.edge.app/"
        ogType="website"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Pakistani Apparel Commerce',
        }}
      />
    );

    expect(document.title).toBe('Pakistani Apparel Commerce — Lawn & Khaddar');

    const descMeta = document.head.querySelector('meta[name="description"]');
    expect(descMeta?.getAttribute('content')).toContain('unstitched Pakistani fashion');

    const canonical = document.head.querySelector('link[rel="canonical"]');
    expect(canonical?.getAttribute('href')).toBe(
      'https://pakistani-commerce.edge.app/'
    );

    const jsonLdScript = document.head.querySelector('script#seo-jsonld');
    expect(jsonLdScript).not.toBeNull();
    expect(jsonLdScript?.textContent).toContain('"@type":"WebSite"');
    expect(jsonLdScript?.textContent).toContain('Pakistani Apparel Commerce');
  });
});
