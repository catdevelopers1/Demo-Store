import { describe, it, expect, vi } from 'vitest';
import { getDb, DatabaseClient, type Env } from '../../src/core/db';
import type { D1Database } from '@cloudflare/workers-types';

describe('Cloudflare D1 Database Wrapper Integration', () => {
  it('throws an error if DB binding is missing in environment', () => {
    expect(() => getDb({} as unknown as Env)).toThrow(/Cloudflare D1 binding "DB" is not configured/);
  });

  it('instantiates DatabaseClient and executes prepare/first successfully on mock D1', async () => {
    const mockFirst = vi.fn().mockResolvedValue({ count: 1 });
    const mockBind = vi.fn().mockReturnValue({ first: mockFirst });
    const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });

    const mockD1 = {
      prepare: mockPrepare,
    } as unknown as D1Database;

    const db = new DatabaseClient(mockD1);
    const row = await db.first<{ count: number }>('SELECT COUNT(*) as count FROM schema_migrations');

    expect(mockPrepare).toHaveBeenCalledWith('SELECT COUNT(*) as count FROM schema_migrations');
    expect(row).toEqual({ count: 1 });
  });

  it('executes atomic batch transactions across multiple SQL statements', async () => {
    const mockBatch = vi.fn().mockResolvedValue([
      { success: true, results: [] },
      { success: true, results: [] },
    ]);
    const mockPrepare = vi.fn().mockImplementation((sql: string) => ({
      bind: () => ({ sql }),
    }));

    const mockD1 = {
      prepare: mockPrepare,
      batch: mockBatch,
    } as unknown as D1Database;

    const db = new DatabaseClient(mockD1);
    const results = await db.batch([
      { sql: 'UPDATE inventory_items SET quantity_available = quantity_available - 1' },
      { sql: 'INSERT INTO orders (id, status) VALUES (?, ?)', params: ['ord_1', 'CONFIRMED'] },
    ]);

    expect(mockPrepare).toHaveBeenCalledTimes(2);
    expect(mockBatch).toHaveBeenCalledTimes(1);
    expect(results).toHaveLength(2);
  });
});
