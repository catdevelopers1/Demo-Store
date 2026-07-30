import { describe, it, expect } from 'vitest';
import {
  generateCartesianVariants,
  generateSku,
  formatPkr,
} from '../../src/features/variants/utils';

describe('Cartesian Variant SKU Matrix Generator', () => {
  it('generates 6 unique sellable SKUs from [Small, Medium, Large] × [Red, Blue]', () => {
    const options = [
      { name: 'Size', values: ['Small', 'Medium', 'Large'] },
      { name: 'Color', values: ['Red', 'Blue'] },
    ];

    const variants = generateCartesianVariants(options, 'kashmiri-khaddar-suit');
    expect(variants).toHaveLength(6);

    // Verify option permutations
    expect(variants[0]?.optionValues).toEqual(['Small', 'Red']);
    expect(variants[1]?.optionValues).toEqual(['Small', 'Blue']);
    expect(variants[5]?.optionValues).toEqual(['Large', 'Blue']);

    // Verify unique SKUs generated
    const skus = variants.map((v) => v.sku);
    expect(new Set(skus).size).toBe(6);
  });

  it('generates a single standard fallback SKU when options are empty', () => {
    const variants = generateCartesianVariants([], 'unstitched-lawn-suit');
    expect(variants).toHaveLength(1);
    expect(variants[0]?.sku).toContain('STD');
  });
});

describe('SKU Generator Helper', () => {
  it('formats clean uppercase SKUs from slug and option abbreviations', () => {
    const sku = generateSku('gul-e-bahar-lawn', ['Small', 'Emerald Green']);
    expect(sku).toBe('PK-GUL-S-EG');
  });
});

describe('PKR Currency Formatting', () => {
  it('formats amounts into PKR currency strings', () => {
    expect(formatPkr(6500)).toBe('PKR 6,500');
    expect(formatPkr(25000)).toBe('PKR 25,000');
  });
});
