import { getDb, type Env } from '../../../core/db';
import type { InventoryReason } from '../types';

export interface StockMutationResult {
  success: boolean;
  error?: string;
  variantId: string;
}

/**
 * Atomically reserves stock during COD checkout.
 * Uses conditional SQL constraint `WHERE quantity_available >= ?` to guarantee zero negative stock under concurrency!
 */
export async function reserveStock(
  env: Env,
  variantId: string,
  qty: number,
  referenceId: string,
  comment = 'Stock reserved for COD checkout'
): Promise<StockMutationResult> {
  const db = getDb(env);

  // 1. Check availability
  const checkRow = await db.first<{ quantity_available: number }>(
    'SELECT quantity_available FROM inventory_items WHERE variant_id = ?',
    [variantId]
  );
  if (!checkRow) {
    return { success: false, error: `Variant '${variantId}' not found in inventory ledger.`, variantId };
  }
  if (checkRow.quantity_available < qty) {
    return {
      success: false,
      error: `Insufficient stock available for variant '${variantId}'. Requested: ${qty}, Available: ${checkRow.quantity_available}.`,
      variantId,
    };
  }

  const logId = `log_rsv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const queries = [
    {
      sql: 'UPDATE inventory_items SET quantity_available = quantity_available - ?, quantity_reserved = quantity_reserved + ?, updated_at = ? WHERE variant_id = ? AND quantity_available >= ?',
      params: [qty, qty, now, variantId, qty],
    },
    {
      sql: 'INSERT INTO inventory_logs (id, variant_id, change_qty, reason, reference_id, comment, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      params: [logId, variantId, -qty, 'SALE', referenceId, comment, now],
    },
  ];

  await db.batch(queries);
  return { success: true, variantId };
}

/**
 * Releases previously reserved stock back to available inventory on order cancellation or return
 */
export async function releaseStock(
  env: Env,
  variantId: string,
  qty: number,
  reason: InventoryReason,
  referenceId: string,
  comment = 'Reserved stock released back to available inventory'
): Promise<StockMutationResult> {
  const db = getDb(env);
  const logId = `log_rel_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const queries = [
    {
      sql: 'UPDATE inventory_items SET quantity_reserved = MAX(0, quantity_reserved - ?), quantity_available = quantity_available + ?, updated_at = ? WHERE variant_id = ?',
      params: [qty, qty, now, variantId],
    },
    {
      sql: 'INSERT INTO inventory_logs (id, variant_id, change_qty, reason, reference_id, comment, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      params: [logId, variantId, qty, reason, referenceId, comment, now],
    },
  ];

  await db.batch(queries);
  return { success: true, variantId };
}
