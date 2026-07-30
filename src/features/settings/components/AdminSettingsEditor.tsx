import React, { useState, useEffect } from 'react';
import { useSettings } from './SettingsProvider';
import { Truck, Palette, Globe, Phone, CheckCircle2 } from 'lucide-react';

export const AdminSettingsEditor: React.FC = () => {
  const { settings, updateSettings, loading, error } = useSettings();

  const [brandName, setBrandName] = useState(settings.brandName);
  const [brandTagline, setBrandTagline] = useState(settings.brandTagline);
  const [supportPhonePk, setSupportPhonePk] = useState(settings.supportPhonePk);
  const [whatsappPk, setWhatsappPk] = useState(settings.whatsappPk);
  const [primaryColorHex, setPrimaryColorHex] = useState(settings.primaryColorHex);
  const [secondaryColorHex, setSecondaryColorHex] = useState(settings.secondaryColorHex);
  const [codShippingBasePkr, setCodShippingBasePkr] = useState(settings.codShippingBasePkr);
  const [freeShippingThresholdPkr, setFreeShippingThresholdPkr] = useState(
    settings.freeShippingThresholdPkr
  );
  const [seoTitle, setSeoTitle] = useState(settings.seoTitle);
  const [seoDescription, setSeoDescription] = useState(settings.seoDescription);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setBrandName(settings.brandName);
    setBrandTagline(settings.brandTagline);
    setSupportPhonePk(settings.supportPhonePk);
    setWhatsappPk(settings.whatsappPk);
    setPrimaryColorHex(settings.primaryColorHex);
    setSecondaryColorHex(settings.secondaryColorHex);
    setCodShippingBasePkr(settings.codShippingBasePkr);
    setFreeShippingThresholdPkr(settings.freeShippingThresholdPkr);
    setSeoTitle(settings.seoTitle);
    setSeoDescription(settings.seoDescription);
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    if (!brandName || !brandTagline) {
      setFormError('Brand Name and Tagline are required.');
      return;
    }

    const ok = await updateSettings({
      brandName,
      brandTagline,
      supportPhonePk,
      whatsappPk,
      primaryColorHex,
      secondaryColorHex,
      codShippingBasePkr: Number(codShippingBasePkr),
      freeShippingThresholdPkr: Number(freeShippingThresholdPkr),
      seoTitle,
      seoDescription,
    });

    if (ok) {
      setSuccessMsg('Store configuration updated successfully in D1 and edge KV cache.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-6 mb-8">
          <div>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              100% Configurable Store Engine
            </span>
            <h1 className="text-2xl font-bold text-stone-900 mt-1">
              Store Settings & Branding Management
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Customize brand typography, color palette, Pakistani COD shipping rules, and SEO without modifying source code.
            </p>
          </div>
        </div>

        {(error || formError) && (
          <div
            role="alert"
            className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl"
          >
            {error ?? formError}
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

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Brand Identity & Typography */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
              <Palette className="w-4 h-4 text-emerald-800" />
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                1. Brand Identity & Theme
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="brand-name"
                  className="block text-xs font-semibold text-stone-700 mb-1"
                >
                  Brand Name (Navbar & Footer Title) *
                </label>
                <input
                  id="brand-name"
                  type="text"
                  required
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. PAKISTANI CLOTHING"
                  className="w-full px-4 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label
                  htmlFor="brand-tagline"
                  className="block text-xs font-semibold text-stone-700 mb-1"
                >
                  Brand Tagline & Hero Subheading *
                </label>
                <input
                  id="brand-tagline"
                  type="text"
                  required
                  value={brandTagline}
                  onChange={(e) => setBrandTagline(e.target.value)}
                  placeholder="e.g. Next-Generation Pakistani Apparel Commerce"
                  className="w-full px-4 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label
                  htmlFor="primary-color"
                  className="block text-xs font-semibold text-stone-700 mb-1"
                >
                  Primary Brand Hex Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="primary-color-picker"
                    type="color"
                    value={primaryColorHex}
                    onChange={(e) => setPrimaryColorHex(e.target.value)}
                    className="w-10 h-10 rounded-xl border border-stone-300 cursor-pointer"
                  />
                  <input
                    id="primary-color"
                    type="text"
                    required
                    value={primaryColorHex}
                    onChange={(e) => setPrimaryColorHex(e.target.value)}
                    placeholder="#065f46"
                    className="w-full px-4 py-2 text-sm border border-stone-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="secondary-color"
                  className="block text-xs font-semibold text-stone-700 mb-1"
                >
                  Secondary Brand Hex Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="secondary-color-picker"
                    type="color"
                    value={secondaryColorHex}
                    onChange={(e) => setSecondaryColorHex(e.target.value)}
                    className="w-10 h-10 rounded-xl border border-stone-300 cursor-pointer"
                  />
                  <input
                    id="secondary-color"
                    type="text"
                    required
                    value={secondaryColorHex}
                    onChange={(e) => setSecondaryColorHex(e.target.value)}
                    placeholder="#047857"
                    className="w-full px-4 py-2 text-sm border border-stone-300 rounded-xl font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Pakistani COD Shipping & Policies */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
              <Truck className="w-4 h-4 text-emerald-800" />
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                2. Pakistani COD Shipping & Order Rules
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="cod-base-rate"
                  className="block text-xs font-semibold text-stone-700 mb-1"
                >
                  Standard COD Shipping Base Rate (PKR) *
                </label>
                <input
                  id="cod-base-rate"
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={codShippingBasePkr}
                  onChange={(e) => setCodShippingBasePkr(Number(e.target.value))}
                  className="w-full px-4 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600 font-mono"
                />
              </div>

              <div>
                <label
                  htmlFor="free-shipping-threshold"
                  className="block text-xs font-semibold text-stone-700 mb-1"
                >
                  Free COD Shipping Order Threshold (PKR) *
                </label>
                <input
                  id="free-shipping-threshold"
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={freeShippingThresholdPkr}
                  onChange={(e) => setFreeShippingThresholdPkr(Number(e.target.value))}
                  className="w-full px-4 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600 font-mono"
                />
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  Orders exceeding this total in PKR will be eligible for free shipping across Pakistan
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Pakistani Support Contacts */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
              <Phone className="w-4 h-4 text-emerald-800" />
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                3. Pakistani Support Contacts
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="support-phone"
                  className="block text-xs font-semibold text-stone-700 mb-1"
                >
                  Customer Support Phone (PK format) *
                </label>
                <input
                  id="support-phone"
                  type="tel"
                  required
                  value={supportPhonePk}
                  onChange={(e) => setSupportPhonePk(e.target.value)}
                  placeholder="0300-1234567"
                  className="w-full px-4 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label
                  htmlFor="whatsapp-number"
                  className="block text-xs font-semibold text-stone-700 mb-1"
                >
                  WhatsApp Support Line (PK format) *
                </label>
                <input
                  id="whatsapp-number"
                  type="tel"
                  required
                  value={whatsappPk}
                  onChange={(e) => setWhatsappPk(e.target.value)}
                  placeholder="0300-1234567"
                  className="w-full px-4 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Section 4: SEO Metadata */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
              <Globe className="w-4 h-4 text-emerald-800" />
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                4. Store SEO Metadata
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="seo-title"
                  className="block text-xs font-semibold text-stone-700 mb-1"
                >
                  Default Store SEO Title *
                </label>
                <input
                  id="seo-title"
                  type="text"
                  required
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="w-full px-4 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label
                  htmlFor="seo-description"
                  className="block text-xs font-semibold text-stone-700 mb-1"
                >
                  Default Store SEO Description *
                </label>
                <input
                  id="seo-description"
                  type="text"
                  required
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  className="w-full px-4 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex items-center justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-800 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Saving to D1 & KV...' : 'Save Store Settings'}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-stone-100 text-xs text-stone-500 flex items-center justify-between">
          <span>Protected by Role-Based Access Control (RBAC) — Requires `ADMIN` Role Claim</span>
          <span className="font-mono">Last Updated: {settings.updatedAt ?? 'System Default'}</span>
        </div>
      </div>
    </div>
  );
};
