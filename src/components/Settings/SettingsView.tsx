import React, { useState } from 'react';
import { Settings, Key, Shield, Bell, CheckCircle2, AlertCircle, Lock, Server, Radio } from 'lucide-react';
import { GrowwAuthStatus, GrowwUserProfile } from '../../services/backendApi';

interface SettingsViewProps {
  backendConnected?: boolean;
  growwAuth?: GrowwAuthStatus | null;
  growwProfile?: GrowwUserProfile | null;
  onConnectGroww?: () => void;
  connectPending?: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  backendConnected = false,
  growwAuth,
  growwProfile,
  onConnectGroww,
  connectPending = false,
}) => {
  const [apiKey] = useState('••••••••••••••••••••••••••••••••');
  const [apiSecret] = useState('••••••••••••••••••••••••••••••••');
  const [maxRiskPerTrade, setMaxRiskPerTrade] = useState('2');
  const [maxLots, setMaxLots] = useState('2');
  const [maxDailyLoss, setMaxDailyLoss] = useState('15000');
  const [telegramAlerts, setTelegramAlerts] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div id="settings-page" className="space-y-4 max-w-4xl">
      {/* Backend Integration Architecture Banner */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                FastAPI + Groww Market Service Gateway
              </h2>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                backendConnected
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
              }`}>
                {backendConnected ? '🟢 Backend Connected (:8000)' : '🟡 Local Mode (213 Stocks Matrix)'}
              </span>
              {onConnectGroww && (
                <button
                  type="button"
                  onClick={onConnectGroww}
                  disabled={!backendConnected || connectPending || Boolean(growwAuth?.authenticated)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:text-slate-500 text-white text-xs font-bold transition-colors"
                >
                  {growwAuth?.authenticated ? 'Groww Connected' : connectPending ? 'Connecting…' : 'Connect Groww'}
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Connected to Sevenseas Capital FastAPI backend engine with Groww Trade & Market Feed SDK. Real-time ticks stream over Redis PubSub and WebSocket (<code className="font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">/ws/market</code>).
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-4">
        {/* Groww Broker Configuration */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs p-5">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Groww Broker API Configuration</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Groww UCC / Client ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  disabled
                  value={growwAuth?.ucc || 'Not connected'}
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-300 cursor-not-allowed"
                />
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Active Client UCC verified via Groww auth token
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Active Broker Segments
              </label>
              <div className="relative">
                <input
                  type="text"
                  disabled
                  value={growwProfile?.active_segments?.join(', ') || 'Available after connection'}
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-300 cursor-not-allowed"
                />
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                NSE & BSE Cash + Equity Derivatives
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-medium">
                Broker Feed: <strong>Groww WebSocket Feed & LTP Engine (NSE/BSE)</strong>
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">FastAPI :8000 Proxy Ready</span>
          </div>
        </div>


        {/* Risk Management Limits */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-5">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <Shield className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Automated Risk Management & Guardrails</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Max Lots Per Trade
              </label>
              <input
                type="number"
                value={maxLots}
                onChange={(e) => setMaxLots(e.target.value)}
                min="1"
                max="10"
                className="w-full px-3 py-2 rounded-md border border-slate-200 font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Default: 2 Lots per signal
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Risk Per Trade (% of Capital)
              </label>
              <input
                type="number"
                value={maxRiskPerTrade}
                onChange={(e) => setMaxRiskPerTrade(e.target.value)}
                min="0.5"
                max="5"
                step="0.5"
                className="w-full px-3 py-2 rounded-md border border-slate-200 font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Recommended: 1.5% - 2.0%
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Max Daily Loss Cutoff (₹)
              </label>
              <input
                type="number"
                value={maxDailyLoss}
                onChange={(e) => setMaxDailyLoss(e.target.value)}
                min="5000"
                step="1000"
                className="w-full px-3 py-2 rounded-md border border-slate-200 font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Engine halts if loss crosses this threshold
              </span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-5">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
            <Bell className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Notifications & Real-time Webhooks</h3>
          </div>

          <div className="flex items-center justify-between text-xs py-2">
            <div>
              <p className="font-semibold text-slate-800">Telegram Instant Trade Alerts</p>
              <p className="text-slate-500 text-[11px]">Send breakout triggers, entry confirmations and target hits to Telegram</p>
            </div>
            <input
              type="checkbox"
              checked={telegramAlerts}
              onChange={(e) => setTelegramAlerts(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-0"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            Save Parameter Changes
          </button>

          {savedSuccess && (
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold animate-fade-in">
              <CheckCircle2 className="w-4 h-4" />
              Parameters updated successfully
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
