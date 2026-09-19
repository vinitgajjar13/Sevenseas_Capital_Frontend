import React, { useState, useMemo } from 'react';
import {
  History,
  Calendar,
  Filter,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Award,
  Shield,
  Search,
  Download,
  Clock,
  Sparkles,
} from 'lucide-react';
import { HistoricalRadarLog } from '../types';
import { HISTORICAL_RADAR_LOGS, formatINR, formatNumber } from '../data/mockData';

export const HistoricalRadarView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>('ALL');
  const [selectedOutcome, setSelectedOutcome] = useState<string>('ALL');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [searchSymbol, setSearchSymbol] = useState<string>('');

  const logs = HISTORICAL_RADAR_LOGS;

  const dates = useMemo(() => {
    const dSet = new Set(logs.map((l) => l.date));
    return ['ALL', ...Array.from(dSet)];
  }, [logs]);

  const sectors = useMemo(() => {
    const sSet = new Set(logs.map((l) => l.sector));
    return ['ALL', ...Array.from(sSet)];
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchDate = selectedDate === 'ALL' || log.date === selectedDate;
      const matchOutcome = selectedOutcome === 'ALL' || log.outcome === selectedOutcome;
      const matchSector = selectedSector === 'ALL' || log.sector === selectedSector;
      const matchSymbol =
        !searchSymbol || log.symbol.toLowerCase().includes(searchSymbol.toLowerCase());

      return matchDate && matchOutcome && matchSector && matchSymbol;
    });
  }, [logs, selectedDate, selectedOutcome, selectedSector, searchSymbol]);

  // Calculate historical statistics
  const totalTrades = logs.length;
  const winningTrades = logs.filter((l) => l.pnlPercent > 0).length;
  const winRate = ((winningTrades / (totalTrades || 1)) * 100).toFixed(1);
  const avgPnl = (logs.reduce((acc, l) => acc + l.pnlPercent, 0) / (totalTrades || 1)).toFixed(1);

  const getOutcomeBadge = (outcome: HistoricalRadarLog['outcome']) => {
    switch (outcome) {
      case 'TARGET_1_HIT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Target 1 Hit
          </span>
        );
      case 'TARGET_2_HIT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
            <Sparkles className="w-3 h-3 text-purple-600" />
            Target 2 Hit (Max)
          </span>
        );
      case 'TRAILING_SL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            Trailing SL Locked
          </span>
        );
      case 'SL_HIT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3 h-3 text-rose-600" />
            Stop Loss Hit
          </span>
        );
      case 'DAY_END_CLOSE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
            3:15 PM Square-off
          </span>
        );
    }
  };

  return (
    <div id="historical-radar-view" className="space-y-4">
      {/* Header Banner */}
      <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" />
                Historical Radar Log & Strategy Performance Audit
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                Archived Sessions
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Historical ledger of past 9:15 AM breakout detections, slot progressions, re-entry triggers, and verified trade outcomes.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Performance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Strategy Win Rate</span>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
            {winRate}%
          </div>
          <p className="text-[10px] text-slate-400 mt-1">{winningTrades} of {totalTrades} profitable</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Profit Factor</span>
          <div className="text-2xl font-bold font-mono text-indigo-600 mt-1">
            2.85x
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Gross Wins / Gross Losses</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Average Return / Setup</span>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
            +{avgPnl}%
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Weighted option contract gain</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Realized R:R Ratio</span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            1 : 2.15
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Target 1 vs SL delta</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Max System Drawdown</span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            -4.2%
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Strict per-trade cap</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Search Symbol */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search symbol..."
              value={searchSymbol}
              onChange={(e) => setSearchSymbol(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-medium text-slate-500 whitespace-nowrap">Date:</label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full py-1.5 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              {dates.map((d) => (
                <option key={d} value={d}>
                  {d === 'ALL' ? 'All Recorded Dates' : d}
                </option>
              ))}
            </select>
          </div>

          {/* Sector Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-medium text-slate-500 whitespace-nowrap">Sector:</label>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full py-1.5 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              {sectors.map((s) => (
                <option key={s} value={s}>
                  {s === 'ALL' ? 'All Sectors' : s}
                </option>
              ))}
            </select>
          </div>

          {/* Outcome Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-medium text-slate-500 whitespace-nowrap">Outcome:</label>
            <select
              value={selectedOutcome}
              onChange={(e) => setSelectedOutcome(e.target.value)}
              className="w-full py-1.5 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              <option value="ALL">All Outcomes</option>
              <option value="TARGET_1_HIT">Target 1 Hit</option>
              <option value="TARGET_2_HIT">Target 2 Hit</option>
              <option value="TRAILING_SL">Trailing SL</option>
              <option value="SL_HIT">Stop Loss Hit</option>
            </select>
          </div>
        </div>
      </div>

      {/* Historical Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-3.5">Date & Time</th>
                <th className="py-3 px-3.5">Symbol</th>
                <th className="py-3 px-3.5">Slot Level</th>
                <th className="py-3 px-3.5">Action</th>
                <th className="py-3 px-3.5 text-right">Entry (₹)</th>
                <th className="py-3 px-3.5 text-right">Exit (₹)</th>
                <th className="py-3 px-3.5 text-center">Outcome</th>
                <th className="py-3 px-3.5 text-right">Return %</th>
                <th className="py-3 px-3.5 text-right">Duration</th>
                <th className="py-3 px-3.5">Post-Trade Analyst Log</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => {
                const isGain = log.pnlPercent > 0;
                return (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="font-semibold text-slate-800">{log.date}</span>
                      <span className="block text-[10px] text-slate-400 font-mono">{log.time}</span>
                    </td>
                    <td className="py-3 px-3.5">
                      <span className="font-bold text-slate-900 text-sm">{log.symbol}</span>
                      <span className="block text-[10px] text-slate-400">{log.sector}</span>
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap text-slate-700 font-medium">
                      {log.slot}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap font-semibold">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] ${
                          log.action.includes('CALL')
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono text-slate-800">
                      {formatINR(log.entryPrice)}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono text-slate-800 font-bold">
                      {formatINR(log.exitPrice)}
                    </td>
                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      {getOutcomeBadge(log.outcome)}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold">
                      <span className={isGain ? 'text-emerald-600' : 'text-rose-600'}>
                        {isGain ? '+' : ''}
                        {log.pnlPercent.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono text-slate-500 whitespace-nowrap">
                      {log.duration}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 text-[11px] max-w-xs">
                      {log.analystComment}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
