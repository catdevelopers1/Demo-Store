import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ShoppingBag, Phone, ShieldCheck, Truck, User, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../features/authentication';
import { useSettings } from '../features/settings';
import { CategoryNavbarMenu } from '../features/categories';
import { StorefrontSearchBar } from '../features/search';
import { useCart, CartDrawer } from '../features/cart';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const { totalCount, setDrawerOpen } = useCart();

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans antialiased">
      {/* Sliding Cart Drawer with Promo Code Engine */}
      <CartDrawer />

      {/* Top Bar for Pakistani COD & Free Shipping Announcement (Dynamically configured) */}
      <div className="bg-emerald-900 text-emerald-50 text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-4">
        <span className="flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5" />
          Free Cash on Delivery (COD) across Pakistan on orders over PKR{' '}
          {settings.freeShippingThresholdPkr.toLocaleString()}
        </span>
        <span className="hidden sm:inline">|</span>
        <span className="hidden sm:flex items-center gap-1">
          <Phone className="w-3.5 h-3.5" />
          WhatsApp Support: {settings.whatsappPk}
        </span>
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl font-bold tracking-tight text-stone-900 uppercase">
              {settings.brandName}
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline">
              COD Engine v0.12
            </span>
          </Link>

          {/* FTS5 Storefront Search Bar */}
          <div className="flex-1 max-w-sm hidden lg:block">
            <StorefrontSearchBar />
          </div>

          {/* Dynamic Database/KV Driven Category Navigation Menu */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/search"
              className="text-sm font-semibold text-stone-700 hover:text-emerald-800 transition-colors py-2"
            >
              Discover
            </Link>
            <CategoryNavbarMenu />
            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className="flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors text-xs"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4 shrink-0">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/account"
                  className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-emerald-800 bg-stone-100 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-emerald-800" />
                  <span className="max-w-[120px] truncate">{user.email}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => void logout()}
                  aria-label="Sign Out"
                  className="p-1.5 text-stone-500 hover:text-red-700 transition-colors rounded-lg hover:bg-stone-100"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-700 px-3.5 py-2 rounded-xl transition-colors shadow-sm"
              >
                Sign In / Register
              </Link>
            )}

            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Shopping Bag"
              className="p-2 text-stone-700 hover:text-emerald-800 relative transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-800 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                {totalCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Store Footer */}
      <footer className="bg-stone-900 text-stone-300 py-12 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
          <div>
            <h3 className="text-white font-semibold mb-3">{settings.brandName}</h3>
            <p className="text-stone-400 text-xs leading-relaxed">{settings.brandTagline}</p>
            <p className="text-stone-400 text-xs mt-2 font-mono">
              Support Line: {settings.supportPhonePk}
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Customer Care</h3>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>Cash on Delivery Policy</li>
              <li>Shipping across Pakistan</li>
              <li>Exchange & Returns</li>
              <li>Order Tracking (#PK)</li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Store Policies</h3>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Turnstile Security</li>
              <li>COD Verification rules</li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Secure & Verified</h3>
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Protected by Cloudflare Edge & Turnstile Bot Defense</span>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-stone-800 text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 {settings.brandName}. Open-Source Reusable Commerce Framework.</p>
          <p>Version v0.12.0 — Cash on Delivery (COD) Checkout Engine</p>
        </div>
      </footer>
    </div>
  );
};
