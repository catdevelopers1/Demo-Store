import React from 'react';
import { Truck, ShieldCheck, Zap, PhoneCall } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../features/settings';
import { CategoryGrid } from '../features/categories';
import { ProductCatalogGrid } from '../features/products';

export const Home: React.FC = () => {
  const { settings } = useSettings();

  return (
    <div className="space-y-16 py-12">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-stone-900 to-stone-800 rounded-3xl text-white p-8 sm:p-16 flex flex-col items-start justify-center shadow-xl relative overflow-hidden">
          <span className="bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-6">
            PK COD E-Commerce Foundation • {settings.brandName}
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight max-w-2xl">
            {settings.brandTagline}
          </h1>
          <p className="mt-4 text-stone-300 text-sm sm:text-base max-w-xl leading-relaxed">
            Built from the ground up for Cash on Delivery (COD) brands. Powered by Cloudflare Edge, D1 Serverless SQLite, and high-speed FTS5 search across Pakistani fashion collections.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/search"
              className="bg-emerald-700 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all shadow-md hover:shadow-lg"
            >
              Discover & Search
            </Link>
            <Link
              to="/products"
              className="bg-stone-800/80 hover:bg-stone-700 text-stone-200 border border-stone-600 font-semibold px-6 py-3 rounded-xl text-sm transition-all"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      </section>

      {/* Database/KV Driven Pakistani Collections Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CategoryGrid />
      </section>

      {/* Database Driven Catalog Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProductCatalogGrid />
      </section>

      {/* Value Propositions for Pakistani Market */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold text-stone-900 mb-6 tracking-tight">
          Pakistani Market Architecture Highlights
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-stone-900">Cash on Delivery First</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Tailored checkout supporting Pakistani phone verification, city shipping rates, and order confirmation tracking.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-stone-900">Turnstile Anti-Bot</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Integrated Cloudflare Turnstile protection blocks fraudulent COD order attempts and automated spam checkouts.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-stone-900">Edge-First Performance</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Serverless SQLite D1 with FTS5 search executes on Cloudflare Edge nodes for sub-millisecond catalog discovery.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <PhoneCall className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-stone-900">03XX Number Formatting</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Built-in validation and normalization for Pakistani mobile numbers and address books across all provinces.
            </p>
          </div>
        </div>
      </section>

      {/* Framework Status Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-100 border border-stone-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-stone-900 text-sm">
              Milestone 12 (`v0.13.0`): Order Lifecycle Management &amp; Audit Timeline Complete
            </h3>
            <p className="text-xs text-stone-600 mt-1">
              COD state machine, mobile-verified customer tracking, and atomic cancellation restock operational.
            </p>
          </div>
          <span className="bg-emerald-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
            Ready for Milestone 13
          </span>
        </div>
      </section>
    </div>
  );
};
