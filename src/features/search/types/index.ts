import type { Product } from '../../products/types';

export type SearchSortOrder = 'relevance' | 'price_asc' | 'price_desc' | 'newest';

export interface SearchFilter {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: SearchSortOrder;
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SearchResultPayload {
  products: Product[];
  meta: PaginationMeta;
}
