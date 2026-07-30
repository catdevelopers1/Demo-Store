import React, { useState } from 'react';
import { useInventory } from './InventoryProvider';
import type { InventoryItemWithVariant, InventoryLog } from '../types';
import type { ManualAdjustmentReason } from '../validation';
import {
  AlertTriangle,
  History,
  CheckCircle2,
  SlidersHorizontal,
  X,
  Search,
} from 'lucide-react';

export const AdminInventoryManager: React.FC = () => {
  const { items, loading, error, adjustStock, fetchLogs, refreshInventory } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItemWithVariant | null>(null);
  const [logsModalItem, setLogsModalItem] = useState<InventoryItemWithVariant | null>(null);
  const [logsList, setLogsList] = useState<InventoryLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Modal form states
  const [changeQty, setChangeQty] = useState<number>(0);
  const [reason, setReason] = useState<ManualAdjustmentReason>('RESTOCK');
  const [referenceId, setReferenceId] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    void refreshInventory(filterLowStock, val);
  };

  const handleFilterToggle = (lowOnly: boolean) => {
    setFilterLowStock(lowOnly);
    void refreshInventory(lowOnly, searchQuery);
  };

  const openAdjustModal = (item: InventoryItemWithVariant) => {
    setSelectedItem(item);
    setChangeQty(0);
    setReason('RESTOCK');
    setReferenceId('');
    setComment('');
    setFormError(null);
    setSuccessMsg(null);
  };

  const openLogsModal = async (item: InventoryItemWithVariant) => {
    setLogsModalItem(item);
    setLogsLoading(true);
    const logs = await fetchLogs(item.variantId);
    setLogsList(logs);
    setLogsLoading(false);
  };

  const handleAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setFormError(null);
    setSuccessMsg(null);

    if (changeQty === 0) {
      setFormError('Change quantity cannot be zero.');
      return;
    }
    if (!comment || comment.trim().length < 3) {
      setFormError('An audit comment of at least 3 characters is mandatory.');
      return;
    }

    setSubmitting(true);
    const ok = await adjustStock(selectedItem.variantId, {
      changeQty: Number(changeQty),
      reason,
      referenceId: referenceId.trim() || undefined,
      comment: comment.trim(),
    });
    setSubmitting(false);

    if (ok) {
      setSuccessMsg(`Stock ledger for SKU '${selectedItem.sku}' updated in atomic D1 batch transaction.`);
      setSelectedItem(null);
    }
  };

  // Compute summary metrics
  const totalSkus = items.length;
  const lowStockCount = items.filter((i) => i.status === 'LOW_STOCK').length;
  const outOfStockCount = items.filter((i) => i.status === 'OUT_OF_STOCK').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-6 mb-8">
          <div>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Real-Time Stock Ledger
            </span>
            <h1 className="text-2xl font-bold text-stone-900 mt-1">
              Inventory & Stock Management Engine
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Track available SKU stock, reserve inventory for COD orders, and manage audit logs.
            </p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl"
          >
            {error}
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

        {/* KPI Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-stone-50 border border-stone-200/60 p-6 rounded-2xl">
            <span className="text-xs text-stone-500 font-semibold uppercase tracking-wider block mb-2">
              Total Catalog SKUs
            </span>
            <p className="text-3xl font-extrabold text-stone-900">{totalSkus}</p>
            <p className="text-[11px] text-stone-500 mt-1">Active sellable variants</p>
          </div>

          <div className="bg-amber-50 border border-amber-200/60 p-6 rounded-2xl">
            <span className="text-xs text-amber-800 font-semibold uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Low Stock Alerts</span>
            </span>
            <p className="text-3xl font-extrabold text-amber-900">{lowStockCount}</p>
            <p className="text-[11px] text-amber-700 mt-1">Below threshold — order soon</p>
          </div>

          <div className="bg-red-50 border border-red-200/60 p-6 rounded-2xl">
            <span className="text-xs text-red-800 font-semibold uppercase tracking-wider block mb-2">
              Out of Stock SKUs
            </span>
            <p className="text-3xl font-extrabold text-red-900">{outOfStockCount}</p>
            <p className="text-[11px] text-red-700 mt-1">Requires restock adjustment</p>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleFilterToggle(false)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                !filterLowStock
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              All SKUs ({totalSkus})
            </button>
            <button
              type="button"
              onClick={() => handleFilterToggle(true)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                filterLowStock
                  ? 'bg-amber-800 text-white shadow-sm'
                  : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Low Stock Alerts ({lowStockCount + outOfStockCount})</span>
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by SKU or Product name..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600 bg-white"
            />
          </div>
        </div>

        {/* Inventory Ledger Table */}
        <div className="overflow-x-auto border border-stone-200 rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Product Title</th>
                <th className="px-4 py-3">Available</th>
                <th className="px-4 py-3">Reserved</th>
                <th className="px-4 py-3">Threshold</th>
                <th className="px-4 py-3">Stock Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {items.map((item) => (
                <tr key={item.variantId} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-stone-900">{item.sku}</td>
                  <td className="px-4 py-3 font-semibold text-stone-700">{item.productName}</td>
                  <td className="px-4 py-3 font-mono font-extrabold text-stone-900 text-sm">
                    {item.quantityAvailable}
                  </td>
                  <td className="px-4 py-3 font-mono text-stone-500">{item.quantityReserved}</td>
                  <td className="px-4 py-3 font-mono text-stone-400">{item.lowStockThreshold}</td>
                  <td className="px-4 py-3">
                    {item.status === 'IN_STOCK' && (
                      <span className="bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded-full text-[10px]">
                        In Stock
                      </span>
                    )}
                    {item.status === 'LOW_STOCK' && (
                      <span className="bg-amber-100 text-amber-800 font-semibold px-2.5 py-1 rounded-full text-[10px] flex items-center gap-1 w-fit">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Low Stock</span>
                      </span>
                    )}
                    {item.status === 'OUT_OF_STOCK' && (
                      <span className="bg-red-100 text-red-800 font-bold px-2.5 py-1 rounded-full text-[10px]">
                        Out of Stock
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openAdjustModal(item)}
                        aria-label={`Adjust stock for ${item.sku}`}
                        className="bg-stone-100 hover:bg-emerald-800 hover:text-white text-stone-700 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>Adjust</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => void openLogsModal(item)}
                        aria-label={`View audit logs for ${item.sku}`}
                        className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <History className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-stone-400">
                    {loading ? 'Loading inventory ledger...' : 'No SKU items match your filter.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal: Manual Stock Adjustment */}
        {selectedItem && (
          <div
            role="dialog"
            aria-label="Manual Stock Adjustment Modal"
            className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-3xl border border-stone-200 max-w-lg w-full p-6 shadow-xl relative">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
                <div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase">
                    Atomic D1 Batch Adjustment
                  </span>
                  <h2 className="text-lg font-bold text-stone-900 mt-1">
                    Adjust SKU Stock — {selectedItem.sku}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="text-stone-400 hover:text-stone-700 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                  {formError}
                </div>
              )}

              <form onSubmit={handleAdjustmentSubmit} className="space-y-4 text-left">
                <div>
                  <label htmlFor="adj-qty" className="block text-xs font-semibold text-stone-700 mb-1">
                    Change Quantity (+ to add, - to subtract) *
                  </label>
                  <input
                    id="adj-qty"
                    type="number"
                    required
                    value={changeQty}
                    onChange={(e) => setChangeQty(Number(e.target.value))}
                    placeholder="+10 or -3"
                    className="w-full px-4 py-2 text-sm border border-stone-300 rounded-xl font-mono focus:outline-none focus:border-emerald-600"
                  />
                  <span className="text-[10px] text-stone-500 mt-1 block">
                    Current Available: <span className="font-bold">{selectedItem.quantityAvailable}</span> → New Available:{' '}
                    <span className="font-bold">{selectedItem.quantityAvailable + Number(changeQty)}</span>
                  </span>
                </div>

                <div>
                  <label htmlFor="adj-reason" className="block text-xs font-semibold text-stone-700 mb-1">
                    Adjustment Reason *
                  </label>
                  <select
                    id="adj-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value as ManualAdjustmentReason)}
                    className="w-full px-4 py-2 text-xs border border-stone-300 rounded-xl bg-white"
                  >
                    <option value="RESTOCK">RESTOCK — New inventory receipt</option>
                    <option value="ADJUSTMENT">ADJUSTMENT — Stock audit correction</option>
                    <option value="RETURN">RETURN — Customer return restock</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="adj-ref" className="block text-xs font-semibold text-stone-700 mb-1">
                    Reference / PO ID (Optional)
                  </label>
                  <input
                    id="adj-ref"
                    type="text"
                    value={referenceId}
                    onChange={(e) => setReferenceId(e.target.value)}
                    placeholder="PO-2026-081"
                    className="w-full px-4 py-2 text-xs border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label htmlFor="adj-comment" className="block text-xs font-semibold text-stone-700 mb-1">
                    Mandatory Audit Comment *
                  </label>
                  <input
                    id="adj-comment"
                    type="text"
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="e.g. Received shipment from Lahore warehouse"
                    className="w-full px-4 py-2 text-xs border border-stone-300 rounded-xl"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-emerald-800 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50"
                  >
                    {submitting ? 'Executing D1 Batch...' : 'Confirm Stock Adjustment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Audit Log Trail */}
        {logsModalItem && (
          <div
            role="dialog"
            aria-label="Inventory Audit Log Modal"
            className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-3xl border border-stone-200 max-w-2xl w-full p-6 shadow-xl relative max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
                <div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase">
                    Immutable Audit Log
                  </span>
                  <h2 className="text-lg font-bold text-stone-900 mt-1">
                    Stock History — {logsModalItem.sku}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setLogsModalItem(null)}
                  className="text-stone-400 hover:text-stone-700 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 border border-stone-200 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-600 uppercase">
                      <th className="px-3 py-2">Timestamp</th>
                      <th className="px-3 py-2">Change</th>
                      <th className="px-3 py-2">Reason</th>
                      <th className="px-3 py-2">Reference</th>
                      <th className="px-3 py-2">Comment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-xs">
                    {logsList.map((l) => (
                      <tr key={l.id}>
                        <td className="px-3 py-2 font-mono text-stone-500 text-[10px]">
                          {l.createdAt?.substring(0, 16).replace('T', ' ')}
                        </td>
                        <td
                          className={`px-3 py-2 font-mono font-bold ${
                            l.changeQty > 0 ? 'text-emerald-700' : 'text-red-700'
                          }`}
                        >
                          {l.changeQty > 0 ? `+${l.changeQty}` : l.changeQty}
                        </td>
                        <td className="px-3 py-2 font-semibold">{l.reason}</td>
                        <td className="px-3 py-2 font-mono text-stone-500">
                          {l.referenceId ?? 'N/A'}
                        </td>
                        <td className="px-3 py-2 text-stone-700">{l.comment ?? ''}</td>
                      </tr>
                    ))}
                    {logsList.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-stone-400">
                          {logsLoading ? 'Loading logs...' : 'No audit log entries recorded yet.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setLogsModalItem(null)}
                  className="bg-stone-900 text-white text-xs font-semibold px-4 py-2 rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-stone-100 text-xs text-stone-500 flex items-center justify-between">
          <span>Protected by Role-Based Access Control (RBAC) — Requires `ADMIN` Role Claim</span>
          <span className="font-mono">Milestone 6 (`v0.7.0`)</span>
        </div>
      </div>
    </div>
  );
};
