import { getDb, type Env } from '../../../core/db';
import type { Product, ProductWithVariants, ProductListFilter } from '../types';
import type { ProductOption, ProductOptionValue, ProductVariant } from '../../variants/types';
import type { CreateProductInput } from '../validation';
import { slugify } from '../../categories/utils';

export interface ProductRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  base_price_pkr: number;
  category_id: string | null;
  category_name?: string | null;
  is_active: number;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface OptionRow {
  id: string;
  product_id: string;
  name: string;
  sort_order: number;
}

export interface OptionValueRow {
  id: string;
  option_id: string;
  value: string;
  sort_order: number;
}

export interface VariantRow {
  id: string;
  product_id: string;
  sku: string;
  price_override_pkr: number | null;
  compare_at_price_pkr: number | null;
  weight_grams: number;
  is_active: number;
}

export interface VariantOptionRow {
  variant_id: string;
  option_value_id: string;
}

function mapRowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    basePricePkr: row.base_price_pkr,
    categoryId: row.category_id,
    categoryName: row.category_name,
    isActive: Boolean(row.is_active),
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Retrieves a filtered list of catalog clothing products
 */
export async function getProducts(
  env: Env,
  filter: ProductListFilter = {}
): Promise<Product[]> {
  const db = getDb(env);

  let sql = `
    SELECT p.id, p.name, p.slug, p.description, p.base_price_pkr, p.category_id, c.name as category_name, p.is_active, p.seo_title, p.seo_description, p.created_at, p.updated_at
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = 1
  `;
  const params: unknown[] = [];

  if (filter.categorySlug) {
    sql += ' AND c.slug = ?';
    params.push(filter.categorySlug);
  } else if (filter.categoryId) {
    sql += ' AND p.category_id = ?';
    params.push(filter.categoryId);
  }

  if (filter.search) {
    sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
    params.push(`%${filter.search}%`, `%${filter.search}%`);
  }

  if (filter.minPrice !== undefined) {
    sql += ' AND p.base_price_pkr >= ?';
    params.push(filter.minPrice);
  }

  if (filter.maxPrice !== undefined) {
    sql += ' AND p.base_price_pkr <= ?';
    params.push(filter.maxPrice);
  }

  sql += ' ORDER BY p.created_at DESC';

  const rows = await db.query<ProductRow>(sql, params);
  return rows.results.map(mapRowToProduct);
}

/**
 * Retrieves a single product with all its options, option values, and sellable SKU variants
 */
export async function getProductBySlug(
  env: Env,
  slug: string
): Promise<ProductWithVariants | null> {
  const db = getDb(env);

  const productRow = await db.first<ProductRow>(
    `SELECT p.id, p.name, p.slug, p.description, p.base_price_pkr, p.category_id, c.name as category_name, p.is_active, p.seo_title, p.seo_description, p.created_at, p.updated_at
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.slug = ?`,
    [slug]
  );

  if (!productRow) {
    return null;
  }

  const product = mapRowToProduct(productRow);

  // 1. Fetch options & option values
  const optionRows = await db.query<OptionRow>(
    'SELECT id, product_id, name, sort_order FROM product_options WHERE product_id = ? ORDER BY sort_order ASC',
    [product.id]
  );
  const valueRows = await db.query<OptionValueRow>(
    `SELECT v.id, v.option_id, v.value, v.sort_order
     FROM product_option_values v
     INNER JOIN product_options o ON v.option_id = o.id
     WHERE o.product_id = ?
     ORDER BY v.sort_order ASC`,
    [product.id]
  );

  const valuesByOption = new Map<string, ProductOptionValue[]>();
  const allValuesMap = new Map<string, ProductOptionValue>();

  for (const v of valueRows.results) {
    const val: ProductOptionValue = {
      id: v.id,
      optionId: v.option_id,
      value: v.value,
      sortOrder: v.sort_order,
    };
    allValuesMap.set(v.id, val);
    const existing = valuesByOption.get(v.option_id) ?? [];
    existing.push(val);
    valuesByOption.set(v.option_id, existing);
  }

  const options: ProductOption[] = optionRows.results.map((o) => ({
    id: o.id,
    productId: o.product_id,
    name: o.name,
    sortOrder: o.sort_order,
    values: valuesByOption.get(o.id) ?? [],
  }));

  // 2. Fetch variants & their option value linkages
  const variantRows = await db.query<VariantRow>(
    'SELECT id, product_id, sku, price_override_pkr, compare_at_price_pkr, weight_grams, is_active FROM product_variants WHERE product_id = ? AND is_active = 1',
    [product.id]
  );
  const mappingRows = await db.query<VariantOptionRow>(
    `SELECT m.variant_id, m.option_value_id
     FROM product_variant_options m
     INNER JOIN product_variants v ON m.variant_id = v.id
     WHERE v.product_id = ?`,
    [product.id]
  );

  const valuesByVariant = new Map<string, ProductOptionValue[]>();
  for (const m of mappingRows.results) {
    const val = allValuesMap.get(m.option_value_id);
    if (val) {
      const list = valuesByVariant.get(m.variant_id) ?? [];
      list.push(val);
      valuesByVariant.set(m.variant_id, list);
    }
  }

  const variants: ProductVariant[] = variantRows.results.map((v) => ({
    id: v.id,
    productId: v.product_id,
    sku: v.sku,
    priceOverridePkr: v.price_override_pkr,
    compareAtPricePkr: v.compare_at_price_pkr,
    weightGrams: v.weight_grams,
    isActive: Boolean(v.is_active),
    optionValues: valuesByVariant.get(v.id) ?? [],
  }));

  return {
    ...product,
    options,
    variants,
  };
}

