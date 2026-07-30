import { describe, it, expect, vi } from 'vitest';
import {
  getAllCategories,
  createCategory,
  updateCategory,
} from '../../src/features/categories/db/categoryRepository';
import type { Env } from '../../src/core/db';
import type { D1Database, KVNamespace, R2Bucket } from '@cloudflare/workers-types';

describe('Category Repository & Cache Integration', () => {
  it('reads categories from KV cache without querying D1 when cache hit occurs', async () => {
    const cachedCategories = [
      {
        id: 'cat_lawn',
        parentId: null,
        name: 'Unstitched Lawn',
        slug: 'unstitched-lawn',
        sortOrder: 10,
        isActive: true,
      },
    ];

    const mockGet = vi.fn().mockResolvedValue(JSON.stringify(cachedCategories));
    const mockPrepare = vi.fn();

    const mockEnv: Env = {
      DB: { prepare: mockPrepare } as unknown as D1Database,
      KV: { get: mockGet } as unknown as KVNamespace,
      BUCKET: {} as unknown as R2Bucket,
      ENVIRONMENT: 'development',
    };

    const categories = await getAllCategories(mockEnv);
    expect(categories).toHaveLength(1);
    expect(categories[0]?.name).toBe('Unstitched Lawn');
    expect(mockGet).toHaveBeenCalledWith('categories_cache', 'text');
    expect(mockPrepare).not.toHaveBeenCalled();
  });

  it('creates a new category in D1 and invalidates KV cache', async () => {
    const mockDelete = vi.fn().mockResolvedValue(undefined);

    const mockFirst = vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce({
      id: 'cat_test_1',
      parent_id: null,
      name: 'New Lawn',
      slug: 'new-lawn',
      description: 'Test',
      sort_order: 5,
      is_active: 1,
      created_at: new Date().toISOString(),
    });

    const mockPrepare = vi.fn().mockImplementation((_sql: string) => ({
      bind: () => ({
        first: mockFirst,
        all: vi.fn().mockResolvedValue({ success: true, results: [] }),
      }),
    }));

    const mockEnv: Env = {
      DB: { prepare: mockPrepare } as unknown as D1Database,
      KV: { delete: mockDelete } as unknown as KVNamespace,
      BUCKET: {} as unknown as R2Bucket,
      ENVIRONMENT: 'development',
    };

    const result = await createCategory(mockEnv, {
      id: 'cat_test_1',
      name: 'New Lawn',
      slug: 'new-lawn',
      sortOrder: 5,
    });

    expect('category' in result).toBe(true);
    if ('category' in result) {
      expect(result.category.name).toBe('New Lawn');
      expect(result.category.slug).toBe('new-lawn');
    }
    expect(mockDelete).toHaveBeenCalledWith('categories_cache');
  });

  it('blocks updating a category if it causes a circular reference cycle', async () => {
    const existingCategories = [
      { id: 'cat_a', parent_id: null, name: 'Root A', slug: 'a', sort_order: 1, is_active: 1 },
      { id: 'cat_b', parent_id: 'cat_a', name: 'Child B', slug: 'b', sort_order: 1, is_active: 1 },
    ];

    const mockAll = vi.fn().mockResolvedValue({
      success: true,
      results: existingCategories,
    });

    const mockPrepare = vi.fn().mockImplementation(() => ({
      bind: (...args: unknown[]) => ({
        first: () => {
          const id = args[0] as string;
          const found = existingCategories.find((c) => c.id === id);
          return Promise.resolve(found ?? null);
        },
        all: mockAll,
      }),
    }));

    const mockEnv: Env = {
      DB: { prepare: mockPrepare } as unknown as D1Database,
      KV: {} as unknown as KVNamespace,
      BUCKET: {} as unknown as R2Bucket,
      ENVIRONMENT: 'development',
    };

    // Try setting Root A's parent to Child B (would create cycle!)
    const result = await updateCategory(mockEnv, 'cat_a', { parentId: 'cat_b' });
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toContain('Circular reference detected');
    }
  });
});
