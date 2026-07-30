import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
      {/* Khaadi Collection Row Header */}
      <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-[0.18em] uppercase text-black">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {categorySlug && (
            <Link
              to={`/search?category=${categorySlug}`}
              className="text-xs font-bold tracking-[0.18em] uppercase text-black hover:underline mr-2"
            >
              VIEW ALL
            </Link>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={scrollLeft}
              aria-label="Scroll Carousel Left"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#EAEAEA] bg-white hover:bg-black hover:text-white text-black transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
            >
              <ChevronLeft className="w-5 h-5 stroke-1" />
            </button>

            <button
              type="button"
              onClick={scrollRight}
              aria-label="Scroll Carousel Right"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#EAEAEA] bg-white hover:bg-black hover:text-white text-black transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
            >
              <ChevronRight className="w-5 h-5 stroke-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scrolling Product Cards */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 pt-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {products.map((p) => (
          <div
            key={p.id}
            className="min-w-[240px] sm:min-w-[280px] max-w-[300px] shrink-0 snap-start flex flex-col"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
};
