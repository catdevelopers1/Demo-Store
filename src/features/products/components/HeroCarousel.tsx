import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  id: number;
  collectionText: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
}

const SLIDES: Slide[] = [
  {
    id: 0,
    collectionText: 'EXCLUSIVELY ONLINE • 30% - 50% OFF',
    title: 'SUMMER LAWN 2026',
    subtitle:
      'Unstitched 3-piece and ready-to-wear printed lawn ensembles paired with silk dupattas.',
    ctaText: 'SHOP SALE NOW',
    ctaLink: '/products',
    imageUrl:
      'https://us.khaadi.com/dw/image/v2/BJTG_PRD/on/demandware.static/-/Library-Sites-KhaadiSharedLibrary/default/dwa8c56fcb/images/0.0.0-07-14-2026-desktop-banner-1920x700.jpg',
  },
  {
    id: 1,
    collectionText: 'NEW COLLECTION • LUXURY PRET',
    title: 'READY TO WEAR PRET',
    subtitle:
      'Stitched velvet, raw silk, and embroidered kurtas crafted for festive wear.',
    ctaText: 'DISCOVER PRET',
    ctaLink: '/search?category=ready-to-wear',
    imageUrl:
      'https://us.khaadi.com/dw/image/v2/BJTG_PRD/on/demandware.static/-/Library-Sites-KhaadiSharedLibrary/default/dw79194ae3/images/0.0-0.0-0.0-0.0-0.0-EMAN-desktop-banner-1920x700.jpg',
  },
  {
    id: 2,
    collectionText: 'WINTER EDIT • KHADDAR & KARANDI',
    title: 'KASHMIRI KHADDAR',
    subtitle:
      'Warm textured fabrics accompanied by embroidered woolen shawls.',
    ctaText: 'EXPLORE KHADDAR',
    ctaLink: '/search?category=winter-khaddar',
    imageUrl:
      'https://us.khaadi.com/dw/image/v2/BJTG_PRD/on/demandware.static/-/Library-Sites-KhaadiSharedLibrary/default/dwadb79ae1/images/0.0-AFFAIR-desktop-banner-1920x700.jpg',
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
    <div className="relative bg-black text-white overflow-hidden w-full aspect-[16/9] sm:aspect-[21/8] md:aspect-[21/7] flex items-center justify-start">
      {/* Authentic Khaadi Campaign Banner Photo */}
      <img
        src={slide.imageUrl}
        alt="Khaadi Campaign Banner"
        className="absolute inset-0 w-full h-full object-cover opacity-95 transition-opacity duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

      {/* Slide Content (Khaadi Left-Aligned Overlay) */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 w-full space-y-4 sm:space-y-6">
        <span className="inline-block text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-gray-200">
          {slide.collectionText}
        </span>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-[0.18em] leading-tight text-white uppercase max-w-2xl">
          {slide.title}
        </h1>

        <p className="max-w-lg text-gray-200 text-xs sm:text-sm font-normal tracking-wide leading-relaxed">
          {slide.subtitle}
        </p>

        <div className="pt-2 sm:pt-4">
          <Link
            to={slide.ctaLink}
            className="inline-block bg-white text-black hover:bg-black hover:text-white px-8 sm:px-10 py-3.5 sm:py-4 text-xs font-bold tracking-[0.22em] uppercase transition-all duration-300 shadow-md"
          >
            {slide.ctaText}
          </Link>
        </div>
      </div>

      {/* Sleek Circular Left / Right Carousel Navigation Arrows */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Previous Campaign Slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white text-white hover:text-black backdrop-blur-md transition-colors flex items-center justify-center cursor-pointer"
      >
        <ChevronLeft className="w-6 h-6 stroke-1" />
      </button>

      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next Campaign Slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white text-white hover:text-black backdrop-blur-md transition-colors flex items-center justify-center cursor-pointer"
      >
        <ChevronRight className="w-6 h-6 stroke-1" />
      </button>

      {/* Khaadi Minimalist Slide Indicator Bars */}
      <div className="absolute bottom-6 left-6 sm:left-12 lg:left-16 z-20 flex items-center gap-2">
        {SLIDES.map((s, index) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setCurrentSlide(index)}
            aria-label={`Jump to slide ${index + 1}`}
            className={`h-1 transition-all duration-300 cursor-pointer ${
              currentSlide === index
                ? 'w-10 bg-white'
                : 'w-4 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
