import type { PaginationMeta } from '../types';

/**
 * Safely sanitizes user search keyword input for SQLite FTS5 queries.
 * Strips special control characters and appends prefix wildcard '*' to tokens.
 * e.g., "lawn suit!" -> "lawn* suit*"
 */
export function sanitizeFtsQuery(raw?: string | null): string | null {
  if (!raw) return null;

  // 1. Remove FTS5 control symbols, operators & punctuation
  const cleaned = raw
    .replace(/[-"'*^$():{}[\]+~!?,.;@#%&/\\|`<>]/g, ' ')
    .replace(/\b(AND|OR|NOT|NEAR)\b/gi, ' ')
    .trim();

  if (!cleaned) return null;

  // 2. Tokenize and append prefix matching '*'
  const tokens = cleaned
    .split(/\s+/)
    .filter((token) => token.length > 0)
    .map((token) => `${token}*`);

  return tokens.length > 0 ? tokens.join(' ') : null;
}

/**
 * Calculates standardized pagination metadata and SQL offset
 */
export function calculatePagination(
  total: number,
  page = 1,
  limit = 12
): { meta: PaginationMeta; offset: number; limit: number } {
  const safeLimit = Math.max(1, Math.min(limit, 50));
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));
  const safePage = Math.max(1, Math.min(page, totalPages));
  const offset = (safePage - 1) * safeLimit;

  return {
    meta: {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages,
    },
    offset,
    limit: safeLimit,
  };
}
