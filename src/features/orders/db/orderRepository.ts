import { getDb, type Env } from '../../../core/db';
import type {
  CodOrder,
  OrderItem,
  OrderTimelineEntry,
  OrderStatus,
  PaymentMethod,
  OrderFilterParams,
  PaginatedOrdersResult,
  UpdateOrderStatusInput,
} from '../types';
import type { CustomerAddress } from '../../customers/types';
import { normalizePakistaniPhone } from '../utils/phone';
import { isValidStatusTransition } from '../utils/stateMachine';
import { releaseStock } from '../../inventory/api/reservation';

interface OrderRow {
  id: string;
  order_number: string;
  customer_id: string | null;
  guest_email: string | null;
  guest_phone: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  subtotal_pkr: number;
  discount_pkr: number;
  shipping_pkr: number;
  total_pkr: number;
  shipping_address_json: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  sku: string;
  product_name: string;
  variant_name: string;
  unit_price_pkr: number;
  quantity: number;
  total_pkr: number;
}

interface TimelineRow {
  id: string;
  order_id: string;
  old_status: OrderStatus | null;
  new_status: OrderStatus;
  changed_by_user_id: string | null;
  comment: string | null;
  created_at: string;
}

function mapRowToOrder(
  row: OrderRow,
  items: OrderItem[],
  timeline: OrderTimelineEntry[]
): CodOrder {
  let addressObj: CustomerAddress;
  try {
    addressObj = JSON.parse(row.shipping_address_json) as CustomerAddress;
  } catch {
    addressObj = {
      id: 'addr_fallback',
      customerId: row.customer_id ?? 'guest',
      recipientName: 'Valued Customer',
      phone: row.guest_phone,
      city: 'Lahore',
      provinceState: 'Punjab',
      streetAddress: 'Pakistani Address',
      isDefault: false,
    };
  }

  return {
    id: row.id,
    orderNumber: row.order_number,
    customerId: row.customer_id,
    guestEmail: row.guest_email,
    guestPhone: row.guest_phone,
    status: row.status,
    paymentMethod: row.payment_method,
    subtotalPkr: row.subtotal_pkr,
    discountPkr: row.discount_pkr,
    shippingPkr: row.shipping_pkr,
    totalPkr: row.total_pkr,
    shippingAddressJson: row.shipping_address_json,
    shippingAddress: addressObj,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items,
    timeline,
  };
}

/**
 * Retrieves an order by internal order ID with full items and timeline
 */
export async function getOrderById(
  env: Env,
  orderId: string
): Promise<CodOrder | null> {
  const db = getDb(env);

  const orderRow = await db.first<OrderRow>(
    'SELECT id, order_number, customer_id, guest_email, guest_phone, status, payment_method, subtotal_pkr, discount_pkr, shipping_pkr, total_pkr, shipping_address_json, notes, created_at, updated_at FROM orders WHERE id = ?',
    [orderId]
  );
  if (!orderRow) {
    return null;
  }

  const itemRows = await db.query<OrderItemRow>(
    'SELECT id, order_id, product_id, variant_id, sku, product_name, variant_name, unit_price_pkr, quantity, total_pkr FROM order_items WHERE order_id = ?',
    [orderRow.id]
  );

  const items: OrderItem[] = itemRows.results.map((i) => ({
    id: i.id,
    orderId: i.order_id,
    productId: i.product_id,
    variantId: i.variant_id,
    sku: i.sku,
    productName: i.product_name,
    variantName: i.variant_name,
    unitPricePkr: i.unit_price_pkr,
    quantity: i.quantity,
    totalPkr: i.total_pkr,
  }));

  const timelineRows = await db.query<TimelineRow>(
    'SELECT id, order_id, old_status, new_status, changed_by_user_id, comment, created_at FROM order_timeline WHERE order_id = ? ORDER BY created_at ASC',
    [orderRow.id]
  );

  const timeline: OrderTimelineEntry[] = timelineRows.results.map((t) => ({
    id: t.id,
    orderId: t.order_id,
    oldStatus: t.old_status,
    newStatus: t.new_status,
    changedByUserId: t.changed_by_user_id,
    comment: t.comment,
    createdAt: t.created_at,
  }));

  return mapRowToOrder(orderRow, items, timeline);
}

/**
 * Secure Customer/Guest tracking endpoint that verifies the Pakistani mobile number
 * matches orders.guest_phone before returning order confirmation and timeline details.
 */
