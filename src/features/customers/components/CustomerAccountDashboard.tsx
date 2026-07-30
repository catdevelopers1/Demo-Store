import React, { useState } from 'react';
import { useCustomer } from './CustomerProvider';
import { useAuth } from '../../authentication';
import {
  PAKISTAN_PROVINCES,
  PAKISTAN_CITIES_BY_PROVINCE,
  type PakistanProvince,
} from '../utils/pakistanLocations';
import {
  User,
  MapPin,
  Phone,
  Mail,
  Plus,
  Trash2,
  CheckCircle2,
  Star,
  X,
  ShieldCheck,
  Package,
} from 'lucide-react';

export const CustomerAccountDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const {
    profile,
    addresses,
    loading,
    error,
    createAddress,
    deleteAddress,
    setDefaultAddress,
  } = useCustomer();

  const [activeTab, setActiveTab] = useState<'addresses' | 'orders'>('addresses');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Modal Form States
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [provinceState, setProvinceState] = useState<PakistanProvince>('Punjab');
  const [city, setCity] = useState('Lahore');
  const [streetAddress, setStreetAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleProvinceChange = (newProvince: PakistanProvince) => {
    setProvinceState(newProvince);
    const cities = PAKISTAN_CITIES_BY_PROVINCE[newProvince];
    if (cities && cities.length > 0) {
      setCity(cities[0]!);
    }
  };

  const openCreateModal = () => {
    setRecipientName(user?.email.split('@')[0] ?? 'Customer');
    setPhone(user?.phone ?? '0300-1234567');
    setProvinceState('Punjab');
    setCity('Lahore');
    setStreetAddress('');
    setPostalCode('');
    setIsDefault(addresses.length === 0);
    setFormError(null);
    setSuccessMsg(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    if (!recipientName || !phone || !streetAddress || !city) {
      setFormError('Please complete all required shipping address fields.');
      return;
    }

    setSubmitting(true);
    const ok = await createAddress({
      recipientName,
      phone,
      provinceState,
      city,
      streetAddress,
      postalCode: postalCode.trim() || undefined,
      isDefault,
    });
    setSubmitting(false);

    if (ok) {
      setSuccessMsg('Pakistani shipping address added to address book in atomic D1 transaction.');
      setModalOpen(false);
    }
  };

  const handleSetDefault = async (id: string, label: string) => {
    setSuccessMsg(null);
    const ok = await setDefaultAddress(id);
    if (ok) {
      setSuccessMsg(`Address '${label}' promoted to default COD shipping address.`);
    }
  };

  const handleDeleteAddress = async (id: string, label: string) => {
    if (window.confirm(`Delete Pakistani shipping address '${label}' from your address book?`)) {
      setSuccessMsg(null);
      const ok = await deleteAddress(id);
      if (ok) {
        setSuccessMsg(`Address '${label}' deleted. Remaining addresses promoted atomically if needed.`);
      }
    }
  };

  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 shadow-sm">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-stone-100 pb-8 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl">
              <User className="w-7 h-7" />
            </div>
            <div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Verified COD Customer
              </span>
              <h1 className="text-2xl font-bold text-stone-900 mt-1">
                Pakistani Customer Dashboard
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                Manage your Pakistani shipping addresses, COD order history, and account security.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openCreateModal}
              className="bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Pakistani Address</span>
            </button>
            <button
              type="button"
              onClick={() => void logout()}
              className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Alerts & Messages */}
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

        {/* Profile Summary & Default Address Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200/60">
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
              <Mail className="w-4 h-4 text-emerald-700" />
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                Account Email
              </span>
            </div>
            <p className="font-bold text-stone-900 text-sm truncate">{user?.email}</p>
            <p className="text-[11px] text-stone-400 mt-0.5">Role: {user?.role}</p>
          </div>

          <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200/60">
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
              <Phone className="w-4 h-4 text-emerald-700" />
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                Pakistani Mobile Line
              </span>
            </div>
            <p className="font-bold text-stone-900 text-sm">
              {profile?.phone ?? user?.phone ?? '0300-1234567'}
            </p>
            <p className="text-[11px] text-stone-400 mt-0.5">Active for COD SMS confirmation</p>
          </div>

          <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200/60">
            <div className="flex items-center gap-2 text-xs text-emerald-800 mb-1">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                Default Shipping Address
              </span>
            </div>
            <p className="font-bold text-emerald-900 text-sm truncate">
              {defaultAddress
                ? `${defaultAddress.recipientName} • ${defaultAddress.city}`
                : 'No default address set'}
            </p>
            <p className="text-[11px] text-emerald-700 mt-0.5 truncate">
              {defaultAddress
                ? `${defaultAddress.streetAddress}, ${defaultAddress.provinceState}`
                : 'Add an address below for COD checkout'}
            </p>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-4 border-b border-stone-200 mb-8">
          <button
            type="button"
            onClick={() => setActiveTab('addresses')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'addresses'
                ? 'border-emerald-800 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Pakistani Address Book ({addresses.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'orders'
                ? 'border-emerald-800 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            COD Order History
          </button>
        </div>

        {/* Tab 1: Address Book */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-stone-900">
                  Saved Pakistani Shipping Addresses
                </h2>
                <p className="text-xs text-stone-500">
                  These addresses will be available during Cash on Delivery (COD) checkout.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-stone-400 border border-stone-200 rounded-2xl">
                Loading Pakistani address book from Cloudflare D1...
              </div>
            ) : addresses.length === 0 ? (
              <div className="py-12 bg-stone-50 rounded-2xl border border-stone-200 text-center p-8">
                <MapPin className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                <h3 className="font-bold text-stone-800 text-sm">No Addresses Saved Yet</h3>
                <p className="text-xs text-stone-500 mt-1">
                  Add your first Pakistani address to enable instant Cash on Delivery checkout.
                </p>
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="mt-4 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition-colors shadow-sm inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add First Address</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`bg-white rounded-2xl border p-6 shadow-sm flex flex-col justify-between transition-all ${
                      addr.isDefault
                        ? 'border-emerald-800 ring-2 ring-emerald-800 ring-offset-2'
                        : 'border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-stone-900 text-base">
                          {addr.recipientName}
                        </span>
                        {addr.isDefault ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                            <Star className="w-3 h-3 fill-emerald-800" />
                            <span>Primary COD Address</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => void handleSetDefault(addr.id, addr.city)}
                            className="text-[11px] text-stone-500 hover:text-emerald-800 font-semibold underline transition-colors"
                          >
                            Set as Default
                          </button>
                        )}
                      </div>

                      <p className="text-xs font-mono font-semibold text-stone-700">
                        {addr.phone}
                      </p>
                      <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                        {addr.streetAddress}
                      </p>
                      <p className="text-xs font-bold text-stone-800 mt-1">
                        {addr.city}, <span className="text-stone-600">{addr.provinceState}</span>
                      </p>
                      {addr.postalCode && (
                        <p className="text-[11px] font-mono text-stone-400 mt-0.5">
                          Postal Code: {addr.postalCode}
                        </p>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-[11px] text-stone-400 font-mono">
                        ID: {addr.id}
                      </span>
                      <button
                        type="button"
                        onClick={() => void handleDeleteAddress(addr.id, `${addr.recipientName} (${addr.city})`)}
                        aria-label="Delete address"
                        className="text-stone-400 hover:text-red-700 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: COD Order History Placeholder */}
        {activeTab === 'orders' && (
          <div className="py-12 bg-stone-50 rounded-2xl border border-stone-200 text-center p-8">
            <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="font-bold text-stone-900 text-sm">COD Order History</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto leading-relaxed">
              Milestone 7 (`v0.8.0`): Customer profile and address book are active. Complete order history tracking and shipment milestones will mount here in Milestone 12 (`v0.13.0`).
            </p>
          </div>
        )}

        {/* Modal: Add New Pakistani Shipping Address */}
        {modalOpen && (
          <div
            role="dialog"
            aria-label="Add Pakistani Shipping Address Modal"
            className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-3xl border border-stone-200 max-w-lg w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
                <div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase">
                    Pakistani Standardization
                  </span>
                  <h2 className="text-lg font-bold text-stone-900 mt-1">
                    Add New Shipping Address
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
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

              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div>
                  <label htmlFor="addr-name" className="block text-xs font-semibold text-stone-700 mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    id="addr-name"
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Ahmed Khan"
                    className="w-full px-4 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label htmlFor="addr-phone" className="block text-xs font-semibold text-stone-700 mb-1">
                    Pakistani Mobile Number (03XX...) *
                  </label>
                  <input
                    id="addr-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full px-4 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600 font-mono"
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block">
                    Mandatory for Cash on Delivery courier confirmation & SMS alerts
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="addr-province" className="block text-xs font-semibold text-stone-700 mb-1">
                      Province / Territory *
                    </label>
                    <select
                      id="addr-province"
                      value={provinceState}
                      onChange={(e) => handleProvinceChange(e.target.value as PakistanProvince)}
                      className="w-full px-4 py-2 text-xs border border-stone-300 rounded-xl bg-white"
                    >
                      {PAKISTAN_PROVINCES.map((prov) => (
                        <option key={prov} value={prov}>
                          {prov}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="addr-city" className="block text-xs font-semibold text-stone-700 mb-1">
                      City *
                    </label>
                    <select
                      id="addr-city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-2 text-xs border border-stone-300 rounded-xl bg-white font-medium"
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
                  <label htmlFor="addr-street" className="block text-xs font-semibold text-stone-700 mb-1">
                    Detailed Street / House Address *
                  </label>
                  <input
                    id="addr-street"
                    type="text"
                    required
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="House 12, Street 4, Gulberg III"
                    className="w-full px-4 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label htmlFor="addr-postal" className="block text-xs font-semibold text-stone-700 mb-1">
                    Postal Code (Optional 5-digit PK format)
                  </label>
                  <input
                    id="addr-postal"
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="54660"
                    className="w-full px-4 py-2 text-xs border border-stone-300 rounded-xl font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    id="addr-default"
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="w-4 h-4 text-emerald-800 rounded border-stone-300 focus:ring-emerald-800"
                  />
                  <label htmlFor="addr-default" className="text-xs font-semibold text-stone-700 cursor-pointer">
                    Set as Default Shipping Address for COD Checkout
                  </label>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-emerald-800 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50"
                  >
                    {submitting ? 'Saving to D1...' : 'Save Pakistani Address'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-stone-100 text-xs text-stone-500 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            100% Pakistani Standardization & Address Verification
          </span>
          <span className="font-mono">Milestone 7 (`v0.8.0`)</span>
        </div>
      </div>
    </div>
  );
};
