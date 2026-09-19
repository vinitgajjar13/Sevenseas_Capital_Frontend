import React from 'react';
import {
  Sliders,
  ShieldCheck,
  CheckSquare,
  Target,
  Zap,
  Clock,
  FileSpreadsheet,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Info,
} from 'lucide-react';
import { STRATEGY_PARAMETERS } from '../data/mockData';

export const StrategyView: React.FC = () => {
  const slotDefinitions = [
    {
      slot: 'Slot 1: Alpha Leader',
      score: '90 - 100',
      description: 'Top momentum performers. Stock rank #1-3 in sector rank #1-2. Highest institutional volume surge (>2.0x).',
      action: 'Aggressive Call Buy (CE) on 9:15 AM High break.',
      color: 'bg-purple-50 border-purple-200 text-purple-900',
    },
    {
      slot: 'Slot 2: Breakout Momentum',
      score: '80 - 89',
      description: 'Clean breakouts exceeding previous day high and 9:15 high with positive VWAP delta.',
      action: 'Standard Call Buy (CE) with Target 1 and Target 2 brackets.',
      color: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    },
    {
      slot: 'Slot 3: Trend Follower',
      score: '65 - 79',
      description: 'Consistent higher lows. Trading comfortably above rising 20 EMA and VWAP.',
      action: 'Hold / Stay in position; trail stop loss to breakeven.',
      color: 'bg-blue-50 border-blue-200 text-blue-900',
    },
    {
      slot: 'Slot 4: Mean-Reversion',
      score: '70 - 85 (on Re-entry)',
      description: 'Stock experienced early morning shakeout/pullback to VWAP/20 EMA support, then confirmed buyer absorption.',
      action: 'Re-entry Call Buy (CE) with tight stop loss below pullback low.',
      color: 'bg-teal-50 border-teal-200 text-teal-900',
    },
    {
      slot: 'Slot 5: Weak / Distribution',
      score: '< 40',
      description: 'Breached 9:15 AM Low and previous day low. Trapped below descending VWAP with lagging sector rank.',
      action: 'Put Buy (PE) or strict Avoid for longs.',
      color: 'bg-rose-50 border-rose-200 text-rose-900',
    },
  ];

  const sheetFormulas = [
    {
      sheetField: 'BULLISH / BEARISH Status',
      algorithmLogic: 'IF(LTP > High_915 AND LTP > VWAP AND RVol > 1.5 AND Sector_Rank <= 3, "BULL", IF(LTP < Low_915 AND LTP < VWAP, "BEAR", "CONSOLIDATING"))',
      purpose: 'Core directional engine matching the client spreadsheet formula.',
    },
    {
      sheetField: 'Slot Assignment (1 - 5)',
      algorithmLogic: 'Rank-based quantile categorization weighting Sector Strength (30%), Volume Multiplier (25%), and VWAP Spread (25%).',
      purpose: 'Groups 50 NSE stocks into clean executable momentum buckets.',
    },
    {
      sheetField: 'Re-entry / Stay Condition',
      algorithmLogic: 'IF(Prev_Status == "BULL" AND Price_Tested_VWAP AND Current_Price > VWAP AND Green_5m_Candle, "RE-ENTRY", "STAY")',
      purpose: 'Captures high-probability second-wave entries after the opening rush.',
    },
    {
      sheetField: 'Target 1 & Target 2 Math',
      algorithmLogic: 'Target_1 = Entry + (1.5 * ATR_14); Target_2 = Entry + (2.5 * ATR_14); Stop_Loss = Min(Low_915, Entry - ATR_14)',
      purpose: 'Ensures minimum 1 : 2.0 Risk-to-Reward ratio on every execution.',
    },
  ];

  return (
    <div id="strategy-page" className="space-y-4">
      {/* Overview Card */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-900 text-white">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Spreadsheet Model Logic & Strategy Specifications
              </h2>
              <p className="text-xs text-slate-500">
                Automated quantitative implementation of the client's NSE Excel/Google Sheet matrix.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono self-start sm:self-auto">
            Version 2.4 Quant Model
          </span>
        </div>
      </div>

      {/* 5-Slot Architecture Cards */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-600" />
          <h3 className="font-bold text-slate-900 text-sm">
            The 5 Slot Matrix Architecture (Spreadsheet Classification)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {slotDefinitions.map((slotItem, idx) => (
            <div key={idx} className={`p-3.5 rounded-xl border ${slotItem.color} space-y-1.5`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">{slotItem.slot}</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/80">
                  Score: {slotItem.score}
                </span>
              </div>
              <p className="text-xs opacity-90 leading-relaxed">{slotItem.description}</p>
              <div className="pt-1.5 border-t border-black/10 text-[11px] font-semibold">
                <span>Action: {slotItem.action}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Spreadsheet Formula Mapping */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/70">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-600" />
            Direct Excel / Sheet Formula Translation Matrix
          </h3>
        </div>

        <div className="p-5 space-y-3">
          {sheetFormulas.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">{item.sheetField}</span>
                <span className="text-[11px] text-slate-500">{item.purpose}</span>
              </div>
              <div className="p-2 bg-white rounded border border-slate-200 font-mono text-[11px] text-slate-800 break-all">
                {item.algorithmLogic}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Execution Lifecycle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Risk Rules */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Configured Risk Management Guardrails
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="font-semibold text-slate-700">Opening Benchmark:</span>
              <span className="font-mono text-slate-900">{STRATEGY_PARAMETERS.breakoutCandle}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="font-semibold text-slate-700">Volume Surge Threshold:</span>
              <span className="font-mono text-slate-900">&gt; {STRATEGY_PARAMETERS.volumeMultiplierThreshold}x 20-Day Avg</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="font-semibold text-slate-700">Minimum Quant Score (Buy):</span>
              <span className="font-mono text-emerald-600 font-bold">&gt; {STRATEGY_PARAMETERS.minQuantScoreForBuy} / 100</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="font-semibold text-slate-700">Maximum Open Positions:</span>
              <span className="font-mono text-slate-900">{STRATEGY_PARAMETERS.maxOpenPositions} Concurrent Trades</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="font-semibold text-slate-700">Hard Cut-off Square Off:</span>
              <span className="font-mono text-rose-600 font-bold">{STRATEGY_PARAMETERS.squareOffTime}</span>
            </div>
          </div>
        </div>

        {/* Intraday Time Steps */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            Intraday Session Phases (09:15 AM to 03:30 PM)
          </h3>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 block">Phase 1 (09:15 - 09:30 AM): Baseline Capture</span>
              Calculates opening 5-min candle boundaries and assigns preliminary Slots 1 to 5.
            </div>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 block">Phase 2 (09:30 - 11:30 AM): Breakout Momentum</span>
              Triggers CE/PE option bracket orders on high volume candle crosses with sector alignment.
            </div>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 block">Phase 3 (11:30 AM - 01:30 PM): Re-entry / Stay Tracking</span>
              Monitors VWAP pullbacks for low-risk re-entries and moves trailing stop losses to breakeven.
            </div>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 block">Phase 4 (03:15 PM): Mandatory Auto Square-Off</span>
              Closes all open MIS positions and writes logs to the Historical Radar database.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
