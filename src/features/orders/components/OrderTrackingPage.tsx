import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Phone,
  MapPin,
  Calendar,
  FileText,
  RotateCcw,
  XCircle,
  ArrowLeft,
} from 'lucide-react';
import { formatPkr } from '../../variants/utils';
import type { CodOrder, OrderStatus } from '../types';
import {
  STATUS_LABELS,
  STATUS_BADGE_CLASSES,
  STATUS_DESCRIPTIONS,
} from '../utils/stateMachine';
import { formatPakistaniPhoneDisplay } from '../utils/phone';
import { SeoHead } from '../../seo';

function getStatusIcon(status: OrderStatus) {
  switch (status) {
    case 'PENDING_VERIFICATION':
      return <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
    case 'CONFIRMED':
      return <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    case 'PROCESSING':
      return <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
    case 'SHIPPED':
      return <Truck className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
    case 'DELIVERED':
      return <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    case 'CANCELLED':
      return <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
    case 'RETURNED':
      return <RotateCcw className="w-5 h-5 text-slate-600 dark:text-slate-400" />;
    default:
      return <FileText className="w-5 h-5 text-gray-500" />;
  }
}

export const OrderTrackingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(
    searchParams.get('orderNumber') ?? ''
  );
  const [phone, setPhone] = useState(searchParams.get('phone') ?? '');
  const [order, setOrder] = useState<CodOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrackingDetails = async (
    targetOrderNum: string,
    targetPhone: string
  ) => {
    const cleanNumber = targetOrderNum.trim();
    const cleanPhone = targetPhone.trim();

    if (!cleanNumber || !cleanPhone) {
      setError('Please provide both order number (#PK-XXXXX) and mobile number.');
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const query = new URLSearchParams({
        orderNumber: cleanNumber,
        phone: cleanPhone,
      }).toString();

      const response = await fetch(`/api/v1/orders/track?${query}`);
      const data = (await response.json()) as {
        success?: boolean;
        data?: CodOrder;
        error?: { message?: string };
      };

      if (!response.ok || !data.success || !data.data) {
        throw new Error(
          data.error?.message ??
            'No COD order found matching this order number and mobile number.'
        );
      }

      setOrder(data.data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to retrieve order details. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const paramNum = searchParams.get('orderNumber');
    const paramPhone = searchParams.get('phone');
    if (paramNum && paramPhone) {
      void fetchTrackingDetails(paramNum, paramPhone);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ orderNumber, phone });
    void fetchTrackingDetails(orderNumber, phone);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <SeoHead
        title="Track COD Order — Pakistani Apparel Store"
        description="Track your Cash on Delivery (COD) clothing order status and delivery timeline with mobile number verification."
        canonicalUrl="https://pakistani-commerce.edge.app/track-order"
      />
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          Pakistani COD Order Tracker
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
          Enter your executive order number and registered Pakistani mobile number
          to inspect live delivery status and audit timeline.
        </p>
      </div>

      {/* Tracking Form Card */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 mb-8 border border-gray-100 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label
              htmlFor="orderNumber"
              className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1"
            >
              Order Number
            </label>
            <div className="relative">
              <input
                id="orderNumber"
                type="text"
                placeholder="#PK-10001"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[var(--brand-primary-hex,#047857)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1"
            >
              Pakistani Mobile Number
            </label>
            <div className="relative">
              <input
                id="phone"
                type="text"
                placeholder="0300-1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[var(--brand-primary-hex,#047857)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[var(--brand-primary-hex,#047857)] hover:bg-[var(--brand-secondary-hex,#065f46)] text-white font-medium text-sm rounded-lg shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Tracking...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Track COD Order</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Demo hints */}
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between text-xs text-gray-500 dark:text-gray-400 gap-2">
          <span>Quick demo lookup:</span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setOrderNumber('#PK-10001');
                setPhone('0300-1234567');
                setSearchParams({ orderNumber: '#PK-10001', phone: '0300-1234567' });
                void fetchTrackingDetails('#PK-10001', '0300-1234567');
              }}
              className="underline hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer"
            >
              #PK-10001 (Confirmed)
            </button>
            <button
              type="button"
              onClick={() => {
                setOrderNumber('#PK-10002');
                setPhone('0301-2345678');
                setSearchParams({ orderNumber: '#PK-10002', phone: '0301-2345678' });
                void fetchTrackingDetails('#PK-10002', '0301-2345678');
              }}
              className="underline hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer"
            >
              #PK-10002 (Verification)
            </button>
            <button
              type="button"
              onClick={() => {
                setOrderNumber('#PK-10004');
                setPhone('0321-4567890');
                setSearchParams({ orderNumber: '#PK-10004', phone: '0321-4567890' });
                void fetchTrackingDetails('#PK-10004', '0321-4567890');
              }}
              className="underline hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer"
            >
              #PK-10004 (Shipped)
            </button>
            <button
              type="button"
              onClick={() => {
                setOrderNumber('#PK-10005');
                setPhone('0345-6789012');
                setSearchParams({ orderNumber: '#PK-10005', phone: '0345-6789012' });
                void fetchTrackingDetails('#PK-10005', '0345-6789012');
              }}
              className="underline hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer"
            >
              #PK-10005 (Delivered)
            </button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-xl p-4 mb-8 text-rose-800 dark:text-rose-200 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Lookup Failed</p>
            <p className="mt-0.5 text-rose-700 dark:text-rose-300">{error}</p>
          </div>
        </div>
      )}

      {/* Order Details Hydration */}
      {order && (
        <div className="space-y-8 animate-fadeIn">
          {/* Order Header Summary Card */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {order.orderNumber}
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                      STATUS_BADGE_CLASSES[order.status]
                    }`}
                  >
                    {getStatusIcon(order.status)}
                    <span>{STATUS_LABELS[order.status]}</span>
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Placed on{' '}
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString('en-PK', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })
                    : 'Recent'}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="block text-xs font-medium uppercase tracking-wider text-gray-400">
                  Total Payable on Delivery
                </span>
                <span className="text-xl font-extrabold text-gray-900 dark:text-white">
                  {formatPkr(order.totalPkr)}
                </span>
                <span className="block text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  {order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod}
                </span>
              </div>
            </div>

            {/* Status Description Box */}
            <div className="mt-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-300 flex items-center gap-3">
              {getStatusIcon(order.status)}
              <span>{STATUS_DESCRIPTIONS[order.status]}</span>
            </div>
          </div>

          {/* Delivery Timeline Card */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[var(--brand-primary-hex,#047857)]" />
              <span>Order Audit & Delivery Timeline</span>
            </h3>

            <div className="relative pl-6 border-l-2 border-gray-200 dark:border-gray-700 space-y-6">
              {order.timeline.map((entry, index) => {
                const isLatest = index === order.timeline.length - 1;
                return (
                  <div key={entry.id} className="relative">
                    {/* Timeline circle marker */}
                    <div
                      className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 ${
                        isLatest
                          ? 'bg-[var(--brand-primary-hex,#047857)] border-white dark:border-gray-800'
                          : 'bg-gray-300 dark:bg-gray-600 border-white dark:border-gray-800'
                      }`}
                    />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {STATUS_LABELS[entry.newStatus]}
                      </span>
                      <span className="text-xs text-gray-400">
                        {entry.createdAt
                          ? new Date(entry.createdAt).toLocaleString('en-PK', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })
                          : ''}
                      </span>
                    </div>

                    {entry.oldStatus && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Status updated from{' '}
                        <span className="font-semibold">
                          {STATUS_LABELS[entry.oldStatus]}
                        </span>{' '}
                        to{' '}
                        <span className="font-semibold">
                          {STATUS_LABELS[entry.newStatus]}
                        </span>
                      </p>
                    )}

                    {entry.comment && (
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700">
                        {entry.comment}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grid: Shipping Address & Order Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pakistani Delivery Address */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[var(--brand-primary-hex,#047857)]" />
                <span>Pakistani Shipping Address</span>
              </h3>

              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {order.shippingAddress?.recipientName}
                </p>
                <p className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Phone className="w-3.5 h-3.5" />
                  <span>
                    {formatPakistaniPhoneDisplay(
                      order.shippingAddress?.phone ?? order.guestPhone
                    )}
                  </span>
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {order.shippingAddress?.streetAddress}
                </p>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  {order.shippingAddress?.city}, {order.shippingAddress?.provinceState}{' '}
                  {order.shippingAddress?.postalCode}
                </p>
                {order.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Delivery Instructions:</span>{' '}
                    {order.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Line Items & PKR Bill */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[var(--brand-primary-hex,#047857)]" />
                <span>Itemized Order Bill</span>
              </h3>

              <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-64 overflow-y-auto pr-1">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="py-3 flex items-center justify-between gap-3 text-sm"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {item.productName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        SKU: {item.sku} &middot; Qty: {item.quantity} &times;{' '}
                        {formatPkr(item.unitPricePkr)}
                      </p>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white shrink-0">
                      {formatPkr(item.totalPkr)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatPkr(order.subtotalPkr)}</span>
                </div>

                {order.discountPkr > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Discount Applied</span>
                    <span>-{formatPkr(order.discountPkr)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>COD Delivery Across Pakistan</span>
                  <span>
                    {order.shippingPkr === 0
                      ? 'FREE'
                      : formatPkr(order.shippingPkr)}
                  </span>
                </div>

                <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center font-extrabold text-base text-gray-900 dark:text-white">
                  <span>Total Payable on Delivery</span>
                  <span className="text-lg text-[var(--brand-primary-hex,#047857)]">
                    {formatPkr(order.totalPkr)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Back */}
          <div className="text-center pt-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--brand-primary-hex,#047857)] hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Pakistani Fashion Storefront</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
