import React from 'react';
import {
  Truck,
  ShieldCheck,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { useSettings } from '../features/settings';
import { CategoryGrid } from '../features/categories';
import {
  ProductCatalogGrid,
  HeroCarousel,
  ProductCarousel,
  useProducts,
} from '../features/products';
import { SeoHead } from '../features/seo';

export const Home: React.FC = () => {
  const { settings } = useSettings();
  const { products } = useProducts();

  // Curate products into collection carousels
  const lawnProducts = products.filter((p) =>
    p.categoryName?.toLowerCase().includes('lawn')
  );
  const khaddarProducts = products.filter((p) =>
    p.categoryName?.toLowerCase().includes('khaddar')
  );
  const pretProducts = products.filter(
    (p) =>
      p.categoryName?.toLowerCase().includes('ready') ||
      p.categoryName?.toLowerCase().includes('pret') ||
      p.categoryName?.toLowerCase().includes('formal')
  );

  const newArrivals = products.slice(0, 12);
  const displayLawn = lawnProducts.length > 0 ? lawnProducts.slice(0, 12) : products.slice(12, 24);
  const displayKhaddar =
    khaddarProducts.length > 0
      ? khaddarProducts.slice(0, 12)
      : products.slice(24, 36);
  const displayPret = pretProducts.length > 0 ? pretProducts.slice(0, 12) : products.slice(0, 12);

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

      {/* Interactive Hero Lookbook Carousel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HeroCarousel />
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

      {/* Product Carousel 1: New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProductCarousel
          title="New Arrivals &amp; Summer Eid"
          subtitle="Latest luxury unstitched lawn and ready to wear pret suits"
          products={newArrivals}
          categorySlug="unstitched-lawn"
        />
      </section>

      {/* Product Carousel 2: Summer Lawn */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProductCarousel
          title="Unstitched Lawn Collections"
          subtitle="3-Piece and 2-Piece embroidered lawn suits paired with silk and chiffon dupattas"
          products={displayLawn}
          categorySlug="3-piece-lawn"
        />
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

      {/* Product Carousel 3: Winter Khaddar & Karandi */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProductCarousel
          title="Winter Khaddar &amp; Karandi"
          subtitle="Warm textured fabrics accompanied by woven and embroidered shawls"
          products={displayKhaddar}
          categorySlug="winter-khaddar"
        />
      </section>

      {/* Product Carousel 4: Luxury Pret */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProductCarousel
          title="Ready to Wear Luxury Pret"
          subtitle="Stitched velvet, raw silk, and embroidered tunics ready for instant wear"
          products={displayPret}
          categorySlug="ready-to-wear"
        />
      </section>

      {/* 100-Product Catalog Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProductCatalogGrid />
      </section>
    </div>
  );
};
