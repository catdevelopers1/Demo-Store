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
import { SearchProvider } from '../../src/features/search';
import { CartProvider } from '../../src/features/cart';
import {
  DiscountProvider,
  AdminDiscountManager,
} from '../../src/features/discounts';

describe('Milestone 10 Storefront & Admin Discount Coupon E2E Test', () => {
  it('renders the Admin Discount Manager with promo code creation form and safeguard notice', async () => {
    render(
      <AuthProvider>
        <CustomerProvider>
          <SettingsProvider>
            <CategoryProvider>
              <ProductsProvider>
                <InventoryProvider>
                  <SearchProvider>
                    <DiscountProvider>
                      <CartProvider>
                        <MemoryRouter initialEntries={['/admin/discounts']}>
                          <Routes>
                            <Route path="/admin/discounts" element={<AdminDiscountManager />} />
                          </Routes>
                        </MemoryRouter>
                      </CartProvider>
                    </DiscountProvider>
                  </SearchProvider>
                </InventoryProvider>
              </ProductsProvider>
            </CategoryProvider>
          </SettingsProvider>
        </CustomerProvider>
      </AuthProvider>
    );

    const heading = screen.getByRole('heading', {
      name: /Discount Code & Coupon Manager/i,
    });
    expect(heading).toBeDefined();

    const codeInput = await screen.findByText(/Promo Code \* \(e\.g\. AZADI14\)/i);
    expect(codeInput).toBeDefined();

    const safeguardNotice = await screen.findByText(/Discount Engine Safeguard/i);
    expect(safeguardNotice).toBeDefined();
  });
});
