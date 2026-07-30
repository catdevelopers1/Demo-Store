import React, { useState } from 'react';
import { useCart } from './CartProvider';
import { useSettings } from '../../settings';
import { useDiscount } from '../../discounts';
import { formatPkr } from '../../variants/utils';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  Truck,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const CartDrawer: React.FC = () => {
  const {
    items,
    subtotalPkr,
    totalCount,
    warnings,
    drawerOpen,
    setDrawerOpen,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();
  const { settings } = useSettings();
  const {
    appliedCoupon,
    discountPkr,
    couponError,
    loading: couponLoading,
    applyCoupon,
    removeCoupon,
  } = useDiscount();

  const [inputCode, setInputCode] = useState('');

  if (!drawerOpen) {
    return null;
  }

  const freeThreshold = settings.freeShippingThresholdPkr;
  const effectiveTotalPkr = Math.max(0, subtotalPkr - discountPkr);
  const remainingForFree = Math.max(0, freeThreshold - effectiveTotalPkr);
  const isFreeShipping = effectiveTotalPkr >= freeThreshold && effectiveTotalPkr > 0;

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    await applyCoupon(inputCode.trim(), subtotalPkr);
  };

  return (
    <div
      role="dialog"
      aria-label="Cash on Delivery Shopping Bag"
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Backdrop */}
      <div
        onClick={() => setDrawerOpen(false)}
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 border-b border-stone-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-stone-900">
                    COD Shopping Bag
                  </h2>
                  <p className="text-[11px] text-stone-500 font-medium">
                    {totalCount} {totalCount === 1 ? 'item' : 'items'} • Authoritative Server Prices
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close cart drawer"
                className="p-2 text-stone-400 hover:text-stone-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free COD Shipping Progress Banner */}
            <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200/60 text-xs text-emerald-900">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="font-semibold">
                  {isFreeShipping
                    ? "You've unlocked FREE COD Shipping across Pakistan!"
                    : `Add ${formatPkr(remainingForFree)} more for Free COD Shipping`}
                </span>
              </div>
            </div>
          </div>

          {/* Stock Warnings Banner */}
          {warnings.length > 0 && (
            <div className="bg-amber-50 border-b border-amber-200 p-4 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1 text-amber-800">
                <AlertTriangle className="w-4 h-4" />
                <span>Notice:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                {warnings.map((warn, idx) => (
                  <li key={idx}>{warn}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="py-16 text-center text-stone-400 space-y-3">
                <ShoppingBag className="w-12 h-12 mx-auto text-stone-200" />
                <p className="text-sm font-semibold text-stone-700">Your bag is empty</p>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Explore our Pakistani Lawn and Winter Khaddar collections to start shopping.
                </p>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="mt-4 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition-colors"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.variantId}
                    className="flex items-start justify-between gap-4 p-4 rounded-2xl border border-stone-200/80 bg-stone-50/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-stone-900 text-sm truncate">
                        {item.productName}
                      </p>
                      <p className="text-xs font-mono text-stone-500 mt-0.5">
                        SKU: {item.sku}
                      </p>
                      <p className="text-xs font-extrabold text-stone-900 mt-2">
                        {formatPkr(item.unitPricePkr)}
                      </p>
                    </div>

                    <div className="flex flex-col items-end justify-between h-full gap-3">
                      <button
                        type="button"
                        onClick={() => void removeItem(item.variantId)}
                        aria-label={`Remove ${item.sku}`}
                        className="text-stone-400 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-2 py-1 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => void updateQuantity(item.variantId, item.verifiedQuantity - 1)}
                          aria-label="Decrease quantity"
                          className="p-1 text-stone-600 hover:text-emerald-800"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold text-xs px-1">
                          {item.verifiedQuantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => void updateQuantity(item.variantId, item.verifiedQuantity + 1)}
                          aria-label="Increase quantity"
                          className="p-1 text-stone-600 hover:text-emerald-800"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-[11px] text-stone-400 hover:text-red-700 font-semibold underline"
                  >
                    Clear All Items
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer, Promo Code Input & Checkout Action */}
          <div className="p-6 border-t border-stone-200 bg-stone-50 space-y-4">
            {/* Promo Code Apply Box */}
            {items.length > 0 && (
              <div className="space-y-2">
                {!appliedCoupon ? (
                  <form onSubmit={handleApplyPromo} className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-stone-400">
                        <Tag className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type="text"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                        placeholder="Promo Code (e.g. AZADI14)"
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600 uppercase font-mono font-bold bg-white"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={couponLoading || !inputCode.trim()}
                      className="bg-stone-900 hover:bg-stone-800 text-white font-semibold px-4 py-1.5 rounded-xl text-xs transition-colors disabled:opacity-50"
                    >
                      {couponLoading ? 'Checking...' : 'Apply'}
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between bg-emerald-100 border border-emerald-200 px-3 py-2 rounded-xl text-xs text-emerald-900">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span className="font-bold">
                        Coupon {appliedCoupon.code} applied (-{formatPkr(discountPkr)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      aria-label="Remove promo code"
                      className="text-emerald-700 hover:text-red-700 font-bold p-0.5"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {couponError && (
                  <p className="text-[11px] text-red-600 font-medium">{couponError}</p>
                )}
              </div>
            )}

            {/* Price Calculations */}
            <div className="space-y-1.5 border-t border-stone-200 pt-3">
              <div className="flex items-center justify-between text-xs text-stone-600">
                <span>Subtotal</span>
                <span>{formatPkr(subtotalPkr)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex items-center justify-between text-xs text-emerald-800 font-bold">
                  <span>Promo Discount ({appliedCoupon.code})</span>
                  <span>-{formatPkr(discountPkr)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-base font-extrabold text-stone-900 pt-1 border-t border-stone-200">
                <span>Total (PKR)</span>
                <span>{formatPkr(effectiveTotalPkr)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              onClick={() => setDrawerOpen(false)}
              className={`w-full font-bold py-4 rounded-2xl text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
                items.length === 0
                  ? 'bg-stone-300 text-stone-500 pointer-events-none'
                  : 'bg-emerald-800 hover:bg-emerald-700 text-white hover:shadow-lg'
              }`}
            >
              <span>Proceed to COD Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                100% Verified D1 Server-Side Prices
              </span>
              <span className="font-mono">Milestone 10 (`v0.11.0`)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
