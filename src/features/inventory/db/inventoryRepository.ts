import { getDb, type Env } from '../../../core/db';
import type {
  InventoryItemWithVariant,
  InventoryLog,
  StockStatus,
  StockCheckResult,
} from '../types';
import type { AdjustStockInput } from '../validation';

export interface LedgerRow {
  variant_id: string;
  sku: string;
  product_id: string;
  product_name: string;
  quantity_available: number;
  quantity_reserved: number;
  low_stock_threshold: number;
  updated_at: string;
}

export interface LogRow {
  id: string;
  variant_id: string;
  change_qty: number;
  reason: 'SALE' | 'RETURN' | 'RESTOCK' | 'ADJUSTMENT' | 'CANCELLATION';
  reference_id: string | null;
  comment: string | null;
  created_at: string;
}

function evaluateStatus(available: number, threshold: number): StockStatus {
  if (available <= 0) {
    return 'OUT_OF_STOCK';
  }
  if (available <= threshold) {
    return 'LOW_STOCK';
  }
  return 'IN_STOCK';
}

function mapRowToLedgerItem(row: LedgerRow): InventoryItemWithVariant {
  return {
    variantId: row.variant_id,
    sku: row.sku,
    productId: row.product_id,
    productName: row.product_name,
    quantityAvailable: row.quantity_available,
    quantityReserved: row.quantity_reserved,
    lowStockThreshold: row.low_stock_threshold,
    updatedAt: row.updated_at,
    status: evaluateStatus(row.quantity_available, row.low_stock_threshold),
  };
}

/**
 * Retrieves full stock ledger across all catalog SKUs
 */
export async function getInventoryLedger(
  env: Env,
  filter: { lowStockOnly?: boolean; search?: string } = {}
): Promise<InventoryItemWithVariant[]> {
  const db = getDb(env);

  let sql = `
    SELECT i.variant_id, v.sku, v.product_id, p.name as product_name,
           i.quantity_available, i.quantity_reserved, i.low_stock_threshold, i.updated_at
    FROM inventory_items i
    INNER JOIN product_variants v ON i.variant_id = v.id
    INNER JOIN products p ON v.product_id = p.id
    WHERE v.is_active = 1
  `;
  const params: unknown[] = [];

  if (filter.lowStockOnly) {
    sql += ' AND i.quantity_available <= i.low_stock_threshold';
  }

  if (filter.search) {
    sql += ' AND (v.sku LIKE ? OR p.name LIKE ?)';
    params.push(`%${filter.search}%`, `%${filter.search}%`);
  }

  sql += ' ORDER BY (i.quantity_available = 0) DESC, (i.quantity_available <= i.low_stock_threshold) DESC, p.name ASC';

  const rows = await db.query<LedgerRow>(sql, params);
  return rows.results.map(mapRowToLedgerItem);
}

/**
 * Retrieves audit log trail for a SKU variant
 */
export async function getInventoryLogs(env: Env, variantId: string): Promise<InventoryLog[]> {
  const db = getDb(env);
  const rows = await db.query<LogRow>(
    'SELECT id, variant_id, change_qty, reason, reference_id, comment, created_at FROM inventory_logs WHERE variant_id = ? ORDER BY created_at DESC LIMIT 50',
    [variantId]
  );

  return rows.results.map((r) => ({
    id: r.id,
    variantId: r.variant_id,
    changeQty: r.change_qty,
    reason: r.reason,
    referenceId: r.reference_id,
    comment: r.comment,
    createdAt: r.created_at,
  }));
}

/**
 * Manually adjusts available stock and records audit log in an atomic D1 batch transaction
 */
export async function adjustStockManual(
  env: Env,
  variantId: string,
  input: AdjustStockInput
): Promise<{ item: InventoryItemWithVariant; log: InventoryLog } | { error: string }> {
  const db = getDb(env);

  const current = await db.first<LedgerRow>(
    `SELECT i.variant_id, v.sku, v.product_id, p.name as product_name,
            i.quantity_available, i.quantity_reserved, i.low_stock_threshold, i.updated_at
     FROM inventory_items i
     INNER JOIN product_variants v ON i.variant_id = v.id
     INNER JOIN products p ON v.product_id = p.id
     WHERE i.variant_id = ?`,
    [variantId]
  );

  if (!current) {
    return { error: `Inventory item for variant '${variantId}' was not found.` };
  }

  const newAvailable = current.quantity_available + input.changeQty;
  if (newAvailable < 0) {
    return {
      error: `Stock adjustment (-${Math.abs(input.changeQty)}) would drop available quantity below zero (current: ${current.quantity_available}).`,
    };
  }

  const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const queries = [
    {
      sql: 'UPDATE inventory_items SET quantity_available = quantity_available + ?, updated_at = ? WHERE variant_id = ? AND quantity_available + ? >= 0',
      params: [input.changeQty, now, variantId, input.changeQty],
    },
    {
      sql: 'INSERT INTO inventory_logs (id, variant_id, change_qty, reason, reference_id, comment, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      params: [
        logId,
        variantId,
        input.changeQty,
        input.reason,
        input.referenceId ?? 'ADMIN_MANUAL',
        input.comment,
        now,
      ],
    },
  ];

  // 1. Execute atomic D1 batch transaction!
  await db.batch(queries);

  const updatedItem: InventoryItemWithVariant = {
    ...mapRowToLedgerItem(current),
    quantityAvailable: newAvailable,
    updatedAt: now,
    status: evaluateStatus(newAvailable, current.low_stock_threshold),
  };

  const newLog: InventoryLog = {
    id: logId,
    variantId,
    changeQty: input.changeQty,
    reason: input.reason,
    referenceId: input.referenceId ?? 'ADMIN_MANUAL',
    comment: input.comment,
    createdAt: now,
  };

  return { item: updatedItem, log: newLog };
}

/**
 * Retrieves public stock status for storefront SKU availability checks
 */
export async function getPublicVariantStock(
  env: Env,
  variantId: string
): Promise<StockCheckResult | null> {
  const db = getDb(env);
  const row = await db.first<LedgerRow>(
    `SELECT i.variant_id, v.sku, v.product_id, p.name as product_name,
            i.quantity_available, i.quantity_reserved, i.low_stock_threshold, i.updated_at
     FROM inventory_items i
     INNER JOIN product_variants v ON i.variant_id = v.id
     INNER JOIN products p ON v.product_id = p.id
     WHERE i.variant_id = ? AND v.is_active = 1`,
    [variantId]
  );

  if (!row) {
    return null;
  }

  return {
    variantId: row.variant_id,
    sku: row.sku,
    quantityAvailable: row.quantity_available,
    lowStockThreshold: row.low_stock_threshold,
    status: evaluateStatus(row.quantity_available, row.low_stock_threshold),
  };
}
