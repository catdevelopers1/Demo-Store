import React, { useState, useEffect } from 'react';
import { useProducts } from './ProductsProvider';
import type { ProductImage } from '../types/image';
import {
  ALLOWED_IMAGE_MIMES,
  MAX_IMAGE_SIZE_BYTES,
} from '../validation/image';
import {
  Upload,
  Trash2,
  CheckCircle2,
  Image as ImageIcon,
  Check,
  Star,
  AlertTriangle,
} from 'lucide-react';

export const AdminImageManager: React.FC = () => {
  const { products } = useProducts();

  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Upload Form fields
  const [altText, setAltText] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isPrimary, setIsPrimary] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const loadProductImages = async (prodId: string) => {
    if (!prodId) {
      setImages([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/products/${prodId}/images`);
      if (res.ok) {
        const json = (await res.json()) as { success?: boolean; data?: ProductImage[] };
        if (json?.success && json.data) {
          setImages(json.data);
        }
      }
    } catch {
      setError('Failed to fetch lookbook images from Edge backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      const firstId = products[0]!.id;
      setSelectedProductId(firstId);
      void loadProductImages(firstId);
    }
  }, [products, selectedProductId]);

  const handleProductSelect = (id: string) => {
    setSelectedProductId(id);
    setSuccessMsg(null);
    setError(null);
    void loadProductImages(id);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!(ALLOWED_IMAGE_MIMES as readonly string[]).includes(file.type)) {
      setError('Invalid file format. Allowed formats: WebP, JPEG, PNG, AVIF.');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError('File size exceeds the 5 MB limit.');
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
    if (!altText) {
      setAltText(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!selectedProductId) {
      setError('Please select a product first.');
      return;
    }

    if (!selectedFile) {
      setError('Please choose an image file to upload.');
      return;
    }

    setUploading(true);
    try {
      const base64Data = await convertFileToBase64(selectedFile);

      const res = await fetch('/api/v1/admin/images/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProductId,
          filename: selectedFile.name,
          contentType: selectedFile.type,
          base64Data,
          altText: altText || selectedFile.name,
          sortOrder: Number(sortOrder),
          isPrimary,
        }),
      });

      const json = (await res.json()) as {
        success?: boolean;
        error?: { message?: string };
        data?: ProductImage;
      };

      if (!res.ok || !json.success) {
        setError(json?.error?.message ?? 'Failed to upload image to Cloudflare R2.');
        setUploading(false);
        return;
      }

      setSuccessMsg(`Lookbook image '${selectedFile.name}' uploaded successfully to R2 bucket & D1.`);
      setSelectedFile(null);
      setAltText('');
      setSortOrder((prev) => prev + 1);
      setIsPrimary(false);
      await loadProductImages(selectedProductId);
    } catch {
      setError('An unexpected network error occurred during R2 upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/v1/admin/images/${imageId}/primary?productId=${selectedProductId}`, {
        method: 'PATCH',
      });
      const json = (await res.json()) as { success?: boolean; error?: { message?: string } };
      if (res.ok && json.success) {
        setSuccessMsg('Primary lookbook cover updated in atomic D1 transaction.');
        await loadProductImages(selectedProductId);
      } else {
        setError(json?.error?.message ?? 'Failed to set primary lookbook cover.');
      }
    } catch {
      setError('Network error updating primary lookbook image.');
    }
  };

  const handleDeleteImage = async (img: ProductImage) => {
    if (window.confirm(`Delete image '${img.altText ?? img.r2Key}' from Cloudflare R2 bucket and D1 database?`)) {
      setError(null);
      setSuccessMsg(null);
      try {
        const res = await fetch(`/api/v1/admin/images/${img.id}`, {
          method: 'DELETE',
        });
        const json = (await res.json()) as { success?: boolean; error?: { message?: string } };
        if (res.ok && json.success) {
          setSuccessMsg('Image deleted from R2 object storage & D1 metadata.');
          await loadProductImages(selectedProductId);
        } else {
          setError(json?.error?.message ?? 'Failed to delete image.');
        }
      } catch {
        setError('Network error deleting lookbook image.');
      }
    }
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-6 mb-8">
          <div>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Cloudflare R2 Asset Pipeline
            </span>
            <h1 className="text-2xl font-bold text-stone-900 mt-1">
              R2 Product Image & Lookbook Manager
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Upload, sort, and manage high-resolution lookbook imagery stored in Cloudflare R2 object storage.
            </p>
          </div>

          <div className="w-full sm:w-64">
            <label htmlFor="select-product" className="block text-xs font-bold text-stone-700 mb-1">
              Select Catalog Product
            </label>
            <select
              id="select-product"
              value={selectedProductId}
              onChange={(e) => handleProductSelect(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600 bg-white font-medium"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.slug})
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl"
          >
            {error}
          </div>
        )}

        {successMsg && (
          <div
            role="status"
            className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side: Upload Form */}
          <div className="lg:col-span-1 bg-stone-50 p-6 rounded-2xl border border-stone-200">
            <div className="flex items-center gap-2 border-b border-stone-200/60 pb-3 mb-4">
              <Upload className="w-4 h-4 text-emerald-800" />
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                Upload New Lookbook
              </h2>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="file-upload"
                  className="block text-xs font-semibold text-stone-700 mb-1"
                >
                  Choose Image File *
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/webp,image/jpeg,image/png,image/avif"
                  onChange={handleFileChange}
                  className="w-full text-xs text-stone-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200 cursor-pointer"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">
                  Formats: WebP, JPEG, PNG, AVIF (Max 5 MB)
                </span>
              </div>

              <div>
                <label
                  htmlFor="alt-text"
                  className="block text-xs font-semibold text-stone-700 mb-1"
                >
                  SEO Alt Text
                </label>
                <input
                  id="alt-text"
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="e.g. Gul-e-Bahar Front Embroidered Lookbook"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>

              <div>
                <label
                  htmlFor="sort-order"
                  className="block text-xs font-semibold text-stone-700 mb-1"
                >
                  Lookbook Sort Order (Ascending)
                </label>
                <input
                  id="sort-order"
                  type="number"
                  min="1"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600 bg-white font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="is-primary"
                  type="checkbox"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="w-4 h-4 text-emerald-800 rounded border-stone-300 focus:ring-emerald-800"
                />
                <label htmlFor="is-primary" className="text-xs font-semibold text-stone-700 cursor-pointer">
                  Mark as Primary Lookbook Cover
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="w-full bg-emerald-800 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span>
                    {uploading ? 'Uploading to R2 Bucket...' : 'Upload to Cloudflare R2'}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Side: Uploaded Images Grid */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                Lookbook Imagery ({images.length}) • {selectedProduct?.name ?? 'Selected Product'}
              </h2>
              <span className="text-xs text-stone-400">R2 Storage (`BUCKET`)</span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-stone-400 border border-stone-200 rounded-2xl">
                Loading R2 lookbook gallery...
              </div>
            ) : images.length === 0 ? (
              <div className="py-12 bg-stone-50 rounded-2xl border border-stone-200 text-center p-8">
                <ImageIcon className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                <h3 className="font-bold text-stone-800 text-sm">No Images in R2</h3>
                <p className="text-xs text-stone-500 mt-1">
                  Upload your first lookbook image for this product using the form on the left.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className={`bg-white rounded-2xl border p-4 shadow-sm flex flex-col justify-between transition-all ${
                      img.isPrimary
                        ? 'border-emerald-800 ring-2 ring-emerald-800 ring-offset-2'
                        : 'border-stone-200'
                    }`}
                  >
                    <div>
                      <div className="aspect-[4/5] rounded-xl overflow-hidden bg-stone-100 border border-stone-100 relative mb-3">
                        <img
                          src={img.url}
                          alt={img.altText ?? 'Lookbook asset'}
                          className="w-full h-full object-cover"
                        />
                        {img.isPrimary && (
                          <span className="absolute top-2 left-2 bg-emerald-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                            <Star className="w-3 h-3 fill-white" />
                            <span>Primary Cover</span>
                          </span>
                        )}
                      </div>

                      <p className="font-semibold text-stone-900 text-xs line-clamp-1">
                        {img.altText ?? 'Lookbook photo'}
                      </p>
                      <p className="text-[10px] text-stone-400 font-mono mt-0.5 truncate">
                        Key: {img.r2Key}
                      </p>
                      <p className="text-[10px] text-stone-500 mt-0.5">
                        Order: <span className="font-bold">{img.sortOrder}</span>
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                      {!img.isPrimary ? (
                        <button
                          type="button"
                          onClick={() => void handleSetPrimary(img.id)}
                          className="bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 text-stone-700 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Set Primary</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Active Cover</span>
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => void handleDeleteImage(img)}
                        aria-label="Delete R2 asset"
                        className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-2 text-xs text-stone-600">
              <AlertTriangle className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                Orphan Defense Active: If a D1 database error occurs during upload, the R2 object is automatically deleted to prevent orphaned storage.
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-stone-100 text-xs text-stone-500 flex items-center justify-between">
          <span>Protected by Role-Based Access Control (RBAC) — Requires `ADMIN` Role Claim</span>
          <span className="font-mono">Milestone 5 (`v0.6.0`)</span>
        </div>
      </div>
    </div>
  );
};