/**
 * Creates a product with all its options, values, and SKU variants in a single atomic D1 batch transaction
 */
export async function createProductWithVariants(
  env: Env,
  input: CreateProductInput
): Promise<{ product: ProductWithVariants } | { error: string }> {
  const db = getDb(env);

  const productId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const slug = input.slug && input.slug.trim().length > 0 ? input.slug.trim() : slugify(input.name);

  // Check if slug already exists
  const existing = await getProductBySlug(env, slug);
  if (existing) {
    return { error: `Product slug '${slug}' is already in use by '${existing.name}'.` };
  }

  const now = new Date().toISOString();
  const queries: { sql: string; params?: unknown[] }[] = [];

  // 1. Insert product header
  queries.push({
    sql: 'INSERT INTO products (id, name, slug, description, base_price_pkr, category_id, is_active, seo_title, seo_description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)',
    params: [
      productId,
      input.name.trim(),
      slug,
      input.description ?? null,
      input.basePricePkr,
      input.categoryId ?? null,
      input.seoTitle ?? null,
      input.seoDescription ?? null,
      now,
      now,
    ],
  });

  // 2. Insert options and option values, mapping (optionName_valueName) -> valueId
  const valueIdMap = new Map<string, string>();
  for (let optIdx = 0; optIdx < input.options.length; optIdx++) {
    const opt = input.options[optIdx]!;
    const optionId = `opt_${Date.now()}_${optIdx}_${Math.random().toString(36).substring(2, 5)}`;
    queries.push({
      sql: 'INSERT INTO product_options (id, product_id, name, sort_order) VALUES (?, ?, ?, ?)',
      params: [optionId, productId, opt.name.trim(), optIdx + 1],
    });

    for (let valIdx = 0; valIdx < opt.values.length; valIdx++) {
      const valText = opt.values[valIdx]!.trim();
      const valueId = `val_${Date.now()}_${optIdx}_${valIdx}_${Math.random().toString(36).substring(2, 5)}`;
      valueIdMap.set(`${opt.name.trim().toLowerCase()}_${valText.toLowerCase()}`, valueId);
      valueIdMap.set(valText.toLowerCase(), valueId);

      queries.push({
        sql: 'INSERT INTO product_option_values (id, option_id, value, sort_order) VALUES (?, ?, ?, ?)',
        params: [valueId, optionId, valText, valIdx + 1],
      });
    }
  }

  // 3. Insert variants and variant-to-value linkages
  const variantsToInsert =
    input.variants.length > 0
      ? input.variants
      : [
          {
            sku: `PK-${slug.toUpperCase().substring(0, 10)}-STD`,
            priceOverridePkr: null,
            optionValues: [],
          },
        ];

  for (let varIdx = 0; varIdx < variantsToInsert.length; varIdx++) {
    const varInput = variantsToInsert[varIdx]!;
    const variantId = `var_${Date.now()}_${varIdx}_${Math.random().toString(36).substring(2, 6)}`;

    queries.push({
      sql: 'INSERT INTO product_variants (id, product_id, sku, price_override_pkr, compare_at_price_pkr, weight_grams, is_active) VALUES (?, ?, ?, ?, NULL, 0, 1)',
      params: [variantId, productId, varInput.sku.trim(), varInput.priceOverridePkr ?? null],
    });

    queries.push({
      sql: 'INSERT INTO inventory_items (variant_id, quantity_available, quantity_reserved, low_stock_threshold) VALUES (?, 10, 0, 5)',
      params: [variantId],
    });

    for (const valText of varInput.optionValues) {
      const matchedValueId = valueIdMap.get(valText.trim().toLowerCase());
      if (matchedValueId) {
        queries.push({
          sql: 'INSERT INTO product_variant_options (variant_id, option_value_id) VALUES (?, ?)',
          params: [variantId, matchedValueId],
        });
      }
    }
  }

  // 4. Execute atomic D1 batch transaction!
  await db.batch(queries);

  const created = await getProductBySlug(env, slug);
  if (!created) {
    throw new Error('Failed to retrieve newly created product.');
  }

  return { product: created };
}
