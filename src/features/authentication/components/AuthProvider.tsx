import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { UserProfile } from '../types';
import type { LoginInput, RegisterInput } from '../validation';

export interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginInput) => Promise<boolean>;
  register: (data: RegisterInput) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Check active session on initial mount
  useEffect(() => {
    let isMounted = true;
    async function checkSession() {
      try {
        const res = await fetch('/api/v1/auth/session', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (res.ok) {
          const json = (await res.json()) as {
            success?: boolean;
            data?: { user?: UserProfile };
          };
          if (isMounted && json?.success && json?.data?.user) {
            setUser(json.data.user);
          }
        }
      } catch {
        // Ignore network errors on session check
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    void checkSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials: LoginInput): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const json = (await res.json()) as {
        success?: boolean;
        error?: { message?: string };
        data?: UserProfile;
      };
      if (!res.ok || !json.success) {
        setError(json?.error?.message ?? 'Login failed. Please verify your credentials.');
        setLoading(false);
        return false;
      }

      if (json.data) {
        setUser(json.data);
      }
      setLoading(false);
      return true;
    } catch {
      setError('A network error occurred while logging in.');
      setLoading(false);
      return false;
    }
  };

  const register = async (data: RegisterInput): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = (await res.json()) as {
        success?: boolean;
        error?: { message?: string };
        data?: UserProfile;
      };
      if (!res.ok || !json.success) {
        setError(json?.error?.message ?? 'Registration failed.');
        setLoading(false);
        return false;
      }

      if (json.data) {
        setUser(json.data);
      }
      setLoading(false);
      return true;
    } catch {
      setError('A network error occurred while registering your account.');
      setLoading(false);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an <AuthProvider /> component.');
  }
  return context;
}
