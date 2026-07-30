import { describe, it, expect } from 'vitest';
import { updateSettingsSchema, HEX_COLOR_REGEX } from '../../src/features/settings/validation';
import { DEFAULT_STORE_SETTINGS } from '../../src/features/settings/types';

describe('Hex Color Regex Validation', () => {
  it('accepts valid 6-character hex colors', () => {
    expect(HEX_COLOR_REGEX.test('#065f46')).toBe(true);
    expect(HEX_COLOR_REGEX.test('#047857')).toBe(true);
    expect(HEX_COLOR_REGEX.test('#FFFFFF')).toBe(true);
  });

  it('rejects invalid hex codes', () => {
    expect(HEX_COLOR_REGEX.test('065f46')).toBe(false); // Missing #
    expect(HEX_COLOR_REGEX.test('#fff')).toBe(false); // 3 digits not allowed
    expect(HEX_COLOR_REGEX.test('#gggggg')).toBe(false); // Invalid hex characters
  });
});

describe('Zod Store Settings Validation Schema', () => {
  it('validates default Pakistani clothing brand settings', () => {
    const result = updateSettingsSchema.safeParse(DEFAULT_STORE_SETTINGS);
    expect(result.success).toBe(true);
  });

  it('rejects negative COD shipping rates or thresholds', () => {
    const invalid = {
      ...DEFAULT_STORE_SETTINGS,
      codShippingBasePkr: -50,
      freeShippingThresholdPkr: -100,
    };

    const result = updateSettingsSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.some((e) => e.path.includes('codShippingBasePkr'))).toBe(true);
    }
  });

  it('rejects invalid Pakistani support phone format', () => {
    const invalid = {
      ...DEFAULT_STORE_SETTINGS,
      supportPhonePk: '12345',
    };

    const result = updateSettingsSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
