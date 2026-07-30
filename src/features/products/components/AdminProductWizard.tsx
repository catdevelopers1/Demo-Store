import React, { useState } from 'react';
import { useProducts } from './ProductsProvider';
import { useCategories } from '../../categories';
import { generateCartesianVariants, formatPkr } from '../../variants/utils';
import { PackagePlus, Plus, Trash2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { slugify } from '../../categories/utils';

interface OptionDraft {
  id: string;
  name: string;
  valuesStr: string;
}

interface VariantDraft {
  sku: string;
  optionValues: string[];
  priceOverridePkr: string;
}

export const AdminProductWizard: React.FC = () => {
  const { createProduct, loading, error } = useProducts();
  const { categories } = useCategories();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [basePricePkr, setBasePricePkr] = useState<number>(6500);
  const [categoryId, setCategoryId] = useState<string>('');
  const [options, setOptions] = useState<OptionDraft[]>([
    { id: 'opt_1', name: 'Size', valuesStr: 'Small, Medium, Large' },
  ]);
  const [variants, setVariants] = useState<VariantDraft[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug) {
      setSlug(slugify(val));
    }
  };

  const addOptionRow = () => {
    setOptions((prev) => [
      ...prev,
      { id: `opt_${Date.now()}`, name: '', valuesStr: '' },
    ]);
  };

  const removeOptionRow = (id: string) => {
    setOptions((prev) => prev.filter((o) => o.id !== id));
  };

  const updateOptionRow = (id: string, field: 'name' | 'valuesStr', val: string) => {
    setOptions((prev) =>
      prev.map((o) => (o.id === id ? { ...o, [field]: val } : o))
    );
  };

  const handleGenerateMatrix = () => {
    setFormError(null);
    const parsedOptions = options
      .filter((o) => o.name.trim().length > 0 && o.valuesStr.trim().length > 0)
      .map((o) => ({
        name: o.name.trim(),
        values: o.valuesStr
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean),
      }));

    const effectiveSlug = slug || slugify(name || 'product');
    const generated = generateCartesianVariants(parsedOptions, effectiveSlug);
    setVariants(
      generated.map((g) => ({
        sku: g.sku,
        optionValues: g.optionValues,
        priceOverridePkr: '',
      }))
    );
  };

  const updateVariantOverride = (index: number, val: string) => {
    setVariants((prev) =>
      prev.map((v, idx) => (idx === index ? { ...v, priceOverridePkr: val } : v))
    );
  };

  const updateVariantSku = (index: number, val: string) => {
    setVariants((prev) =>
      prev.map((v, idx) => (idx === index ? { ...v, sku: val } : v))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    if (!name || !basePricePkr) {
      setFormError('Product Name and Base Price PKR are required.');
      return;
    }

    const parsedOptions = options
      .filter((o) => o.name.trim().length > 0 && o.valuesStr.trim().length > 0)
      .map((o) => ({
        name: o.name.trim(),
        values: o.valuesStr
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean),
      }));

    const effectiveSlug = slug || slugify(name);
    const variantsPayload =
      variants.length > 0
        ? variants.map((v) => ({
            sku: v.sku.trim(),
            priceOverridePkr: v.priceOverridePkr ? Number(v.priceOverridePkr) : null,
            optionValues: v.optionValues,
          }))
        : [];

    const ok = await createProduct({
      name,
      slug: effectiveSlug,
      description: description || null,
      basePricePkr: Number(basePricePkr),
      categoryId: categoryId || null,
      options: parsedOptions,
      variants: variantsPayload,
    });

    if (ok) {
      setSuccessMsg(
        `Product '${name}' and its ${variantsPayload.length} SKU variants created in atomic D1 batch transaction.`
      );
      setName('');
      setSlug('');
      setDescription('');
      setBasePricePkr(6500);
      setOptions([{ id: 'opt_1', name: 'Size', valuesStr: 'Small, Medium, Large' }]);
      setVariants([]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-6 mb-8">
          <div>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Cartesian Variant SKU Wizard
            </span>
            <h1 className="text-2xl font-bold text-stone-900 mt-1">
              Create Product & SKU Matrix
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Atomically create apparel items, option values, and sellable SKU combinations in Cloudflare D1.
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
          {/* Step 1: Basic Information */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider border-b border-stone-100 pb-2">
              Step 1: Product Header & Pricing
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label
                  htmlFor="prod-name"
                  className="block text-xs font-semibold text-stone-700 mb-1"
                >
                  Product Name *
                </label>
                <input
                  id="prod-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Gul-e-Bahar 3-Piece Lawn"
                  className="w-full px-4 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>

              <div>
                <label
                  htmlFor="prod-slug"
                  className="block text-xs font-semibold text-stone-700 mb-1"
                >
                  SEO Slug *
                </label>
                <input
                  id="prod-slug"
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="gul-e-bahar-3-piece-lawn"
                  className="w-full px-4 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600 bg-white font-mono"
                />
              </div>

              <div>
                <label
                  htmlFor="prod-price"
                  className="block text-xs font-semibold text-stone-700 mb-1"
                >
                  Base Price (PKR) *
                </label>
                <input
                  id="prod-price"
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={basePricePkr}
                  onChange={(e) => setBasePricePkr(Number(e.target.value))}
                  className="w-full px-4 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600 bg-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div>
                <label
                  htmlFor="prod-category"
                  className="block text-xs font-semibold text-stone-700 mb-1"
                >
                  Collection Category
                </label>
                <select
                  id="prod-category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600 bg-white"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="prod-description"
                  className="block text-xs font-semibold text-stone-700 mb-1"
                >
                  Description
                </label>
                <input
                  id="prod-description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Luxury embroidered lawn suit for summer gatherings..."
                  className="w-full px-4 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Dynamic Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                Step 2: Product Options (Size, Color, Fabric)
              </h2>
              <button
                type="button"
                onClick={addOptionRow}
                className="text-xs text-emerald-800 font-semibold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Option</span>
              </button>
            </div>

            <div className="space-y-3">
              {options.map((opt) => (
                <div
                  key={opt.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-stone-50 p-4 rounded-xl border border-stone-200"
                >
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold text-stone-500 uppercase">
                      Option Name
                    </label>
                    <input
                      type="text"
                      value={opt.name}
                      onChange={(e) => updateOptionRow(opt.id, 'name', e.target.value)}
                      placeholder="e.g. Size"
                      className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-600 bg-white"
                    />
                  </div>
                  <div className="sm:col-span-8">
                    <label className="block text-[10px] font-bold text-stone-500 uppercase">
                      Comma-Separated Values
                    </label>
                    <input
                      type="text"
                      value={opt.valuesStr}
                      onChange={(e) => updateOptionRow(opt.id, 'valuesStr', e.target.value)}
                      placeholder="e.g. Small, Medium, Large"
                      className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-600 bg-white"
                    />
                  </div>
                  <div className="sm:col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => removeOptionRow(opt.id)}
                      aria-label="Remove option"
                      className="p-2 text-stone-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleGenerateMatrix}
                className="bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
              >
                Generate SKU Variant Matrix ({options.length} Options)
              </button>
            </div>
          </div>

          {/* Step 3: Generated Variant SKUs & Price Overrides */}
          {variants.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                  Step 3: Cartesian SKU Variants ({variants.length} Sellable SKUs)
                </h2>
                <span className="text-xs text-stone-500">
                  Base Price: {formatPkr(basePricePkr)}
                </span>
              </div>

              <div className="overflow-x-auto border border-stone-200 rounded-2xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                      <th className="px-4 py-3">Variant Combination</th>
                      <th className="px-4 py-3">Generated SKU</th>
                      <th className="px-4 py-3">Price Override (PKR)</th>
                      <th className="px-4 py-3 text-right">Effective COD Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-xs">
                    {variants.map((v, idx) => {
                      const effectivePrice = v.priceOverridePkr
                        ? Number(v.priceOverridePkr)
                        : basePricePkr;
                      return (
                        <tr key={v.sku} className="hover:bg-stone-50/50 transition-colors">
                          <td className="px-4 py-3 font-semibold text-stone-900">
                            {v.optionValues.join(' × ') || 'Standard'}
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={v.sku}
                              onChange={(e) => updateVariantSku(idx, e.target.value)}
                              className="w-full max-w-[200px] px-2.5 py-1 text-xs border border-stone-300 rounded-lg font-mono"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              placeholder="Default base price"
                              value={v.priceOverridePkr}
                              onChange={(e) => updateVariantOverride(idx, e.target.value)}
                              className="w-full max-w-[150px] px-2.5 py-1 text-xs border border-stone-300 rounded-lg font-mono"
                            />
                          </td>
                          <td className="px-4 py-3 text-right font-extrabold text-stone-900">
                            {formatPkr(effectivePrice)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4 flex items-center justify-end gap-4 border-t border-stone-100">
            <span className="text-xs text-stone-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              100% ACID Atomic D1 Transaction
            </span>
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-800 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              <PackagePlus className="w-4 h-4" />
              <span>
                {loading ? 'Executing D1 Batch...' : 'Save Product & Variant Matrix'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
