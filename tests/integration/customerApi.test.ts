import { describe, it, expect, vi } from 'vitest';
import {
  createCustomerAddress,
  deleteCustomerAddress,
} from '../../src/features/customers/db/customerRepository';
import type { Env } from '../../src/core/db';
import type { D1Database, KVNamespace, R2Bucket } from '@cloudflare/workers-types';

describe('Customer Address Book & Atomic Default Promotion Integration', () => {
  it('automatically sets isDefault = true when adding the very first address to an account', async () => {
    const mockBatch = vi.fn().mockResolvedValue([]);

    // Existing addresses empty
    const mockAll = vi.fn().mockResolvedValue({ success: true, results: [] });
    const mockPrepare = vi.fn().mockImplementation(() => ({
      bind: () => ({ all: mockAll }),
    }));

    const mockEnv: Env = {
      DB: { prepare: mockPrepare, batch: mockBatch } as unknown as D1Database,
      KV: {} as unknown as KVNamespace,
      BUCKET: {} as unknown as R2Bucket,
      ENVIRONMENT: 'development',
    };

    const address = await createCustomerAddress(mockEnv, 'usr_1', {
      recipientName: 'Ahmed Khan',
      phone: '0300-1234567',
      provinceState: 'Punjab',
      city: 'Lahore',
      streetAddress: 'Gulberg III',
      isDefault: false, // Passed false, but should become true since it's the first!
    });

    expect(address.isDefault).toBe(true);
    expect(mockBatch).toHaveBeenCalledTimes(1);
  });

  it('atomically updates customer profile and resets other default flags when adding a new default address', async () => {
    const mockBatch = vi.fn().mockResolvedValue([]);
    const existingAddresses = [
      { id: 'addr_1', customer_id: 'usr_1', is_default: 1, created_at: '2026-07-01T00:00:00Z' },
    ];

    const mockAll = vi.fn().mockResolvedValue({ success: true, results: existingAddresses });
    const mockPrepare = vi.fn().mockImplementation(() => ({
      bind: () => ({ all: mockAll }),
    }));

    const mockEnv: Env = {
      DB: { prepare: mockPrepare, batch: mockBatch } as unknown as D1Database,
      KV: {} as unknown as KVNamespace,
      BUCKET: {} as unknown as R2Bucket,
      ENVIRONMENT: 'development',
    };

    const address = await createCustomerAddress(mockEnv, 'usr_1', {
      recipientName: 'Bilal Ahmed',
      phone: '0300-9999999',
      provinceState: 'Sindh',
      city: 'Karachi',
      streetAddress: 'DHA Phase 6',
      isDefault: true,
    });

    expect(address.isDefault).toBe(true);
    expect(mockBatch).toHaveBeenCalledTimes(1);
    const batchArg = mockBatch.mock.calls[0]![0] as unknown[];
    expect(batchArg.length).toBe(4); // 1 INSERT IGNORE profile, 1 UPDATE reset addresses, 1 UPDATE set profile default, 1 INSERT address
  });

  it('promotes remaining address to default when the active default address is deleted', async () => {
    const mockBatch = vi.fn().mockResolvedValue([]);
    const mockFirst = vi.fn().mockResolvedValue({ is_default: 1 });
    const remainingAddresses = [
      {
        id: 'addr_remaining_2',
        customer_id: 'usr_1',
        recipient_name: 'Ahmed Khan',
        phone: '0300-1234567',
        city: 'Lahore',
        province_state: 'Punjab',
        street_address: 'Gulberg III',
        postal_code: '54660',
        is_default: 0,
        created_at: '2026-07-15T00:00:00Z',
      },
    ];

    const mockAll = vi.fn().mockResolvedValue({ success: true, results: remainingAddresses });
    const mockRun = vi.fn().mockResolvedValue({ success: true });
    const mockPrepare = vi.fn().mockImplementation(() => ({
      bind: () => ({
        first: mockFirst,
        all: mockAll,
        run: mockRun,
      }),
    }));

    const mockEnv: Env = {
      DB: { prepare: mockPrepare, batch: mockBatch } as unknown as D1Database,
      KV: {} as unknown as KVNamespace,
      BUCKET: {} as unknown as R2Bucket,
      ENVIRONMENT: 'development',
    };

    const result = await deleteCustomerAddress(mockEnv, 'usr_1', 'addr_old_1');
    expect(result).toEqual({ success: true, id: 'addr_old_1' });
    expect(mockBatch).toHaveBeenCalledTimes(1); // Promotes addr_remaining_2 to is_default = 1
  });
});
