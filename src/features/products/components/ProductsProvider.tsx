import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Product, ProductWithVariants } from '../types';
import type { CreateProductInput } from '../validation';

export interface ProductsContextValue {
  products: Product[];
  loading: boolean;
  error: string | null;
  createProduct: (data: CreateProductInput) => Promise<boolean>;
  refreshProducts: () => Promise<void>;
  fetchProductBySlug: (slug: string) => Promise<ProductWithVariants | null>;
}

const ProductsContext = createContext<ProductsContextValue | undefined>(undefined);

export const ProductsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/v1/products');
      if (res.ok) {
        const json = (await res.json()) as { success?: boolean; data?: Product[] };
        if (json?.success && json.data) {
          setProducts(json.data);
        }
      }
    } catch {
      // Ignore offline errors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProducts();
  }, []);

  const createProduct = async (data: CreateProductInput): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = (await res.json()) as {
        success?: boolean;
        error?: { message?: string };
        data?: ProductWithVariants;
      };

      if (!res.ok || !json.success) {
        setError(json?.error?.message ?? 'Failed to create product.');
        setLoading(false);
        return false;
      }

      await fetchProducts();
      return true;
    } catch {
      setError('A network error occurred while creating product.');
      setLoading(false);
      return false;
    }
  };

  const refreshProducts = async (): Promise<void> => {
    setLoading(true);
    await fetchProducts();
  };

  const fetchProductBySlug = async (slug: string): Promise<ProductWithVariants | null> => {
    try {
      const res = await fetch(`/api/v1/products/${slug}`);
      if (!res.ok) return null;
      const json = (await res.json()) as {
        success?: boolean;
        data?: ProductWithVariants;
      };
      if (json?.success && json.data) {
        return json.data;
      }
      return null;
    } catch {
      return null;
    }
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        loading,
        error,
        createProduct,
        refreshProducts,
        fetchProductBySlug,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

export function useProducts(): ProductsContextValue {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a <ProductsProvider /> component.');
  }
  return context;
}
