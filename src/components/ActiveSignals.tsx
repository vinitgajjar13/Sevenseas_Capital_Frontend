import React from 'react';
import { Zap, ArrowUpRight, ArrowDownRight, Target, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { ActiveSignal, SignalStatus } from '../types';
import { formatINR } from '../data/mockData';

interface ActiveSignalsProps {
  signals: ActiveSignal[];
  onTakePaperTrade?: (signal: ActiveSignal) => void;
}

export const ActiveSignals: React.FC<ActiveSignalsProps> = ({
  signals,
  onTakePaperTrade,
}) => {
  const getStatusBadge = (status: SignalStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            ACTIVE
          </span>
        );
      case 'TRAILING SL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-2.5 h-2.5" />
            TRAILING SL
          </span>
        );
      case 'TARGET REACHED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-2.5 h-2.5" />
            TARGET HIT
          </span>
        );
      case 'TRIGGERED':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            TRIGGERED
          </span>
        );
    }
  };

  return (
    <section id="active-signals-section" className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-amber-50 text-amber-700 border border-amber-200">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Active Signals</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {signals.length} Options Signals
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              High-probability breakout setups with calculated 1:2 Risk-to-Reward strikes
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
          <span className="font-mono text-[11px] bg-slate-100 px-2 py-1 rounded">R:R Min 1:2</span>
        </div>
      </div>

      {/* Signals Table */}
      <div className="overflow-x-auto">
        <table id="table-active-signals" className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-2.5 px-3.5">Stock</th>
              <th className="py-2.5 px-3 text-center">Signal</th>
              <th className="py-2.5 px-3 text-center">Option</th>
              <th className="py-2.5 px-3 text-right">Strike</th>
              <th className="py-2.5 px-3 text-right">Entry (₹)</th>
              <th className="py-2.5 px-3 text-right">LTP (₹)</th>
              <th className="py-2.5 px-3 text-right">Stop Loss (₹)</th>
              <th className="py-2.5 px-3 text-right">Target (₹)</th>
              <th className="py-2.5 px-3 text-center">Status</th>
              <th className="py-2.5 px-3 text-right">Trigger Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {signals.map((sig) => {
              const isBullish = sig.signal === 'BULLISH';
              const pnlPoints = sig.currentPrice - sig.entry;
              const pnlPercent = (pnlPoints / sig.entry) * 100;
              const isProfitable = pnlPoints >= 0;

              return (
                <tr
                  key={sig.id}
                  id={`signal-row-${sig.stock}-${sig.strike}`}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  {/* Stock */}
                  <td className="py-3 px-3.5 font-medium text-slate-900">
                    <span className="font-bold text-slate-900 tracking-tight">{sig.stock}</span>
                    <span className="text-[10px] text-slate-400 block">{sig.companyName}</span>
                  </td>

                  {/* Signal */}
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                        isBullish
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {isBullish ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {sig.signal}
                    </span>
                  </td>

                  {/* Option Type */}
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                        sig.option === 'CE'
                          ? 'bg-emerald-100/70 text-emerald-800'
                          : 'bg-rose-100/70 text-rose-800'
                      }`}
                    >
                      {sig.option}
                    </span>
                  </td>

                  {/* Strike */}
                  <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-800">
                    {sig.strike}
                  </td>

                  {/* Entry */}
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                    ₹{sig.entry.toFixed(2)}
                  </td>

                  {/* Current LTP */}
                  <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                    <div>₹{sig.currentPrice.toFixed(2)}</div>
                    <span
                      className={`text-[10px] font-medium ${
                        isProfitable ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isProfitable ? '+' : ''}
                      {pnlPercent.toFixed(1)}%
                    </span>
                  </td>

                  {/* Stop Loss */}
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-rose-600 font-medium">
                    ₹{sig.stopLoss.toFixed(2)}
                  </td>

                  {/* Target */}
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-600 font-bold">
                    ₹{sig.target.toFixed(2)}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    {getStatusBadge(sig.status)}
                  </td>

                  {/* Trigger Time */}
                  <td className="py-3 px-3 text-right font-mono text-[11px] text-slate-500">
                    {sig.triggeredAt}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Example badge reference banner */}
      <div className="p-3 bg-slate-50/60 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Sample Signal:</span>
          <span className="font-mono text-slate-600">
            RELIANCE | BULLISH | CE | 3000 | ₹42.50 | SL: ₹32.00 | TGT: ₹65.00 | ACTIVE
          </span>
        </div>
        <span className="hidden md:inline text-slate-400 font-mono">1:2 R:R Guaranteed SL Guard</span>
      </div>
    </section>
  );
};
