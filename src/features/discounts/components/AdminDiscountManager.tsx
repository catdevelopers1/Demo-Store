import React, { useState } from 'react';
import { useDiscount } from './DiscountProvider';
import type { DiscountType } from '../types';
import { formatPkr } from '../../variants/utils';
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

export const AdminDiscountManager: React.FC = () => {
  const { discounts, createDiscount, deleteDiscount, loading } = useDiscount();

  const [code, setCode] = useState('');
  const [type, setType] = useState<DiscountType>('PERCENTAGE');
  const [value, setValue] = useState<number>(15);
  const [minOrderPkr, setMinOrderPkr] = useState<number>(3000);
  const [maxDiscountPkr, setMaxDiscountPkr] = useState<number | ''>(2000);
  const [startTime, setStartTime] = useState('2026-07-01T00:00:00.000Z');
  const [endTime, setEndTime] = useState('2026-12-31T23:59:59.000Z');
  const [usageLimit, setUsageLimit] = useState<number | ''>(500);
  const [isActive, setIsActive] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setCode('');
    setType('PERCENTAGE');
    setValue(15);
    setMinOrderPkr(3000);
    setMaxDiscountPkr(2000);
    setUsageLimit(500);
    setIsActive(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    if (!code || !value) {
      setFormError('Promo Code and Discount Value are required.');
      return;
    }

    const ok = await createDiscount({
      code: code.trim().toUpperCase(),
      type,
      value: Number(value),
      minOrderPkr: Number(minOrderPkr),
      maxDiscountPkr: maxDiscountPkr !== '' ? Number(maxDiscountPkr) : null,
      startTime,
      endTime,
      usageLimit: usageLimit !== '' ? Number(usageLimit) : null,
      isActive,
    });

    if (ok) {
      setSuccessMsg(`Promo code '${code.trim().toUpperCase()}' registered in D1 database.`);
      resetForm();
    } else {
      setFormError('Failed to create promo code. Please check code formatting or existing codes.');
    }
  };

  const handleDeleteClick = async (id: string, promoCode: string) => {
    if (window.confirm(`Delete promo code '${promoCode}' from Cloudflare D1?`)) {
      const ok = await deleteDiscount(id);
      if (ok) {
        setSuccessMsg(`Promo code '${promoCode}' deleted.`);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-6 mb-8">
          <div>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Promotions & Discount Engine
            </span>
            <h1 className="text-2xl font-bold text-stone-900 mt-1">
              Discount Code & Coupon Manager
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Configure percentage or fixed PKR promotional codes with minimum order thresholds and usage caps.
            </p>
          </div>
        </div>

        {formError && (
          <div
            role="alert"
            className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl"
          >
            {formError}
          </div>
        )}

        {successMsg && (
          <div
            role="status"
            className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Side */}
          <div className="lg:col-span-1 bg-stone-50 p-6 rounded-2xl border border-stone-200">
            <div className="flex items-center gap-2 border-b border-stone-200/60 pb-3 mb-4">
              <Tag className="w-4 h-4 text-emerald-800" />
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                Create Promo Code
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="promo-code"
                  className="block text-xs font-semibold text-stone-700 mb-1"
                >
                  Promo Code * (e.g. AZADI14)
                </label>
                <input
                  id="promo-code"
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="AZADI14"
                  className="w-full px-4 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600 bg-white font-mono uppercase font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="promo-type"
                    className="block text-xs font-semibold text-stone-700 mb-1"
                  >
                    Discount Type *
                  </label>
                  <select
                    id="promo-type"
                    value={type}
                    onChange={(e) => setType(e.target.value as DiscountType)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white"
                  >
                    <option value="PERCENTAGE">PERCENTAGE (%)</option>
                    <option value="FIXED_PKR">FIXED AMOUNT (PKR)</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="promo-value"
                    className="block text-xs font-semibold text-stone-700 mb-1"
                  >
                    Value * ({type === 'PERCENTAGE' ? '%' : 'PKR'})
                  </label>
                  <input
                    id="promo-value"
                    type="number"
                    min="1"
                    required
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="min-order"
                    className="block text-xs font-semibold text-stone-700 mb-1"
                  >
                    Min Order (PKR)
                  </label>
                  <input
                    id="min-order"
                    type="number"
                    min="0"
                    value={minOrderPkr}
                    onChange={(e) => setMinOrderPkr(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white font-mono"
                  />
                </div>

                <div>
                  <label
                    htmlFor="max-discount"
                    className="block text-xs font-semibold text-stone-700 mb-1"
                  >
                    Max Cap (PKR)
                  </label>
                  <input
                    id="max-discount"
                    type="number"
                    min="1"
                    placeholder="None"
                    value={maxDiscountPkr}
                    onChange={(e) => setMaxDiscountPkr(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="start-time"
                    className="block text-xs font-semibold text-stone-700 mb-1"
                  >
                    Start ISO Date
                  </label>
                  <input
                    id="start-time"
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white font-mono"
                  />
                </div>

                <div>
                  <label
                    htmlFor="end-time"
                    className="block text-xs font-semibold text-stone-700 mb-1"
                  >
                    End ISO Date
                  </label>
                  <input
                    id="end-time"
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label
                    htmlFor="usage-limit"
                    className="block text-xs font-semibold text-stone-700 mb-1"
                  >
                    Usage Limit
                  </label>
                  <input
                    id="usage-limit"
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    id="promo-active"
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-emerald-800 rounded border-stone-300 focus:ring-emerald-800"
                  />
                  <label htmlFor="promo-active" className="text-xs font-semibold text-stone-700 cursor-pointer">
                    Active Coupon
                  </label>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-800 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Promo Code</span>
                </button>
              </div>
            </form>
          </div>

          {/* Table Side */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                Registered Coupons ({discounts.length})
              </h2>
              <span className="text-xs text-stone-400">Cloudflare D1 Table</span>
            </div>

            <div className="overflow-x-auto border border-stone-200 rounded-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Type & Value</th>
                    <th className="px-4 py-3">Min Order</th>
                    <th className="px-4 py-3">Max Cap</th>
                    <th className="px-4 py-3">Usage</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs">
                  {discounts.map((d) => (
                    <tr key={d.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-stone-900">
                        {d.code}
                      </td>
                      <td className="px-4 py-3 font-semibold text-emerald-800">
                        {d.type === 'PERCENTAGE' ? `${d.value}% OFF` : `${formatPkr(d.value)} OFF`}
                      </td>
                      <td className="px-4 py-3 font-mono text-stone-600">
                        {formatPkr(d.minOrderPkr)}
                      </td>
                      <td className="px-4 py-3 font-mono text-stone-500">
                        {d.maxDiscountPkr ? formatPkr(d.maxDiscountPkr) : 'No Cap'}
                      </td>
                      <td className="px-4 py-3 font-mono text-stone-500">
                        {d.usedCount} / {d.usageLimit ?? '∞'}
                      </td>
                      <td className="px-4 py-3">
                        {d.isActive ? (
                          <span className="bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded text-[10px]">
                            Active
                          </span>
                        ) : (
                          <span className="bg-stone-100 text-stone-500 font-semibold px-2 py-0.5 rounded text-[10px]">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => void handleDeleteClick(d.id, d.code)}
                          aria-label={`Delete ${d.code}`}
                          className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {discounts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-stone-400">
                        No promotional coupon codes registered yet. Create your first code above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-2 text-xs text-stone-600">
              <ShieldAlert className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                Discount Engine Safeguard: Subtotal calculations automatically enforce a non-negative floor (`Math.max(0, subtotal - discount)`) and verify expiration timestamps in real time.
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-stone-100 text-xs text-stone-500 flex items-center justify-between">
          <span>Protected by Role-Based Access Control (RBAC) — Requires `ADMIN` Role Claim</span>
          <span className="font-mono">Milestone 10 (`v0.11.0`)</span>
        </div>
      </div>
    </div>
  );
};
