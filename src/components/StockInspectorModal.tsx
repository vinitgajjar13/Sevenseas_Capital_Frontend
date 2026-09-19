import React from 'react';
import {
  X,
  TrendingUp,
  TrendingDown,
  Target,
  Sparkles,
  BarChart2,
  CheckCircle2,
  ExternalLink,
  Shield,
  Layers,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { StockRadarItem } from '../types';
import { formatINR, formatNumber } from '../data/mockData';

interface StockInspectorModalProps {
  stock: StockRadarItem | null;
  onClose: () => void;
  onNavigateToForecast: (symbol: string) => void;
  onSimulateTrade?: (stock: StockRadarItem) => void;
}

export const StockInspectorModal: React.FC<StockInspectorModalProps> = ({
  stock,
  onClose,
  onNavigateToForecast,
  onSimulateTrade,
}) => {
  if (!stock) return null;

  const isUp = stock.changePercent >= 0;
  const isAboveVwap = stock.ltp >= stock.vwap;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div
        id="stock-inspector-modal"
        className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl border border-slate-200 shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{stock.symbol}</h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                  {stock.sector}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                  {stock.slot}
                </span>
              </div>
              <p className="text-xs text-slate-500">{stock.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onNavigateToForecast(stock.symbol);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Forecast Model</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              aria-label="Close inspector"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Price Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-[11px] font-medium text-slate-500">Last Traded Price</span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                {formatINR(stock.ltp)}
              </div>
              <div
                className={`text-xs font-semibold font-mono flex items-center gap-0.5 mt-0.5 ${
                  isUp ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isUp ? '+' : ''}
                {stock.change.toFixed(2)} ({isUp ? '+' : ''}
                {stock.changePercent.toFixed(2)}%)
              </div>
            </div>

            <div>
              <span className="text-[11px] font-medium text-slate-500">Day VWAP & Delta</span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                {formatINR(stock.vwap)}
              </div>
              <span className={`text-xs font-medium ${isAboveVwap ? 'text-emerald-600' : 'text-rose-500'}`}>
                {isAboveVwap ? '+ Above VWAP' : '- Below VWAP'}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-medium text-slate-500">9:15 AM High / Low</span>
              <div className="text-sm font-bold font-mono text-slate-800 mt-1">
                H: {formatNumber(stock.high915)}
              </div>
              <div className="text-sm font-bold font-mono text-slate-500">
                L: {formatNumber(stock.low915)}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-medium text-slate-500">Quant & Momentum</span>
              <div className="text-xl font-bold font-mono text-indigo-600 mt-0.5">
                {stock.score} / 100
              </div>
              <span className="text-xs font-medium text-slate-600">
                RVol: {stock.rvol.toFixed(1)}x • RSI: {stock.rsi.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Intraday Chart with VWAP */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-slate-700" />
                <h3 className="font-bold text-slate-900 text-sm">Intraday 5-Min Price Action & VWAP</h3>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span> Price
                </span>
                <span className="flex items-center gap-1 text-indigo-600 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> VWAP
                </span>
              </div>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stock.chartData} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorStockPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f172a" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                  <YAxis domain={['auto', 'auto']} stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip
                    formatter={(val: any) => [`₹${Number(val).toFixed(2)}`, '']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '0.5rem',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    name="LTP"
                    stroke="#0f172a"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorStockPrice)"
                  />
                  <Area
                    type="monotone"
                    dataKey="vwap"
                    name="VWAP"
                    stroke="#6366f1"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    fillOpacity={0}
                  />
                  <ReferenceLine y={stock.high915} stroke="#10b981" strokeDasharray="3 3" label={{ value: '9:15 High', fill: '#10b981', fontSize: 10 }} />
                  <ReferenceLine y={stock.low915} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: '9:15 Low', fill: '#f43f5e', fontSize: 10 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Strategy Details & Suggested Option Strike */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strategy Trigger Breakdown */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Trigger Condition Log
              </h4>
              <p className="text-xs text-slate-700 font-medium leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                {stock.conditionMet}
              </p>
              {stock.reEntryReason && (
                <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 text-xs">
                  <span className="font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-teal-600" />
                    Re-entry Note:
                  </span>
                  <p className="mt-0.5">{stock.reEntryReason}</p>
                </div>
              )}
              <div className="pt-2 text-[11px] text-slate-500">
                <p><span className="font-semibold text-slate-700">Analyst Comment:</span> {stock.analystNote}</p>
              </div>
            </div>

            {/* Target, Stop & Option Contract */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-600" />
                Calculated Targets & Suggested Contract
              </h4>

              <div className="space-y-1.5 text-xs bg-white p-3 rounded-lg border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">Target 1:</span>
                  <span className="font-mono font-bold text-emerald-600">{formatINR(stock.target1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target 2:</span>
                  <span className="font-mono font-bold text-emerald-700">{formatINR(stock.target2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Stop Loss:</span>
                  <span className="font-mono font-bold text-rose-600">{formatINR(stock.stopLoss)}</span>
                </div>
                <div className="pt-1.5 border-t border-slate-100 flex justify-between font-semibold">
                  <span className="text-slate-700">Suggested Contract:</span>
                  <span className="font-mono text-indigo-600 font-bold">{stock.suggestedStrike || 'Spot MIS'}</span>
                </div>
              </div>

              {onSimulateTrade && (
                <button
                  onClick={() => {
                    onSimulateTrade(stock);
                    onClose();
                  }}
                  className="w-full py-2 px-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
                >
                  Simulate Paper Trade Entry ({stock.action})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
