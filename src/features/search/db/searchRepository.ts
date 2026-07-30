import { getDb, type Env } from '../../../core/db';
import type { SearchFilter, SearchResultPayload } from '../types';
import type { Product } from '../../products/types';
import { sanitizeFtsQuery, calculatePagination } from '../utils';

export interface SearchProductRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  base_price_pkr: number;
  category_id: string | null;
  category_name?: string | null;
  is_active: number;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

function mapRowToProduct(row: SearchProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    basePricePkr: row.base_price_pkr,
    categoryId: row.category_id,
    categoryName: row.category_name,
    isActive: Boolean(row.is_active),
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Searches and filters catalog products using D1 FTS5 full-text search with pagination
 */
export async function searchProducts(
  env: Env,
  filter: SearchFilter = {}
): Promise<SearchResultPayload> {
  const db = getDb(env);
  const ftsQuery = sanitizeFtsQuery(filter.q);

  let fromClause = 'FROM products p LEFT JOIN categories c ON p.category_id = c.id';
  const whereClauses = ['p.is_active = 1'];
  const params: unknown[] = [];

  if (ftsQuery) {
    fromClause =
      'FROM products p INNER JOIN products_fts fts ON p.id = fts.product_id LEFT JOIN categories c ON p.category_id = c.id';
    whereClauses.push('products_fts MATCH ?');
    params.push(ftsQuery);
  }

  if (filter.category) {
    whereClauses.push('c.slug = ?');
    params.push(filter.category);
  }

  if (filter.minPrice !== undefined) {
    whereClauses.push('p.base_price_pkr >= ?');
    params.push(filter.minPrice);
  }

  if (filter.maxPrice !== undefined) {
    whereClauses.push('p.base_price_pkr <= ?');
    params.push(filter.maxPrice);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  // 1. Get total matching count
  const countSql = `SELECT COUNT(*) as total ${fromClause} ${whereSql}`;
  const countRow = await db.first<{ total: number }>(countSql, params);
  const totalItems = countRow?.total ?? 0;

  // 2. Compute pagination
  const { meta, offset, limit } = calculatePagination(totalItems, filter.page, filter.limit);

  // 3. Build sorting clause
  let orderSql = 'ORDER BY p.created_at DESC';
  if (filter.sort === 'price_asc') {
    orderSql = 'ORDER BY p.base_price_pkr ASC';
  } else if (filter.sort === 'price_desc') {
    orderSql = 'ORDER BY p.base_price_pkr DESC';
  } else if (filter.sort === 'newest') {
    orderSql = 'ORDER BY p.created_at DESC';
  } else if (filter.sort === 'relevance' && ftsQuery) {
    orderSql = 'ORDER BY fts.rank ASC';
  }

  // 4. Fetch paginated rows
  const querySql = `
    SELECT p.id, p.name, p.slug, p.description, p.base_price_pkr, p.category_id, c.name as category_name,
           p.is_active, p.seo_title, p.seo_description, p.created_at, p.updated_at
    ${fromClause}
    ${whereSql}
    ${orderSql}
    LIMIT ? OFFSET ?
  `;

  const rows = await db.query<SearchProductRow>(querySql, [...params, limit, offset]);
  const products = rows.results.map(mapRowToProduct);

  return {
    products,
    meta,
  };
}
