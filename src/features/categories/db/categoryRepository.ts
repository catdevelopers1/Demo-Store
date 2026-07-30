import { getDb, getKv, type Env } from '../../../core';
import type { Category, CreateCategoryData, UpdateCategoryData } from '../types';
import { slugify, wouldCreateCycle } from '../utils';
import { defaultLogger } from '../../../core/api/logger';

const KV_CATEGORIES_CACHE_KEY = 'categories_cache';
const CACHE_TTL_SECONDS = 3600;

export interface CategoryRow {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  image_r2_key: string | null;
  sort_order: number;
  is_active: number;
  created_at: string;
}

function mapRowToCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    parentId: row.parent_id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    imageR2Key: row.image_r2_key,
    sortOrder: row.sort_order,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
  };
}

/**
 * Retrieves all categories ordered by sort_order ascending, then name ascending (with KV caching)
 */
export async function getAllCategories(env: Env): Promise<Category[]> {
  // 1. Check KV cache
  try {
    if (env.KV) {
      const kv = getKv(env);
      const cached = await kv.getJson<Category[]>(KV_CATEGORIES_CACHE_KEY);
      if (cached) {
        return cached;
      }
    }
  } catch (err) {
    defaultLogger.warn('KV cache lookup failed for categories', {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  // 2. Query D1 database
  const db = getDb(env);
  const rows = await db.query<CategoryRow>(
    'SELECT id, parent_id, name, slug, description, image_r2_key, sort_order, is_active, created_at FROM categories ORDER BY sort_order ASC, name ASC'
  );

  const categories = rows.results.map(mapRowToCategory);

  // 3. Populate KV cache
  try {
    if (env.KV) {
      const kv = getKv(env);
      await kv.putJson(KV_CATEGORIES_CACHE_KEY, categories, {
        expirationTtl: CACHE_TTL_SECONDS,
      });
    }
  } catch (err) {
    defaultLogger.warn('Failed to populate KV cache for categories', {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  return categories;
}

/**
 * Retrieves a single category by slug
 */
export async function getCategoryBySlug(env: Env, slug: string): Promise<Category | null> {
  const db = getDb(env);
  const row = await db.first<CategoryRow>(
    'SELECT id, parent_id, name, slug, description, image_r2_key, sort_order, is_active, created_at FROM categories WHERE slug = ?',
    [slug]
  );
  if (!row) {
    return null;
  }
  return mapRowToCategory(row);
}

/**
 * Retrieves a single category by ID
 */
export async function getCategoryById(env: Env, id: string): Promise<Category | null> {
  const db = getDb(env);
  const row = await db.first<CategoryRow>(
    'SELECT id, parent_id, name, slug, description, image_r2_key, sort_order, is_active, created_at FROM categories WHERE id = ?',
    [id]
  );
  if (!row) {
    return null;
  }
  return mapRowToCategory(row);
}

/**
 * Creates a new category in D1 and invalidates KV cache
 */
export async function createCategory(
  env: Env,
  data: CreateCategoryData
): Promise<{ category: Category } | { error: string }> {
  const db = getDb(env);
  const id = data.id ?? `cat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const slug = data.slug && data.slug.trim().length > 0 ? data.slug.trim() : slugify(data.name);

  // Verify slug uniqueness
  const existingSlug = await getCategoryBySlug(env, slug);
  if (existingSlug) {
    return { error: `Category slug '${slug}' is already in use by '${existingSlug.name}'.` };
  }

  const now = new Date().toISOString();
  await db.query(
    'INSERT INTO categories (id, parent_id, name, slug, description, image_r2_key, sort_order, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      id,
      data.parentId ?? null,
      data.name.trim(),
      slug,
      data.description ?? null,
      data.imageR2Key ?? null,
      data.sortOrder ?? 0,
      data.isActive !== undefined ? (data.isActive ? 1 : 0) : 1,
      now,
    ]
  );

  // Invalidate KV cache
  try {
    if (env.KV) {
      await getKv(env).delete(KV_CATEGORIES_CACHE_KEY);
    }
  } catch {
    // Ignore KV purge failure
  }

  const created = await getCategoryById(env, id);
  if (!created) {
    throw new Error('Failed to retrieve newly created category.');
  }

  return { category: created };
}

/**
 * Updates an existing category in D1 and invalidates KV cache
 */
export async function updateCategory(
  env: Env,
  id: string,
  data: UpdateCategoryData
): Promise<{ category: Category } | { error: string }> {
  const existing = await getCategoryById(env, id);
  if (!existing) {
    return { error: `Category with ID '${id}' not found.` };
  }

  // 1. Validate against circular parent references!
  if (data.parentId !== undefined) {
    const allCategories = await getAllCategories(env);
    if (wouldCreateCycle(id, data.parentId, allCategories)) {
      return {
        error:
          'Circular reference detected: A category cannot be its own parent or descendant.',
      };
    }
  }

  // 2. Check slug uniqueness if changed
  let newSlug = existing.slug;
  if (data.slug && data.slug !== existing.slug) {
    const conflict = await getCategoryBySlug(env, data.slug);
    if (conflict && conflict.id !== id) {
      return { error: `Category slug '${data.slug}' is already in use.` };
    }
    newSlug = data.slug;
  }

  const newParentId = data.parentId !== undefined ? (data.parentId ?? null) : existing.parentId;
  const newName = data.name !== undefined ? data.name.trim() : existing.name;
  const newDesc = data.description !== undefined ? (data.description ?? null) : existing.description;
  const newImg = data.imageR2Key !== undefined ? (data.imageR2Key ?? null) : existing.imageR2Key;
  const newSort = data.sortOrder !== undefined ? data.sortOrder : existing.sortOrder;
  const newActive = data.isActive !== undefined ? (data.isActive ? 1 : 0) : (existing.isActive ? 1 : 0);

  const db = getDb(env);
  await db.query(
    'UPDATE categories SET parent_id = ?, name = ?, slug = ?, description = ?, image_r2_key = ?, sort_order = ?, is_active = ? WHERE id = ?',
    [newParentId, newName, newSlug, newDesc, newImg, newSort, newActive, id]
  );

  // Invalidate KV cache
  try {
    if (env.KV) {
      await getKv(env).delete(KV_CATEGORIES_CACHE_KEY);
    }
  } catch {
    // Ignore KV purge failure
  }

  const updated = await getCategoryById(env, id);
  if (!updated) {
    throw new Error('Failed to retrieve updated category.');
  }

  return { category: updated };
}

/**
 * Deletes a category from D1 and invalidates KV cache
 */
export async function deleteCategory(
  env: Env,
  id: string
): Promise<{ success: true } | { error: string }> {
  const existing = await getCategoryById(env, id);
  if (!existing) {
    return { error: `Category with ID '${id}' not found.` };
  }

  const db = getDb(env);
  await db.query('DELETE FROM categories WHERE id = ?', [id]);

  // Invalidate KV cache
  try {
    if (env.KV) {
      await getKv(env).delete(KV_CATEGORIES_CACHE_KEY);
    }
  } catch {
    // Ignore KV purge failure
  }

  return { success: true };
}
