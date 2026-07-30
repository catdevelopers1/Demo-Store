import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import {
  ShoppingBag,
  Truck,
  User,
  Shield,
  LogOut,
  Search as SearchIcon,
  Globe,
  Heart,
} from 'lucide-react';
import { useAuth } from '../features/authentication';
import { useSettings } from '../features/settings';
import { useCart, CartDrawer } from '../features/cart';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const { totalCount, setDrawerOpen } = useCart();

  return (
    <div className="min-h-screen flex flex-col bg-white text-black font-sans antialiased">
      {/* Sliding Cart Drawer */}
      <CartDrawer />

      {/* 1. Khaadi Slim Black Top Announcement Bar */}
      <div className="bg-black text-white text-[11px] tracking-[0.18em] uppercase py-2 px-4 flex items-center justify-between sm:justify-center relative">
        <div className="text-center font-normal">
          FREE CASH ON DELIVERY ON ORDERS OVER PKR{' '}
          {settings.freeShippingThresholdPkr.toLocaleString()}
        </div>
        <div className="hidden sm:flex items-center gap-2 absolute right-6 text-[10px] tracking-[0.15em] text-gray-300">
          <Globe className="w-3 h-3 stroke-[1.5]" />
          <span>PKR | PAKISTAN</span>
        </div>
      </div>

      {/* 2. Khaadi Crisp White Main Header */}
      <header className="bg-white border-b border-[#EAEAEA] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Minimalist Search Icon */}
          <div className="flex items-center gap-3 w-1/3">
            <Link
              to="/search"
              aria-label="Search Catalog"
              className="p-2 text-black hover:opacity-60 transition-opacity"
            >
              <SearchIcon className="w-5 h-5 stroke-[1.5]" />
            </Link>
          </div>

          {/* Center: Bold Uppercase Letterspaced Logo */}
          <div className="w-1/3 flex justify-center">
            <Link
              to="/"
              className="text-2xl sm:text-3xl font-black tracking-[0.28em] text-black uppercase hover:opacity-80 transition-opacity"
            >
              KHAADI
            </Link>
          </div>

          {/* Right: Minimalist Utility Icon Bar (Zero text buttons) */}
          <div className="flex items-center justify-end gap-1 sm:gap-2 w-1/3">
            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                aria-label="Admin Dashboard"
                className="p-2 text-black hover:opacity-60 transition-opacity"
              >
                <Shield className="w-5 h-5 stroke-[1.5]" />
              </Link>
            )}

            <Link
              to="/track-order"
              aria-label="Track Order"
              className="p-2 text-black hover:opacity-60 transition-opacity"
            >
              <Truck className="w-5 h-5 stroke-[1.5]" />
            </Link>

            <Link
              to="/search"
              aria-label="Wishlist"
              className="p-2 text-black hover:opacity-60 transition-opacity hidden sm:inline-flex"
            >
              <Heart className="w-5 h-5 stroke-[1.5]" />
            </Link>

            {user ? (
              <div className="flex items-center">
                <Link
                  to="/account"
                  aria-label="Customer Account"
                  className="p-2 text-black hover:opacity-60 transition-opacity"
                >
                  <User className="w-5 h-5 stroke-[1.5]" />
                </Link>
                <button
                  type="button"
                  onClick={() => void logout()}
                  aria-label="Sign Out"
                  className="p-2 text-gray-400 hover:text-black transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 stroke-[1.5]" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                aria-label="Sign In or Account"
                className="p-2 text-black hover:opacity-60 transition-opacity"
              >
                <User className="w-5 h-5 stroke-[1.5]" />
              </Link>
            )}

            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Shopping Bag"
              className="p-2 text-black hover:opacity-60 relative transition-opacity cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
              {totalCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-black text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                  {totalCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 3. Khaadi Horizontal Secondary Category Navigation Bar */}
        <nav className="bg-white border-t border-[#EAEAEA] py-3 px-4 flex items-center justify-center gap-6 sm:gap-10 text-[11px] font-semibold tracking-[0.2em] uppercase text-black overflow-x-auto">
          <Link
            to="/products"
            className="text-[#D9232D] font-bold hover:opacity-70 transition-opacity whitespace-nowrap"
          >
            NEW IN
          </Link>
          <Link
            to="/search?category=unstitched-lawn"
            className="hover:opacity-60 transition-opacity whitespace-nowrap"
          >
            UNSTITCHED
          </Link>
          <Link
            to="/search?category=ready-to-wear"
            className="hover:opacity-60 transition-opacity whitespace-nowrap"
          >
            READY TO WEAR
          </Link>
          <Link
            to="/search?category=winter-khaddar"
            className="hover:opacity-60 transition-opacity whitespace-nowrap"
          >
            WESTERN
          </Link>
          <Link
            to="/categories"
            className="hover:opacity-60 transition-opacity whitespace-nowrap"
          >
            FABRICS
          </Link>
          <Link
            to="/search"
            className="text-[#D9232D] font-bold hover:opacity-70 transition-opacity whitespace-nowrap"
          >
            SALE
          </Link>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 bg-white">
        <Outlet />
      </main>

      {/* 4. Khaadi Editorial Fashion Footer */}
      <footer className="bg-white text-black border-t border-[#EAEAEA] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 text-xs">
          <div className="space-y-4">
            <h3 className="font-bold tracking-[0.2em] text-sm uppercase">KHAADI</h3>
            <p className="text-gray-500 text-xs leading-relaxed tracking-wide">
              {settings.brandTagline}
            </p>
            <p className="text-gray-400 text-[11px] tracking-wider uppercase">
              HELPLINE: {settings.supportPhonePk}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold tracking-[0.18em] text-xs uppercase">CUSTOMER CARE</h3>
            <ul className="space-y-2.5 text-gray-600">
              <li>
                <Link to="/track-order" className="hover:text-black transition-colors">
                  Order Tracking (#PK)
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-black transition-colors">
                  Shipping Across Pakistan
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-black transition-colors">
                  Cash on Delivery
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-black transition-colors">
                  Exchange &amp; Returns
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold tracking-[0.18em] text-xs uppercase">INFORMATION</h3>
            <ul className="space-y-2.5 text-gray-600">
              <li>
                <Link to="/search" className="hover:text-black transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-black transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-black transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-black transition-colors">
                  Store Locator
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold tracking-[0.18em] text-xs uppercase">NEWSLETTER</h3>
            <p className="text-gray-500 text-xs leading-relaxed">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <div className="flex border-b border-black pb-1">
              <input
                type="email"
                placeholder="ENTER YOUR EMAIL"
                aria-label="Newsletter email address"
                className="w-full bg-transparent text-xs tracking-wider uppercase focus:outline-none placeholder:text-gray-400"
              />
              <button
                type="button"
                className="text-xs font-bold tracking-[0.2em] uppercase hover:opacity-60 transition-opacity cursor-pointer"
              >
                JOIN
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-[#EAEAEA] text-[11px] text-gray-400 tracking-wider flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 KHAADI PAKISTAN. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center gap-6 uppercase">
            <span>CASH ON DELIVERY</span>
            <span>NATIONWIDE SHIPPING</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
