import { getDb, type Env } from '../../../core/db';
import type { CodOrder, OrderStatus, OrderItem, OrderTimelineEntry } from '../types';
import type { CodCheckoutInput } from '../validation';
import { calculateCodShippingPkr, generateOrderNumber, evaluateOrderInitialStatus } from '../utils';
import { getStoreSettings } from '../../settings/db/settingsRepository';
import { validateCartItems } from '../../cart/db/cartRepository';
import { getDiscountByCode } from '../../discounts/db/discountRepository';
import { evaluateDiscount } from '../../discounts/utils/calculator';
import type { CustomerAddress } from '../../customers/types';

export interface OrderRow {
  id: string;
  order_number: string;
  customer_id: string | null;
  guest_email: string | null;
  guest_phone: string;
  status: OrderStatus;
  payment_method: 'COD';
  subtotal_pkr: number;
  discount_pkr: number;
  shipping_pkr: number;
  total_pkr: number;
  shipping_address_json: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItemRow {
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

export interface TimelineRow {
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
 * Retrieves a complete COD order by its unique executive order number (e.g. "#PK-10045")
 */
export async function getOrderByNumber(env: Env, orderNumber: string): Promise<CodOrder | null> {
  const db = getDb(env);

  const orderRow = await db.first<OrderRow>(
    'SELECT id, order_number, customer_id, guest_email, guest_phone, status, payment_method, subtotal_pkr, discount_pkr, shipping_pkr, total_pkr, shipping_address_json, notes, created_at, updated_at FROM orders WHERE order_number = ?',
    [orderNumber]
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
 * Executes a Cash on Delivery (COD) checkout transaction in an atomic Cloudflare D1 batch
 */
export async function executeCodCheckout(
  env: Env,
  input: CodCheckoutInput,
  customerId?: string | null
): Promise<{ order: CodOrder } | { error: string }> {
  const db = getDb(env);
  const settings = await getStoreSettings(env);

  // 1. Authoritatively re-validate cart items against D1 server-side prices and inventory
  const cartValidation = await validateCartItems(env, input.items);
  if (!cartValidation.isValid || cartValidation.warnings.length > 0) {
    return {
      error: `Cart verification failed: ${cartValidation.warnings.join(' ')}`,
    };
  }
  if (cartValidation.items.length === 0) {
    return { error: 'No valid items remaining in your cart.' };
  }

  // 2. Evaluate promotional coupon if provided
  let discountPkr = 0;
  if (input.couponCode) {
    const discountRecord = await getDiscountByCode(env, input.couponCode);
    if (!discountRecord) {
      return { error: `Promotional coupon '${input.couponCode}' is not registered.` };
    }
    const evaluation = evaluateDiscount(discountRecord, cartValidation.subtotalPkr);
    if (!evaluation.isValid) {
      return { error: `Coupon error: ${evaluation.error}` };
    }
    discountPkr = evaluation.discountPkr;
  }

  // 3. Compute shipping and total PKR
  const subtotalAfterDiscountPkr = Math.max(0, cartValidation.subtotalPkr - discountPkr);
  const shippingPkr = calculateCodShippingPkr(subtotalAfterDiscountPkr, {
    codShippingBasePkr: settings.codShippingBasePkr,
    freeShippingThresholdPkr: settings.freeShippingThresholdPkr,
  });
  const totalPkr = subtotalAfterDiscountPkr + shippingPkr;

  // 4. Determine high-value COD verification flag
  const initialStatus = evaluateOrderInitialStatus(totalPkr, 25000);

  // 5. Generate identifiers
  const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const orderNumber = generateOrderNumber();
  const now = new Date().toISOString();
  const guestPhone = input.guestPhone ?? input.shippingAddress.phone;

  const queries: { sql: string; params?: unknown[] }[] = [];

  // Step A: Stock reservation via atomic conditional SQL constraint across all items
  for (const item of cartValidation.items) {
    queries.push({
      sql: 'UPDATE inventory_items SET quantity_available = quantity_available - ?, quantity_reserved = quantity_reserved + ?, updated_at = ? WHERE variant_id = ? AND quantity_available >= ?',
      params: [item.verifiedQuantity, item.verifiedQuantity, now, item.variantId, item.verifiedQuantity],
    });

    const logId = `log_cod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    queries.push({
      sql: 'INSERT INTO inventory_logs (id, variant_id, change_qty, reason, reference_id, comment, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      params: [
        logId,
        item.variantId,
        -item.verifiedQuantity,
        'SALE',
        orderNumber,
        `COD order placement (${orderNumber})`,
        now,
      ],
    });
  }

  // Step B: Insert order header
  queries.push({
    sql: 'INSERT INTO orders (id, order_number, customer_id, guest_email, guest_phone, status, payment_method, subtotal_pkr, discount_pkr, shipping_pkr, total_pkr, shipping_address_json, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    params: [
      orderId,
      orderNumber,
      customerId ?? null,
      input.guestEmail ?? null,
      guestPhone,
      initialStatus,
      'COD',
      cartValidation.subtotalPkr,
      discountPkr,
      shippingPkr,
      totalPkr,
      JSON.stringify(input.shippingAddress),
      input.notes ?? null,
      now,
      now,
    ],
  });

  // Step C: Insert order line items
  for (let i = 0; i < cartValidation.items.length; i++) {
    const item = cartValidation.items[i]!;
    const itemId = `orditem_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 5)}`;
    queries.push({
      sql: 'INSERT INTO order_items (id, order_id, product_id, variant_id, sku, product_name, variant_name, unit_price_pkr, quantity, total_pkr) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      params: [
        itemId,
        orderId,
        item.productId,
        item.variantId,
        item.sku,
        item.productName,
        item.sku,
        item.unitPricePkr,
        item.verifiedQuantity,
        item.lineTotalPkr,
      ],
    });
  }

  // Step D: Increment promotional coupon usage if applied
  if (input.couponCode) {
    queries.push({
      sql: 'UPDATE discounts SET used_count = used_count + 1 WHERE LOWER(code) = LOWER(?) AND is_active = 1 AND (usage_limit IS NULL OR used_count < usage_limit)',
      params: [input.couponCode.trim()],
    });
  }

  // Step E: Record initial order timeline audit record
  const tlId = `tl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  queries.push({
    sql: 'INSERT INTO order_timeline (id, order_id, old_status, new_status, changed_by_user_id, comment, created_at) VALUES (?, ?, NULL, ?, ?, ?, ?)',
    params: [
      tlId,
      orderId,
      initialStatus,
      customerId ?? 'GUEST_USER',
      `Order placed via Pakistani Cash on Delivery (COD)${
        initialStatus === 'PENDING_VERIFICATION'
          ? ' — Flagged for high-value SMS/WhatsApp confirmation'
          : ''
      }`,
      now,
    ],
  });

  // 6. Execute entire COD checkout in ONE atomic D1 batch transaction!
  await db.batch(queries);

  const createdOrder = await getOrderByNumber(env, orderNumber);
  if (!createdOrder) {
    throw new Error('Failed to retrieve newly placed COD order.');
  }

  return { order: createdOrder };
}
