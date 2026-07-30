import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { formatPkr } from '../../variants/utils';
import { Truck, Eye, ShoppingBag } from 'lucide-react';

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <Link
      to={`/product/${product.slug}`}
      className="group bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
    >
      {/* 4/5 Aspect Ratio Fashion Lookbook Photo */}
      <div className="bg-stone-100 dark:bg-stone-800 aspect-[4/5] relative overflow-hidden flex items-center justify-center">
        {product.primaryImageUrl ? (
          <img
            src={product.primaryImageUrl}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-stone-400">
            <ShoppingBag className="w-10 h-10 stroke-1 mb-2" />
            <span className="text-[10px] uppercase tracking-wider font-semibold">
              Lookbook
            </span>
          </div>
        )}

        {/* Category Badge */}
        <span className="absolute bottom-3 left-3 bg-stone-900/80 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm tracking-wider uppercase">
          {product.categoryName ?? 'Collection'}
        </span>

        {/* Quick View Icon CTA */}
        <span
          aria-label="View Lookbook"
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-stone-900/90 backdrop-blur-md shadow-sm text-stone-900 dark:text-white group-hover:bg-[var(--brand-primary-hex,#047857)] group-hover:text-white transition-all"
        >
          <Eye className="w-3.5 h-3.5" />
        </span>
      </div>

      {/* Editorial Title & COD Price */}
      <div className="p-4 flex flex-col justify-between flex-1">
        <h3 className="font-serif font-bold text-stone-900 dark:text-white text-sm sm:text-base line-clamp-1 group-hover:text-[var(--brand-primary-hex,#047857)] transition-colors">
          {product.name}
        </h3>

        <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <span className="font-extrabold text-stone-900 dark:text-white text-sm sm:text-base">
            {formatPkr(product.basePricePkr)}
          </span>

          <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 inline-flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>COD</span>
          </span>
        </div>
      </div>
    </Link>
  );
};
