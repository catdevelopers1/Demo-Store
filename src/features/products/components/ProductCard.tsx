import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { formatPkr } from '../../variants/utils';
import { ArrowRight, Tag } from 'lucide-react';

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      {/* Aspect ratio image placeholder */}
      <div className="bg-stone-100 aspect-[4/5] flex items-center justify-center border-b border-stone-100 relative">
        <span className="text-stone-400 text-xs font-medium uppercase tracking-wider">
          {product.categoryName ?? 'Pakistani Apparel'}
        </span>
        <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-stone-800 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-stone-200/50 shadow-xs flex items-center gap-1">
          <Tag className="w-3 h-3 text-emerald-700" />
          <span>COD Ready</span>
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col justify-between flex-1">
        <div>
          <h3 className="font-bold text-stone-900 text-base line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
            {product.description ?? 'Unstitched and Ready-to-Wear Pakistani clothing.'}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
              COD Price
            </span>
            <span className="font-extrabold text-stone-900 text-base">
              {formatPkr(product.basePricePkr)}
            </span>
          </div>

          <Link
            to={`/product/${product.slug}`}
            className="inline-flex items-center gap-1 bg-stone-900 hover:bg-emerald-800 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-colors"
          >
            <span>Select Options</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
