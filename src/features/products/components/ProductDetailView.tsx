import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProducts } from './ProductsProvider';
import { ProductImageGallery } from './ProductImageGallery';
import { useCart } from '../../cart';
import type { ProductWithVariants } from '../types';
import type { ProductVariant } from '../../variants/types';
import { formatPkr } from '../../variants/utils';
import { SeoHead } from '../../seo';
import {
  ShieldCheck,
  Tag,
  Check,
  AlertCircle,
  ArrowLeft,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

interface SkuStockInfo {
  quantityAvailable: number;
  lowStockThreshold: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

export const ProductDetailView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { fetchProductBySlug } = useProducts();
  const { addItem } = useCart();

  const [product, setProduct] = useState<ProductWithVariants | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [stockInfo, setStockInfo] = useState<SkuStockInfo | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadProduct() {
      if (!slug) return;
      setLoading(true);
      const data = await fetchProductBySlug(slug);
      if (isMounted && data) {
        setProduct(data);
        const defaults: Record<string, string> = {};
        for (const opt of data.options) {
          if (opt.values.length > 0) {
            defaults[opt.name] = opt.values[0]!.value;
          }
        }
        setSelectedOptions(defaults);
      }
      if (isMounted) {
        setLoading(false);
      }
    }
    void loadProduct();
    return () => {
      isMounted = false;
    };
  }, [slug, fetchProductBySlug]);

  // Find active matching variant from selected option values
  const matchingVariant: ProductVariant | undefined = product?.variants.find((v) => {
    if (v.optionValues.length === 0) return true;
    return v.optionValues.every((valItem) => {
      const opt = product.options.find((o) => o.id === valItem.optionId);
      if (!opt) return false;
      return selectedOptions[opt.name] === valItem.value;
    });
  });

  // Check real-time stock availability for selected variant
  useEffect(() => {
    let isMounted = true;
    async function checkSkuStock() {
      if (!matchingVariant) {
        setStockInfo(null);
        return;
      }
      try {
        const res = await fetch(`/api/v1/inventory/check?variantId=${matchingVariant.id}`);
        if (res.ok) {
          const json = (await res.json()) as { success?: boolean; data?: SkuStockInfo };
          if (isMounted && json?.success && json.data) {
            setStockInfo(json.data);
          }
        }
      } catch {
        // Ignore network errors
      }
    }
    void checkSkuStock();
    return () => {
      isMounted = false;
    };
  }, [matchingVariant?.id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-sm text-stone-500">
        Loading product details from Cloudflare D1...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-white rounded-3xl border border-stone-200 p-12 shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-stone-900">404 — Product Not Found</h1>
          <p className="text-xs text-stone-500 mt-2">
            The requested clothing product was not found in the catalog.
          </p>
          <Link
            to="/products"
            className="inline-block mt-6 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Return to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const effectivePricePkr = matchingVariant?.priceOverridePkr ?? product.basePricePkr;
  const activeSku = matchingVariant?.sku ?? 'N/A';
  const isOutOfStock = stockInfo?.status === 'OUT_OF_STOCK' || stockInfo?.quantityAvailable === 0;
  const isLowStock = stockInfo?.status === 'LOW_STOCK' && stockInfo.quantityAvailable > 0;

  const handleOptionClick = (optionName: string, valStr: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: valStr,
    }));
  };

  const handleAddToCart = () => {
    if (matchingVariant && !isOutOfStock) {
      void addItem(matchingVariant.id, 1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SeoHead
        title={`${product.name} — Pakistani COD Fashion`}
        description={
          product.description ??
          `Buy ${product.name} online with Cash on Delivery across Pakistan.`
        }
        canonicalUrl={`https://pakistani-commerce.edge.app/product/${product.slug}`}
        ogType="product"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: product.description ?? product.name,
          sku: activeSku,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'PKR',
            price: effectivePricePkr,
            availability: isOutOfStock
              ? 'https://schema.org/OutOfStock'
              : 'https://schema.org/InStock',
          },
        }}
      />
      <Link
        to="/products"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-emerald-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Catalog</span>
      </Link>

      <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Side: Lookbook Image Gallery */}
        <div>
          <ProductImageGallery
            productId={product.id}
            categoryName={product.categoryName ?? undefined}
          />
        </div>

        {/* Right Side: Options, SKU, Price, Stock Status & Actions */}
        <div className="flex flex-col justify-between space-y-8">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-400 font-mono uppercase tracking-wider">
                SKU: {activeSku}
              </span>
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1 text-[11px] bg-red-100 text-red-800 font-bold px-2.5 py-0.5 rounded-full">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Out of Stock</span>
                </span>
              ) : isLowStock ? (
                <span className="inline-flex items-center gap-1 text-[11px] bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Only {stockInfo.quantityAvailable} left in stock!</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
                  <Check className="w-3.5 h-3.5" />
                  <span>In Stock</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-2">
              {product.name}
            </h1>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-stone-900">
                {formatPkr(effectivePricePkr)}
              </span>
              {matchingVariant?.priceOverridePkr && (
                <span className="text-xs text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded">
                  Variant Price Override Active
                </span>
              )}
            </div>

            <p className="mt-6 text-sm text-stone-600 leading-relaxed">
              {product.description ??
                'Premium Pakistani apparel made from fine fabrics. Designed for lasting comfort and elegant style.'}
            </p>

            {/* Dynamic Option Selectors (Size, Color, Fabric) */}
            {product.options.length > 0 && (
              <div className="mt-8 space-y-6 pt-6 border-t border-stone-100">
                {product.options.map((option) => (
                  <div key={option.id}>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                      Select {option.name}:{' '}
                      <span className="text-emerald-800 font-semibold">
                        {selectedOptions[option.name]}
                      </span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {option.values.map((val) => {
                        const isSelected = selectedOptions[option.name] === val.value;
                        return (
                          <button
                            key={val.id}
                            type="button"
                            onClick={() => handleOptionClick(option.name, val.value)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                              isSelected
                                ? 'bg-emerald-800 text-white shadow-sm ring-2 ring-emerald-800 ring-offset-2'
                                : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                            }`}
                          >
                            {val.value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4 pt-6 border-t border-stone-100">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full font-bold py-4 rounded-2xl text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
                isOutOfStock
                  ? 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
                  : 'bg-emerald-800 hover:bg-emerald-700 text-white hover:shadow-lg'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>
                {isOutOfStock
                  ? 'Currently Out of Stock'
                  : `Add to COD Cart — ${formatPkr(effectivePricePkr)}`}
              </span>
            </button>

            <div className="flex items-center justify-between text-xs text-stone-500 pt-2">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                100% Original &amp; Secure COD Checkout
              </span>
              <span>7-Day Returns</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
