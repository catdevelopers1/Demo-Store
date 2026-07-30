import { describe, it, expect } from 'vitest';
import { sanitizeFtsQuery, calculatePagination } from '../../src/features/search/utils';

describe('SQLite FTS5 Query Sanitization & Prefix Matcher', () => {
  it('strips FTS5 control operators and appends prefix wildcards', () => {
    expect(sanitizeFtsQuery('lawn suit!')).toBe('lawn* suit*');
    expect(sanitizeFtsQuery('  winter AND khaddar  ')).toBe('winter* khaddar*');
    expect(sanitizeFtsQuery("women's (3-piece) OR lawn")).toBe('women* s* 3* piece* lawn*');
  });

  it('returns null for empty or symbol-only search strings', () => {
    expect(sanitizeFtsQuery('')).toBeNull();
    expect(sanitizeFtsQuery('*** () OR NOT AND')).toBeNull();
  });
});

describe('Search Pagination Metadata & Offset Calculator', () => {
  it('computes correct offset and totalPages for normal page requests', () => {
    const { meta, offset } = calculatePagination(35, 2, 10);
    expect(meta.totalPages).toBe(4); // ceil(35 / 10) = 4
    expect(meta.page).toBe(2);
    expect(offset).toBe(10); // (2 - 1) * 10
  });

  it('clamps page numbers to safe bounds', () => {
    const under = calculatePagination(20, -5, 12);
    expect(under.meta.page).toBe(1);
    expect(under.offset).toBe(0);

    const over = calculatePagination(20, 100, 12);
    expect(over.meta.page).toBe(2); // totalPages = 2
    expect(over.offset).toBe(12);
  });
});
