import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../../src/features/authentication';
import { SettingsProvider } from '../../src/features/settings';
import {
  CategoryProvider,
  CategoryNavbarMenu,
  CategoryGrid,
  AdminCategoryManager,
} from '../../src/features/categories';

describe('Milestone 3 Storefront Category & Taxonomy E2E Test', () => {
  it('renders the Category Navbar Menu with All Collections fallback', async () => {
    render(
      <AuthProvider>
        <SettingsProvider>
          <CategoryProvider>
            <MemoryRouter initialEntries={['/']}>
              <CategoryNavbarMenu />
            </MemoryRouter>
          </CategoryProvider>
        </SettingsProvider>
      </AuthProvider>
    );

    const allCollectionsLink = await screen.findByText(/All Collections/i);
    expect(allCollectionsLink).toBeDefined();
  });

  it('renders the Category Grid with Pakistani Fashion Collections heading', async () => {
    render(
      <AuthProvider>
        <SettingsProvider>
          <CategoryProvider>
            <MemoryRouter initialEntries={['/categories']}>
              <CategoryGrid />
            </MemoryRouter>
          </CategoryProvider>
        </SettingsProvider>
      </AuthProvider>
    );

    const heading = screen.getByRole('heading', { name: /Pakistani Fashion Collections/i });
    expect(heading).toBeDefined();
  });

  it('renders the Admin Category Manager with cycle-detection warning and collection form', async () => {
    render(
      <AuthProvider>
        <SettingsProvider>
          <CategoryProvider>
            <MemoryRouter initialEntries={['/admin/categories']}>
              <Routes>
                <Route path="/admin/categories" element={<AdminCategoryManager />} />
              </Routes>
            </MemoryRouter>
          </CategoryProvider>
        </SettingsProvider>
      </AuthProvider>
    );

    const heading = screen.getByRole('heading', {
      name: /Category & Taxonomy Management/i,
    });
    expect(heading).toBeDefined();

    const parentLabel = await screen.findByText(/Parent Category \(Hierarchy\)/i);
    expect(parentLabel).toBeDefined();

    const cycleNotice = await screen.findByText(
      /Cycle Detection Algorithm active/i
    );
    expect(cycleNotice).toBeDefined();
  });
});
