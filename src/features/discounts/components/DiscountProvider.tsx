import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Discount, DiscountEvaluationResult } from '../types';
import type { CreateDiscountInput, UpdateDiscountInput } from '../validation';
import { useAuth } from '../../authentication';

export interface DiscountContextValue {
  discounts: Discount[];
  appliedCoupon: DiscountEvaluationResult | null;
  discountPkr: number;
  couponError: string | null;
  loading: boolean;
  applyCoupon: (code: string, subtotalPkr: number) => Promise<boolean>;
  removeCoupon: () => void;
  createDiscount: (data: CreateDiscountInput) => Promise<boolean>;
  updateDiscount: (id: string, data: UpdateDiscountInput) => Promise<boolean>;
  deleteDiscount: (id: string) => Promise<boolean>;
  refreshDiscounts: () => Promise<void>;
}

const DiscountContext = createContext<DiscountContextValue | undefined>(undefined);

export const DiscountProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<DiscountEvaluationResult | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchDiscounts = async () => {
    if (!user || user.role !== 'ADMIN') {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/discounts');
      if (res.ok) {
        const json = (await res.json()) as {
          success?: boolean;
          data?: Discount[];
        };
        if (json?.success && json.data) {
          setDiscounts(json.data);
        }
      }
    } catch {
      // Ignore offline errors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchDiscounts();
  }, [user?.role]);

  const applyCoupon = async (code: string, subtotalPkr: number): Promise<boolean> => {
    setLoading(true);
    setCouponError(null);
    try {
      const res = await fetch('/api/v1/discounts/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), subtotalPkr }),
      });

      const json = (await res.json()) as {
        success?: boolean;
        error?: { message?: string };
        data?: DiscountEvaluationResult;
      };

      if (!res.ok || !json.success || !json.data) {
        setCouponError(json?.error?.message ?? 'Invalid promotional coupon code.');
        setLoading(false);
        return false;
      }

      setAppliedCoupon(json.data);
      setLoading(false);
      return true;
    } catch {
      setCouponError('A network error occurred while validating coupon.');
      setLoading(false);
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const createDiscount = async (data: CreateDiscountInput): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = (await res.json()) as { success?: boolean };
      if (!res.ok || !json.success) {
        setLoading(false);
        return false;
      }

      await fetchDiscounts();
      return true;
    } catch {
      setLoading(false);
      return false;
    }
  };

  const updateDiscount = async (id: string, data: UpdateDiscountInput): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/discounts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = (await res.json()) as { success?: boolean };
      if (!res.ok || !json.success) {
        setLoading(false);
        return false;
      }

      await fetchDiscounts();
      return true;
    } catch {
      setLoading(false);
      return false;
    }
  };

  const deleteDiscount = async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/discounts/${id}`, {
        method: 'DELETE',
      });

      const json = (await res.json()) as { success?: boolean };
      if (!res.ok || !json.success) {
        setLoading(false);
        return false;
      }

      await fetchDiscounts();
      return true;
    } catch {
      setLoading(false);
      return false;
    }
  };

  const refreshDiscounts = async (): Promise<void> => {
    await fetchDiscounts();
  };

  return (
    <DiscountContext.Provider
      value={{
        discounts,
        appliedCoupon,
        discountPkr: appliedCoupon?.discountPkr ?? 0,
        couponError,
        loading,
        applyCoupon,
        removeCoupon,
        createDiscount,
        updateDiscount,
        deleteDiscount,
        refreshDiscounts,
      }}
    >
      {children}
    </DiscountContext.Provider>
  );
};

export function useDiscount(): DiscountContextValue {
  const context = useContext(DiscountContext);
  if (!context) {
    throw new Error('useDiscount must be used within a <DiscountProvider /> component.');
  }
  return context;
}
