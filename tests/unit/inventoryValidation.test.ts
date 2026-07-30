import { describe, it, expect } from 'vitest';
import { adjustStockSchema } from '../../src/features/inventory/validation';

describe('Zod Inventory Stock Adjustment Validation Schema', () => {
  it('accepts valid restock or adjustment payloads with mandatory audit comment', () => {
    const input = {
      changeQty: 15,
      reason: 'RESTOCK' as const,
      referenceId: 'PO-2026-99',
      comment: 'Received winter khaddar stock from Lahore factory',
    };

    const result = adjustStockSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('accepts negative quantity adjustments with audit comment', () => {
    const input = {
      changeQty: -2,
      reason: 'ADJUSTMENT' as const,
      comment: 'Damaged item audit adjustment',
    };

    const result = adjustStockSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('rejects zero change quantity', () => {
    const input = {
      changeQty: 0,
      reason: 'RESTOCK' as const,
      comment: 'No change',
    };

    const result = adjustStockSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects short or missing audit comments', () => {
    const input = {
      changeQty: 10,
      reason: 'RESTOCK' as const,
      comment: 'ok',
    };

    const result = adjustStockSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});
