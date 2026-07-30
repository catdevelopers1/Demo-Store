import { getDb, type Env } from '../../../core/db';
import type { CartItemInput, ValidatedCartItem, CartValidationResult } from '../types';

export interface CartDbRow {
  variant_id: string;
  sku: string;
  product_id: string;
  product_name: string;
  base_price_pkr: number;
  price_override_pkr: number | null;
  quantity_available: number;
  image_url: string | null;
}

/**
 * Authoritatively validates shopping cart items against D1 database inventory ledgers and server-side PKR prices
 */
export async function validateCartItems(
  env: Env,
  items: CartItemInput[]
): Promise<CartValidationResult> {
  if (!items || items.length === 0) {
    return {
      items: [],
      subtotalPkr: 0,
      totalCount: 0,
      isValid: true,
      warnings: [],
    };
  }

  const db = getDb(env);
  const uniqueIds = Array.from(new Set(items.map((i) => i.variantId)));
  const placeholders = uniqueIds.map(() => '?').join(', ');

  const sql = `
    SELECT v.id as variant_id, v.sku, v.product_id, p.name as product_name,
           p.base_price_pkr, v.price_override_pkr,
           coalesce(i.quantity_available, 0) as quantity_available,
           (SELECT img.url FROM product_images img WHERE img.product_id = p.id AND img.is_primary = 1 LIMIT 1) as image_url
    FROM product_variants v
    INNER JOIN products p ON v.product_id = p.id
    LEFT JOIN inventory_items i ON v.id = i.variant_id
    WHERE v.id IN (${placeholders}) AND v.is_active = 1 AND p.is_active = 1
  `;

  const rows = await db.query<CartDbRow>(sql, uniqueIds);
  const rowMap = new Map<string, CartDbRow>();
  for (const row of rows.results) {
    rowMap.set(row.variant_id, row);
  }

  const validatedItems: ValidatedCartItem[] = [];
  const warnings: string[] = [];
  let subtotalPkr = 0;
  let totalCount = 0;
  let isValid = true;

  for (const input of items) {
    const row = rowMap.get(input.variantId);

    // 1. Check if SKU exists and is active
    if (!row) {
      warnings.push(`SKU item (${input.variantId}) is no longer available in the catalog and was removed.`);
      isValid = false;
      continue;
    }

    // 2. Determine authoritative server-side price in PKR
    const unitPricePkr = row.price_override_pkr ?? row.base_price_pkr;

    // 3. Verify stock availability and clip quantity if needed
    let verifiedQuantity = input.quantity;
    let isAvailable = true;
    let warning: string | null = null;

    if (row.quantity_available <= 0) {
      verifiedQuantity = 0;
      isAvailable = false;
      warning = `SKU '${row.sku}' is currently out of stock.`;
      warnings.push(warning);
      isValid = false;
    } else if (row.quantity_available < input.quantity) {
      verifiedQuantity = row.quantity_available;
      warning = `Only ${row.quantity_available} units of '${row.sku}' left in stock — quantity adjusted.`;
      warnings.push(warning);
    }

    const lineTotalPkr = unitPricePkr * verifiedQuantity;
    if (verifiedQuantity > 0) {
      subtotalPkr += lineTotalPkr;
      totalCount += verifiedQuantity;
    }

    validatedItems.push({
      variantId: row.variant_id,
      productId: row.product_id,
      sku: row.sku,
      productName: row.product_name,
      variantName: row.sku,
      unitPricePkr,
      requestedQuantity: input.quantity,
      verifiedQuantity,
      lineTotalPkr,
      isAvailable,
      warning,
      imageUrl: row.image_url,
    });
  }

  return {
    items: validatedItems,
    subtotalPkr,
    totalCount,
    isValid,
    warnings,
  };
}
