import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { CartItemInput, ValidatedCartItem, CartValidationResult } from '../types';

export interface CartContextValue {
  items: ValidatedCartItem[];
  subtotalPkr: number;
  totalCount: number;
  isValid: boolean;
  warnings: string[];
  drawerOpen: boolean;
  loading: boolean;
  setDrawerOpen: (open: boolean) => void;
  addItem: (variantId: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => void;
  validateCart: (rawItems?: CartItemInput[]) => Promise<CartValidationResult | null>;
}

const STORAGE_KEY = 'pakistani_cart_v1';

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ValidatedCartItem[]>([]);
  const [subtotalPkr, setSubtotalPkr] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isValid, setIsValid] = useState<boolean>(true);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const saveToStorage = (rawList: CartItemInput[]) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rawList));
      }
    } catch {
      // Ignore storage write errors
    }
  };

  const readFromStorage = (): CartItemInput[] => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as CartItemInput[];
          if (Array.isArray(parsed)) {
            return parsed;
          }
        }
      }
    } catch {
      // Ignore storage read errors
    }
    return [];
  };

  const validateCart = async (rawItems?: CartItemInput[]): Promise<CartValidationResult | null> => {
    setLoading(true);
    const target =
      rawItems ??
      items.map((i) => ({
        variantId: i.variantId,
        quantity: i.verifiedQuantity,
      }));

    try {
      const res = await fetch('/api/v1/cart/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: target }),
      });

      if (res.ok) {
        const json = (await res.json()) as {
          success?: boolean;
          data?: CartValidationResult;
        };
        if (json?.success && json.data) {
          setItems(json.data.items);
          setSubtotalPkr(json.data.subtotalPkr);
          setTotalCount(json.data.totalCount);
          setIsValid(json.data.isValid);
          setWarnings(json.data.warnings);

          saveToStorage(
            json.data.items
              .filter((i) => i.verifiedQuantity > 0)
              .map((i) => ({ variantId: i.variantId, quantity: i.verifiedQuantity }))
          );

          return json.data;
        }
      }
    } catch {
      // Offline fallback
    } finally {
      setLoading(false);
    }
    return null;
  };

  useEffect(() => {
    const initialRaw = readFromStorage();
    if (initialRaw.length > 0) {
      void validateCart(initialRaw);
    } else {
      setLoading(false);
    }
  }, []);

  const addItem = async (variantId: string, quantity = 1): Promise<boolean> => {
    const currentRaw = items
      .filter((i) => i.verifiedQuantity > 0)
      .map((i) => ({ variantId: i.variantId, quantity: i.verifiedQuantity }));
    const existingIndex = currentRaw.findIndex((i) => i.variantId === variantId);

    if (existingIndex >= 0) {
      currentRaw[existingIndex]!.quantity += quantity;
    } else {
      currentRaw.push({ variantId, quantity });
    }

    const res = await validateCart(currentRaw);
    setDrawerOpen(true);
    return Boolean(res);
  };

  const updateQuantity = async (variantId: string, quantity: number): Promise<void> => {
    if (quantity <= 0) {
      await removeItem(variantId);
      return;
    }

    const currentRaw = items
      .filter((i) => i.verifiedQuantity > 0)
      .map((i) => ({ variantId: i.variantId, quantity: i.verifiedQuantity }));
    const existingIndex = currentRaw.findIndex((i) => i.variantId === variantId);

    if (existingIndex >= 0) {
      currentRaw[existingIndex]!.quantity = quantity;
      await validateCart(currentRaw);
    }
  };

  const removeItem = async (variantId: string): Promise<void> => {
    const nextRaw = items
      .filter((i) => i.variantId !== variantId && i.verifiedQuantity > 0)
      .map((i) => ({ variantId: i.variantId, quantity: i.verifiedQuantity }));
    await validateCart(nextRaw);
  };

  const clearCart = () => {
    setItems([]);
    setSubtotalPkr(0);
    setTotalCount(0);
    setIsValid(true);
    setWarnings([]);
    saveToStorage([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        subtotalPkr,
        totalCount,
        isValid,
        warnings,
        drawerOpen,
        loading,
        setDrawerOpen,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        validateCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a <CartProvider /> component.');
  }
  return context;
}
