import { describe, it, expect } from 'vitest';
import { cartItemInputSchema, validateCartSchema } from '../../src/features/cart/validation';

describe('Zod Shopping Cart Validation Schema', () => {
  it('accepts a valid cart item payload', () => {
    const input = {
      variantId: 'var_lwn_01_grn',
      quantity: 2,
    };

    const result = cartItemInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('rejects zero or negative quantities', () => {
    expect(cartItemInputSchema.safeParse({ variantId: 'var_1', quantity: 0 }).success).toBe(false);
    expect(cartItemInputSchema.safeParse({ variantId: 'var_1', quantity: -5 }).success).toBe(false);
  });

  it('rejects quantities exceeding 100 items per SKU', () => {
    expect(cartItemInputSchema.safeParse({ variantId: 'var_1', quantity: 150 }).success).toBe(false);
  });

  it('accepts valid cart item arrays in validateCartSchema', () => {
    const payload = {
      items: [
        { variantId: 'var_1', quantity: 1 },
        { variantId: 'var_2', quantity: 3 },
      ],
    };

    const result = validateCartSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });
});
