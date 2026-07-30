import React, { type ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { ShieldAlert, Loader2 } from 'lucide-react';

export const AdminGuard: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-stone-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2 text-emerald-800" />
        <span className="text-sm">Verifying administrative access...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white border border-stone-200 rounded-2xl text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-stone-900">403 — Forbidden Access</h2>
        <p className="text-xs text-stone-600 mt-2 leading-relaxed">
          Your account ({user.email}) does not have Administrator role permissions to view the Store Admin Dashboard.
        </p>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
};

export const CustomerGuard: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-stone-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2 text-emerald-800" />
        <span className="text-sm">Verifying customer session...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
