import { getDb, getR2, type Env } from '../../../core';
import type { ProductImage } from '../types/image';
import { defaultLogger } from '../../../core/api/logger';

export interface ImageRow {
  id: string;
  product_id: string;
  variant_id: string | null;
  r2_key: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: number;
  created_at: string;
}

function mapRowToImage(row: ImageRow): ProductImage {
  return {
    id: row.id,
    productId: row.product_id,
    variantId: row.variant_id,
    r2Key: row.r2_key,
    url: row.url,
    altText: row.alt_text,
    sortOrder: row.sort_order,
    isPrimary: Boolean(row.is_primary),
    createdAt: row.created_at,
  };
}

/**
 * Retrieves all lookbook images for a product sorted by is_primary DESC, sort_order ASC
 */
export async function getProductImages(env: Env, productId: string): Promise<ProductImage[]> {
  const db = getDb(env);
  const rows = await db.query<ImageRow>(
    'SELECT id, product_id, variant_id, r2_key, url, alt_text, sort_order, is_primary, created_at FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort_order ASC',
    [productId]
  );
  return rows.results.map(mapRowToImage);
}

/**
 * Inserts a new product image record into D1
 */
export async function createProductImageRecord(
  env: Env,
  data: {
    id: string;
    productId: string;
    variantId?: string | null;
    r2Key: string;
    url: string;
    altText?: string | null;
    sortOrder?: number;
    isPrimary?: boolean;
  }
): Promise<ProductImage> {
  const db = getDb(env);
  const now = new Date().toISOString();

  // If set as primary, unmark existing primary images for this product
  if (data.isPrimary) {
    await db.query(
      'UPDATE product_images SET is_primary = 0 WHERE product_id = ?',
      [data.productId]
    );
  }

  await db.query(
    'INSERT INTO product_images (id, product_id, variant_id, r2_key, url, alt_text, sort_order, is_primary, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      data.id,
      data.productId,
      data.variantId ?? null,
      data.r2Key,
      data.url,
      data.altText ?? null,
      data.sortOrder ?? 1,
      data.isPrimary ? 1 : 0,
      now,
    ]
  );

  return {
    id: data.id,
    productId: data.productId,
    variantId: data.variantId,
    r2Key: data.r2Key,
    url: data.url,
    altText: data.altText,
    sortOrder: data.sortOrder ?? 1,
    isPrimary: Boolean(data.isPrimary),
    createdAt: now,
  };
}

/**
 * Deletes an image from Cloudflare R2 bucket and D1 database
 */
export async function deleteProductImageRecord(
  env: Env,
  imageId: string
): Promise<{ success: true; id: string } | { error: string }> {
  const db = getDb(env);
  const row = await db.first<ImageRow>(
    'SELECT id, product_id, variant_id, r2_key, url, alt_text, sort_order, is_primary, created_at FROM product_images WHERE id = ?',
    [imageId]
  );

  if (!row) {
    return { error: `Product image '${imageId}' was not found.` };
  }

  // 1. Delete asset from Cloudflare R2 bucket!
  try {
    if (env.BUCKET) {
      const r2 = getR2(env);
      await r2.delete(row.r2_key);
    }
  } catch (err) {
    defaultLogger.warn('R2 object deletion warning', {
      key: row.r2_key,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  // 2. Delete metadata from D1 database
  await db.query('DELETE FROM product_images WHERE id = ?', [imageId]);

  return { success: true, id: imageId };
}

/**
 * Sets an image as primary cover and unsets all other images for that product in an atomic D1 batch transaction
 */
export async function setPrimaryImage(
  env: Env,
  productId: string,
  imageId: string
): Promise<{ images: ProductImage[] } | { error: string }> {
  const db = getDb(env);

  const row = await db.first<ImageRow>(
    'SELECT id FROM product_images WHERE id = ? AND product_id = ?',
    [imageId, productId]
  );
  if (!row) {
    return { error: `Image '${imageId}' not found for product '${productId}'.` };
  }

  const queries = [
    {
      sql: 'UPDATE product_images SET is_primary = 0 WHERE product_id = ?',
      params: [productId],
    },
    {
      sql: 'UPDATE product_images SET is_primary = 1 WHERE id = ? AND product_id = ?',
      params: [imageId, productId],
    },
  ];

  await db.batch(queries);

  const images = await getProductImages(env, productId);
  return { images };
}
