import React from 'react';
import {
  Truck,
  ShieldCheck,
  RefreshCw,
  Globe,
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
    <div className="space-y-16 pb-16 bg-white">
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

      {/* 1. Khaadi Full-Bleed Hero Lookbook Carousel */}
      <section className="w-full">
        <HeroCarousel />
      </section>

      {/* 2. Khaadi Minimalist Benefits Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-y border-[#EAEAEA] py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center justify-center space-y-2">
            <Truck className="w-5 h-5 stroke-[1.5] text-black" />
            <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase text-black">
              FREE COD SHIPPING
            </h3>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">
              ORDERS OVER PKR 5,000
            </p>
          </div>

          <div className="flex flex-col items-center justify-center space-y-2">
            <ShieldCheck className="w-5 h-5 stroke-[1.5] text-black" />
            <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase text-black">
              100% ORIGINAL FABRICS
            </h3>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">
              PURE LAWN &amp; KHADDAR
            </p>
          </div>

          <div className="flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-5 h-5 stroke-[1.5] text-black" />
            <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase text-black">
              7-DAY EXCHANGE
            </h3>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">
              EASY RETURNS POLICY
            </p>
          </div>

          <div className="flex flex-col items-center justify-center space-y-2">
            <Globe className="w-5 h-5 stroke-[1.5] text-black" />
            <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase text-black">
              NATIONWIDE DISPATCH
            </h3>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">
              ALL 7 PROVINCES &amp; CITIES
            </p>
          </div>
        </div>
      </section>

      {/* 3. Product Carousel 1: NEW IN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProductCarousel
          title="NEW IN"
          products={newArrivals}
          categorySlug="unstitched-lawn"
        />
      </section>

      {/* 4. Product Carousel 2: UNSTITCHED LAWN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProductCarousel
          title="UNSTITCHED LAWN"
          products={displayLawn}
          categorySlug="3-piece-lawn"
        />
      </section>

      {/* 5. Product Carousel 3: READY TO WEAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProductCarousel
          title="READY TO WEAR"
          products={displayPret}
          categorySlug="ready-to-wear"
        />
      </section>

      {/* 6. Product Carousel 4: WINTER KHADDAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProductCarousel
          title="WINTER KHADDAR"
          products={displayKhaddar}
          categorySlug="winter-khaddar"
        />
      </section>

      {/* 7. Shop by Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CategoryGrid />
      </section>

      {/* 8. 100-Product Catalog Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProductCatalogGrid />
      </section>
    </div>
  );
};
