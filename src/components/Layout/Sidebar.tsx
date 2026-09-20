import React from 'react';
import {
  LayoutDashboard,
  Layers,
  Target,
  Briefcase,
  Settings,
  Activity,
  X,
  LogOut,
  User,
  BookOpen,
} from 'lucide-react';
import { NavTab } from '../../types';
import { formatINR } from '../../utils/formatters';
import { UserProfile } from './LoginModal';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  openPositionsCount: number;
  totalUnrealizedPnl: number;
  activeSignalsCount: number;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  currentUser?: UserProfile | null;
  onOpenLogin?: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  openPositionsCount,
  totalUnrealizedPnl,
  activeSignalsCount,
  isMobileOpen,
  setIsMobileOpen,
  currentUser,
  onOpenLogin,
  onLogout,
}) => {
  const navItems: {
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'sector-radar',
      label: 'Sectors',
      icon: Layers,
      badge: 'Radar',
      badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
    },
    {
      id: 'stock-radar',
      label: 'Stocks Matrix',
      icon: Target,
      badge: '14 Stks',
      badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800',
    },
    {
      id: 'positions',
      label: 'Watchlist & Trades',
      icon: Briefcase,
      badge: openPositionsCount > 0 ? `${openPositionsCount} Open` : undefined,
      badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
    },
    {
      id: 'paper-trading',
      label: 'Paper Simulator',
      icon: BookOpen,
      badge: 'Sim',
      badgeColor: 'bg-amber-50 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
    },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          id="mobile-backdrop"
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        id="main-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col w-60 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-slate-900 dark:bg-indigo-600 text-white shadow-xs">
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-bold text-slate-900 dark:text-slate-100 tracking-tight text-sm font-mono">
                  Sevenseas
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  Capital
                </span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                Pro Trader Terminal
              </p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Navigation Items */}
        <div className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Terminal Flow
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                      isActive ? 'bg-slate-800 dark:bg-indigo-700 text-slate-300' : item.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Account / Auth Status Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-2">
          {currentUser ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <div className="w-6 h-6 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center text-[10px] font-bold uppercase">
                    {currentUser.name.slice(0, 2)}
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-slate-900 dark:text-slate-100 truncate leading-tight text-[11px]">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</div>
                  </div>
                </div>

                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800/80 font-mono">
                <span>Unrealized P&L:</span>
                <span
                  className={`font-bold ${
                    totalUnrealizedPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {formatINR(totalUnrealizedPnl)}
                </span>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="w-full py-2 px-3 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <User className="w-3.5 h-3.5" />
              <span>Trader Sign In</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
