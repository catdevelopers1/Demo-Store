import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { ShieldCheck, Lock, Mail } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const { login, error, loading, clearError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setFormError(null);

    if (!email || !password) {
      setFormError('Please enter both your email address and password.');
      return;
    }

    const success = await login({ email, password });
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
      <div className="text-center mb-6">
        <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
          Pakistani COD Account
        </span>
        <h1 className="text-2xl font-bold text-stone-900 mt-2">Sign in to your Account</h1>
        <p className="text-xs text-stone-500 mt-1">
          Access your order tracking (#PK), saved addresses, and COD checkout.
        </p>
      </div>

      {(error || formError) && (
        <div
          role="alert"
          className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl"
        >
          {error ?? formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-stone-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
              <Mail className="w-4 h-4" />
            </span>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@domain.pk"
              className="w-full pl-9 pr-4 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-semibold text-stone-700 mb-1">
            Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
              <Lock className="w-4 h-4" />
            </span>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-4 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-800 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
      </form>

      <div className="mt-6 pt-6 border-t border-stone-100 text-center space-y-3">
        <p className="text-xs text-stone-600">
          Don&apos;t have an account yet?{' '}
          <Link to="/register" className="text-emerald-800 font-semibold hover:underline">
            Register Account
          </Link>
        </p>
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Protected by Cloudflare Turnstile Bot Defense</span>
        </div>
      </div>
    </div>
  );
};
