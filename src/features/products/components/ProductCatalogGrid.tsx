import React from 'react';
import { useProducts } from './ProductsProvider';
import { ProductCard } from './ProductCard';
import { Package } from 'lucide-react';

export const ProductCatalogGrid: React.FC = () => {
  const { products, loading } = useProducts();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-stone-900 dark:text-white tracking-tight">
            Complete Catalog
          </h2>
        </div>
      </div>

      {loading && products.length === 0 ? (
        <div className="py-12 text-center text-xs text-stone-400">
          Loading catalog...
        </div>
      ) : products.length === 0 ? (
        <div className="py-12 bg-white rounded-2xl border border-stone-200 text-center p-8">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center mx-auto mb-3">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-stone-900 text-sm">No Products Found</h3>
          <p className="text-xs text-stone-500 mt-1">
            No active apparel products exist in the database yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
