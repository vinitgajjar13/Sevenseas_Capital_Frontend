import React, { useEffect } from 'react';
import {
  X,
  TrendingUp,
  TrendingDown,
  Target,
  ShieldAlert,
  Wallet,
  ExternalLink,
  MessageSquare,
  Activity,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { SectorStockItem, StockRadarItem } from '../../types';
import { INITIAL_STOCKS_RADAR, formatINR, formatNumber } from '../../data/mockData';
import { LightweightCandlestickChart } from '../StockDetail/LightweightCandlestickChart';

interface StockDetailDrawerProps {
  stock: SectorStockItem | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateFull?: (stock: StockRadarItem) => void;
  theme?: 'light' | 'dark';
}

export const StockDetailDrawer: React.FC<StockDetailDrawerProps> = ({
  stock,
  isOpen,
  onClose,
  onNavigateFull,
  theme = 'light',
}) => {
  // ESC key listener to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !stock) return null;

const stockChangePct = stock.changePercent ?? stock.changePct ?? 0;
const isPositive = stockChangePct >= 0;

  // Convert SectorStockItem to StockRadarItem if user wants to open full detail view
  const handleOpenFull = () => {
    if (!onNavigateFull) return;
    const existing = INITIAL_STOCKS_RADAR.find((s) => s.symbol === stock.symbol);
    const radarItem: StockRadarItem = existing
      ? {
          ...existing,
          ltp: stock.ltp,
          change: stock.change,
          changePercent: stockChangePct,
          volume: stock.volume,
          target1: stock.target1,
          target2: stock.target2,
          target3: stock.target3,
          target4: stock.target4,
          stopLoss: stock.stopLoss,
          capital: stock.capital,
          tradingSignal: stock.tradingSignal,
          signalDirection: stock.signalDirection,
          entryPrice: stock.entryPrice,
          comment: stock.comment,
        }
      : {
          id: stock.symbol,
          symbol: stock.symbol,
          name: stock.name,
          sector: stock.sector,
          rank: 1,
          prevRank: 1,
          slot: 'Slot 1: Alpha Leader',
          status: stock.signalDirection.includes('Bull') ? 'BULL' : 'BEAR',
          action: stock.tradingSignal.includes('Buy')
            ? 'BUY CALL (CE)'
            : stock.tradingSignal.includes('Sell')
            ? 'BUY PUT (PE)'
            : 'HOLD / STAY',
          score: 85,
          ltp: stock.ltp,
          change: stock.change,
          changePercent: stockChangePct,
          open915: +(stock.ltp * 0.99).toFixed(2),
          high915: stock.high,
          low915: stock.low,
          prevHigh: stock.high,
          prevLow: stock.low,
          vwap: stock.vwap || stock.ltp,
          rvol: 1.8,
          rsi: 62,
          breakoutType: 'HIGH_BREAK',
          conditionMet: stock.comment || `${stock.tradingSignal} trigger on sector strength`,
          suggestedStrike: `${stock.tradingSignal} Spot / Options`,
          target1: stock.target1,
          target2: stock.target2,
          target3: stock.target3,
          target4: stock.target4,
          stopLoss: stock.stopLoss,
          pivot: +(stock.ltp * 0.995).toFixed(2),
          resistance1: stock.target1,
          support1: stock.stopLoss,
          confidenceScore: 84,
          chartData: [],
          analystNote: stock.comment || 'Quant sector-driven breakout setup',
          capital: stock.capital,
          tradingSignal: stock.tradingSignal,
          signalDirection: stock.signalDirection,
          entryPrice: stock.entryPrice,
          comment: stock.comment,
        };
    onNavigateFull(radarItem);
  };

  const getSignalBadge = () => {
    switch (stock.signalDirection) {
      case 'Bullish':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60';
      case 'Bearish':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  const getActionBadge = () => {
    switch (stock.tradingSignal) {
      case 'Buy':
      case 'Buy Call':
        return 'bg-emerald-600 text-white dark:bg-emerald-600';
      case 'Sell':
      case 'Buy Put':
        return 'bg-rose-600 text-white dark:bg-rose-600';
      default:
        return 'bg-slate-600 text-white dark:bg-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sliding Drawer Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="stock-drawer-title"
        className="relative w-full max-w-2xl md:max-w-3xl lg:max-w-4xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xl z-10 flex flex-col h-full border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300 overflow-hidden"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 backdrop-blur-xs flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 text-base">
              {stock.symbol.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="stock-drawer-title" className="text-lg sm:text-xl font-bold font-sans tracking-tight">
                  {stock.symbol}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-md font-semibold border bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                  {stock.sector}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-md font-semibold border ${getSignalBadge()}`}>
                  {stock.signalDirection}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-md font-bold shadow-2xs ${getActionBadge()}`}>
                  {stock.tradingSignal}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {stock.name} • NSE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateFull && (
              <button
                onClick={handleOpenFull}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-800/60 transition-colors cursor-pointer"
                title="Open comprehensive stock analysis page"
              >
                Full View
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              aria-label="Close details drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Key Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* LTP */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                LTP / Price
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg sm:text-xl font-bold font-mono">
                  {formatINR(stock.ltp)}
                </span>
              </div>
              <span
                className={`text-xs font-bold font-mono inline-flex items-center gap-0.5 mt-0.5 ${
                  isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stockChangePct.toFixed(2)}%)
              </span>
            </div>

            {/* Range */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Day Range
              </span>
              <div className="text-xs font-mono text-slate-700 dark:text-slate-300 space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Low:</span>
                  <span className="font-semibold">{formatINR(stock.low)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">High:</span>
                  <span className="font-semibold">{formatINR(stock.high)}</span>
                </div>
              </div>
            </div>

            {/* Volume */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Volume / VWAP
              </span>
              <div className="text-xs font-mono text-slate-700 dark:text-slate-300 space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Vol:</span>
                  <span className="font-semibold">{formatNumber(stock.volume)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">VWAP:</span>
                  <span className="font-semibold">{formatINR(stock.vwap ?? stock.ltp)}</span>
                </div>
              </div>
            </div>

            {/* Allocated Trading Capital */}
            <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60">
              <span className="text-[11px] font-medium text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Wallet className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                Allocated Capital
              </span>
              <div className="text-base sm:text-lg font-bold font-mono text-indigo-900 dark:text-indigo-200">
                {formatINR(stock.capital)}
              </div>
              <span className="text-[10px] text-indigo-600/80 dark:text-indigo-400/80 font-medium">
                Trader Position Size
              </span>
            </div>
          </div>

          {/* Interactive Lightweight Candlestick Chart */}
          <div className="p-4 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Candlestick Chart & Technical Indicators
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Lightweight Charts v5
              </span>
            </div>

            <LightweightCandlestickChart
              stockSymbol={stock.symbol}
              stockName={stock.name}
              basePrice={stock.ltp}
              theme={theme}
            />
          </div>

          {/* Quant Strategy & Trading Targets Setup */}
          <div className="p-4 sm:p-5 bg-slate-50/80 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Quantitative Strategy & Target Breakdown
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Entry:</span>
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                  {formatINR(stock.entryPrice)}
                </span>
              </div>
            </div>

            {/* Target 1 - 4 & Stop Loss Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans block">Target 1</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {formatINR(stock.target1)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans block">Target 2</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {formatINR(stock.target2)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans block">Target 3</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-300 text-sm">
                  {formatINR(stock.target3)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans block">
                  Target 4 (Trailing)
                </span>
                <span className="font-bold text-emerald-800 dark:text-emerald-200 text-sm">
                  {formatINR(stock.target4)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60">
                <span className="text-[10px] text-rose-500 dark:text-rose-400 font-sans block">Stop Loss</span>
                <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">
                  {formatINR(stock.stopLoss)}
                </span>
              </div>
            </div>

            {/* Commentary / Analysis Box */}
            {stock.comment && (
              <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                  Algorithm & Sector Scope Commentary
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                  {stock.comment}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>

          {onNavigateFull && (
            <button
              onClick={handleOpenFull}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors cursor-pointer"
            >
              Open Full Analysis & Strategy
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
