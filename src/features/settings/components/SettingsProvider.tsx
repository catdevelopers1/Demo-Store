import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type StoreSettings, DEFAULT_STORE_SETTINGS } from '../types';
import type { UpdateSettingsInput } from '../validation';

export interface SettingsContextValue {
  settings: StoreSettings;
  loading: boolean;
  error: string | null;
  updateSettings: (newSettings: UpdateSettingsInput) => Promise<boolean>;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to apply dynamic CSS variables to root
  const applyDesignTokens = (config: StoreSettings) => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--brand-primary-hex', config.primaryColorHex);
      root.style.setProperty('--brand-secondary-hex', config.secondaryColorHex);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/v1/settings');
      if (res.ok) {
        const json = (await res.json()) as { success?: boolean; data?: StoreSettings };
        if (json?.success && json.data) {
          setSettings(json.data);
          applyDesignTokens(json.data);
        }
      }
    } catch {
      // Keep default fallback settings if offline or fetch fails
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSettings();
  }, []);

  const updateSettings = async (newSettings: UpdateSettingsInput): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      });

      const json = (await res.json()) as {
        success?: boolean;
        error?: { message?: string };
        data?: StoreSettings;
      };

      if (!res.ok || !json.success) {
        setError(json?.error?.message ?? 'Failed to update store settings.');
        setLoading(false);
        return false;
      }

      if (json.data) {
        setSettings(json.data);
        applyDesignTokens(json.data);
      }
      setLoading(false);
      return true;
    } catch {
      setError('A network error occurred while updating settings.');
      setLoading(false);
      return false;
    }
  };

  const refreshSettings = async (): Promise<void> => {
    setLoading(true);
    await fetchSettings();
  };

  return (
    <SettingsContext.Provider
      value={{ settings, loading, error, updateSettings, refreshSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a <SettingsProvider /> component.');
  }
  return context;
}
