export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export type InventoryReason =
  | 'SALE'
  | 'RETURN'
  | 'RESTOCK'
  | 'ADJUSTMENT'
  | 'CANCELLATION';

export interface InventoryItem {
  variantId: string;
  quantityAvailable: number;
  quantityReserved: number;
  lowStockThreshold: number;
  updatedAt?: string;
}

export interface InventoryItemWithVariant extends InventoryItem {
  sku: string;
  productId: string;
  productName: string;
  status: StockStatus;
}

export interface InventoryLog {
  id: string;
  variantId: string;
  changeQty: number;
  reason: InventoryReason;
  referenceId?: string | null;
  comment?: string | null;
  createdAt?: string;
}

export interface StockCheckResult {
  variantId: string;
  sku: string;
  quantityAvailable: number;
  lowStockThreshold: number;
  status: StockStatus;
}
