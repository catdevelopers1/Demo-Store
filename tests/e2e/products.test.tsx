import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../../src/features/authentication';
import { SettingsProvider } from '../../src/features/settings';
import { CategoryProvider } from '../../src/features/categories';
import { ProductsProvider, ProductCatalogGrid, ProductDetailView, AdminProductWizard } from '../../src/features/products';
import { InventoryProvider } from '../../src/features/inventory';
import { CartProvider } from '../../src/features/cart';

describe('Milestone 4 Storefront Product Catalog & Variant Engine E2E Test', () => {
  it('renders the Product Catalog Grid with Pakistani Clothing Catalog heading', async () => {
    render(
      <AuthProvider>
        <SettingsProvider>
          <CategoryProvider>
            <ProductsProvider>
              <MemoryRouter initialEntries={['/products']}>
                <ProductCatalogGrid />
              </MemoryRouter>
            </ProductsProvider>
          </CategoryProvider>
        </SettingsProvider>
      </AuthProvider>
    );

    const heading = screen.getByRole('heading', { name: /Complete Catalog|Pakistani Clothing Catalog/i });
    expect(heading).toBeDefined();
  });

  it('renders the Product Detail View with fallback loading state for D1 hydration', async () => {
    render(
      <AuthProvider>
        <SettingsProvider>
          <CategoryProvider>
            <ProductsProvider>
              <InventoryProvider>
                <CartProvider>
                  <MemoryRouter initialEntries={['/product/gul-e-bahar-unstitched-lawn-3-piece']}>
                    <Routes>
                      <Route path="/product/:slug" element={<ProductDetailView />} />
                    </Routes>
                  </MemoryRouter>
                </CartProvider>
              </InventoryProvider>
            </ProductsProvider>
          </CategoryProvider>
        </SettingsProvider>
      </AuthProvider>
    );

    const loadingText = await screen.findByText(/Loading product details from Cloudflare D1/i);
    expect(loadingText).toBeDefined();
  });

  it('renders the Admin Product Wizard with Cartesian SKU Matrix Generator button', async () => {
    render(
      <AuthProvider>
        <SettingsProvider>
          <CategoryProvider>
            <ProductsProvider>
              <MemoryRouter initialEntries={['/admin/products']}>
                <Routes>
                  <Route path="/admin/products" element={<AdminProductWizard />} />
                </Routes>
              </MemoryRouter>
            </ProductsProvider>
          </CategoryProvider>
        </SettingsProvider>
      </AuthProvider>
    );

    const heading = screen.getByRole('heading', {
      name: /Create Product & SKU Matrix/i,
    });
    expect(heading).toBeDefined();

    const matrixButton = await screen.findByText(/Generate SKU Variant Matrix/i);
    expect(matrixButton).toBeDefined();

    const acidNotice = await screen.findByText(/100% ACID Atomic D1 Transaction/i);
    expect(acidNotice).toBeDefined();
  });
});
