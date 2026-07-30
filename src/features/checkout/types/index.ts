import type { CustomerAddress } from '../../customers/types';
import type { CartItemInput } from '../../cart/types';

export type OrderStatus =
  | 'PENDING_VERIFICATION'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

export type PaymentMethod = 'COD';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  sku: string;
  productName: string;
  variantName: string;
  unitPricePkr: number;
  quantity: number;
  totalPkr: number;
}

export interface OrderTimelineEntry {
  id: string;
  orderId: string;
  oldStatus?: OrderStatus | null;
  newStatus: OrderStatus;
  changedByUserId?: string | null;
  comment?: string | null;
  createdAt?: string;
}

export interface CodOrder {
  id: string;
  orderNumber: string;
  customerId?: string | null;
  guestEmail?: string | null;
  guestPhone: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  subtotalPkr: number;
  discountPkr: number;
  shippingPkr: number;
  totalPkr: number;
  shippingAddressJson: string;
  shippingAddress: CustomerAddress;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  items: OrderItem[];
  timeline: OrderTimelineEntry[];
}

export interface CodCheckoutPayload {
  items: CartItemInput[];
  couponCode?: string | null;
  shippingAddress: Omit<CustomerAddress, 'id' | 'customerId' | 'createdAt'>;
  guestPhone?: string;
  guestEmail?: string;
  notes?: string | null;
  turnstileToken?: string;
}
