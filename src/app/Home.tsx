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

  // Curate products into official Khaadi collections
  const unstitchedProducts = products.filter((p) =>
    p.categoryName?.toUpperCase().includes('UNSTITCHED') || p.name.includes('Lawn') || p.name.includes('Khaddar')
  );
  const readyToWearProducts = products.filter(
    (p) =>
      p.categoryName?.toUpperCase().includes('READY TO WEAR') ||
      p.name.includes('Kurta') ||
      p.name.includes('Co-ord') ||
      p.name.includes('Pret')
  );
  const fabricsProducts = products.filter((p) =>
    p.categoryName?.toUpperCase().includes('FABRICS') || p.name.includes('Cambric') || p.name.includes('Silk')
  );
  const newArrivals = products.slice(0, 12);
  const displayUnstitched = unstitchedProducts.length > 0 ? unstitchedProducts.slice(0, 12) : products.slice(12, 24);
  const displayReadyToWear = readyToWearProducts.length > 0 ? readyToWearProducts.slice(0, 12) : products.slice(0, 12);
  const displayFabrics = fabricsProducts.length > 0 ? fabricsProducts.slice(0, 12) : products.slice(24, 36);

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
          categorySlug="new-in"
        />
      </section>

      {/* 4. Product Carousel 2: UNSTITCHED */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProductCarousel
          title="UNSTITCHED"
          products={displayUnstitched}
          categorySlug="unstitched"
        />
      </section>

      {/* 5. Product Carousel 3: READY TO WEAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProductCarousel
          title="READY TO WEAR"
          products={displayReadyToWear}
          categorySlug="ready-to-wear"
        />
      </section>

      {/* 6. Product Carousel 4: FABRICS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProductCarousel
          title="FABRICS"
          products={displayFabrics}
          categorySlug="fabrics"
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
