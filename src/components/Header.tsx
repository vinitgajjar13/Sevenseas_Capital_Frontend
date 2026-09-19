import React, { useState, useEffect } from 'react';
import {
  Menu,
  Clock,
  User,
  Radio,
  Play,
  RefreshCw,
  Download,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import { TimePeriod, StockRadarItem } from '../types';
import { exportRadarToCSV } from '../data/mockData';
import { UserProfile } from './LoginModal';

interface HeaderProps {
  timePeriod: TimePeriod;
  setTimePeriod: (val: TimePeriod) => void;
  isSimulating: boolean;
  setIsSimulating: (val: boolean) => void;
  onRefreshData: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (val: boolean) => void;
  stocks: StockRadarItem[];
  currentUser?: UserProfile | null;
  onOpenLogin?: () => void;
  onLogout?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  timePeriod,
  setTimePeriod,
  isSimulating,
  setIsSimulating,
  onRefreshData,
  isMobileOpen,
  setIsMobileOpen,
  stocks,
  currentUser,
  onOpenLogin,
  onLogout,
  theme = 'light',
  onToggleTheme,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [countdown, setCountdown] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata',
      };

      try {
        setCurrentTime(new Intl.DateTimeFormat('en-IN', options).format(now));
      } catch {
        setCurrentTime(now.toLocaleTimeString());
      }

      // Calculate time remaining until 3:30 PM IST (Market Close)
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const targetTotalMinutes = 15 * 60 + 30; // 15:30 (3:30 PM)
      const currentTotalMinutes = currentHours * 60 + currentMinutes;

      let diffMinutes = targetTotalMinutes - currentTotalMinutes;
      if (diffMinutes < 0) diffMinutes += 24 * 60;

      const hoursRemaining = Math.floor(diffMinutes / 60);
      const minsRemaining = diffMinutes % 60;
      setCountdown(`${hoursRemaining.toString().padStart(2, '0')}h ${minsRemaining.toString().padStart(2, '0')}m`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      id="top-header"
      className="sticky top-0 z-30 flex items-center justify-between h-14 px-3 md:px-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-150"
    >
      {/* Left: Mobile Toggle & Market Status */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          id="btn-mobile-menu"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-1.5 -ml-1 text-slate-600 dark:text-slate-300 rounded-md lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Market Status Badge */}
        <div
          id="badge-market-status"
          className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs"
        >
          <span className="relative flex w-2 h-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full w-2 h-2 bg-emerald-500"></span>
          </span>
          <span className="tracking-tight font-mono">NSE Live Market</span>
        </div>
      </div>

      {/* Right: Actions, Clock, Theme, Simulation, User */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* CSV Export Button */}
        <button
          id="btn-export-csv"
          onClick={() => exportRadarToCSV(stocks)}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
          title="Export current stock radar to CSV"
        >
          <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span className="hidden lg:inline">CSV</span>
        </button>

        {/* Real-time Clock (IST) */}
        <div
          id="live-clock"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300"
          title="Indian Standard Time (IST)"
        >
          <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
            {currentTime || '09:45:00 AM'}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">IST</span>
        </div>

        {/* Square-off Countdown */}
        <div
          id="squareoff-timer"
          className="hidden 2xl:flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-medium"
          title="Time left until 03:15 PM auto square-off"
        >
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Cut-off:</span>
          <span className="font-mono tabular-nums font-bold text-xs">{countdown || '04h 15m'}</span>
        </div>

        {/* Theme Toggle Button (Light / Dark) */}
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shadow-2xs"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle color theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-200" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600 animate-in spin-in-90 duration-200" />
            )}
          </button>
        )}

        {/* Simulation Toggle */}
        <div className="flex items-center gap-0.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5">
          <button
            id="btn-toggle-simulation"
            onClick={() => setIsSimulating(!isSimulating)}
            className={`flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
              isSimulating
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700'
            }`}
            title={isSimulating ? 'Pause live market tick simulation' : 'Resume live market tick simulation'}
          >
            {isSimulating ? (
              <>
                <Radio className="w-3 h-3 animate-pulse" />
                <span className="hidden sm:inline">Live</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-slate-500" />
                <span className="hidden sm:inline">Paused</span>
              </>
            )}
          </button>

          <button
            id="btn-refresh-ticks"
            onClick={onRefreshData}
            className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Force refresh quotes"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* User Account / Profile */}
        <div id="user-profile-card" className="flex items-center gap-2 pl-1.5 sm:pl-2 border-l border-slate-200 dark:border-slate-800">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div
                className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold uppercase shadow-2xs cursor-pointer"
                title={currentUser.email}
                onClick={onOpenLogin}
              >
                {currentUser.name.slice(0, 2)}
              </div>
              <div className="hidden xl:block text-left">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {currentUser.role || 'Pro Trader'}
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              <User className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
