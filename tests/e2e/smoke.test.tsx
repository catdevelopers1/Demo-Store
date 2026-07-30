import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/dom';
import { AppRouter } from '../../src/app/Router';

describe('Milestone 0-14 Framework Storefront E2E Hydration Test', () => {
  it('hydrates the homepage and displays Pakistani Clothing brand branding', async () => {
    render(<AppRouter />);

    // Verify top bar COD announcement
    const topBarText = await screen.findByText(/Free Cash on Delivery \(COD\) across Pakistan on orders over PKR 5,000/i);
    expect(topBarText).toBeDefined();

    // Verify version badge
    const versionBadge = await screen.findByText(/COD Engine (v0\.(1|2|3|4|5|6|7|8|9|10|11|12|13|14)|v1\.0)/i);
    expect(versionBadge).toBeDefined();

    // Verify hero section heading using role
    const heroTitles = screen.getAllByRole('heading', {
      name: /KHAADI & CO\.|PAKISTANI CLOTHING/i,
    });
    expect(heroTitles.length).toBeGreaterThanOrEqual(1);

    // Verify luxury fashion icon badges and collections section
    const codShippingBadge = await screen.findByText(/Free COD Shipping/i);
    expect(codShippingBadge).toBeDefined();

    const categorySection = await screen.findByText(/Shop by Category/i);
    expect(categorySection).toBeDefined();
  });
});
