import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema, PAKISTAN_PHONE_REGEX } from '../../src/features/authentication/validation';

describe('Pakistani Phone Number Regex Validation', () => {
  it('validates correct Pakistani mobile formats with or without hyphen', () => {
    expect(PAKISTAN_PHONE_REGEX.test('03001234567')).toBe(true);
    expect(PAKISTAN_PHONE_REGEX.test('0300-1234567')).toBe(true);
    expect(PAKISTAN_PHONE_REGEX.test('+923001234567')).toBe(true);
    expect(PAKISTAN_PHONE_REGEX.test('+92300-1234567')).toBe(true);
    expect(PAKISTAN_PHONE_REGEX.test('923001234567')).toBe(true);
    expect(PAKISTAN_PHONE_REGEX.test('3001234567')).toBe(true);
  });

  it('rejects invalid mobile numbers', () => {
    expect(PAKISTAN_PHONE_REGEX.test('02001234567')).toBe(false); // Not starting with 3
    expect(PAKISTAN_PHONE_REGEX.test('0300123456')).toBe(false);  // Too short
    expect(PAKISTAN_PHONE_REGEX.test('030012345678')).toBe(false); // Too long
    expect(PAKISTAN_PHONE_REGEX.test('abcdefghijk')).toBe(false);
  });
});

describe('Zod Register Schema Validation', () => {
  it('accepts a valid customer registration payload', () => {
    const input = {
      email: 'customer@lahore.pk',
      phone: '0300-1234567',
      password: 'StrongPassword123!',
      role: 'CUSTOMER' as const,
    };

    const result = registerSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('rejects passwords shorter than 8 characters', () => {
    const input = {
      email: 'customer@lahore.pk',
      password: 'short',
      role: 'CUSTOMER' as const,
    };

    const result = registerSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0]?.message).toContain('at least 8 characters');
    }
  });
});

describe('Zod Login Schema Validation', () => {
  it('accepts valid login credentials', () => {
    const input = {
      email: 'customer@lahore.pk',
      password: 'StrongPassword123!',
    };

    const result = loginSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('rejects empty password or invalid email format', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: '' });
    expect(result.success).toBe(false);
  });
});
