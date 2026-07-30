import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../../src/features/authentication';
import { SettingsProvider } from '../../src/features/settings';
import {
  OrderTrackingPage,
  AdminOrderManager,
} from '../../src/features/orders';

describe('Milestone 12 Order Lifecycle Management & Audit Timeline E2E Test', () => {
  it('renders the Storefront COD Order Tracking Page with mobile number verification form and quick demo links', async () => {
    render(
      <AuthProvider>
        <SettingsProvider>
          <MemoryRouter initialEntries={['/track-order']}>
            <OrderTrackingPage />
          </MemoryRouter>
        </SettingsProvider>
      </AuthProvider>
    );

    const heading = screen.getByRole('heading', {
      name: /Pakistani COD Order Tracker/i,
    });
    expect(heading).toBeDefined();

    const orderNumInput = screen.getByLabelText(/Order Number/i);
    expect(orderNumInput).toBeDefined();

    const phoneInput = screen.getByLabelText(/Pakistani Mobile Number/i);
    expect(phoneInput).toBeDefined();

    const trackButton = screen.getByRole('button', {
      name: /Track COD Order/i,
    });
    expect(trackButton).toBeDefined();

    const demoLink = screen.getByText(/#PK-10001 \(Confirmed\)/i);
    expect(demoLink).toBeDefined();
  });

  it('renders the Admin Order Lifecycle Manager with Kanban board toggle and status filters', async () => {
    render(
      <AuthProvider>
        <SettingsProvider>
          <MemoryRouter initialEntries={['/admin/orders']}>
            <Routes>
              <Route path="/admin/orders" element={<AdminOrderManager />} />
            </Routes>
          </MemoryRouter>
        </SettingsProvider>
      </AuthProvider>
    );

    const heading = screen.getByRole('heading', {
      name: /Pakistani COD Order Lifecycle Manager/i,
    });
    expect(heading).toBeDefined();

    const tableButton = screen.getByText(/Table/i);
    expect(tableButton).toBeDefined();

    const kanbanButton = screen.getByText(/Kanban Board/i);
    expect(kanbanButton).toBeDefined();

    const filterDropdown = screen.getByRole('combobox');
    expect(filterDropdown).toBeDefined();

    const refreshButton = screen.getByText(/Refresh/i);
    expect(refreshButton).toBeDefined();
  });
});
