import React from 'react';
import { Truck, ShieldCheck, Zap, ShoppingBag, Search as SearchIcon, RefreshCw, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../features/settings';
import { CategoryGrid } from '../features/categories';
import { ProductCatalogGrid } from '../features/products';
import { SeoHead } from '../features/seo';

export const Home: React.FC = () => {
  const { settings } = useSettings();

  return (
    <div className="space-y-16 pb-16">
      <SeoHead
        title={`${settings.brandName} | Exquisite Pakistani Fashion`}
        description="Shop luxury unstitched lawn, khaddar, and ready-to-wear Pakistani clothing with Cash on Delivery across Pakistan."
        canonicalUrl="https://pakistani-commerce.edge.app/"
        ogType="website"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: settings.brandName,
          url: 'https://pakistani-commerce.edge.app/',
          description: settings.brandTagline,
        }}
      />

      {/* High-Impact Luxury Fashion Hero Lookbook Banner */}
      <section className="relative bg-stone-950 text-white overflow-hidden min-h-[580px] flex items-center justify-center">
        {/* Background Lookbook Photo Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 scale-105 transform duration-1000"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1600&q=80)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 py-20">
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Summer Festive Collection 2026</span>
          </span>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-extrabold tracking-tight leading-tight text-white uppercase">
            {settings.brandName}
          </h1>

          <p className="max-w-2xl mx-auto text-stone-200 text-sm sm:text-lg font-light tracking-wide leading-relaxed">
            Exquisite Unstitched Lawn, Winter Khaddar, and Ready-to-Wear Luxury Pret crafted for the modern Pakistani wardrobe.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-700 text-white font-semibold px-8 py-4 rounded-full text-xs uppercase tracking-widest transition-all shadow-xl hover:shadow-2xl hover:scale-105"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Shop New Arrivals</span>
            </Link>

            <Link
              to="/search"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 font-semibold px-8 py-4 rounded-full text-xs uppercase tracking-widest backdrop-blur-md transition-all hover:scale-105"
            >
              <SearchIcon className="w-4 h-4" />
              <span>Explore Lookbook</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4 Minimalist Icon Value Badges (Less text, more icons) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6 stroke-1" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-stone-900 dark:text-white text-sm">
                Free COD Shipping
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Orders over PKR 5,000
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 stroke-1" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-stone-900 dark:text-white text-sm">
                Instant Verification
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                WhatsApp &amp; SMS Helpline
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <RefreshCw className="w-6 h-6 stroke-1" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-stone-900 dark:text-white text-sm">
                7-Day Exchange
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Hassle-Free Returns Policy
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 stroke-1" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-stone-900 dark:text-white text-sm">
                100% Original
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Pure Lawn &amp; Khaddar Fabrics
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collections Taxonomy Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 tracking-widest uppercase">
            Curated Collections
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-stone-900 dark:text-white tracking-tight mt-1">
            Shop by Category
          </h2>
        </div>
        <CategoryGrid />
      </section>

      {/* 100-Product Catalog Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProductCatalogGrid />
      </section>
    </div>
  );
};
