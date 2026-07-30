import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { formatPkr } from '../../variants/utils';
import { Eye } from 'lucide-react';

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <Link
      to={`/product/${product.slug}`}
      className="group block bg-transparent flex flex-col justify-between"
    >
      {/* 3/4 Khaadi Vertical Fashion Lookbook Aspect Ratio */}
      <div className="bg-[#F5F5F5] aspect-[3/4] relative overflow-hidden flex items-center justify-center">
        {product.primaryImageUrl ? (
          <img
            src={product.primaryImageUrl}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <img
            src="/placeholder-green.svg"
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        )}

        {/* Minimalist Floating Quick View Icon (Top Right on hover) */}
        <span
          aria-label="Quick View"
          className="absolute top-3 right-3 p-2.5 rounded-full bg-white/90 text-black shadow-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black hover:text-white"
        >
          <Eye className="w-3.5 h-3.5 stroke-[1.5]" />
        </span>

        {/* Subtle SALE / NEW badge if applicable */}
        <span className="absolute top-3 left-3 bg-black text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-[0.15em]">
          NEW IN
        </span>
      </div>

      {/* Khaadi Typography Below Photo */}
      <div className="pt-3 pb-1 flex flex-col justify-start">
        <span className="text-[10px] text-[#737373] tracking-[0.14em] uppercase font-medium">
          {product.categoryName ?? 'EMBROIDERED LAWN'}
        </span>

        <h3 className="text-xs sm:text-sm font-normal text-[#1A1A1A] truncate mt-0.5 group-hover:underline">
          {product.name}
        </h3>

        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-xs sm:text-sm font-bold text-[#1A1A1A]">
            {formatPkr(product.basePricePkr)}
          </span>

          {/* Size Pills visible on card hover */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-[9px] font-bold border border-[#EBEBEB] px-1.5 py-0.5 text-black">
              S
            </span>
            <span className="text-[9px] font-bold border border-[#EBEBEB] px-1.5 py-0.5 text-black">
              M
            </span>
            <span className="text-[9px] font-bold border border-[#EBEBEB] px-1.5 py-0.5 text-black">
              L
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
