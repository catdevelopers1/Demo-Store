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
import { DiscountProvider } from '../../src/features/discounts';
import { CartProvider } from '../../src/features/cart';
import {
  CodCheckoutPage,
  OrderConfirmationPage,
} from '../../src/features/checkout';

describe('Milestone 11 Storefront Cash on Delivery (COD) Checkout E2E Test', () => {
  it('renders empty checkout fallback when no cart items exist', async () => {
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
                        <MemoryRouter initialEntries={['/checkout']}>
                          <Routes>
                            <Route path="/checkout" element={<CodCheckoutPage />} />
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
      name: /Your Shopping Bag is Empty/i,
    });
    expect(heading).toBeDefined();
  });

  it('renders Order Confirmation Page loading state', async () => {
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
                        <MemoryRouter initialEntries={['/order-confirmation/%23PK-10001']}>
                          <Routes>
                            <Route
                              path="/order-confirmation/:orderNumber"
                              element={<OrderConfirmationPage />}
                            />
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

    const loadingText = await screen.findByText(/Retrieving Cash on Delivery order confirmation/i);
    expect(loadingText).toBeDefined();
  });
});
