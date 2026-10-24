import React, { useState } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { authenticateUser, resetUserPassword, AuthUser } from '../../services/authService';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
  defaultUsername?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  defaultUsername = 'Sevenseas',
}) => {
  // Mode: 'login' | 'forgot'
  const [viewMode, setViewMode] = useState<'login' | 'forgot'>('login');

  // Login form state
  const [username, setUsername] = useState(defaultUsername);
  const [password, setPassword] = useState('Sevenseas@1211');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot password form state
  const [resetUsername, setResetUsername] = useState('Sevenseas');
  const [recoveryCode, setRecoveryCode] = useState('7777');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [resetErrorMessage, setResetErrorMessage] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim()) {
      setErrorMessage('Please enter your username.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await authenticateUser(username, password);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setErrorMessage(result.error || 'Authentication failed. Please check credentials.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Password Reset submission
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetErrorMessage(null);
    setResetSuccessMessage(null);

    if (!resetUsername.trim()) {
      setResetErrorMessage('Username is required.');
      return;
    }
    if (!recoveryCode.trim()) {
      setResetErrorMessage('Security Recovery Code is required.');
      return;
    }
    if (newPassword.length < 6) {
      setResetErrorMessage('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetErrorMessage('New password and Confirm password do not match.');
      return;
    }

    setIsResetting(true);

    try {
      const res = await resetUserPassword(resetUsername, recoveryCode, newPassword);
      if (res.success) {
        setResetSuccessMessage(res.message);
        // Pre-fill login with updated password
        setUsername(resetUsername);
        setPassword(newPassword);
        setTimeout(() => {
          setViewMode('login');
          setResetSuccessMessage(null);
        }, 1800);
      } else {
        setResetErrorMessage(res.message);
      }
    } catch {
      setResetErrorMessage('Failed to update password. Please check your recovery code.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fbfe] text-slate-800 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden font-display select-none">
      {/* Background Trading Market Wave & Candlestick Graphics */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {/* Soft Ambient Radial Lighting */}
        <div className="absolute -top-32 -left-32 w-[38rem] h-[38rem] rounded-full bg-blue-100/50 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[42rem] h-[42rem] rounded-full bg-sky-100/60 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-[30rem] h-[30rem] rounded-full bg-indigo-50/50 blur-3xl" />

        {/* Dot Matrix Decorative Accents */}
        <div
          className="absolute top-10 left-10 w-36 h-36 opacity-35"
          style={{
            backgroundImage: 'radial-gradient(#94a3b8 1.5px, transparent 1.5px)',
            backgroundSize: '16px 16px',
          }}
        />
        <div
          className="absolute bottom-10 right-10 w-36 h-36 opacity-35"
          style={{
            backgroundImage: 'radial-gradient(#94a3b8 1.5px, transparent 1.5px)',
            backgroundSize: '16px 16px',
          }}
        />

        {/* Subtle Candlesticks & Wave Curves SVG */}
        <svg
          className="absolute inset-0 w-full h-full opacity-65"
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="candleUp" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#bfdbfe" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#dbeafe" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#eff6ff" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Left Chart Candlesticks */}
          <g opacity="0.65">
            {/* Candlestick 1 */}
            <line x1="100" y1="420" x2="100" y2="580" stroke="#93c5fd" strokeWidth="2" />
            <rect x="91" y="450" width="18" height="90" rx="3" fill="url(#candleUp)" />

            {/* Candlestick 2 */}
            <line x1="140" y1="390" x2="140" y2="550" stroke="#93c5fd" strokeWidth="2" />
            <rect x="131" y="420" width="18" height="100" rx="3" fill="url(#candleUp)" />

            {/* Candlestick 3 */}
            <line x1="180" y1="440" x2="180" y2="600" stroke="#93c5fd" strokeWidth="2" />
            <rect x="171" y="470" width="18" height="95" rx="3" fill="url(#candleUp)" />

            {/* Candlestick 4 */}
            <line x1="220" y1="410" x2="220" y2="570" stroke="#93c5fd" strokeWidth="2" />
            <rect x="211" y="430" width="18" height="110" rx="3" fill="url(#candleUp)" />

            {/* Candlestick 5 */}
            <line x1="260" y1="480" x2="260" y2="640" stroke="#93c5fd" strokeWidth="2" />
            <rect x="251" y="500" width="18" height="105" rx="3" fill="url(#candleUp)" />
          </g>

          {/* Right Rising Chart Candlesticks */}
          <g opacity="0.75">
            <line x1="1120" y1="310" x2="1120" y2="470" stroke="#93c5fd" strokeWidth="2" />
            <rect x="1111" y="340" width="18" height="90" rx="3" fill="url(#candleUp)" />

            <line x1="1160" y1="270" x2="1160" y2="430" stroke="#93c5fd" strokeWidth="2" />
            <rect x="1151" y="300" width="18" height="100" rx="3" fill="url(#candleUp)" />

            <line x1="1200" y1="220" x2="1200" y2="390" stroke="#93c5fd" strokeWidth="2" />
            <rect x="1191" y="250" width="18" height="110" rx="3" fill="url(#candleUp)" />

            <line x1="1240" y1="180" x2="1240" y2="340" stroke="#93c5fd" strokeWidth="2" />
            <rect x="1231" y="210" width="18" height="100" rx="3" fill="url(#candleUp)" />

            <line x1="1280" y1="210" x2="1280" y2="370" stroke="#93c5fd" strokeWidth="2" />
            <rect x="1271" y="240" width="18" height="95" rx="3" fill="url(#candleUp)" />

            <line x1="1320" y1="140" x2="1320" y2="310" stroke="#93c5fd" strokeWidth="2" />
            <rect x="1311" y="170" width="18" height="115" rx="3" fill="url(#candleUp)" />

            <line x1="1360" y1="100" x2="1360" y2="270" stroke="#93c5fd" strokeWidth="2" />
            <rect x="1351" y="130" width="18" height="110" rx="3" fill="url(#candleUp)" />
          </g>

          {/* Smooth Sweeping Trendline */}
          <path
            d="M 0 560 Q 250 510 500 580 T 950 520 T 1320 370 T 1440 280"
            stroke="url(#waveGrad)"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M 0 560 Q 250 510 500 580 T 950 520 T 1320 370 T 1440 280 L 1440 900 L 0 900 Z"
            fill="url(#areaFill)"
          />

          {/* Glowing Data Point Nodes */}
          <circle cx="1320" cy="370" r="5" fill="#3b82f6" />
          <circle cx="1320" cy="370" r="11" stroke="#93c5fd" strokeWidth="1.5" fill="none" opacity="0.6" />
        </svg>
      </div>

      {/* Main Container */}
      <div className="relative w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-display">
            Sevenseas <span className="text-blue-600">Capital</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-medium font-sans">
            Institutional Quantitative Trader Terminal
          </p>
        </div>

        {/* Card Box (Clean Crisp White with Soft Ambient Shadow) */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_20px_60px_-15px_rgba(37,99,235,0.12),0_4px_20px_-2px_rgba(15,23,42,0.04)] overflow-hidden p-7 sm:p-8">
          {viewMode === 'login' ? (
            /* --- LOGIN VIEW --- */
            <div>
              <div className="flex items-start justify-between pb-5 border-b border-slate-100 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight font-display">
                    Trader Sign In
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 font-sans">
                    Enter your verified terminal credentials
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-sans">{errorMessage}</span>
                </div>
              )}

              {/* Reset Success Notification */}
              {resetSuccessMessage && (
                <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-sans">{resetSuccessMessage}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Username Input */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    USER NAME
                  </label>
                  <div className="relative rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus-within:bg-white focus-within:border-blue-500 focus-within:ring-3 focus-within:ring-blue-500/15 transition-all">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Sevenseas"
                      autoComplete="username"
                      className="w-full pl-10 pr-4 py-2.5 bg-transparent text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-hidden"
                      required
                    />
                  </div>
                </div>

                {/* Password Input with Eye Toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      PASSWORD
                    </label>
                    <button
                      type="button"
                      onClick={() => setViewMode('forgot')}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus-within:bg-white focus-within:border-blue-500 focus-within:ring-3 focus-within:ring-blue-500/15 transition-all">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      autoComplete="current-password"
                      className="w-full pl-10 pr-11 py-2.5 bg-transparent text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-hidden"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-hidden cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Security Status Strip */}
                <div className="pt-1 flex items-center justify-between text-xs text-slate-500 font-sans">
                  <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>256-Bit SHA Encryption</span>
                  </span>
                  <span className="text-slate-400 text-xs font-medium">Auto brute-force guard</span>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Terminal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* --- FORGOT PASSWORD VIEW --- */
            <div>
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('login');
                    setResetErrorMessage(null);
                  }}
                  className="p-1.5 -ml-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Back to login"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight font-display">
                    Reset Terminal Password
                  </h2>
                  <p className="text-xs text-slate-500 font-sans">
                    Update your database password securely
                  </p>
                </div>
              </div>

              {resetErrorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-sans">{resetErrorMessage}</span>
                </div>
              )}

              <form onSubmit={handleResetSubmit} className="space-y-3.5">
                {/* Username */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    USER NAME
                  </label>
                  <div className="relative rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus-within:bg-white focus-within:border-blue-500">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={resetUsername}
                      onChange={(e) => setResetUsername(e.target.value)}
                      placeholder="Sevenseas"
                      className="w-full pl-9 pr-3 py-2 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Security Recovery Code */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      SECURITY RECOVERY CODE
                    </label>
                    <span className="text-[10px] text-blue-600 font-semibold">PIN: 7777</span>
                  </div>
                  <div className="relative rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus-within:bg-white focus-within:border-blue-500">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={recoveryCode}
                      onChange={(e) => setRecoveryCode(e.target.value)}
                      placeholder="Enter recovery code (e.g. 7777)"
                      className="w-full pl-9 pr-3 py-2 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden font-mono"
                      required
                    />
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    NEW PASSWORD
                  </label>
                  <div className="relative rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus-within:bg-white focus-within:border-blue-500">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min. 6 chars)"
                      className="w-full pl-9 pr-10 py-2 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    CONFIRM NEW PASSWORD
                  </label>
                  <div className="relative rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus-within:bg-white focus-within:border-blue-500">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full pl-9 pr-3 py-2 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Submit Reset Button */}
                <button
                  type="submit"
                  disabled={isResetting}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isResetting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Updating Database...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Update Password in Database</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('login')}
                  className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-700 pt-1 cursor-pointer"
                >
                  Cancel and return to sign in
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer info matching design */}
        <div className="text-center mt-7 text-xs text-slate-500 font-sans space-y-1">
          <p className="text-slate-500">Institutional Trading Environment &copy; Sevenseas Capital</p>
          <div className="flex items-center justify-center gap-2.5 text-[11px] text-slate-400 font-medium">
            <span>NSE / BSE Segment</span>
            <span>•</span>
            <span>Groww Gateway</span>
            <span>•</span>
            <span>ISO 27001 Security Standard</span>
          </div>
        </div>
      </div>
    </div>
  );
};
