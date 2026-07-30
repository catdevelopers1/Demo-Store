import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../../src/features/authentication';
import { SettingsProvider } from '../../src/features/settings';
import { CategoryProvider } from '../../src/features/categories';
import { ProductsProvider } from '../../src/features/products';
import { InventoryProvider } from '../../src/features/inventory';
import {
  CustomerProvider,
  CustomerAccountDashboard,
} from '../../src/features/customers';

describe('Milestone 7 Storefront Pakistani Address Book E2E Test', () => {
  it('renders the Customer Account Dashboard with Address Book tab and Add Address action', async () => {
    render(
      <AuthProvider>
        <SettingsProvider>
          <CategoryProvider>
            <ProductsProvider>
              <InventoryProvider>
                <CustomerProvider>
                  <MemoryRouter initialEntries={['/account']}>
                    <Routes>
                      <Route path="/account" element={<CustomerAccountDashboard />} />
                    </Routes>
                  </MemoryRouter>
                </CustomerProvider>
              </InventoryProvider>
            </ProductsProvider>
          </CategoryProvider>
        </SettingsProvider>
      </AuthProvider>
    );

    const heading = screen.getByRole('heading', {
      name: /Pakistani Customer Dashboard/i,
    });
    expect(heading).toBeDefined();

    const addAddressBtn = await screen.findByText(/Add Pakistani Address/i);
    expect(addAddressBtn).toBeDefined();

    const addressBookHeading = await screen.findByText(/Saved Pakistani Shipping Addresses/i);
    expect(addressBookHeading).toBeDefined();
  });
});
