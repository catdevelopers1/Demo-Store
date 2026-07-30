import { describe, it, expect } from 'vitest';
import { slugify, buildCategoryTree, wouldCreateCycle } from '../../src/features/categories/utils';
import type { Category } from '../../src/features/categories/types';

describe('Apparel Collection Slugify Normalizer', () => {
  it('converts titles to clean lowercase hyphens', () => {
    expect(slugify('Unstitched Lawn 3-Piece!')).toBe('unstitched-lawn-3-piece');
    expect(slugify('  Winter Khaddar & Cambric 2026 ')).toBe('winter-khaddar-cambric-2026');
    expect(slugify("Women's Ready-to-Wear")).toBe('womens-ready-to-wear');
  });
});

describe('Recursive Category Tree Builder', () => {
  it('builds a nested CategoryNode hierarchy sorted by sortOrder', () => {
    const flatList: Category[] = [
      {
        id: 'cat_root_2',
        parentId: null,
        name: 'Winter Khaddar',
        slug: 'winter-khaddar',
        sortOrder: 20,
        isActive: true,
      },
      {
        id: 'cat_root_1',
        parentId: null,
        name: 'Unstitched Lawn',
        slug: 'unstitched-lawn',
        sortOrder: 10,
        isActive: true,
      },
      {
        id: 'cat_child_1',
        parentId: 'cat_root_1',
        name: '3-Piece Lawn',
        slug: '3-piece-lawn',
        sortOrder: 1,
        isActive: true,
      },
    ];

    const tree = buildCategoryTree(flatList);
    expect(tree).toHaveLength(2);
    expect(tree[0]?.name).toBe('Unstitched Lawn'); // sortOrder 10 comes before 20
    expect(tree[0]?.children).toHaveLength(1);
    expect(tree[0]?.children[0]?.name).toBe('3-Piece Lawn');
    expect(tree[1]?.name).toBe('Winter Khaddar');
  });
});

describe('Hierarchy Cycle Detection Algorithm', () => {
  const categories: Category[] = [
    { id: 'cat_a', parentId: null, name: 'Root A', slug: 'a', sortOrder: 1, isActive: true },
    { id: 'cat_b', parentId: 'cat_a', name: 'Child B', slug: 'b', sortOrder: 1, isActive: true },
    { id: 'cat_c', parentId: 'cat_b', name: 'Grandchild C', slug: 'c', sortOrder: 1, isActive: true },
  ];

  it('blocks self-parenting as a circular reference cycle', () => {
    expect(wouldCreateCycle('cat_a', 'cat_a', categories)).toBe(true);
  });

  it('blocks setting a descendant as a parent (e.g. C as parent of A)', () => {
    expect(wouldCreateCycle('cat_a', 'cat_c', categories)).toBe(true);
    expect(wouldCreateCycle('cat_a', 'cat_b', categories)).toBe(true);
  });

  it('allows setting a valid non-ancestor parent', () => {
    expect(wouldCreateCycle('cat_c', 'cat_a', categories)).toBe(false);
  });
});
