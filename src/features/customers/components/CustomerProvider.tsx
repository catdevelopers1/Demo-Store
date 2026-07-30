import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { CustomerAddress, CustomerProfileWithAddresses } from '../types';
import type { CreateAddressInput, UpdateAddressInput } from '../validation';
import { useAuth } from '../../authentication';

export interface CustomerContextValue {
  profile: CustomerProfileWithAddresses | null;
  addresses: CustomerAddress[];
  loading: boolean;
  error: string | null;
  createAddress: (data: CreateAddressInput) => Promise<boolean>;
  updateAddress: (id: string, data: UpdateAddressInput) => Promise<boolean>;
  deleteAddress: (id: string) => Promise<boolean>;
  setDefaultAddress: (id: string) => Promise<boolean>;
  refreshAddresses: () => Promise<void>;
}

const CustomerContext = createContext<CustomerContextValue | undefined>(undefined);

export const CustomerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CustomerProfileWithAddresses | null>(null);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomerData = async () => {
    if (!user) {
      setProfile(null);
      setAddresses([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resProfile = await fetch('/api/v1/customer/profile');
      if (resProfile.ok) {
        const jsonProfile = (await resProfile.json()) as {
          success?: boolean;
          data?: CustomerProfileWithAddresses;
        };
        if (jsonProfile?.success && jsonProfile.data) {
          setProfile(jsonProfile.data);
          setAddresses(jsonProfile.data.addresses);
        }
      }
    } catch {
      // Ignore network errors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCustomerData();
  }, [user?.id]);

  const createAddress = async (data: CreateAddressInput): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/customer/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = (await res.json()) as {
        success?: boolean;
        error?: { message?: string };
      };

      if (!res.ok || !json.success) {
        setError(json?.error?.message ?? 'Failed to create Pakistani shipping address.');
        setLoading(false);
        return false;
      }

      await fetchCustomerData();
      return true;
    } catch {
      setError('A network error occurred while adding shipping address.');
      setLoading(false);
      return false;
    }
  };

  const updateAddress = async (id: string, data: UpdateAddressInput): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/customer/addresses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = (await res.json()) as {
        success?: boolean;
        error?: { message?: string };
      };

      if (!res.ok || !json.success) {
        setError(json?.error?.message ?? 'Failed to update shipping address.');
        setLoading(false);
        return false;
      }

      await fetchCustomerData();
      return true;
    } catch {
      setError('A network error occurred while updating shipping address.');
      setLoading(false);
      return false;
    }
  };

  const deleteAddress = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/customer/addresses/${id}`, {
        method: 'DELETE',
      });

      const json = (await res.json()) as {
        success?: boolean;
        error?: { message?: string };
      };

      if (!res.ok || !json.success) {
        setError(json?.error?.message ?? 'Failed to delete shipping address.');
        setLoading(false);
        return false;
      }

      await fetchCustomerData();
      return true;
    } catch {
      setError('A network error occurred while deleting address.');
      setLoading(false);
      return false;
    }
  };

  const setDefaultAddress = async (id: string): Promise<boolean> => {
    return await updateAddress(id, { isDefault: true });
  };

  const refreshAddresses = async (): Promise<void> => {
    await fetchCustomerData();
  };

  return (
    <CustomerContext.Provider
      value={{
        profile,
        addresses,
        loading,
        error,
        createAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        refreshAddresses,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export function useCustomer(): CustomerContextValue {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a <CustomerProvider /> component.');
  }
  return context;
}
