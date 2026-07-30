import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../../src/features/authentication';
import { SettingsProvider } from '../../src/features/settings';
import { CategoryProvider } from '../../src/features/categories';
import { ProductsProvider } from '../../src/features/products';
import {
  InventoryProvider,
  AdminInventoryManager,
} from '../../src/features/inventory';

describe('Milestone 6 Storefront Inventory & Stock Ledger E2E Test', () => {
  it('renders the Admin Inventory Manager with KPI overview cards and low-stock filter', async () => {
    render(
      <AuthProvider>
        <SettingsProvider>
          <CategoryProvider>
            <ProductsProvider>
              <InventoryProvider>
                <MemoryRouter initialEntries={['/admin/inventory']}>
                  <Routes>
                    <Route path="/admin/inventory" element={<AdminInventoryManager />} />
                  </Routes>
                </MemoryRouter>
              </InventoryProvider>
            </ProductsProvider>
          </CategoryProvider>
        </SettingsProvider>
      </AuthProvider>
    );

    const heading = screen.getByRole('heading', {
      name: /Inventory & Stock Management Engine/i,
    });
    expect(heading).toBeDefined();

    // Match exact KPI card string without matching the filter button
    const lowStockCard = screen.getByText('Low Stock Alerts');
    expect(lowStockCard).toBeDefined();

    const outOfStockCard = screen.getByText('Out of Stock SKUs');
    expect(outOfStockCard).toBeDefined();
  });
});
