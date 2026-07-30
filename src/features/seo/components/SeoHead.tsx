import React, { useEffect } from 'react';
import type { SeoMetadata } from '../types';

function updateMetaTag(nameOrProperty: string, content: string, isProperty = false) {
  const selector = isProperty
    ? `meta[property="${nameOrProperty}"]`
    : `meta[name="${nameOrProperty}"]`;
  let element = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    if (isProperty) {
      element.setAttribute('property', nameOrProperty);
    } else {
      element.setAttribute('name', nameOrProperty);
    }
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function updateCanonicalLink(url: string) {
  let element = document.head.querySelector(
    'link[rel="canonical"]'
  ) as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', url);
}

function updateJsonLd(schemaData: Record<string, unknown>) {
  let element = document.head.querySelector(
    'script#seo-jsonld'
  ) as HTMLScriptElement | null;
  if (!element) {
    element = document.createElement('script');
    element.setAttribute('type', 'application/ld+json');
    element.setAttribute('id', 'seo-jsonld');
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify(schemaData);
}

/**
 * Dynamic Edge SEO metadata component that synchronizes title, meta tags, and structured JSON-LD
 */
export const SeoHead: React.FC<SeoMetadata> = ({
  title,
  description,
  canonicalUrl,
  ogImage,
  ogType = 'website',
  jsonLd,
}) => {
  useEffect(() => {
    if (title) {
      document.title = title;
      updateMetaTag('og:title', title, true);
    }
    if (description) {
      updateMetaTag('description', description);
      updateMetaTag('og:description', description, true);
    }
    if (ogImage) {
      updateMetaTag('og:image', ogImage, true);
    }
    updateMetaTag('og:type', ogType, true);

    if (canonicalUrl) {
      updateCanonicalLink(canonicalUrl);
    }

    if (jsonLd) {
      updateJsonLd(jsonLd);
    }
  }, [title, description, canonicalUrl, ogImage, ogType, jsonLd]);

  return null;
};
