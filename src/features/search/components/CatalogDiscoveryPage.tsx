import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearch } from './SearchProvider';
import { useCategories } from '../../categories';
import { ProductCard } from '../../products/components/ProductCard';
import {
  Search as SearchIcon,
  Filter,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  Package,
} from 'lucide-react';
import { SeoHead } from '../../seo';
import type { SearchSortOrder } from '../types';

export const CatalogDiscoveryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, meta, loading, error, filter, search, resetFilter } = useSearch();
  const { categories } = useCategories();

  const [localKeyword, setLocalKeyword] = useState<string>(searchParams.get('q') ?? '');
  const [minPriceInput, setMinPriceInput] = useState<string>(
    searchParams.get('minPrice') ?? ''
  );
  const [maxPriceInput, setMaxPriceInput] = useState<string>(
    searchParams.get('maxPrice') ?? ''
  );

  // Synchronize URL query params with SearchProvider filter
  useEffect(() => {
    const qParam = searchParams.get('q') ?? undefined;
    const catParam = searchParams.get('category') ?? undefined;
    const minParam = searchParams.get('minPrice');
    const maxParam = searchParams.get('maxPrice');
    const sortParam = (searchParams.get('sort') as SearchSortOrder) ?? 'relevance';
    const pageParam = searchParams.get('page');

    void search({
      q: qParam,
      category: catParam,
      minPrice: minParam ? Number(minParam) : undefined,
      maxPrice: maxParam ? Number(maxParam) : undefined,
      sort: sortParam,
      page: pageParam ? Number(pageParam) : 1,
    });
  }, [searchParams]);

  const handleKeywordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (localKeyword.trim()) {
      newParams.set('q', localKeyword.trim());
    } else {
      newParams.delete('q');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleCategorySelect = (slug?: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (slug) {
      newParams.set('category', slug);
    } else {
      newParams.delete('category');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleSortChange = (sortOrder: SearchSortOrder) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', sortOrder);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (minPriceInput && Number(minPriceInput) >= 0) {
      newParams.set('minPrice', minPriceInput);
    } else {
      newParams.delete('minPrice');
    }
    if (maxPriceInput && Number(maxPriceInput) >= 0) {
      newParams.set('maxPrice', maxPriceInput);
    } else {
      newParams.delete('maxPrice');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setLocalKeyword('');
    setMinPriceInput('');
    setMaxPriceInput('');
    setSearchParams(new URLSearchParams());
    resetFilter();
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(newPage));
    setSearchParams(newParams);
  };

  const currentCategorySlug = searchParams.get('category');
  const currentSort = (searchParams.get('sort') as SearchSortOrder) ?? 'relevance';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SeoHead
        title="Discover Pakistani Clothing Collections | COD Fashion"
        description="Search and filter Pakistani clothing collections, lawn suits, khaddar, and unstitched fabrics with FTS5 instant search."
        canonicalUrl="https://pakistani-commerce.edge.app/search"
      />
      {/* Header & Main Search Bar */}
      <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Cloudflare D1 FTS5 Engine
            </span>
            <h1 className="text-2xl font-bold text-stone-900 mt-1">
              Storefront Product Discovery
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Instant keyword search across Pakistani apparel names, descriptions, SKUs, and collections.
            </p>
          </div>

          <form onSubmit={handleKeywordSubmit} className="w-full md:w-96 flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                <SearchIcon className="w-4 h-4" />
              </span>
              <input
                type="search"
                value={localKeyword}
                onChange={(e) => setLocalKeyword(e.target.value)}
                placeholder="Search Lawn, Khaddar, SKUs..."
                aria-label="Search catalog keywords"
                className="w-full pl-9 pr-4 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600 bg-stone-50 font-medium"
              />
            </div>
            <button
              type="submit"
              className="bg-emerald-800 hover:bg-emerald-700 text-white font-semibold px-5 py-2 rounded-xl text-xs transition-colors shadow-sm"
            >
              Search
            </button>
          </form>
        </div>

        {/* Filter Bar: Category Pills & Sorting */}
        <div className="mt-8 pt-6 border-t border-stone-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-stone-500 uppercase mr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Category:</span>
            </span>
            <button
              type="button"
              onClick={() => handleCategorySelect(undefined)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                !currentCategorySlug
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              All Collections
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat.slug)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  currentCategorySlug === cat.slug
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-500 uppercase flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Sort:</span>
              </span>
              <select
                value={currentSort}
                onChange={(e) => handleSortChange(e.target.value as SearchSortOrder)}
                aria-label="Sort products"
                className="px-3 py-1.5 text-xs border border-stone-300 rounded-xl bg-white font-semibold focus:outline-none focus:border-emerald-600"
              >
                <option value="relevance">Relevance (FTS5 Rank)</option>
                <option value="price_asc">Price: Low to High (PKR)</option>
                <option value="price_desc">Price: High to Low (PKR)</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>

            {(filter.q || filter.category || filter.minPrice || filter.maxPrice) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs text-red-700 hover:text-red-900 font-semibold flex items-center gap-1 underline"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Price Range PKR Form */}
        <form
          onSubmit={handlePriceApply}
          className="mt-4 pt-4 border-t border-stone-100 flex flex-wrap items-center gap-3 text-xs"
        >
          <span className="font-bold text-stone-500 uppercase">Price Filter (PKR):</span>
          <input
            type="number"
            min="0"
            placeholder="Min PKR"
            value={minPriceInput}
            onChange={(e) => setMinPriceInput(e.target.value)}
            className="w-28 px-3 py-1 border border-stone-300 rounded-lg font-mono focus:outline-none focus:border-emerald-600"
          />
          <span className="text-stone-400">—</span>
          <input
            type="number"
            min="0"
            placeholder="Max PKR"
            value={maxPriceInput}
            onChange={(e) => setMaxPriceInput(e.target.value)}
            className="w-28 px-3 py-1 border border-stone-300 rounded-lg font-mono focus:outline-none focus:border-emerald-600"
          />
          <button
            type="submit"
            className="bg-stone-800 hover:bg-stone-700 text-white font-semibold px-4 py-1 rounded-lg"
          >
            Apply Price
          </button>
        </form>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-stone-700">
          Showing {products.length} of {meta.total} Pakistani apparel items
        </h2>
        <span className="text-xs text-stone-400 font-mono">
          Page {meta.page} of {meta.totalPages} • Edge Caching Active (`30s`)
        </span>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl"
        >
          {error}
        </div>
      )}

      {/* Product Discovery Grid */}
      {loading && products.length === 0 ? (
        <div className="py-16 text-center text-xs text-stone-400 bg-white rounded-3xl border border-stone-200">
          Searching Cloudflare D1 FTS5 index...
        </div>
      ) : products.length === 0 ? (
        <div className="py-16 bg-white rounded-3xl border border-stone-200 text-center p-8">
          <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="font-bold text-stone-900 text-sm">No Matching Items Found</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            No clothing items match your keyword query or filter selection. Try searching for &quot;Lawn&quot; or &quot;Khaddar&quot;.
          </p>
          <button
            type="button"
            onClick={handleClearFilters}
            className="mt-4 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {meta.totalPages > 1 && (
        <div className="mt-12 flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200">
          <button
            type="button"
            disabled={meta.page <= 1}
            onClick={() => handlePageChange(meta.page - 1)}
            className="px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Page</span>
          </button>

          <span className="text-xs font-bold text-stone-700">
            Page {meta.page} of {meta.totalPages}
          </span>

          <button
            type="button"
            disabled={meta.page >= meta.totalPages}
            onClick={() => handlePageChange(meta.page + 1)}
            className="px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1"
          >
            <span>Next Page</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
