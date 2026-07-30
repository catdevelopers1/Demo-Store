import type {
  OrderStatus,
  PaymentMethod,
  OrderItem,
  OrderTimelineEntry,
  CodOrder,
} from '../../checkout/types';

export type {
  OrderStatus,
  PaymentMethod,
  OrderItem,
  OrderTimelineEntry,
  CodOrder,
};

export interface OrderFilterParams {
  status?: OrderStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedOrdersResult {
  orders: CodOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateOrderStatusInput {
  status: OrderStatus;
  comment: string;
  restockInventory?: boolean;
}

export interface OrderTrackingInput {
  orderNumber: string;
  phone: string;
}

export interface OrderAuditRecord {
  oldStatus: OrderStatus | null;
  newStatus: OrderStatus;
  changedByUserId: string | null;
  comment: string;
  createdAt?: string;
}
