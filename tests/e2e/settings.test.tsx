import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../../src/features/authentication';
import { SettingsProvider, AdminSettingsEditor } from '../../src/features/settings';

describe('Milestone 2 Storefront Settings & Branding E2E Test', () => {
  it('renders the Admin Settings Editor with all customizable brand and COD fields', async () => {
    render(
      <AuthProvider>
        <SettingsProvider>
          <MemoryRouter initialEntries={['/admin/settings']}>
            <Routes>
              <Route path="/admin/settings" element={<AdminSettingsEditor />} />
            </Routes>
          </MemoryRouter>
        </SettingsProvider>
      </AuthProvider>
    );

    const heading = screen.getByRole('heading', {
      name: /Store Settings & Branding Management/i,
    });
    expect(heading).toBeDefined();

    const brandNameLabel = await screen.findByText(/Brand Name \(Navbar & Footer Title\)/i);
    expect(brandNameLabel).toBeDefined();

    const codShippingLabel = await screen.findByText(/Standard COD Shipping Base Rate \(PKR\)/i);
    expect(codShippingLabel).toBeDefined();

    const freeShippingThresholdLabel = await screen.findByText(
      /Free COD Shipping Order Threshold \(PKR\)/i
    );
    expect(freeShippingThresholdLabel).toBeDefined();

    const supportPhoneLabel = await screen.findByText(/Customer Support Phone \(PK format\)/i);
    expect(supportPhoneLabel).toBeDefined();
  });
});
