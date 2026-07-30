export interface ProductOptionValue {
  id: string;
  optionId: string;
  value: string;
  sortOrder: number;
}

export interface ProductOption {
  id: string;
  productId: string;
  name: string;
  sortOrder: number;
  values: ProductOptionValue[];
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  priceOverridePkr?: number | null;
  compareAtPricePkr?: number | null;
  weightGrams?: number;
  isActive: boolean;
  optionValues: ProductOptionValue[];
}

export interface GeneratedVariantPreview {
  sku: string;
  optionValues: string[];
  priceOverridePkr?: number | null;
}
