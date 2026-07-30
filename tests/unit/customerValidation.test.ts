import { describe, it, expect } from 'vitest';
import { addressSchema } from '../../src/features/customers/validation';
import {
  PAKISTAN_PROVINCES,
  PAKISTAN_CITIES_BY_PROVINCE,
  isValidPakistanCity,
  formatPakistanPhone,
} from '../../src/features/customers/utils/pakistanLocations';

describe('Pakistani Location Standardization & Phone Formatting', () => {
  it('contains all 7 administrative provinces and major cities', () => {
    expect(PAKISTAN_PROVINCES).toContain('Punjab');
    expect(PAKISTAN_PROVINCES).toContain('Sindh');
    expect(PAKISTAN_PROVINCES).toContain('Khyber Pakhtunkhwa');
    expect(PAKISTAN_CITIES_BY_PROVINCE['Punjab']).toContain('Lahore');
    expect(PAKISTAN_CITIES_BY_PROVINCE['Sindh']).toContain('Karachi');
  });

  it('validates whether a city belongs to a province', () => {
    expect(isValidPakistanCity('Lahore', 'Punjab')).toBe(true);
    expect(isValidPakistanCity('Karachi', 'Sindh')).toBe(true);
    expect(isValidPakistanCity('Lahore', 'Sindh')).toBe(false);
  });

  it('formats Pakistani mobile numbers with a hyphen', () => {
    expect(formatPakistanPhone('03001234567')).toBe('0300-1234567');
    expect(formatPakistanPhone('923001234567')).toBe('+92300-1234567');
  });
});

describe('Zod Pakistani Shipping Address Validation Schema', () => {
  it('accepts a valid Pakistani shipping address', () => {
    const input = {
      recipientName: 'Ahmed Khan',
      phone: '0300-1234567',
      provinceState: 'Punjab' as const,
      city: 'Lahore',
      streetAddress: 'House 12, Street 4, Gulberg III',
      postalCode: '54660',
      isDefault: true,
    };

    const result = addressSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('rejects an address with an invalid postal code format', () => {
    const input = {
      recipientName: 'Ahmed Khan',
      phone: '0300-1234567',
      provinceState: 'Punjab' as const,
      city: 'Lahore',
      streetAddress: 'House 12, Street 4, Gulberg III',
      postalCode: '123', // Must be 5 digits!
    };

    const result = addressSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});
