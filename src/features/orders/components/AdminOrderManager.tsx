import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  RotateCcw,
  XCircle,
  FileText,
  Eye,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Columns,
  List,
  MessageSquare,
  ShieldAlert,
} from 'lucide-react';
import { formatPkr } from '../../variants/utils';
import type { CodOrder, OrderStatus } from '../types';
import {
  STATUS_LABELS,
  STATUS_BADGE_CLASSES,
  getAvailableNextStatuses,
  isTerminalStatus,
} from '../utils/stateMachine';
import { formatPakistaniPhoneDisplay } from '../utils/phone';

function getStatusIcon(status: OrderStatus) {
  switch (status) {
    case 'PENDING_VERIFICATION':
      return <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    case 'CONFIRMED':
      return <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    case 'PROCESSING':
      return <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
    case 'SHIPPED':
      return <Truck className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
    case 'DELIVERED':
      return <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    case 'CANCELLED':
      return <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
    case 'RETURNED':
      return <RotateCcw className="w-4 h-4 text-slate-600 dark:text-slate-400" />;
    default:
      return <FileText className="w-4 h-4 text-gray-500" />;
  }
}

export const AdminOrderManager: React.FC = () => {
  const [orders, setOrders] = useState<CodOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState<CodOrder | null>(null);
  const [statusModalOrder, setStatusModalOrder] = useState<CodOrder | null>(null);
  const [nextStatus, setNextStatus] = useState<OrderStatus>('CONFIRMED');
  const [auditComment, setAuditComment] = useState('');
  const [restockInventory, setRestockInventory] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (statusFilter && statusFilter !== 'ALL') {
        params.append('status', statusFilter);
      }
      if (searchQuery.trim() !== '') {
        params.append('search', searchQuery.trim());
      }

      const response = await fetch(`/api/v1/admin/orders?${params.toString()}`);
      const data = (await response.json()) as {
        success?: boolean;
        data?: CodOrder[];
        meta?: { page?: number; limit?: number; total?: number };
        error?: { message?: string };
      };

      if (!response.ok || !data.success || !data.data) {
        throw new Error(data.error?.message ?? 'Failed to load COD orders.');
      }

      setOrders(data.data);
      const total = data.meta?.total ?? 0;
      const limit = data.meta?.limit ?? 20;
      setTotalPages(Math.max(1, Math.ceil(total / limit)));
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to fetch admin order list.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, searchQuery]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  const openStatusChangeModal = (order: CodOrder) => {
    const validNext = getAvailableNextStatuses(order.status);
    const firstNext = validNext[0];
    if (!firstNext) {
      return;
    }
    setStatusModalOrder(order);
    setNextStatus(firstNext);
    setAuditComment('');
    setRestockInventory(true);
    setStatusError(null);
  };

  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalOrder) {
      return;
    }
    if (auditComment.trim().length < 3) {
      setStatusError('A mandatory audit comment (minimum 3 chars) is required.');
      return;
    }

    setStatusUpdating(true);
    setStatusError(null);

    try {
      const response = await fetch(
        `/api/v1/admin/orders/${statusModalOrder.id}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: nextStatus,
            comment: auditComment.trim(),
            restockInventory,
          }),
        }
      );
      const data = (await response.json()) as {
        success?: boolean;
        data?: CodOrder;
        error?: { message?: string };
      };

      if (!response.ok || !data.success || !data.data) {
        throw new Error(
          data.error?.message ?? 'Failed to update order lifecycle status.'
        );
      }

      setStatusModalOrder(null);
      void fetchOrders();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to save new order status.';
      setStatusError(msg);
    } finally {
      setStatusUpdating(false);
    }
  };

  // Group orders by status for Kanban Board
  const kanbanStatuses: OrderStatus[] = [
    'PENDING_VERIFICATION',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'RETURNED',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Pakistani COD Order Lifecycle Manager
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Manage cash-on-delivery orders, inspect Pakistani addresses, execute state transitions, and audit timeline logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-600 p-0.5 bg-gray-50 dark:bg-gray-700">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Kanban Board</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => void fetchOrders()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-4 border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search #PK-10001, phone, name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setPage(1);
                void fetchOrders();
              }
            }}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-[var(--brand-primary-hex,#047857)] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-[var(--brand-primary-hex,#047857)] focus:outline-none"
          >
            <option value="ALL">All Order Statuses</option>
            {kanbanStatuses.map((st) => (
              <option key={st} value={st}>
                {STATUS_LABELS[st]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-xl p-4 text-rose-800 dark:text-rose-200 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error Loading Orders</p>
            <p className="mt-0.5 text-rose-700 dark:text-rose-300">{error}</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && orders.length === 0 ? (
        <div className="py-16 text-center text-gray-500 dark:text-gray-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-[var(--brand-primary-hex,#047857)]" />
          <p className="text-sm">Loading COD order lifecycle records...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
          <Package className="w-10 h-10 mx-auto mb-3 text-gray-400" />
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            No orders found
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Try adjusting your status filter or search query.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                  <th className="py-3 px-4">Order Number</th>
                  <th className="py-3 px-4">Customer &amp; City</th>
                  <th className="py-3 px-4">Pakistani Mobile</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total (PKR)</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                {orders.map((order) => {
                  const canTransition = !isTerminalStatus(order.status);
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                        {order.orderNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {order.shippingAddress?.recipientName ?? 'Customer'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {order.shippingAddress?.city},{' '}
                          {order.shippingAddress?.provinceState}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-700 dark:text-gray-300 font-mono">
                        {formatPakistaniPhoneDisplay(order.guestPhone)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            STATUS_BADGE_CLASSES[order.status]
                          }`}
                        >
                          {getStatusIcon(order.status)}
                          <span>{STATUS_LABELS[order.status]}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-600 dark:text-gray-400">
                        {order.items.reduce((acc, i) => acc + i.quantity, 0)} item(s)
                      </td>
                      <td className="py-3 px-4 font-extrabold text-gray-900 dark:text-white">
                        {formatPkr(order.totalPkr)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>

                          {canTransition && (
                            <button
                              type="button"
                              onClick={() => openStatusChangeModal(order)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-[var(--brand-primary-hex,#047857)] hover:bg-[var(--brand-secondary-hex,#065f46)] text-white transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Update</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1 rounded bg-gray-100 dark:bg-gray-700 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1 rounded bg-gray-100 dark:bg-gray-700 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* KANBAN BOARD VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 overflow-x-auto pb-4">
          {kanbanStatuses.map((st) => {
            const colOrders = orders.filter((o) => o.status === st);
            return (
              <div
                key={st}
                className="bg-gray-100/60 dark:bg-gray-800/60 rounded-xl p-3 border border-gray-200 dark:border-gray-700 min-h-[380px] flex flex-col"
              >
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900 dark:text-white">
                    {getStatusIcon(st)}
                    <span>{STATUS_LABELS[st]}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full text-[10px] font-semibold text-gray-700 dark:text-gray-300">
                    {colOrders.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {colOrders.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-400">
                      No orders in this stage
                    </div>
                  ) : (
                    colOrders.map((order) => {
                      const canTransition = !isTerminalStatus(order.status);
                      return (
                        <div
                          key={order.id}
                          className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow text-xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-gray-900 dark:text-white">
                              {order.orderNumber}
                            </span>
                            <span className="font-bold text-[var(--brand-primary-hex,#047857)]">
                              {formatPkr(order.totalPkr)}
                            </span>
                          </div>

                          <div className="text-gray-600 dark:text-gray-400">
                            <p className="font-semibold text-gray-800 dark:text-gray-200">
                              {order.shippingAddress?.recipientName}
                            </p>
                            <p className="text-[11px]">
                              {order.shippingAddress?.city},{' '}
                              {order.shippingAddress?.provinceState}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                              className="text-[11px] font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white underline cursor-pointer"
                            >
                              View details
                            </button>

                            {canTransition && (
                              <button
                                type="button"
                                onClick={() => openStatusChangeModal(order)}
                                className="px-2 py-1 text-[11px] font-medium bg-[var(--brand-primary-hex,#047857)] hover:bg-[var(--brand-secondary-hex,#065f46)] text-white rounded transition-colors cursor-pointer"
                              >
                                Advance
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ORDER DETAIL VIEW MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>Order Details</span>
                  <span className="text-[var(--brand-primary-hex,#047857)]">
                    {selectedOrder.orderNumber}
                  </span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Placed on{' '}
                  {selectedOrder.createdAt
                    ? new Date(selectedOrder.createdAt).toLocaleString('en-PK', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })
                    : ''}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-600 dark:text-gray-300 cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Status Header */}
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                  STATUS_BADGE_CLASSES[selectedOrder.status]
                }`}
              >
                {getStatusIcon(selectedOrder.status)}
                <span>{STATUS_LABELS[selectedOrder.status]}</span>
              </span>

              {!isTerminalStatus(selectedOrder.status) && (
                <button
                  type="button"
                  onClick={() => {
                    const target = selectedOrder;
                    setSelectedOrder(null);
                    openStatusChangeModal(target);
                  }}
                  className="px-3 py-1.5 bg-[var(--brand-primary-hex,#047857)] hover:bg-[var(--brand-secondary-hex,#065f46)] text-white text-xs font-medium rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Change Status
                </button>
              )}
            </div>

            {/* Pakistani Shipping Address */}
            <div className="space-y-1 text-sm bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-2">
                Customer &amp; Shipping Details
              </h4>
              <p className="font-semibold text-gray-900 dark:text-white">
                {selectedOrder.shippingAddress?.recipientName}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Phone: {formatPakistaniPhoneDisplay(selectedOrder.guestPhone)}
              </p>
              {selectedOrder.guestEmail && (
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Email: {selectedOrder.guestEmail}
                </p>
              )}
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {selectedOrder.shippingAddress?.streetAddress},{' '}
                {selectedOrder.shippingAddress?.city},{' '}
                {selectedOrder.shippingAddress?.provinceState}{' '}
                {selectedOrder.shippingAddress?.postalCode}
              </p>
              {selectedOrder.notes && (
                <div className="mt-2 text-xs text-amber-700 dark:text-amber-300 font-medium bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                  Notes: {selectedOrder.notes}
                </div>
              )}
            </div>

            {/* Line Items Table */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-2">
                Order Items ({selectedOrder.items.length})
              </h4>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {selectedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="py-2.5 flex items-center justify-between text-sm"
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
                    <span className="font-bold text-gray-900 dark:text-white">
                      {formatPkr(item.totalPkr)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bill PKR */}
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>{formatPkr(selectedOrder.subtotalPkr)}</span>
              </div>
              {selectedOrder.discountPkr > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Discount</span>
                  <span>-{formatPkr(selectedOrder.discountPkr)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>COD Shipping Fee</span>
                <span>
                  {selectedOrder.shippingPkr === 0
                    ? 'FREE'
                    : formatPkr(selectedOrder.shippingPkr)}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between font-extrabold text-gray-900 dark:text-white">
                <span>Total Payable (COD)</span>
                <span className="text-[var(--brand-primary-hex,#047857)]">
                  {formatPkr(selectedOrder.totalPkr)}
                </span>
              </div>
            </div>

            {/* Timeline Log */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-3">
                Immutable Order Timeline Audit Log
              </h4>
              <div className="space-y-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                {selectedOrder.timeline.map((entry) => (
                  <div key={entry.id} className="text-xs space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 dark:text-white">
                        {STATUS_LABELS[entry.newStatus]}
                      </span>
                      <span className="text-gray-400">
                        {entry.createdAt
                          ? new Date(entry.createdAt).toLocaleString('en-PK', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })
                          : ''}
                      </span>
                    </div>
                    {entry.comment && (
                      <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/40 p-2 rounded">
                        {entry.comment}
                      </p>
                    )}
                    {entry.changedByUserId && (
                      <p className="text-[10px] text-gray-400">
                        By: {entry.changedByUserId}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-right pt-2 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-800 dark:text-gray-200 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Close Modal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATUS CHANGE & AUDIT COMMENT MODAL */}
      {statusModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full shadow-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Update COD Order Lifecycle Status
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Order: <span className="font-bold">{statusModalOrder.orderNumber}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setStatusModalOrder(null)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
              {/* Current vs Next Status */}
              <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700 space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>Current Stage:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {STATUS_LABELS[statusModalOrder.status]}
                  </span>
                </div>

                <div>
                  <label
                    htmlFor="nextStatus"
                    className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Select New Stage
                  </label>
                  <select
                    id="nextStatus"
                    value={nextStatus}
                    onChange={(e) =>
                      setNextStatus(e.target.value as OrderStatus)
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[var(--brand-primary-hex,#047857)] focus:outline-none"
                  >
                    {getAvailableNextStatuses(statusModalOrder.status).map((st) => (
                      <option key={st} value={st}>
                        {STATUS_LABELS[st]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Alert banner if Cancelling or Returning */}
              {(nextStatus === 'CANCELLED' || nextStatus === 'RETURNED') && (
                <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-xl p-3 text-xs text-amber-800 dark:text-amber-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Inventory Restock Rule Applied</span>
                  </div>
                  <p>
                    Transitioning this COD order to <strong>{STATUS_LABELS[nextStatus]}</strong> will automatically restore reserved SKU stock back to available inventory.
                  </p>
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={restockInventory}
                      onChange={(e) => setRestockInventory(e.target.checked)}
                      className="rounded border-gray-300 text-[var(--brand-primary-hex,#047857)] focus:ring-[var(--brand-primary-hex,#047857)]"
                    />
                    <span>Restock reserved inventory ({statusModalOrder.items.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                  </label>
                </div>
              )}

              {/* Mandatory Audit Comment */}
              <div>
                <label
                  htmlFor="auditComment"
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[var(--brand-primary-hex,#047857)]" />
                  <span>Mandatory Audit Comment</span>
                </label>
                <textarea
                  id="auditComment"
                  rows={3}
                  required
                  placeholder="e.g., Order confirmed via WhatsApp voice note with customer..."
                  value={auditComment}
                  onChange={(e) => setAuditComment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[var(--brand-primary-hex,#047857)] focus:outline-none"
                />
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  Required by Pakistani COD audit rules (minimum 3 characters).
                </p>
              </div>

              {statusError && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-800 dark:text-rose-200 text-xs">
                  {statusError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setStatusModalOrder(null)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={statusUpdating || auditComment.trim().length < 3}
                  className="px-4 py-2 bg-[var(--brand-primary-hex,#047857)] hover:bg-[var(--brand-secondary-hex,#065f46)] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {statusUpdating ? 'Updating Status...' : 'Save & Record Timeline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
