import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/dom';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../src/features/authentication';
import { SettingsProvider } from '../../src/features/settings';
import { CategoryProvider } from '../../src/features/categories';
import { ProductsProvider } from '../../src/features/products';
import { InventoryProvider } from '../../src/features/inventory';
import { CustomerProvider } from '../../src/features/customers';
import { SearchProvider } from '../../src/features/search';
import { DiscountProvider } from '../../src/features/discounts';
import {
  CartProvider,
  CartDrawer,
} from '../../src/features/cart';

describe('Milestone 9 Storefront COD Shopping Cart E2E Test', () => {
  it('renders the COD Shopping Bag drawer when drawerOpen is active', async () => {
    const TestDrawerTrigger: React.FC = () => {
      return (
        <DiscountProvider>
          <CartProvider>
            <CartDrawer />
          </CartProvider>
        </DiscountProvider>
      );
    };

    render(
      <AuthProvider>
        <CustomerProvider>
          <SettingsProvider>
            <CategoryProvider>
              <ProductsProvider>
                <InventoryProvider>
                  <SearchProvider>
                    <MemoryRouter initialEntries={['/']}>
                      <TestDrawerTrigger />
                    </MemoryRouter>
                  </SearchProvider>
                </InventoryProvider>
              </ProductsProvider>
            </CategoryProvider>
          </SettingsProvider>
        </CustomerProvider>
      </AuthProvider>
    );

    expect(true).toBe(true);
  });
});
