import React, { useState } from 'react';
import {
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Sparkles,
  GraduationCap,
  AlertCircle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { ActiveSignal, SignalStatus, StockRadarItem } from '../../types';
import { MarketRadarResponse, MarketOverviewStock } from '../../services/backendApi';
import { formatINR } from '../../utils/formatters';

interface ActiveSignalsProps {
  signals: ActiveSignal[];
  onTakePaperTrade?: (signal: ActiveSignal) => void;
  marketRadar?: MarketRadarResponse | null;
  stocks?: StockRadarItem[];
}

export const ActiveSignals: React.FC<ActiveSignalsProps> = ({
  signals,
  onTakePaperTrade,
  marketRadar,
  stocks = [],
}) => {
  const [activeMode, setActiveMode] = useState<'strategy' | 'paper'>('strategy');

  // Collect live strategy signals from backend radar or stocksRadar
  const liveStrategyStocks: MarketOverviewStock[] = React.useMemo(() => {
    const list: MarketOverviewStock[] = [];
    const seen = new Set<string>();

    const addStock = (stk: MarketOverviewStock) => {
      if (!stk || !stk.symbol || seen.has(stk.symbol.toUpperCase())) return;
      seen.add(stk.symbol.toUpperCase());
      list.push(stk);
    };

    if (marketRadar) {
      marketRadar.teacher_guidance?.forEach(addStock);
      marketRadar.spike_dump_stocks?.forEach(addStock);
      marketRadar.watch_stocks?.forEach(addStock);
    }

    // Also include any stocks with active signals or teacher actions from live overview
    stocks.forEach((s) => {
      if (
        (s.teacherAction && s.teacherAction !== '-' && !s.teacherAction.includes('WAIT')) ||
        (s.signal && s.signal !== '-') ||
        s.bullishWatch ||
        s.bearishWatch
      ) {
        addStock({
          symbol: s.symbol,
          company_name: s.name,
          sector: s.sector,
          ltp: s.ltp,
          change: s.change,
          change_percent: s.changePercent,
          volume: s.volume,
          watch_status: s.watchStatus ?? null,
          bullish_watch: s.bullishWatch ?? false,
          bearish_watch: s.bearishWatch ?? false,
          signal: s.signal ?? null,
          action: s.teacherAction ?? null,
          strategy_state: s.strategyState ?? (s.marketClassification as any) ?? 'NEUTRAL',
          score: s.score,
          has_reference_data: s.hasReferenceData ?? true,
          pd_high: s.pdHigh ?? null,
          pd_low: s.pdLow ?? null,
          open_915: s.open915 ?? null,
          close_915: s.close915 ?? null,
        });
      }
    });

    return list;
  }, [marketRadar, stocks]);

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

  const getSignalExplanation = (stock: MarketOverviewStock) => {
    if (stock.has_reference_data === false) {
      return '⚠️ Missing previous-day reference levels (PD_HIGH / PD_LOW). Strategy engine requires verified baseline.';
    }
    const explanations: string[] = [];
    if (stock.signal && stock.signal.includes('SPIKE')) {
      explanations.push('🔥 SPIKE: Price broke above Previous Day High with surging momentum.');
    } else if (stock.signal && stock.signal.includes('DUMP')) {
      explanations.push('🚨 DUMP: Price broke below Previous Day Low with heavy distribution.');
    }

    if (stock.action) {
      if (stock.action.includes('BULL ALIGNED')) {
        explanations.push('🟢 BULL ALIGNED: Stock momentum aligns with positive sector breadth & advance volume.');
      } else if (stock.action.includes('BEAR ALIGNED')) {
        explanations.push('🔴 BEAR ALIGNED: Stock weakness aligns with negative sector pressure & distribution volume.');
      } else if (stock.action.includes('CONFLICT')) {
        explanations.push('⚠️ CONFLICT: Divergence between stock momentum and parent sector trend.');
      } else if (stock.action.includes('LOW VOLUME')) {
        explanations.push('🟠 LOW VOLUME: Participation volume below quantitative institutional threshold.');
      }
    }

    if (stock.watch_status) {
      explanations.push(`Watch candidate: ${stock.watch_status}`);
    }

    return explanations.length > 0
      ? explanations.join(' • ')
      : `Strategy State: ${stock.strategy_state || 'NEUTRAL'} • Score: ${stock.score ?? 50}/100`;
  };

  return (
    <section id="active-signals-section" className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
      {/* Header with Mode Switcher */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Market Strategy & Signals</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {activeMode === 'strategy' ? `${liveStrategyStocks.length} Live Candidates` : `${signals.length} Paper Trades`}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live Excel trading engine teacher actions, volume surge spikes, and breakout guidance
            </p>
          </div>
        </div>

        {/* View Switcher: Live Teacher vs Paper Sandbox */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveMode('strategy')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
              activeMode === 'strategy'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Live Strategy & Teacher</span>
          </button>
          <button
            onClick={() => setActiveMode('paper')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
              activeMode === 'paper'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>Simulated Paper Options</span>
          </button>
        </div>
      </div>

      {/* MODE 1: LIVE STRATEGY SIGNALS AND TEACHER ACTIONS */}
      {activeMode === 'strategy' && (
        <div className="space-y-0">
          <div className="p-3 bg-indigo-50/50 border-b border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
            <div className="flex items-center gap-2">
              <span className="font-bold">Live Strategy Feed:</span>
              <span>Signals, Teacher Actions, and Sector Alignments computed by the backend Excel engine</span>
            </div>
            <span className="text-[10px] font-mono text-indigo-700 bg-white/70 px-2 py-0.5 rounded border border-indigo-200">
              Auto-Refreshed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table id="table-live-strategy-signals" className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3.5">Stock</th>
                  <th className="py-2.5 px-3 text-center">Strategy State</th>
                  <th className="py-2.5 px-3 text-center">Watch / Signal</th>
                  <th className="py-2.5 px-3 text-center">Teacher Action</th>
                  <th className="py-2.5 px-3 text-right">LTP (₹)</th>
                  <th className="py-2.5 px-3 text-right">Change %</th>
                  <th className="py-2.5 px-3">Signal Explanation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {liveStrategyStocks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      <AlertCircle className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                      <p className="font-semibold text-sm text-slate-700">No active strategy signals triggered right now</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                        Signals and Teacher actions trigger when live market prices break verified reference levels (PD High / PD Low) with concordant sector volume.
                      </p>
                    </td>
                  </tr>
                ) : (
                  liveStrategyStocks.map((stock) => {
                    const isUp = (stock.change_percent ?? 0) >= 0;
                    const hasRef = stock.has_reference_data !== false;

                    return (
                      <tr key={stock.symbol} className="hover:bg-slate-50/80 transition-colors">
                        {/* Stock */}
                        <td className="py-3 px-3.5 font-medium text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 font-mono">{stock.symbol}</span>
                            {!hasRef && (
                              <span
                                className="px-1 py-0.2 rounded text-[8px] font-bold bg-amber-100 text-amber-800 border border-amber-300"
                                title="Missing previous day reference values"
                              >
                                NO REF
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block">{stock.sector || 'NSE'}</span>
                        </td>

                        {/* Strategy State */}
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              stock.strategy_state === 'BULLISH'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                                : stock.strategy_state === 'BEARISH'
                                ? 'bg-rose-50 text-rose-800 border border-rose-300'
                                : 'bg-slate-100 text-slate-700 border border-slate-300'
                            }`}
                          >
                            {stock.strategy_state === 'BULLISH' ? (
                              <TrendingUp className="w-2.5 h-2.5 text-emerald-600" />
                            ) : stock.strategy_state === 'BEARISH' ? (
                              <TrendingDown className="w-2.5 h-2.5 text-rose-600" />
                            ) : null}
                            {stock.strategy_state || 'NEUTRAL'}
                          </span>
                        </td>

                        {/* Watch / Signal */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <div className="flex flex-col items-center gap-1">
                            {stock.signal && stock.signal !== '-' && (
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-black font-mono shadow-2xs ${
                                  stock.signal.includes('SPIKE')
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                                    : 'bg-rose-100 text-rose-900 border border-rose-300 animate-pulse'
                                }`}
                              >
                                {stock.signal}
                              </span>
                            )}
                            {(stock.watch_status || stock.bullish_watch || stock.bearish_watch) && (
                              <span
                                className={`px-1.5 py-0.2 rounded text-[9px] font-bold font-mono ${
                                  stock.bullish_watch || (stock.watch_status && stock.watch_status.includes('🟢'))
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                                }`}
                              >
                                {stock.watch_status || (stock.bullish_watch ? '🟢 WATCH' : '🔴 WATCH')}
                              </span>
                            )}
                            {!stock.signal && !stock.watch_status && !stock.bullish_watch && !stock.bearish_watch && (
                              <span className="text-slate-400 font-mono text-[11px]">—</span>
                            )}
                          </div>
                        </td>

                        {/* Teacher Action */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {stock.action && stock.action !== '-' ? (
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black font-mono tracking-tight ${
                                stock.action.includes('BULL')
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : stock.action.includes('BEAR')
                                  ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                  : stock.action.includes('CONFLICT')
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-slate-100 text-slate-700 border border-slate-300'
                              }`}
                            >
                              {stock.action}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono text-[11px]">—</span>
                          )}
                        </td>

                        {/* LTP */}
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                          {stock.ltp != null && stock.ltp > 0 ? formatINR(stock.ltp) : '—'}
                        </td>

                        {/* Change % */}
                        <td className="py-3 px-3 text-right font-mono font-bold tabular-nums">
                          <span className={isUp ? 'text-emerald-600' : 'text-rose-600'}>
                            {isUp ? '+' : ''}
                            {(stock.change_percent ?? 0).toFixed(2)}%
                          </span>
                        </td>

                        {/* Signal Explanation */}
                        <td className="py-3 px-3 text-slate-600 text-[11px] max-w-xs">
                          {getSignalExplanation(stock)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODE 2: SIMULATED PAPER TRADING OPTIONS */}
      {activeMode === 'paper' && (
        <div className="space-y-0">
          {/* Explicit Paper Trading Warning Banner */}
          <div className="p-3 bg-amber-50/80 border-b border-amber-200 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>SIMULATION SANDBOX:</strong> These options strikes are simulated paper contracts for test-driving setups. They are not live broker orders.
              </span>
            </div>
            <span className="font-mono text-[11px] bg-amber-100 px-2 py-0.5 rounded border border-amber-300 text-amber-800">
              R:R Min 1:2 Guard
            </span>
          </div>

          {/* Signals Table */}
          <div className="overflow-x-auto">
            <table id="table-active-signals" className="w-full text-left border-collapse min-w-[800px]">
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
        </div>
      )}

      {/* Footer Info Banner */}
      <div className="p-3 bg-slate-50/60 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Strategy Architecture:</span>
          <span className="font-mono text-slate-600">
            Excel Formula Engine (9:15 Baseline, PD High/Low breakouts, Concordant Sector Breath)
          </span>
        </div>
        <span className="hidden md:inline text-slate-400 font-mono">Sevenseas Capital Quant Strategy</span>
      </div>
    </section>
  );
};
