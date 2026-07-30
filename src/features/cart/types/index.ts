export interface CartItemInput {
  variantId: string;
  quantity: number;
}

export interface ValidatedCartItem {
  variantId: string;
  productId: string;
  sku: string;
  productName: string;
  variantName: string;
  unitPricePkr: number;
  requestedQuantity: number;
  verifiedQuantity: number;
  lineTotalPkr: number;
  isAvailable: boolean;
  warning?: string | null;
  imageUrl?: string | null;
}

export interface CartValidationResult {
  items: ValidatedCartItem[];
  subtotalPkr: number;
  totalCount: number;
  isValid: boolean;
  warnings: string[];
}
