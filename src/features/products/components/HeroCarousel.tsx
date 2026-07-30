import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Search as SearchIcon,
  Sparkles,
} from 'lucide-react';

interface Slide {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
}

const SLIDES: Slide[] = [
  {
    id: 0,
    badge: 'Summer Festive 2026',
    title: 'EXQUISITE UNSTITCHED LAWN',
    subtitle:
      'Pure lawn 3-piece ensembles paired with digital printed silk dupattas and embroidered damans.',
    ctaText: 'Shop Lawn Collection',
    ctaLink: '/products',
  },
  {
    id: 1,
    badge: 'Winter Collection',
    title: 'KASHMIRI KHADDAR & KARANDI',
    subtitle:
      'Warm textured fabrics accompanied by embroidered woolen shawls for effortless elegance.',
    ctaText: 'Explore Khaddar',
    ctaLink: '/search?category=winter-khaddar',
  },
  {
    id: 2,
    badge: 'Luxury Pret',
    title: 'READY TO WEAR EMBROIDERED KURTAS',
    subtitle:
      'Stitched velvet, raw silk, and cambric tunics featuring traditional tilla and zardozi work.',
    ctaText: 'Browse Ready to Wear',
    ctaLink: '/search?category=ready-to-wear',
  },
];

export const HeroCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[currentSlide] ?? SLIDES[0]!;

  return (
    <div className="relative bg-stone-950 text-white overflow-hidden rounded-3xl min-h-[520px] sm:min-h-[580px] flex items-center justify-center shadow-xl border border-stone-800">
      {/* Singular plain solid green placeholder background */}
      <img
        src="/placeholder-green-wide.svg"
        alt="Pakistani Fashion Lookbook Background"
        className="absolute inset-0 w-full h-full object-cover opacity-90 transition-opacity duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

      {/* Slide Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 py-16">
        <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/30 text-emerald-300 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
          <span>{slide.badge}</span>
        </span>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-extrabold tracking-tight leading-tight text-white uppercase">
          {slide.title}
        </h1>

        <p className="max-w-xl mx-auto text-stone-200 text-sm sm:text-base font-light tracking-wide leading-relaxed">
          {slide.subtitle}
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <Link
            to={slide.ctaLink}
            className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-700 text-white font-semibold px-7 py-3.5 rounded-full text-xs uppercase tracking-widest transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{slide.ctaText}</span>
          </Link>

          <Link
            to="/search"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 font-semibold px-7 py-3.5 rounded-full text-xs uppercase tracking-widest backdrop-blur-md transition-all hover:scale-105"
          >
            <SearchIcon className="w-4 h-4" />
            <span>Explore All Lookbooks</span>
          </Link>
        </div>
      </div>

      {/* Left / Right Carousel Arrow Buttons */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Previous Carousel Slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-stone-900/70 hover:bg-emerald-800 text-white backdrop-blur-md border border-white/10 transition-colors shadow-md cursor-pointer"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next Carousel Slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-stone-900/70 hover:bg-emerald-800 text-white backdrop-blur-md border border-white/10 transition-colors shadow-md cursor-pointer"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Indicator Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {SLIDES.map((s, index) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setCurrentSlide(index)}
            aria-label={`Jump to slide ${index + 1}`}
            className={`h-2.5 rounded-full transition-all cursor-pointer ${
              currentSlide === index
                ? 'w-8 bg-emerald-400 shadow-sm'
                : 'w-2.5 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
