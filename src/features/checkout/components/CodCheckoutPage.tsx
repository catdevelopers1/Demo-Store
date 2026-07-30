import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../cart';
import { useDiscount } from '../../discounts';
import { useSettings } from '../../settings';
import { useCustomer } from '../../customers';
import { useAuth } from '../../authentication';
import {
  PAKISTAN_PROVINCES,
  PAKISTAN_CITIES_BY_PROVINCE,
  type PakistanProvince,
} from '../../customers/utils/pakistanLocations';
import { calculateCodShippingPkr, evaluateOrderInitialStatus } from '../utils';
import { formatPkr } from '../../variants/utils';
import type { CodOrder } from '../types';
import {
  Truck,
  ShieldCheck,
  Tag,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  MapPin,
  ShoppingBag,
} from 'lucide-react';

export const CodCheckoutPage: React.FC = () => {
  const { items, subtotalPkr, totalCount, clearCart } = useCart();
  const { appliedCoupon, discountPkr, applyCoupon, removeCoupon, couponError } = useDiscount();
  const { settings } = useSettings();
  const { user } = useAuth();
  const { addresses } = useCustomer();
  const navigate = useNavigate();

  // Form states
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [provinceState, setProvinceState] = useState<PakistanProvince>('Punjab');
  const [city, setCity] = useState('Lahore');
  const [streetAddress, setStreetAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [notes, setNotes] = useState('');
  const [promoInput, setPromoInput] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Auto-populate from customer default address if logged in
  useEffect(() => {
    if (user && addresses.length > 0) {
      const defaultAddr = addresses.find((a) => a.isDefault) ?? addresses[0];
      if (defaultAddr) {
        setRecipientName(defaultAddr.recipientName);
        setPhone(defaultAddr.phone);
        setProvinceState(defaultAddr.provinceState);
        setCity(defaultAddr.city);
        setStreetAddress(defaultAddr.streetAddress);
        setPostalCode(defaultAddr.postalCode ?? '');
      }
    } else if (user) {
      setPhone(user.phone ?? '');
      setGuestEmail(user.email);
    }
  }, [user, addresses]);

  const handleProvinceChange = (newProvince: PakistanProvince) => {
    setProvinceState(newProvince);
    const cList = PAKISTAN_CITIES_BY_PROVINCE[newProvince];
    if (cList && cList.length > 0) {
      setCity(cList[0]!);
    }
  };

  const effectiveSubtotalAfterDiscount = Math.max(0, subtotalPkr - discountPkr);
  const shippingPkr = calculateCodShippingPkr(effectiveSubtotalAfterDiscount, {
    codShippingBasePkr: settings.codShippingBasePkr,
    freeShippingThresholdPkr: settings.freeShippingThresholdPkr,
  });
  const finalTotalPkr = effectiveSubtotalAfterDiscount + shippingPkr;
  const initialStatus = evaluateOrderInitialStatus(finalTotalPkr, 25000);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    await applyCoupon(promoInput.trim(), subtotalPkr);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (items.length === 0) {
      setFormError('Your shopping bag is empty.');
      return;
    }

    if (!recipientName || !phone || !city || !streetAddress) {
      setFormError('Please complete all mandatory shipping address and contact fields.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.verifiedQuantity })),
        couponCode: appliedCoupon?.code ?? null,
        shippingAddress: {
          recipientName: recipientName.trim(),
          phone: phone.trim(),
          provinceState,
          city: city.trim(),
          streetAddress: streetAddress.trim(),
          postalCode: postalCode.trim() || null,
          isDefault: false,
        },
        guestPhone: phone.trim(),
        guestEmail: guestEmail.trim() || undefined,
        notes: notes.trim() || null,
      };

      const res = await fetch('/api/v1/checkout/cod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as {
        success?: boolean;
        error?: { message?: string };
        data?: CodOrder;
      };

      if (!res.ok || !json.success || !json.data) {
        setFormError(json?.error?.message ?? 'Failed to place COD order in D1 database.');
        setSubmitting(false);
        return;
      }

      // Success! Clear cart and coupon and navigate to confirmation
      clearCart();
      removeCoupon();
      navigate(`/order-confirmation/${json.data.orderNumber}`);
    } catch {
      setFormError('An unexpected network error occurred while submitting order.');
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-white rounded-3xl border border-stone-200 p-12 shadow-sm">
          <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-stone-900">Your Shopping Bag is Empty</h1>
          <p className="text-xs text-stone-500 mt-2">
            You must add at least one clothing item to your bag before checking out.
          </p>
          <Link
            to="/products"
            className="inline-block mt-6 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Explore Pakistani Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        to="/products"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-emerald-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Continue Shopping</span>
      </Link>

      <div className="flex items-center justify-between border-b border-stone-200 pb-6 mb-8">
        <div>
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            100% Cash on Delivery Across Pakistan
          </span>
          <h1 className="text-2xl font-bold text-stone-900 mt-1">
            Cash on Delivery Checkout
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            No advance online payment required. Pay your courier in PKR upon parcel arrival.
          </p>
        </div>
      </div>

      {formError && (
        <div
          role="alert"
          className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl"
        >
          {formError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Customer & Pakistani Shipping Address Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-8">
          <div>
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3 mb-6">
              <MapPin className="w-5 h-5 text-emerald-800" />
              <h2 className="text-base font-bold text-stone-900 uppercase tracking-wider">
                1. Pakistani Shipping & Delivery Address
              </h2>
            </div>

            <form id="cod-checkout-form" onSubmit={handlePlaceOrder} className="space-y-6 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="chk-name"
                    className="block text-xs font-semibold text-stone-700 mb-1"
                  >
                    Recipient Full Name *
                  </label>
                  <input
                    id="chk-name"
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Ahmed Khan"
                    className="w-full px-4 py-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label
                    htmlFor="chk-phone"
                    className="block text-xs font-semibold text-stone-700 mb-1"
                  >
                    Pakistani Mobile Number (03XX...) *
                  </label>
                  <input
                    id="chk-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full px-4 py-2.5 text-xs border border-stone-300 rounded-xl font-mono focus:outline-none focus:border-emerald-600"
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block">
                    Courier will contact this number for SMS verification & delivery arrival
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="chk-province"
                    className="block text-xs font-semibold text-stone-700 mb-1"
                  >
                    Province / Territory *
                  </label>
                  <select
                    id="chk-province"
                    value={provinceState}
                    onChange={(e) => handleProvinceChange(e.target.value as PakistanProvince)}
                    className="w-full px-4 py-2.5 text-xs border border-stone-300 rounded-xl bg-white"
                  >
                    {PAKISTAN_PROVINCES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="chk-city"
                    className="block text-xs font-semibold text-stone-700 mb-1"
                  >
                    City *
                  </label>
                  <select
                    id="chk-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs border border-stone-300 rounded-xl bg-white font-medium"
                  >
                    {(PAKISTAN_CITIES_BY_PROVINCE[provinceState] ?? []).map((cityName) => (
                      <option key={cityName} value={cityName}>
                        {cityName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="chk-street"
                  className="block text-xs font-semibold text-stone-700 mb-1"
                >
                  Detailed Street / House Address *
                </label>
                <input
                  id="chk-street"
                  type="text"
                  required
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="House 12, Street 4, Gulberg III"
                  className="w-full px-4 py-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="chk-postal"
                    className="block text-xs font-semibold text-stone-700 mb-1"
                  >
                    Postal Code (Optional 5-digit PK)
                  </label>
                  <input
                    id="chk-postal"
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="54660"
                    className="w-full px-4 py-2.5 text-xs border border-stone-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label
                    htmlFor="chk-email"
                    className="block text-xs font-semibold text-stone-700 mb-1"
                  >
                    Email Address (For order tracking)
                  </label>
                  <input
                    id="chk-email"
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="customer@lahore.pk"
                    className="w-full px-4 py-2.5 text-xs border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="chk-notes"
                  className="block text-xs font-semibold text-stone-700 mb-1"
                >
                  Optional Order / Courier Delivery Notes
                </label>
                <textarea
                  id="chk-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Ring doorbell, leave with guard, call on arrival..."
                  className="w-full px-4 py-2 text-xs border border-stone-300 rounded-xl"
                />
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Order Summary, Coupon & Verification (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-stone-900 uppercase tracking-wider border-b border-stone-100 pb-3">
              2. Order Summary ({totalCount} {totalCount === 1 ? 'item' : 'items'})
            </h2>

            {/* Line Items Snapshot */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex items-center justify-between text-xs py-2 border-b border-stone-100"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-stone-800 truncate">{item.productName}</p>
                    <p className="text-[11px] text-stone-500 font-mono">
                      {item.sku} × {item.verifiedQuantity}
                    </p>
                  </div>
                  <span className="font-extrabold text-stone-900 shrink-0">
                    {formatPkr(item.lineTotalPkr)}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Section */}
            <div className="pt-2">
              {!appliedCoupon ? (
                <form onSubmit={handleApplyPromo} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-stone-400">
                      <Tag className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      placeholder="Promo Code (AZADI14)"
                      className="w-full pl-8 pr-3 py-2 text-xs border border-stone-300 rounded-xl uppercase font-mono font-bold"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-stone-900 hover:bg-stone-800 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-colors"
                  >
                    Apply
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between bg-emerald-100 border border-emerald-200 px-3 py-2.5 rounded-xl text-xs text-emerald-900">
                  <span className="font-bold">
                    Promo {appliedCoupon.code} applied (-{formatPkr(discountPkr)})
                  </span>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-emerald-800 hover:text-red-700 font-bold"
                  >
                    Remove
                  </button>
                </div>
              )}
              {couponError && (
                <p className="text-[11px] text-red-600 font-medium mt-1">{couponError}</p>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 border-t border-stone-100 pt-4 text-xs">
              <div className="flex items-center justify-between text-stone-600">
                <span>Cart Subtotal</span>
                <span>{formatPkr(subtotalPkr)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex items-center justify-between text-emerald-800 font-bold">
                  <span>Promotional Discount</span>
                  <span>-{formatPkr(discountPkr)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-stone-700">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>COD Shipping across Pakistan</span>
                </span>
                <span className="font-bold">
                  {shippingPkr === 0 ? 'FREE' : formatPkr(shippingPkr)}
                </span>
              </div>
              <div className="flex items-center justify-between text-lg font-extrabold text-stone-900 pt-3 border-t border-stone-200">
                <span>Payable on Delivery</span>
                <span>{formatPkr(finalTotalPkr)}</span>
              </div>
            </div>

            {/* High-Value COD Verification Warning */}
            {initialStatus === 'PENDING_VERIFICATION' && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">High-Value Order Verification Policy</p>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                    Orders exceeding PKR 25,000 are flagged as <b>PENDING_VERIFICATION</b>. Our Lahore dispatch team will call or send a WhatsApp SMS to confirm before shipping.
                  </p>
                </div>
              </div>
            )}

            {/* Security Guarantee Notice */}
            <div className="p-3 bg-stone-50 border border-[#EAEAEA] flex items-center justify-between text-[11px] text-gray-500 uppercase tracking-wider">
              <span className="flex items-center gap-1.5 font-semibold text-black">
                <ShieldCheck className="w-4 h-4 text-black" />
                <span>100% SECURE CHECKOUT</span>
              </span>
              <span>NATIONWIDE COD</span>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              form="cod-checkout-form"
              disabled={submitting}
              className="w-full bg-black hover:bg-[#333333] text-white font-bold py-4 text-xs tracking-[0.2em] uppercase transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span>
                {submitting
                  ? 'PLACING ORDER...'
                  : `PLACE ORDER — ${formatPkr(finalTotalPkr)}`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
