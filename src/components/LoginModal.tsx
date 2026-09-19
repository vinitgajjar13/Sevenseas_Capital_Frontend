import React, { useState } from 'react';
import { Lock, Mail, ShieldCheck, ArrowRight, X } from 'lucide-react';

export interface UserProfile {
  email: string;
  name: string;
  provider: 'email' | 'google' | 'demo';
  role: string;
  token?: string;
}

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  initialEmail?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialEmail = 'trader@sevenseascapital.in',
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('••••••••');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEmailPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password || password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      setIsLoading(false);
      const user: UserProfile = {
        email,
        name: email.split('@')[0].toUpperCase(),
        provider: 'email',
        role: 'Pro Trader (13y Exp)',
        token: `sevenseas-token-${Date.now()}`,
      };
      localStorage.setItem('quantradar_user', JSON.stringify(user));
      onLoginSuccess(user);
      if (onClose) onClose();
    }, 400);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      setIsLoading(false);
      const user: UserProfile = {
        email: 'karshalavinit1289@gmail.com',
        name: 'Vinit K. (Pro Trader)',
        provider: 'google',
        role: 'Pro Trader (13y Exp)',
        token: `sevenseas-google-${Date.now()}`,
      };
      localStorage.setItem('quantradar_user', JSON.stringify(user));
      onLoginSuccess(user);
      if (onClose) onClose();
    }, 400);
  };

  const handleQuickDemo = () => {
    const user: UserProfile = {
      email: 'lead.trader@sevenseascapital.in',
      name: 'Terminal Master',
      provider: 'demo',
      role: 'Senior Trader (13y Exp)',
      token: `sevenseas-demo-${Date.now()}`,
    };
    localStorage.setItem('quantradar_user', JSON.stringify(user));
    onLoginSuccess(user);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div
        id="login-dialog"
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 dark:bg-slate-950 text-white border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-mono text-xs font-bold tracking-wider uppercase text-slate-200">
              Sevenseas Capital Trading Terminal Login
            </span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
              aria-label="Close login dialog"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Sign in to Terminal</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Access real-time NSE/BSE market indices, sector participation, and pro stock setups.
            </p>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleEmailPasswordSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Trader Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="trader@domain.com"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-400 font-mono text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-400 font-mono text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In with Email'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider relative">
              OR
            </span>
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2.5 shadow-2xs cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Quick Trader Bypass */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Quick MVP Preview:</span>
            <button
              type="button"
              onClick={handleQuickDemo}
              className="text-slate-900 dark:text-slate-200 hover:text-slate-700 dark:hover:text-white font-semibold underline underline-offset-2 flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Instant Pro Login</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
