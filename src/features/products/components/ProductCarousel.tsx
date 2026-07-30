import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import type { Product } from '../types';
import { ProductCard } from './ProductCard';

interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  products: Product[];
  categorySlug?: string;
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  title,
  subtitle,
  products,
  categorySlug,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -600, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 600, behavior: 'smooth' });
    }
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Carousel Header with Arrows */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-stone-900 dark:text-white tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {categorySlug && (
            <Link
              to={`/search?category=${categorySlug}`}
              className="text-xs font-semibold text-[var(--brand-primary-hex,#047857)] hover:underline inline-flex items-center gap-1 mr-2"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          <button
            type="button"
            onClick={scrollLeft}
            aria-label="Scroll Carousel Left"
            className="p-2.5 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-emerald-800 hover:text-white text-stone-700 dark:text-stone-300 transition-colors shadow-xs cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={scrollRight}
            aria-label="Scroll Carousel Right"
            className="p-2.5 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-emerald-800 hover:text-white text-stone-700 dark:text-stone-300 transition-colors shadow-xs cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrolling Product Slider */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 pt-1 px-1 -mx-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {products.map((p) => (
          <div
            key={p.id}
            className="min-w-[260px] sm:min-w-[280px] max-w-[300px] shrink-0 snap-start flex flex-col"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
};
