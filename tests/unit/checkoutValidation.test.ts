import { describe, it, expect } from 'vitest';
import {
  calculateCodShippingPkr,
  generateOrderNumber,
  evaluateOrderInitialStatus,
} from '../../src/features/checkout/utils';
import { codCheckoutSchema } from '../../src/features/checkout/validation';

describe('Cash on Delivery Shipping Calculation Engine', () => {
  const settings = { codShippingBasePkr: 250, freeShippingThresholdPkr: 5000 };

  it('charges standard COD base fee for orders below the threshold', () => {
    expect(calculateCodShippingPkr(4500, settings)).toBe(250);
  });

  it('provides free COD shipping for orders over the threshold', () => {
    expect(calculateCodShippingPkr(5000, settings)).toBe(0);
    expect(calculateCodShippingPkr(15000, settings)).toBe(0);
  });
});

describe('High-Value Pakistani COD Order Verification Rule', () => {
  it('flags orders exceeding PKR 25,000 as PENDING_VERIFICATION', () => {
    expect(evaluateOrderInitialStatus(30000)).toBe('PENDING_VERIFICATION');
    expect(evaluateOrderInitialStatus(25001)).toBe('PENDING_VERIFICATION');
  });

  it('approves orders below the high-value threshold as CONFIRMED', () => {
    expect(evaluateOrderInitialStatus(18000)).toBe('CONFIRMED');
    expect(evaluateOrderInitialStatus(25000)).toBe('CONFIRMED');
  });
});

describe('Executive Pakistani Order Number Generator', () => {
  it('generates five-digit #PK order identifiers', () => {
    const number = generateOrderNumber();
    expect(number).toMatch(/^#PK-[0-9]{5}$/);
  });
});

describe('Zod COD Checkout Payload Schema', () => {
  it('accepts a valid Pakistani COD checkout request', () => {
    const payload = {
      items: [{ variantId: 'var_lwn_01_grn', quantity: 2 }],
      couponCode: 'AZADI14',
      shippingAddress: {
        recipientName: 'Ahmed Khan',
        phone: '0300-1234567',
        provinceState: 'Punjab' as const,
        city: 'Lahore',
        streetAddress: 'House 12, Gulberg III',
        postalCode: '54660',
        isDefault: false,
      },
      guestPhone: '0300-1234567',
      guestEmail: 'ahmed@lahore.pk',
      notes: 'Call on arrival',
    };

    const result = codCheckoutSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('rejects an empty item list', () => {
    const invalid = {
      items: [],
      shippingAddress: {
        recipientName: 'Ahmed Khan',
        phone: '0300-1234567',
        provinceState: 'Punjab' as const,
        city: 'Lahore',
        streetAddress: 'House 12, Gulberg III',
        isDefault: false,
      },
    };

    expect(codCheckoutSchema.safeParse(invalid).success).toBe(false);
  });
});
