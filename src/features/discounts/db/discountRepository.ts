import { getDb, type Env } from '../../../core/db';
import type { Discount, DiscountType } from '../types';
import type { CreateDiscountInput, UpdateDiscountInput } from '../validation';

export interface DiscountRow {
  id: string;
  code: string;
  type: DiscountType;
  value: number;
  min_order_pkr: number;
  max_discount_pkr: number | null;
  start_time: string;
  end_time: string;
  usage_limit: number | null;
  used_count: number;
  is_active: number;
  created_at: string;
}

function mapRowToDiscount(row: DiscountRow): Discount {
  return {
    id: row.id,
    code: row.code,
    type: row.type,
    value: row.value,
    minOrderPkr: row.min_order_pkr,
    maxDiscountPkr: row.max_discount_pkr,
    startTime: row.start_time,
    endTime: row.end_time,
    usageLimit: row.usage_limit,
    usedCount: row.used_count,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
  };
}

/**
 * Finds an active promo code by string matching (case-insensitive)
 */
export async function getDiscountByCode(env: Env, code: string): Promise<Discount | null> {
  const db = getDb(env);
  const row = await db.first<DiscountRow>(
    'SELECT id, code, type, value, min_order_pkr, max_discount_pkr, start_time, end_time, usage_limit, used_count, is_active, created_at FROM discounts WHERE LOWER(code) = LOWER(?)',
    [code.trim()]
  );
  if (!row) {
    return null;
  }
  return mapRowToDiscount(row);
}

/**
 * Retrieves all promotional coupons ordered by created_at DESC
 */
export async function getAllDiscounts(env: Env): Promise<Discount[]> {
  const db = getDb(env);
  const rows = await db.query<DiscountRow>(
    'SELECT id, code, type, value, min_order_pkr, max_discount_pkr, start_time, end_time, usage_limit, used_count, is_active, created_at FROM discounts ORDER BY created_at DESC'
  );
  return rows.results.map(mapRowToDiscount);
}

/**
 * Inserts a new discount code into D1
 */
export async function createDiscount(
  env: Env,
  data: CreateDiscountInput
): Promise<{ discount: Discount } | { error: string }> {
  const db = getDb(env);
  const cleanCode = data.code.trim().toUpperCase();

  const existing = await getDiscountByCode(env, cleanCode);
  if (existing) {
    return { error: `Promo code '${cleanCode}' is already registered.` };
  }

  const id = `disc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  await db.query(
    'INSERT INTO discounts (id, code, type, value, min_order_pkr, max_discount_pkr, start_time, end_time, usage_limit, used_count, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)',
    [
      id,
      cleanCode,
      data.type,
      data.value,
      data.minOrderPkr,
      data.maxDiscountPkr ?? null,
      data.startTime,
      data.endTime,
      data.usageLimit ?? null,
      data.isActive ? 1 : 0,
      now,
    ]
  );

  const created = await getDiscountByCode(env, cleanCode);
  if (!created) {
    throw new Error('Failed to retrieve newly created discount code.');
  }

  return { discount: created };
}

/**
 * Updates an existing promotional code in D1
 */
export async function updateDiscount(
  env: Env,
  id: string,
  data: UpdateDiscountInput
): Promise<{ discount: Discount } | { error: string }> {
  const db = getDb(env);

  const existing = await db.first<DiscountRow>(
    'SELECT id, code, type, value, min_order_pkr, max_discount_pkr, start_time, end_time, usage_limit, used_count, is_active, created_at FROM discounts WHERE id = ?',
    [id]
  );
  if (!existing) {
    return { error: `Discount with ID '${id}' not found.` };
  }

  let newCode = existing.code;
  if (data.code && data.code.trim().toUpperCase() !== existing.code) {
    const conflict = await getDiscountByCode(env, data.code.trim().toUpperCase());
    if (conflict && conflict.id !== id) {
      return { error: `Promo code '${data.code}' is already registered.` };
    }
    newCode = data.code.trim().toUpperCase();
  }

  const newType = data.type ?? existing.type;
  const newValue = data.value !== undefined ? data.value : existing.value;
  const newMin = data.minOrderPkr !== undefined ? data.minOrderPkr : existing.min_order_pkr;
  const newMax = data.maxDiscountPkr !== undefined ? (data.maxDiscountPkr ?? null) : existing.max_discount_pkr;
  const newStart = data.startTime ?? existing.start_time;
  const newEnd = data.endTime ?? existing.end_time;
  const newLimit = data.usageLimit !== undefined ? (data.usageLimit ?? null) : existing.usage_limit;
  const newActive = data.isActive !== undefined ? (data.isActive ? 1 : 0) : existing.is_active;

  await db.query(
    'UPDATE discounts SET code = ?, type = ?, value = ?, min_order_pkr = ?, max_discount_pkr = ?, start_time = ?, end_time = ?, usage_limit = ?, is_active = ? WHERE id = ?',
    [newCode, newType, newValue, newMin, newMax, newStart, newEnd, newLimit, newActive, id]
  );

  const updated = await getDiscountByCode(env, newCode);
  if (!updated) {
    throw new Error('Failed to retrieve updated discount code.');
  }

  return { discount: updated };
}

/**
 * Deletes a promo code from D1
 */
export async function deleteDiscount(
  env: Env,
  id: string
): Promise<{ success: true } | { error: string }> {
  const db = getDb(env);
  const row = await db.first<{ id: string }>('SELECT id FROM discounts WHERE id = ?', [id]);
  if (!row) {
    return { error: `Discount with ID '${id}' not found.` };
  }

  await db.query('DELETE FROM discounts WHERE id = ?', [id]);
  return { success: true };
}

/**
 * Atomically increments usage count when a COD order is finalized
 */
export async function incrementDiscountUsage(env: Env, code: string): Promise<boolean> {
  const db = getDb(env);
  const result = await db.query(
    'UPDATE discounts SET used_count = used_count + 1 WHERE LOWER(code) = LOWER(?) AND is_active = 1 AND (usage_limit IS NULL OR used_count < usage_limit)',
    [code.trim()]
  );
  return (result.meta?.changes ?? 0) > 0;
}
