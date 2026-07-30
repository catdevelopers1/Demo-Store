import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, LoginForm, RegisterForm, AdminGuard } from '../../src/features/authentication';
import { AdminView } from '../../src/app/Admin';

describe('Milestone 1 Storefront Auth E2E Test', () => {
  it('renders the Login Form with Pakistani COD benefits and Turnstile badge', async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginForm />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    const heading = screen.getByRole('heading', { name: /Sign in to your Account/i });
    expect(heading).toBeDefined();

    const codBadge = await screen.findByText(/Pakistani COD Account/i);
    expect(codBadge).toBeDefined();

    const turnstileNotice = await screen.findByText(/Protected by Cloudflare Turnstile Bot Defense/i);
    expect(turnstileNotice).toBeDefined();
  });

  it('renders the Registration Form with Pakistani Mobile Number field and RBAC selection', async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/register']}>
          <Routes>
            <Route path="/register" element={<RegisterForm />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    const heading = screen.getByRole('heading', { name: /Create your Account/i });
    expect(heading).toBeDefined();

    const mobileLabel = await screen.findByText(/Pakistani Mobile Number/i);
    expect(mobileLabel).toBeDefined();

    const rbacLabel = await screen.findByText(/Account Type \(RBAC Selection\)/i);
    expect(rbacLabel).toBeDefined();
  });

  it('redirects an unauthenticated user attempting to access protected Admin view', async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <AdminView />
                </AdminGuard>
              }
            />
            <Route path="/login" element={<LoginForm />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    // Because user is null, AdminGuard redirects to /login and renders LoginForm
    const heading = await screen.findByRole('heading', { name: /Sign in to your Account/i });
    expect(heading).toBeDefined();
  });
});
