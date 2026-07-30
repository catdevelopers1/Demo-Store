import type { ProductOption, ProductVariant } from '../../variants/types';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  basePricePkr: number;
  categoryId?: string | null;
  categoryName?: string | null;
  isActive: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductWithVariants extends Product {
  options: ProductOption[];
  variants: ProductVariant[];
}

export interface ProductListFilter {
  categorySlug?: string;
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}
