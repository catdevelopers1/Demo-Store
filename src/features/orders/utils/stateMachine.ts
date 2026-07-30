import type { OrderStatus } from '../types';

/**
 * Valid state transitions for Pakistani COD Order Lifecycle State Machine
 */
export const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_VERIFICATION: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'SHIPPED', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'RETURNED'],
  DELIVERED: ['RETURNED'],
  CANCELLED: [],
  RETURNED: [],
};

/**
 * Checks whether transitioning from `currentStatus` to `nextStatus` is allowed
 */
export function isValidStatusTransition(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus
): boolean {
  if (currentStatus === nextStatus) {
    return false;
  }
  const allowed = VALID_TRANSITIONS[currentStatus];
  return allowed ? allowed.includes(nextStatus) : false;
}

/**
 * Returns the list of valid next statuses from the current status
 */
export function getAvailableNextStatuses(currentStatus: OrderStatus): OrderStatus[] {
  return VALID_TRANSITIONS[currentStatus] ?? [];
}

/**
 * Returns whether an order status is terminal (cannot transition further)
 */
export function isTerminalStatus(status: OrderStatus): boolean {
  const allowed = VALID_TRANSITIONS[status];
  return !allowed || allowed.length === 0;
}

/**
 * Returns whether an order in `status` can be cancelled
 */
export function canCancelOrder(status: OrderStatus): boolean {
  return (
    status === 'PENDING_VERIFICATION' ||
    status === 'CONFIRMED' ||
    status === 'PROCESSING'
  );
}

/**
 * Returns whether an order in `status` can be marked as returned
 */
export function canReturnOrder(status: OrderStatus): boolean {
  return status === 'SHIPPED' || status === 'DELIVERED';
}

/**
 * Human-readable display labels for each order status
 */
export const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_VERIFICATION: 'Pending Verification',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  RETURNED: 'Returned',
};

/**
 * Customer and staff descriptive summaries for each status
 */
export const STATUS_DESCRIPTIONS: Record<OrderStatus, string> = {
  PENDING_VERIFICATION: 'High-value COD order awaiting SMS/WhatsApp phone verification before dispatch.',
  CONFIRMED: 'Order has been verified and confirmed. Ready for warehouse processing.',
  PROCESSING: 'Order items are being gathered, inspected, and packed in the warehouse.',
  SHIPPED: 'Order has been dispatched via courier across Pakistan. Tracking ID available in timeline.',
  DELIVERED: 'Order successfully delivered to customer and COD payment collected.',
  CANCELLED: 'Order was cancelled. Reserved inventory has been released back to stock.',
  RETURNED: 'Order was returned. Items have been inspected and restocked if eligible.',
};

/**
 * Tailwind badge styling classes for order status badges
 */
export const STATUS_BADGE_CLASSES: Record<OrderStatus, string> = {
  PENDING_VERIFICATION:
    'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
  CONFIRMED:
    'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
  PROCESSING:
    'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700',
  SHIPPED:
    'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
  DELIVERED:
    'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
  CANCELLED:
    'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700',
  RETURNED:
    'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600',
};
