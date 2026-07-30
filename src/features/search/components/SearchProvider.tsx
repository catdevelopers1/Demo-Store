import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Product } from '../../products/types';
import type { SearchFilter, PaginationMeta } from '../types';

export interface SearchContextValue {
  products: Product[];
  meta: PaginationMeta;
  loading: boolean;
  error: string | null;
  filter: SearchFilter;
  setFilter: React.Dispatch<React.SetStateAction<SearchFilter>>;
  search: (customFilter?: Partial<SearchFilter>) => Promise<void>;
  resetFilter: () => void;
}

const DEFAULT_META: PaginationMeta = {
  total: 0,
  page: 1,
  limit: 12,
  totalPages: 1,
};

const SearchContext = createContext<SearchContextValue | undefined>(undefined);

export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_META);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<SearchFilter>({
    sort: 'relevance',
    page: 1,
    limit: 12,
  });

  const performSearch = async (currentFilter: SearchFilter) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (currentFilter.q) params.set('q', currentFilter.q);
      if (currentFilter.category) params.set('category', currentFilter.category);
      if (currentFilter.minPrice !== undefined) params.set('minPrice', String(currentFilter.minPrice));
      if (currentFilter.maxPrice !== undefined) params.set('maxPrice', String(currentFilter.maxPrice));
      if (currentFilter.sort) params.set('sort', currentFilter.sort);
      if (currentFilter.page) params.set('page', String(currentFilter.page));
      if (currentFilter.limit) params.set('limit', String(currentFilter.limit));

      const res = await fetch(`/api/v1/search?${params.toString()}`);
      if (res.ok) {
        const json = (await res.json()) as {
          success?: boolean;
          data?: Product[];
          meta?: Partial<PaginationMeta>;
        };
        if (json?.success && json.data) {
          setProducts(json.data);
          setMeta({
            total: json.meta?.total ?? json.data.length,
            page: json.meta?.page ?? currentFilter.page ?? 1,
            limit: json.meta?.limit ?? currentFilter.limit ?? 12,
            totalPages: json.meta?.totalPages ?? Math.max(1, Math.ceil((json.meta?.total ?? json.data.length) / 12)),
          });
        }
      } else {
        setError('Failed to query Cloudflare D1 FTS5 search index.');
      }
    } catch {
      setError('A network error occurred while searching catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void performSearch(filter);
  }, [filter]);

  const search = async (customFilter: Partial<SearchFilter> = {}): Promise<void> => {
    setFilter((prev) => ({
      ...prev,
      ...customFilter,
      page: customFilter.page ?? 1,
    }));
  };

  const resetFilter = () => {
    setFilter({
      sort: 'relevance',
      page: 1,
      limit: 12,
    });
  };

  return (
    <SearchContext.Provider
      value={{
        products,
        meta,
        loading,
        error,
        filter,
        setFilter,
        search,
        resetFilter,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export function useSearch(): SearchContextValue {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a <SearchProvider /> component.');
  }
  return context;
}
