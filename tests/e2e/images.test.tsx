import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../../src/features/authentication';
import { SettingsProvider } from '../../src/features/settings';
import { CategoryProvider } from '../../src/features/categories';
import {
  ProductsProvider,
  ProductImageGallery,
  AdminImageManager,
} from '../../src/features/products';

describe('Milestone 5 Storefront Lookbook & R2 Image Pipeline E2E Test', () => {
  it('renders the Product Image Gallery with R2 Lookbook fallback state', async () => {
    render(
      <AuthProvider>
        <SettingsProvider>
          <CategoryProvider>
            <ProductsProvider>
              <ProductImageGallery productId="prod_lawn_01" categoryName="3-Piece Lawn Suits" />
            </ProductsProvider>
          </CategoryProvider>
        </SettingsProvider>
      </AuthProvider>
    );

    const loadingText = await screen.findByText(/Loading Lookbook from Cloudflare R2/i);
    expect(loadingText).toBeDefined();
  });

  it('renders the Admin Image Manager with Cloudflare R2 Asset Pipeline heading and format limits', async () => {
    render(
      <AuthProvider>
        <SettingsProvider>
          <CategoryProvider>
            <ProductsProvider>
              <MemoryRouter initialEntries={['/admin/images']}>
                <Routes>
                  <Route path="/admin/images" element={<AdminImageManager />} />
                </Routes>
              </MemoryRouter>
            </ProductsProvider>
          </CategoryProvider>
        </SettingsProvider>
      </AuthProvider>
    );

    const heading = screen.getByRole('heading', {
      name: /R2 Product Image & Lookbook Manager/i,
    });
    expect(heading).toBeDefined();

    const formatNotice = await screen.findByText(/Formats: WebP, JPEG, PNG, AVIF \(Max 5 MB\)/i);
    expect(formatNotice).toBeDefined();

    const orphanNotice = await screen.findByText(/Orphan Defense Active/i);
    expect(orphanNotice).toBeDefined();
  });
});
