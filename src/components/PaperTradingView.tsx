import React, { useState } from 'react';
import {
  Briefcase,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  XCircle,
  Shield,
  RotateCcw,
  Sparkles,
  PlusCircle,
  History,
  AlertTriangle,
  Wallet,
  Info,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { PositionItem, TradeHistoryItem, StockRadarItem } from '../types';
import { formatINR } from '../data/mockData';

interface PaperTradingViewProps {
  positions: PositionItem[];
  tradeHistory: TradeHistoryItem[];
  stocks: StockRadarItem[];
  virtualBalance: number;
  onSquareOff: (positionId: string) => void;
  onSquareOffAll: () => void;
  onSimulateTrade: (stock: StockRadarItem) => void;
  onResetPaperAccount: () => void;
}

export const PaperTradingView: React.FC<PaperTradingViewProps> = ({
  positions,
  tradeHistory,
  stocks,
  virtualBalance,
  onSquareOff,
  onSquareOffAll,
  onSimulateTrade,
  onResetPaperAccount,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'positions' | 'history'>('positions');
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string>(stocks[0]?.symbol || '');
  const [customTradeType, setCustomTradeType] = useState<'CE' | 'PE'>('CE');
  const [customLots, setCustomLots] = useState<number>(2);
  const [showOrderModal, setShowOrderModal] = useState<boolean>(false);

  // Financial calculations
  const totalUnrealizedPnl = positions.reduce((acc, pos) => acc + pos.pnl, 0);
  const marginDeployed = positions.reduce((acc, pos) => acc + pos.entryPrice * pos.quantity, 0);
  const availableMargin = Math.max(0, virtualBalance - marginDeployed);
  const totalNetPortfolioValue = virtualBalance + totalUnrealizedPnl;

  const totalRealizedPnl = tradeHistory.reduce((acc, t) => acc + t.netPnl, 0);
  const winningTrades = tradeHistory.filter((t) => t.netPnl > 0).length;
  const winRate = tradeHistory.length > 0 ? (winningTrades / tradeHistory.length) * 100 : 0;

  const handleQuickExecute = (e: React.FormEvent) => {
    e.preventDefault();
    const stock = stocks.find((s) => s.symbol === selectedStockSymbol);
    if (!stock) return;

    onSimulateTrade(stock);
    setShowOrderModal(false);
  };

  return (
    <div id="paper-trading-view" className="space-y-4 animate-in fade-in duration-150">
      {/* SIMULATION MANDATORY BANNER */}
      <div
        id="simulation-watermark-banner"
        className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-amber-900"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500 text-white shrink-0 font-bold font-mono text-[10px] tracking-wider uppercase">
            SIM
          </div>
          <div>
            <div className="font-bold tracking-tight text-amber-950 flex items-center gap-1.5">
              <span>Simulation Environment & Virtual Paper Trading Terminal</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200/60 font-semibold text-amber-800">
                Sandbox Mode
              </span>
            </div>
            <p className="text-[11px] text-amber-800/90 mt-0.5">
              Quotes and fills are strictly virtual for risk-free strategy validation. Real brokerage accounts and financial capital are completely untouched.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-reset-virtual-account"
            onClick={onResetPaperAccount}
            className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Reset virtual balance back to ₹10,00,000 baseline"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Balance</span>
          </button>

          <button
            id="btn-open-paper-order"
            onClick={() => setShowOrderModal(true)}
            className="px-3 py-1.5 text-[11px] font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>New Paper Order</span>
          </button>
        </div>
      </div>

      {/* VIRTUAL ACCOUNT BALANCE & MARGIN STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Virtual Portfolio Equity */}
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Virtual Portfolio Value
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {formatINR(totalNetPortfolioValue)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1 font-mono">
            <span>Base: {formatINR(virtualBalance)}</span>
          </div>
        </div>

        {/* Card 2: Live Unrealized P&L */}
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Live Unrealized P&L
          </span>
          <div
            className={`text-xl font-bold font-mono mt-1 tabular-nums ${
              totalUnrealizedPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {totalUnrealizedPnl >= 0 ? '+' : ''}
            {formatINR(totalUnrealizedPnl)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1 font-mono">
            <span>{positions.length} Active Positions</span>
          </div>
        </div>

        {/* Card 3: Available Virtual Margin */}
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Available Virtual Margin
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {formatINR(availableMargin)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1 font-mono">
            <span>Deployed: {formatINR(marginDeployed)}</span>
          </div>
        </div>

        {/* Card 4: Booked Realized P&L & Win Rate */}
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Closed Realized P&L
          </span>
          <div
            className={`text-xl font-bold font-mono mt-1 tabular-nums ${
              totalRealizedPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {totalRealizedPnl >= 0 ? '+' : ''}
            {formatINR(totalRealizedPnl)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1 font-mono">
            <span>Win Rate: {winRate.toFixed(1)}% ({tradeHistory.length} trades)</span>
          </div>
        </div>
      </div>

      {/* VIEW SUB-NAVIGATION (OPEN POSITIONS vs TRADE HISTORY) */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 pt-2 rounded-t-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('positions')}
            className={`pb-2.5 px-3 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
              activeSubTab === 'positions'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Open Positions ({positions.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('history')}
            className={`pb-2.5 px-3 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
              activeSubTab === 'history'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Simulated Trade History ({tradeHistory.length})</span>
          </button>
        </div>

        {activeSubTab === 'positions' && positions.length > 0 && (
          <button
            id="btn-square-off-all-sim"
            onClick={onSquareOffAll}
            className="mb-2 px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Square Off All</span>
          </button>
        )}
      </div>

      {/* SUB-VIEW 1: OPEN POSITIONS */}
      {activeSubTab === 'positions' && (
        <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 shadow-2xs overflow-hidden">
          {positions.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-sm text-slate-700">No Open Paper Positions</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Execute a simulated paper trade from any stock radar or using the button above to test strategies in real-time.
              </p>
              <button
                onClick={() => setShowOrderModal(true)}
                className="mt-4 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Place First Simulated Trade</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Instrument</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3 text-right">Qty</th>
                    <th className="py-2.5 px-3 text-right">Avg Entry</th>
                    <th className="py-2.5 px-3 text-right">LTP / Current</th>
                    <th className="py-2.5 px-3 text-right">Target</th>
                    <th className="py-2.5 px-3 text-right">Stop Loss</th>
                    <th className="py-2.5 px-3 text-right">Unrealized P&L</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {positions.map((pos) => {
                    const isProfit = pos.pnl >= 0;
                    return (
                      <tr key={pos.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span>{pos.instrument}</span>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              SIM
                            </span>
                          </div>
                          <span className="text-[10px] font-normal text-slate-400 block mt-0.5">
                            Entered at {pos.entryTime}
                          </span>
                        </td>

                        <td className="py-2.5 px-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold font-mono ${
                              pos.optionType === 'CE'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                                : 'bg-rose-50 text-rose-800 border border-rose-300'
                            }`}
                          >
                            BUY {pos.optionType}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono text-slate-800 tabular-nums">
                          {pos.quantity}
                          <span className="text-[10px] text-slate-400 block">({pos.lots} lots)</span>
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono text-slate-700 tabular-nums">
                          ₹{pos.entryPrice.toFixed(2)}
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                          ₹{pos.currentPrice.toFixed(2)}
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono text-emerald-700 tabular-nums">
                          ₹{pos.target.toFixed(2)}
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono text-rose-700 tabular-nums">
                          ₹{pos.stopLoss.toFixed(2)}
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums">
                          <span className={isProfit ? 'text-emerald-600' : 'text-rose-600'}>
                            {isProfit ? '+' : ''}
                            {formatINR(pos.pnl)}
                          </span>
                          <span
                            className={`text-[10px] block ${
                              isProfit ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            ({isProfit ? '+' : ''}
                            {pos.pnlPercent.toFixed(2)}%)
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => onSquareOff(pos.id)}
                            className="px-2 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors cursor-pointer"
                            title="Close simulation position at current market price"
                          >
                            Exit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 2: SIMULATED TRADE HISTORY */}
      {activeSubTab === 'history' && (
        <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 shadow-2xs overflow-hidden">
          {tradeHistory.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-sm text-slate-700">No Simulation Trade Logs</p>
              <p className="text-xs text-slate-400 mt-1">
                Completed paper trades will automatically be logged here with exit prices and realized P&L.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Instrument</th>
                    <th className="py-2.5 px-3">Signal</th>
                    <th className="py-2.5 px-3 text-right">Qty</th>
                    <th className="py-2.5 px-3 text-right">Entry Price</th>
                    <th className="py-2.5 px-3 text-right">Exit Price</th>
                    <th className="py-2.5 px-3 text-right">Realized P&L</th>
                    <th className="py-2.5 px-3 text-center">Exit Reason</th>
                    <th className="py-2.5 px-3 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tradeHistory.map((trade) => {
                    const isProfit = trade.netPnl >= 0;
                    return (
                      <tr key={trade.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          {trade.instrument}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                              trade.signal === 'BULLISH'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                                : 'bg-rose-50 text-rose-800 border border-rose-300'
                            }`}
                          >
                            {trade.signal}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700 tabular-nums">
                          {trade.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700 tabular-nums">
                          ₹{trade.entryPrice.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                          ₹{trade.exitPrice.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums">
                          <span className={isProfit ? 'text-emerald-600' : 'text-rose-600'}>
                            {isProfit ? '+' : ''}
                            {formatINR(trade.netPnl)}
                          </span>
                          <span
                            className={`text-[10px] block ${
                              isProfit ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            ({isProfit ? '+' : ''}
                            {trade.pnlPercent.toFixed(2)}%)
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {trade.exitReason.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-[11px] text-slate-500 font-mono">
                          {trade.exitTime}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* QUICK PAPER ORDER MODAL */}
      {showOrderModal && (
        <div
          id="paper-order-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-slate-900 text-white">
                  <PlusCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Execute Paper Order</h3>
                  <span className="text-[10px] font-mono text-amber-700 font-semibold bg-amber-50 px-1 rounded">
                    100% Simulation Mode
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowOrderModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickExecute} className="space-y-3.5 text-xs">
              {/* Select Stock */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Select Underlying Stock
                </label>
                <select
                  value={selectedStockSymbol}
                  onChange={(e) => setSelectedStockSymbol(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold"
                >
                  {stocks.map((s) => (
                    <option key={s.symbol} value={s.symbol}>
                      {s.symbol} — {formatINR(s.ltp)} ({s.changePercent >= 0 ? '+' : ''}
                      {s.changePercent.toFixed(2)}%)
                    </option>
                  ))}
                </select>
              </div>

              {/* CE vs PE */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Option Contract Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomTradeType('CE')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                      customTradeType === 'CE'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>BUY CALL (CE)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomTradeType('PE')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                      customTradeType === 'PE'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>BUY PUT (PE)</span>
                  </button>
                </div>
              </div>

              {/* Order Info summary */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1 text-slate-600 text-[11px] font-mono">
                <div className="flex justify-between">
                  <span>Product Type:</span>
                  <span className="font-bold text-slate-900">MIS (Intraday Bracket)</span>
                </div>
                <div className="flex justify-between">
                  <span>Target Ratio:</span>
                  <span className="font-bold text-emerald-600">+35%</span>
                </div>
                <div className="flex justify-between">
                  <span>Stop Loss:</span>
                  <span className="font-bold text-rose-600">-20%</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  Execute Simulation Fill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
