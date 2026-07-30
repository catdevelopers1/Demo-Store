import { describe, it, expect, vi } from 'vitest';
import { adjustStockManual } from '../../src/features/inventory/db/inventoryRepository';
import { reserveStock, releaseStock } from '../../src/features/inventory/api/reservation';
import type { Env } from '../../src/core/db';
import type { D1Database, KVNamespace, R2Bucket } from '@cloudflare/workers-types';

describe('Inventory Repository & Atomic Reservation Integration', () => {
  it('manually adjusts stock and writes an audit log in an atomic D1 batch transaction', async () => {
    const mockBatch = vi.fn().mockResolvedValue([]);
    const mockFirst = vi.fn().mockResolvedValue({
      variant_id: 'var_lwn_01_grn',
      sku: 'PK-LWN-GB-GRN',
      product_id: 'prod_1',
      product_name: 'Gul-e-Bahar Lawn',
      quantity_available: 25,
      quantity_reserved: 0,
      low_stock_threshold: 5,
      updated_at: new Date().toISOString(),
    });

    const mockPrepare = vi.fn().mockImplementation(() => ({
      bind: () => ({
        first: mockFirst,
        all: vi.fn().mockResolvedValue({ success: true, results: [] }),
      }),
    }));

    const mockEnv: Env = {
      DB: { prepare: mockPrepare, batch: mockBatch } as unknown as D1Database,
      KV: {} as unknown as KVNamespace,
      BUCKET: {} as unknown as R2Bucket,
      ENVIRONMENT: 'development',
    };

    const result = await adjustStockManual(mockEnv, 'var_lwn_01_grn', {
      changeQty: 10,
      reason: 'RESTOCK',
      comment: 'Received 10 suits from warehouse',
    });

    expect('item' in result).toBe(true);
    if ('item' in result) {
      expect(result.item.quantityAvailable).toBe(35); // 25 + 10
      expect(result.log.reason).toBe('RESTOCK');
    }
    expect(mockBatch).toHaveBeenCalledTimes(1);
    const batchArg = mockBatch.mock.calls[0]![0] as unknown[];
    expect(batchArg.length).toBe(2); // One UPDATE on inventory_items, one INSERT into inventory_logs
  });

  it('blocks negative inventory when manual adjustment exceeds available stock', async () => {
    const mockFirst = vi.fn().mockResolvedValue({
      variant_id: 'var_lwn_01_blu',
      sku: 'PK-LWN-GB-BLU',
      product_id: 'prod_1',
      product_name: 'Gul-e-Bahar Lawn',
      quantity_available: 3,
      quantity_reserved: 0,
      low_stock_threshold: 5,
      updated_at: new Date().toISOString(),
    });

    const mockPrepare = vi.fn().mockImplementation(() => ({
      bind: () => ({ first: mockFirst }),
    }));

    const mockEnv: Env = {
      DB: { prepare: mockPrepare } as unknown as D1Database,
      KV: {} as unknown as KVNamespace,
      BUCKET: {} as unknown as R2Bucket,
      ENVIRONMENT: 'development',
    };

    const result = await adjustStockManual(mockEnv, 'var_lwn_01_blu', {
      changeQty: -10, // Only 3 available!
      reason: 'ADJUSTMENT',
      comment: 'Attempting invalid subtraction',
    });

    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toContain('would drop available quantity below zero');
    }
  });

  it('atomically reserves stock using conditional SQL and rejects when requested exceeds available', async () => {
    const mockFirst = vi
      .fn()
      .mockResolvedValueOnce({ quantity_available: 10 }) // Enough stock
      .mockResolvedValueOnce({ quantity_available: 2 }); // Insufficient stock

    const mockBatch = vi.fn().mockResolvedValue([]);
    const mockPrepare = vi.fn().mockImplementation(() => ({
      bind: () => ({ first: mockFirst }),
    }));

    const mockEnv: Env = {
      DB: { prepare: mockPrepare, batch: mockBatch } as unknown as D1Database,
      KV: {} as unknown as KVNamespace,
      BUCKET: {} as unknown as R2Bucket,
      ENVIRONMENT: 'development',
    };

    // 1. Successful reservation
    const successResult = await reserveStock(mockEnv, 'var_khd_01_s', 3, 'ord_1001', 'COD order reservation');
    expect(successResult.success).toBe(true);
    expect(mockBatch).toHaveBeenCalledTimes(1);

    // 2. Rejected reservation when requested (5) > available (2)
    const failedResult = await reserveStock(mockEnv, 'var_khd_01_s', 5, 'ord_1002', 'COD order reservation');
    expect(failedResult.success).toBe(false);
    expect(failedResult.error).toContain('Insufficient stock available');
  });

  it('releases reserved stock back to available inventory on order cancellation', async () => {
    const mockBatch = vi.fn().mockResolvedValue([]);
    const mockPrepare = vi.fn().mockImplementation(() => ({
      bind: () => ({}),
    }));

    const mockEnv: Env = {
      DB: { prepare: mockPrepare, batch: mockBatch } as unknown as D1Database,
      KV: {} as unknown as KVNamespace,
      BUCKET: {} as unknown as R2Bucket,
      ENVIRONMENT: 'development',
    };

    const result = await releaseStock(mockEnv, 'var_khd_01_s', 2, 'CANCELLATION', 'ord_1001', 'COD order cancelled by customer');
    expect(result.success).toBe(true);
    expect(mockBatch).toHaveBeenCalledTimes(1);
  });
});