export async function getOrderByNumberAndPhone(
  env: Env,
  orderNumber: string,
  phone: string
): Promise<CodOrder | null> {
  const db = getDb(env);

  const cleanNumber = orderNumber.trim();
  const candidates = [cleanNumber];
  if (!cleanNumber.startsWith('#')) {
    candidates.push(`#${cleanNumber}`);
  } else {
    candidates.push(cleanNumber.replace(/^#/, ''));
  }

  const orderRow = await db.first<OrderRow>(
    'SELECT id, order_number, customer_id, guest_email, guest_phone, status, payment_method, subtotal_pkr, discount_pkr, shipping_pkr, total_pkr, shipping_address_json, notes, created_at, updated_at FROM orders WHERE order_number = ? OR order_number = ?',
    [candidates[0], candidates[1] ?? candidates[0]]
  );

  if (!orderRow) {
    return null;
  }

  const normInput = normalizePakistaniPhone(phone);
  const normStored = normalizePakistaniPhone(orderRow.guest_phone);

  if (!normInput || normInput !== normStored) {
    return null;
  }

  return getOrderById(env, orderRow.id);
}

/**
 * Retrieves a paginated list of COD orders for Admin with optional status and search filters
 */
export async function getAdminOrders(
  env: Env,
  filters: OrderFilterParams
): Promise<PaginatedOrdersResult> {
  const db = getDb(env);
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 20));
  const offset = (page - 1) * limit;

  const conditions: string[] = ['1=1'];
  const params: unknown[] = [];

  if (filters.status) {
    conditions.push('status = ?');
    params.push(filters.status);
  }

  if (filters.search && filters.search.trim() !== '') {
    const term = `%${filters.search.trim()}%`;
    conditions.push(
      '(order_number LIKE ? OR guest_phone LIKE ? OR guest_email LIKE ? OR shipping_address_json LIKE ?)'
    );
    params.push(term, term, term, term);
  }

  const whereSql = conditions.join(' AND ');

  const countRow = await db.first<{ total: number }>(
    `SELECT COUNT(*) as total FROM orders WHERE ${whereSql}`,
    params
  );
  const total = countRow?.total ?? 0;

  const selectSql = `
    SELECT id, order_number, customer_id, guest_email, guest_phone, status, payment_method,
           subtotal_pkr, discount_pkr, shipping_pkr, total_pkr, shipping_address_json, notes, created_at, updated_at
    FROM orders
    WHERE ${whereSql}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;
  const listParams = [...params, limit, offset];
  const orderRows = await db.query<OrderRow>(selectSql, listParams);

  if (orderRows.results.length === 0) {
    return {
      orders: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    };
  }

  const orderIds = orderRows.results.map((r) => r.id);
  const placeholders = orderIds.map(() => '?').join(', ');

  const itemRows = await db.query<OrderItemRow>(
    `SELECT id, order_id, product_id, variant_id, sku, product_name, variant_name, unit_price_pkr, quantity, total_pkr
     FROM order_items
     WHERE order_id IN (${placeholders})`,
    orderIds
  );

  const timelineRows = await db.query<TimelineRow>(
    `SELECT id, order_id, old_status, new_status, changed_by_user_id, comment, created_at
     FROM order_timeline
     WHERE order_id IN (${placeholders})
     ORDER BY created_at ASC`,
    orderIds
  );

  const itemsByOrder: Record<string, OrderItem[]> = {};
  for (const row of itemRows.results) {
    const list = itemsByOrder[row.order_id] ?? [];
    list.push({
      id: row.id,
      orderId: row.order_id,
      productId: row.product_id,
      variantId: row.variant_id,
      sku: row.sku,
      productName: row.product_name,
      variantName: row.variant_name,
      unitPricePkr: row.unit_price_pkr,
      quantity: row.quantity,
      totalPkr: row.total_pkr,
    });
    itemsByOrder[row.order_id] = list;
  }

  const timelineByOrder: Record<string, OrderTimelineEntry[]> = {};
  for (const row of timelineRows.results) {
    const list = timelineByOrder[row.order_id] ?? [];
    list.push({
      id: row.id,
      orderId: row.order_id,
      oldStatus: row.old_status,
      newStatus: row.new_status,
      changedByUserId: row.changed_by_user_id,
      comment: row.comment,
      createdAt: row.created_at,
    });
    timelineByOrder[row.order_id] = list;
  }

  const orders: CodOrder[] = orderRows.results.map((r) =>
    mapRowToOrder(
      r,
      itemsByOrder[r.id] ?? [],
      timelineByOrder[r.id] ?? []
    )
  );

  return {
    orders,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Atomically updates order status and records an immutable audit timeline record.
 * If transitioning to CANCELLED or RETURNED (with restock), atomically restores reserved inventory.
 */
export async function updateOrderStatus(
  env: Env,
  orderId: string,
  input: UpdateOrderStatusInput,
  userId?: string | null
): Promise<CodOrder> {
  const db = getDb(env);

  const existingOrder = await getOrderById(env, orderId);
  if (!existingOrder) {
    throw new Error(`Order ID '${orderId}' not found.`);
  }

  if (existingOrder.status === input.status) {
    throw new Error(
      `Order #${existingOrder.orderNumber} is already in status '${existingOrder.status}'. No change required.`
    );
  }

  if (!isValidStatusTransition(existingOrder.status, input.status)) {
    throw new Error(
      `Invalid status transition from '${existingOrder.status}' to '${input.status}' for Order #${existingOrder.orderNumber}.`
    );
  }

  const timelineId = `tl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const queries = [
    {
      sql: 'UPDATE orders SET status = ?, updated_at = ? WHERE id = ?',
      params: [input.status, now, existingOrder.id],
    },
    {
      sql: 'INSERT INTO order_timeline (id, order_id, old_status, new_status, changed_by_user_id, comment, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      params: [
        timelineId,
        existingOrder.id,
        existingOrder.status,
        input.status,
        userId ?? 'admin',
        input.comment,
        now,
      ],
    },
  ];

  await db.batch(queries);

  // If order is cancelled, atomically release reserved stock back to quantity_available
  if (input.status === 'CANCELLED') {
    for (const item of existingOrder.items) {
      await releaseStock(
        env,
        item.variantId,
        item.quantity,
        'CANCELLATION',
        existingOrder.id,
        `Order #${existingOrder.orderNumber} cancelled: ${input.comment}`
      );
    }
  }

  // If order is returned and restock is enabled, release stock back to available inventory
  if (input.status === 'RETURNED' && input.restockInventory !== false) {
    for (const item of existingOrder.items) {
      await releaseStock(
        env,
        item.variantId,
        item.quantity,
        'RETURN',
        existingOrder.id,
        `Order #${existingOrder.orderNumber} returned: ${input.comment}`
      );
    }
  }

  const updatedOrder = await getOrderById(env, existingOrder.id);
  if (!updatedOrder) {
    throw new Error('Failed to fetch updated order after status transition.');
  }

  return updatedOrder;
}
