import React from 'react';
import { useAuth } from '../features/authentication';
import {
  ShieldAlert,
  LayoutDashboard,
  Truck,
  Users,
  Settings,
  FolderTree,
  ShoppingBag,
  Image as ImageIcon,
  SlidersHorizontal,
  Tag,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminView: React.FC = () => {
  const { user } = useAuth();

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-stone-900 text-white rounded-3xl p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-800 pb-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <span className="bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider">
                RBAC Verified Admin
              </span>
              <h1 className="text-2xl font-bold mt-1">Pakistani Commerce Store Admin</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/orders"
              className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors shadow-sm"
            >
              <Truck className="w-4 h-4" />
              <span>Orders</span>
            </Link>
            <Link
              to="/admin/products"
              className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Products</span>
            </Link>
            <Link
              to="/admin/discounts"
              className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors shadow-sm"
            >
              <Tag className="w-4 h-4" />
              <span>Discounts</span>
            </Link>
            <Link
              to="/admin/inventory"
              className="flex items-center gap-1.5 bg-amber-700 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Inventory</span>
            </Link>
            <Link
              to="/admin/images"
              className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors shadow-sm"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Lookbook R2</span>
            </Link>
            <Link
              to="/admin/categories"
              className="flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
            >
              <FolderTree className="w-4 h-4" />
              <span>Categories</span>
            </Link>
            <Link
              to="/admin/settings"
              className="flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Link>
            <div className="text-xs text-stone-400 hidden sm:block">
              <span className="text-emerald-400 font-semibold">{user.email}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link
            to="/admin/orders"
            className="bg-stone-800/80 border border-stone-700/60 p-6 rounded-2xl hover:border-emerald-500/50 transition-colors block"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-stone-400 font-medium uppercase tracking-wider">
                COD Order Lifecycle
              </span>
              <Truck className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-3xl font-extrabold">6</p>
            <p className="text-xs text-stone-500 mt-1">
              View Kanban board &amp; immutable audit log
            </p>
          </Link>

          <div className="bg-stone-800/80 border border-stone-700/60 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-stone-400 font-medium uppercase tracking-wider">
                Promotional Coupons
              </span>
              <Tag className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-3xl font-extrabold">3</p>
            <p className="text-xs text-stone-500 mt-1">AZADI14, LAWNSALE500 active</p>
          </div>

          <div className="bg-stone-800/80 border border-stone-700/60 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-stone-400 font-medium uppercase tracking-wider">
                Registered Customers
              </span>
              <Users className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-3xl font-extrabold">1</p>
            <p className="text-xs text-stone-500 mt-1">100% Pakistani mobile formatting</p>
          </div>
        </div>

        <div className="mt-8 p-4 rounded-xl bg-emerald-950/50 border border-emerald-800/50 flex items-center gap-3 text-xs text-emerald-300">
          <ShieldAlert className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            Milestone 12 (`v0.13.0`): Order Lifecycle Management & Audit Timeline operational. Click "Orders" above to manage COD state transitions and inspect audit logs.
          </span>
        </div>
      </div>
    </div>
  );
};
