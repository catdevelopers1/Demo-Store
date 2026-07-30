import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type {
  InventoryItemWithVariant,
  InventoryLog,
  StockCheckResult,
} from '../types';
import type { AdjustStockInput } from '../validation';

export interface InventoryContextValue {
  items: InventoryItemWithVariant[];
  loading: boolean;
  error: string | null;
  adjustStock: (variantId: string, input: AdjustStockInput) => Promise<boolean>;
  fetchLogs: (variantId: string) => Promise<InventoryLog[]>;
  checkStock: (variantId: string) => Promise<StockCheckResult | null>;
  refreshInventory: (lowStockOnly?: boolean, q?: string) => Promise<void>;
}

const InventoryContext = createContext<InventoryContextValue | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<InventoryItemWithVariant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = async (lowStockOnly = false, q?: string) => {
    setLoading(true);
    setError(null);
    try {
      let url = '/api/v1/admin/inventory?';
      if (lowStockOnly) url += 'lowStock=true&';
      if (q) url += `q=${encodeURIComponent(q)}&`;

      const res = await fetch(url);
      if (res.ok) {
        const json = (await res.json()) as {
          success?: boolean;
          data?: InventoryItemWithVariant[];
        };
        if (json?.success && json.data) {
          setItems(json.data);
        }
      }
    } catch {
      // Ignore network errors if unauthenticated or offline
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchInventory();
  }, []);

  const adjustStock = async (variantId: string, input: AdjustStockInput): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/admin/inventory/${variantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const json = (await res.json()) as {
        success?: boolean;
        error?: { message?: string };
      };

      if (!res.ok || !json.success) {
        setError(json?.error?.message ?? 'Stock adjustment failed.');
        setLoading(false);
        return false;
      }

      await fetchInventory();
      return true;
    } catch {
      setError('A network error occurred while adjusting inventory.');
      setLoading(false);
      return false;
    }
  };

  const fetchLogs = async (variantId: string): Promise<InventoryLog[]> => {
    try {
      const res = await fetch(`/api/v1/admin/inventory/${variantId}/logs`);
      if (!res.ok) return [];
      const json = (await res.json()) as {
        success?: boolean;
        data?: InventoryLog[];
      };
      return json?.success && json.data ? json.data : [];
    } catch {
      return [];
    }
  };

  const checkStock = async (variantId: string): Promise<StockCheckResult | null> => {
    try {
      const res = await fetch(`/api/v1/inventory/check?variantId=${variantId}`);
      if (!res.ok) return null;
      const json = (await res.json()) as {
        success?: boolean;
        data?: StockCheckResult;
      };
      return json?.success && json.data ? json.data : null;
    } catch {
      return null;
    }
  };

  const refreshInventory = async (lowStockOnly?: boolean, q?: string): Promise<void> => {
    await fetchInventory(lowStockOnly, q);
  };

  return (
    <InventoryContext.Provider
      value={{
        items,
        loading,
        error,
        adjustStock,
        fetchLogs,
        checkStock,
        refreshInventory,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export function useInventory(): InventoryContextValue {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an <InventoryProvider /> component.');
  }
  return context;
}
