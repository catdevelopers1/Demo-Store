import type { GeneratedVariantPreview } from '../types';

/**
 * Formats a PKR currency amount cleanly (e.g. 6500 -> "PKR 6,500")
 */
export function formatPkr(amount: number): string {
  return `PKR ${amount.toLocaleString('en-PK')}`;
}

/**
 * Generates an uppercase SKU prefix from option value strings
 * e.g. "Emerald Green" -> "GRN", "Small" -> "S"
 */
function abbreviateValue(val: string): string {
  const clean = val.trim().toUpperCase();
  if (['SMALL', 'S'].includes(clean)) return 'S';
  if (['MEDIUM', 'M'].includes(clean)) return 'M';
  if (['LARGE', 'L'].includes(clean)) return 'L';
  if (['EXTRA LARGE', 'XL'].includes(clean)) return 'XL';
  const words = clean.split(/[^A-Z0-9]+/);
  if (words.length > 1) {
    return words.map((w) => w[0]).join('');
  }
  return clean.substring(0, 3);
}

/**
 * Generates an uppercase SKU from product slug and option values
 * e.g. ("gul-e-bahar-lawn", ["Small", "Green"]) -> "PK-GUL-S-GRN"
 */
export function generateSku(productSlug: string, optionValues: string[]): string {
  const words = productSlug
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .split('-')
    .filter(Boolean);
  const prefix = words[0] ? words[0].substring(0, 3) : 'PK';
  const parts = optionValues.map(abbreviateValue);
  return `PK-${prefix}-${parts.join('-')}`;
}

/**
 * Computes the Cartesian product of an array of option arrays
 */
function cartesianProduct<T>(arrays: T[][]): T[][] {
  if (arrays.length === 0) return [];
  return arrays.reduce<T[][]>(
    (acc, curr) => acc.flatMap((x) => curr.map((y) => [...x, y])),
    [[]]
  );
}

/**
 * Generates a complete Cartesian variant SKU matrix from product options and their discrete values
 */
export function generateCartesianVariants(
  options: { name: string; values: string[] }[],
  productSlug: string
): GeneratedVariantPreview[] {
  const nonEmptyOptions = options.filter((o) => o.values.length > 0);
  if (nonEmptyOptions.length === 0) {
    return [
      {
        sku: generateSku(productSlug, ['STD']),
        optionValues: ['Standard'],
        priceOverridePkr: null,
      },
    ];
  }

  const valueArrays = nonEmptyOptions.map((o) => o.values);
  const permutations = cartesianProduct(valueArrays);

  return permutations.map((perm, index) => {
    const uniqueSku = `${generateSku(productSlug, perm)}${permutations.length > 1 ? `-${index + 1}` : ''}`;
    return {
      sku: uniqueSku,
      optionValues: perm,
      priceOverridePkr: null,
    };
  });
}
