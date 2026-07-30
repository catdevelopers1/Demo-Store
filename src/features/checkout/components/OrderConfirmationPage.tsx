import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { CodOrder } from '../types';
import { formatPkr } from '../../variants/utils';
import {
  CheckCircle2,
  Truck,
  ShieldCheck,
  AlertTriangle,
  Clock,
  MapPin,
  Phone,
  Package,
  ArrowRight,
} from 'lucide-react';

export const OrderConfirmationPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<CodOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchOrder() {
      if (!orderNumber) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/orders/${encodeURIComponent(orderNumber)}`);
        if (res.ok) {
          const json = (await res.json()) as { success?: boolean; data?: CodOrder };
          if (isMounted && json?.success && json.data) {
            setOrder(json.data);
          }
        }
      } catch {
        // Ignore network errors
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    void fetchOrder();
    return () => {
      isMounted = false;
    };
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-sm text-stone-500">
        Retrieving Cash on Delivery order confirmation from Cloudflare D1...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="bg-white rounded-3xl border border-stone-200 p-12 shadow-sm">
          <h1 className="text-2xl font-bold text-stone-900">Order Not Found</h1>
          <p className="text-xs text-stone-500 mt-2">
            Could not locate COD order <b>{orderNumber}</b>.
          </p>
          <Link
            to="/products"
            className="inline-block mt-6 bg-emerald-800 text-white text-xs font-semibold px-6 py-3 rounded-xl"
          >
            Return to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const isPendingVerif = order.status === 'PENDING_VERIFICATION';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Banner */}
      <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 shadow-sm mb-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-6 shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Cash on Delivery (COD) Order Placed
        </span>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 mt-3">
          Thank you for your order!
        </h1>

        <p className="text-sm text-stone-600 mt-2 max-w-md mx-auto">
          Your Order Number is{' '}
          <span className="font-mono font-bold text-emerald-800">{order.orderNumber}</span>. Please keep your cash ready at the time of delivery.
        </p>

        {/* Status Badge */}
        <div className="mt-6 flex justify-center">
          {isPendingVerif ? (
            <div className="bg-amber-100 border border-amber-300 text-amber-900 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                Status: PENDING_VERIFICATION — Our team will send an SMS to {order.guestPhone} to confirm your order over PKR 25,000.
              </span>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                Status: CONFIRMED — Your parcel is being prepared for dispatch.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Grid: Delivery & Itemized Bill */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Left Card: Delivery Address */}
        <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3 mb-4">
              <MapPin className="w-5 h-5 text-emerald-800" />
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                1. Delivery Address
              </h2>
            </div>

            <p className="font-bold text-stone-900 text-base">
              {order.shippingAddress.recipientName}
            </p>
            <p className="text-xs font-mono font-semibold text-stone-700 mt-0.5">
              {order.shippingAddress.phone}
            </p>
            <p className="text-xs text-stone-600 mt-3 leading-relaxed">
              {order.shippingAddress.streetAddress}
            </p>
            <p className="text-xs font-bold text-stone-800 mt-1">
              {order.shippingAddress.city},{' '}
              <span className="text-stone-600">{order.shippingAddress.provinceState}</span>
            </p>
            {order.shippingAddress.postalCode && (
              <p className="text-[11px] font-mono text-stone-400 mt-0.5">
                Postal Code: {order.shippingAddress.postalCode}
              </p>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-emerald-700" />
              Courier SMS active
            </span>
            <span className="font-mono">COD Parcel</span>
          </div>
        </div>

        {/* Right Card: Itemized Bill PKR */}
        <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-800" />
                <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                  2. Itemized Bill (PKR)
                </h2>
              </div>
              <span className="text-xs font-mono text-stone-500">{order.orderNumber}</span>
            </div>

            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-xs py-1.5 border-b border-stone-100"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-stone-800 truncate">{item.productName}</p>
                    <p className="text-[11px] text-stone-500 font-mono">
                      {item.sku} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-extrabold text-stone-900 shrink-0">
                    {formatPkr(item.totalPkr)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-stone-100 pt-4 text-xs mt-4">
              <div className="flex items-center justify-between text-stone-600">
                <span>Subtotal</span>
                <span>{formatPkr(order.subtotalPkr)}</span>
              </div>
              {order.discountPkr > 0 && (
                <div className="flex items-center justify-between text-emerald-800 font-bold">
                  <span>Promotional Discount</span>
                  <span>-{formatPkr(order.discountPkr)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-stone-700">
                <span>COD Shipping</span>
                <span className="font-bold">
                  {order.shippingPkr === 0 ? 'FREE' : formatPkr(order.shippingPkr)}
                </span>
              </div>
              <div className="flex items-center justify-between text-base font-extrabold text-stone-900 pt-2 border-t border-stone-200">
                <span>Total Payable on Delivery</span>
                <span>{formatPkr(order.totalPkr)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Atomic D1 Batch Transaction
            </span>
            <span className="font-mono">Milestone 11 (`v0.12.0`)</span>
          </div>
        </div>
      </div>

      {/* Timeline Card */}
      <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm mb-8">
        <div className="flex items-center gap-2 border-b border-stone-100 pb-3 mb-6">
          <Clock className="w-5 h-5 text-emerald-800" />
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
            3. Order Timeline & Status Audit Trail
          </h2>
        </div>

        <div className="space-y-4 text-left">
          {order.timeline.map((entry) => (
            <div key={entry.id} className="flex items-start gap-4">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-700 mt-1.5 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-900">{entry.newStatus}</span>
                  <span className="text-[10px] font-mono text-stone-400">
                    {entry.createdAt?.replace('T', ' ').substring(0, 19)}
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-0.5">{entry.comment}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/products"
          className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-8 py-4 rounded-2xl text-sm transition-colors shadow-md flex items-center gap-2"
        >
          <span>Continue Pakistani Apparel Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
