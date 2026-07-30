import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/dom';
import { AppRouter } from '../../src/app/Router';

describe('Milestone 0-11 Framework Storefront E2E Hydration Test', () => {
  it('hydrates the homepage and displays Pakistani Clothing brand branding', async () => {
    render(<AppRouter />);

    // Verify top bar COD announcement
    const topBarText = await screen.findByText(/Free Cash on Delivery \(COD\) across Pakistan on orders over PKR 5,000/i);
    expect(topBarText).toBeDefined();

    // Verify version badge
    const versionBadge = await screen.findByText(/COD Engine v0\.(1|2|3|4|5|6|7|8|9|10|11|12)/i);
    expect(versionBadge).toBeDefined();

    // Verify hero section heading using role
    const heroTitle = screen.getByRole('heading', {
      name: /Next-Generation Pakistani Apparel Commerce/i,
    });
    expect(heroTitle).toBeDefined();

    // Verify Milestone completion banner
    const milestoneBanner = await screen.findByText(/Milestone (0|1|2|3|4|5|6|7|8|9|10|11) \(`v0\.(1|2|3|4|5|6|7|8|9|10|11|12)\.0`\)/i);
    expect(milestoneBanner).toBeDefined();
  });
});
