import React, { useState, useEffect } from 'react';
import type { ProductImage } from '../types/image';
import { ZoomIn, Check, Tag, X, ChevronLeft, ChevronRight } from 'lucide-react';

export const ProductImageGallery: React.FC<{ productId: string; categoryName?: string }> = ({
  productId,
  categoryName,
}) => {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [activeImage, setActiveImage] = useState<ProductImage | null>(null);
  const [zoomModalOpen, setZoomModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchImages() {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/products/${productId}/images`);
        if (res.ok) {
          const json = (await res.json()) as { success?: boolean; data?: ProductImage[] };
          if (isMounted && json?.success && json.data) {
            setImages(json.data);
            const primary = json.data.find((i) => i.isPrimary) ?? json.data[0] ?? null;
            setActiveImage(primary);
          }
        }
      } catch {
        // Ignore offline errors
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    void fetchImages();
    return () => {
      isMounted = false;
    };
  }, [productId]);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length <= 1 || !activeImage) {
      return;
    }
    const idx = images.findIndex((img) => img.id === activeImage.id);
    const prevIdx = idx <= 0 ? images.length - 1 : idx - 1;
    setActiveImage(images[prevIdx] ?? activeImage);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length <= 1 || !activeImage) {
      return;
    }
    const idx = images.findIndex((img) => img.id === activeImage.id);
    const nextIdx = idx >= images.length - 1 ? 0 : idx + 1;
    setActiveImage(images[nextIdx] ?? activeImage);
  };

  if (loading && images.length === 0) {
    return (
      <div className="bg-stone-100 aspect-[4/5] rounded-2xl flex flex-col items-center justify-center p-8 border border-stone-200/60 text-xs text-stone-400">
        Loading Lookbook from Cloudflare R2...
      </div>
    );
  }

  // Fallback visual placeholder if no R2 images uploaded yet
  if (images.length === 0 || !activeImage) {
    return (
      <div className="bg-stone-100 dark:bg-stone-800 aspect-[4/5] rounded-2xl overflow-hidden border border-stone-200/60 relative">
        <img
          src="/placeholder-green.svg"
          alt="Pakistani lookbook green placeholder"
          className="w-full h-full object-cover"
        />
        <span className="absolute bottom-4 left-4 bg-stone-900/80 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          {categoryName ?? 'Pakistani Collection'}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Hero Lookbook Carousel Viewer */}
      <div
        onClick={() => setZoomModalOpen(true)}
        className="bg-stone-100 dark:bg-stone-800 aspect-[4/5] rounded-2xl overflow-hidden border border-stone-200/60 relative cursor-zoom-in group flex items-center justify-center"
      >
        <img
          src={activeImage.url}
          alt={activeImage.altText ?? 'Pakistani clothing lookbook'}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Primary Cover Badge */}
        {activeImage.isPrimary && (
          <span className="absolute top-4 left-4 bg-emerald-800 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
            Lookbook
          </span>
        )}

        {/* Zoom Hint Icon */}
        <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-stone-700 p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="w-4 h-4" />
        </span>

        {/* Left / Right Carousel Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevImage}
              aria-label="Previous Lookbook Image"
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-stone-900/70 hover:bg-emerald-800 text-white backdrop-blur-md transition-colors shadow-sm cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleNextImage}
              aria-label="Next Lookbook Image"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-stone-900/70 hover:bg-emerald-800 text-white backdrop-blur-md transition-colors shadow-sm cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        <span className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm text-stone-800 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-stone-200 shadow-xs flex items-center gap-1">
          <Tag className="w-3 h-3 text-emerald-700" />
          <span>COD Lookbook Verified</span>
        </span>
      </div>

      {/* Lookbook Thumbnail Row */}
      {images.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {images.map((img) => {
            const isSelected = activeImage.id === img.id;
            return (
              <button
                key={img.id}
                type="button"
                onClick={() => setActiveImage(img)}
                aria-label={`Select lookbook view ${img.altText ?? ''}`}
                className={`w-16 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 relative ${
                  isSelected
                    ? 'border-emerald-800 ring-2 ring-emerald-800 ring-offset-1'
                    : 'border-stone-200 hover:border-stone-400 opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={img.url}
                  alt={img.altText ?? 'Thumbnail'}
                  className="w-full h-full object-cover"
                />
                {img.isPrimary && (
                  <span className="absolute bottom-0 right-0 bg-emerald-800 text-white p-0.5 rounded-tl">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Zoom Preview Modal */}
      {zoomModalOpen && (
        <div
          role="dialog"
          aria-label="Lookbook Zoom Preview"
          className="fixed inset-0 z-50 bg-stone-900/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <button
            type="button"
            onClick={() => setZoomModalOpen(false)}
            aria-label="Close zoom preview"
            className="absolute top-6 right-6 bg-white/20 hover:bg-white/30 text-white p-2.5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-black flex items-center justify-center">
            <img
              src={activeImage.url}
              alt={activeImage.altText ?? 'Zoomed lookbook'}
              className="max-w-full max-h-[85vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
