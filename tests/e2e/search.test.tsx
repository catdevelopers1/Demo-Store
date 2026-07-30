import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../../src/features/authentication';
import { SettingsProvider } from '../../src/features/settings';
import { CategoryProvider } from '../../src/features/categories';
import { ProductsProvider } from '../../src/features/products';
import { InventoryProvider } from '../../src/features/inventory';
import { CustomerProvider } from '../../src/features/customers';
import {
  SearchProvider,
  CatalogDiscoveryPage,
} from '../../src/features/search';

describe('Milestone 8 Storefront Product Discovery & FTS5 Search E2E Test', () => {
  it('renders the Catalog Discovery Page with search bar, category pills, and sort dropdown', async () => {
    render(
      <AuthProvider>
        <CustomerProvider>
          <SettingsProvider>
            <CategoryProvider>
              <ProductsProvider>
                <InventoryProvider>
                  <SearchProvider>
                    <MemoryRouter initialEntries={['/search']}>
                      <Routes>
                        <Route path="/search" element={<CatalogDiscoveryPage />} />
                      </Routes>
                    </MemoryRouter>
                  </SearchProvider>
                </InventoryProvider>
              </ProductsProvider>
            </CategoryProvider>
          </SettingsProvider>
        </CustomerProvider>
      </AuthProvider>
    );

    const heading = screen.getByRole('heading', {
      name: /Storefront Product Discovery/i,
    });
    expect(heading).toBeDefined();

    const allCollectionsBtn = await screen.findByText(/All Collections/i);
    expect(allCollectionsBtn).toBeDefined();

    const priceFilterLabel = await screen.findByText(/Price Filter \(PKR\):/i);
    expect(priceFilterLabel).toBeDefined();

    const sortDropdown = screen.getByLabelText('Sort products');
    expect(sortDropdown).toBeDefined();
  });
});
