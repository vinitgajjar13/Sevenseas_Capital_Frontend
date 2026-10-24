import React, { useState } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  X,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { authenticateUser, resetUserPassword, AuthUser } from '../../services/authService';

export type UserProfile = AuthUser;

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  initialUsername?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialUsername = 'Sevenseas',
}) => {
  const [viewMode, setViewMode] = useState<'login' | 'forgot'>('login');
  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState('Sevenseas@1211');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot password state
  const [resetUsername, setResetUsername] = useState('Sevenseas');
  const [recoveryCode, setRecoveryCode] = useState('7777');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter your username.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await authenticateUser(username, password);
    setIsLoading(false);

    if (result.success && result.user) {
      onLoginSuccess(result.user);
      if (onClose) onClose();
    } else {
      setError(result.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);

    if (!resetUsername.trim()) {
      setResetError('Username is required.');
      return;
    }
    if (!recoveryCode.trim()) {
      setResetError('Security Recovery Code is required.');
      return;
    }
    if (newPassword.length < 6) {
      setResetError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('New password and Confirm password do not match.');
      return;
    }

    setIsResetting(true);
    const res = await resetUserPassword(resetUsername, recoveryCode, newPassword);
    setIsResetting(false);

    if (res.success) {
      setResetSuccess(res.message);
      setUsername(resetUsername);
      setPassword(newPassword);
      setTimeout(() => {
        setViewMode('login');
        setResetSuccess(null);
      }, 1500);
    } else {
      setResetError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div
        id="login-dialog"
        className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden font-display"
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950 text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-xs tracking-wider uppercase text-slate-200">
              SEVENSEAS TRADING TERMINAL LOGIN
            </span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close login dialog"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="p-6">
          {viewMode === 'login' ? (
            <div>
              <div className="mb-5">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Sign In to Terminal
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 font-sans">
                  Institutional access for Indian market radar & quant systems
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="font-sans">{error}</span>
                </div>
              )}

              {resetSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="font-sans">{resetSuccess}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Username */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Enter User Name
                  </label>
                  <div className="relative rounded-xl border border-slate-700 bg-slate-950/80 focus-within:border-indigo-500">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Sevenseas"
                      className="w-full pl-10 pr-3 py-2.5 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-hidden font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Password with Eye Toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setViewMode('forgot')}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative rounded-xl border border-slate-700 bg-slate-950/80 focus-within:border-indigo-500">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Sevenseas@1211"
                      className="w-full pl-10 pr-10 py-2.5 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-hidden font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Security strip */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-sans pt-1">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>256-Bit Encrypted Session</span>
                  </span>
                  <span className="text-slate-500">ISO 27001 Protocol</span>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In with Credentials</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800 mb-4">
                <button
                  type="button"
                  onClick={() => setViewMode('login')}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Reset Terminal Password
                  </h2>
                  <p className="text-xs text-slate-400 font-sans">
                    Update database credentials
                  </p>
                </div>
              </div>

              {resetError && (
                <div className="mb-3 p-2.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs">
                  {resetError}
                </div>
              )}

              <form onSubmit={handleResetSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={resetUsername}
                    onChange={(e) => setResetUsername(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Security Code / PIN
                    </label>
                    <span className="text-[10px] text-indigo-400">PIN: 7777</span>
                  </div>
                  <input
                    type="text"
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value)}
                    placeholder="7777"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-hidden font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full px-3 pr-9 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-hidden"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-200"
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-hidden"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isResetting}
                  className="w-full mt-2 py-2.5 px-3 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Update Password in Database</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
