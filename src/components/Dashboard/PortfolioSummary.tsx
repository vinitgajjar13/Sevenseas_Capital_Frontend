import React from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  ChevronRight,
  Briefcase,
  History,
} from 'lucide-react';
import { formatINR } from '../../data/mockData';
import { MOCK_PORTFOLIO_SUMMARY, MOCK_RECENT_TRADES } from '../../data/mock/portfolio';

interface PortfolioSummaryProps {
  onNavigateToPositions?: () => void;
  onNavigateToPaperTrading?: () => void;
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  onNavigateToPositions,
  onNavigateToPaperTrading,
}) => {
  const p = MOCK_PORTFOLIO_SUMMARY;
  const isDayUp = p.dayPnl >= 0;
  const isOverallUp = p.overallPnl >= 0;

  return (
    <section id="portfolio-summary-section" aria-label="Trader Portfolio Summary" className="w-full">
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
        {/* Header with Title and Quick Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
                <Wallet className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-slate-50 font-mono">
                Trading Portfolio & Execution
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Live Margin
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Account balance, day P&L, available margin, and recent paper trades
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToPositions && (
              <button
                type="button"
                onClick={onNavigateToPositions}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                <span>Open Trades ({p.openPositionsCount})</span>
              </button>
            )}

            {onNavigateToPaperTrading && (
              <button
                type="button"
                onClick={onNavigateToPaperTrading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors cursor-pointer shadow-2xs"
              >
                <span>Terminal Simulator</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 4 Metric Cards in 1 Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Total Portfolio Value */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
              Portfolio Value
            </span>
            <div className="mt-2">
              <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-slate-50 tabular-nums">
                {formatINR(p.totalValue)}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Equity & Derivatives Book
              </div>
            </div>
          </div>

          {/* Card 2: Day P&L */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
              Day P&L
            </span>
            <div className="mt-2">
              <div
                className={`text-xl sm:text-2xl font-black font-mono tabular-nums flex items-baseline gap-1 ${
                  isDayUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                <span>{isDayUp ? '+' : ''}{formatINR(p.dayPnl)}</span>
              </div>
              <div
                className={`text-[11px] font-bold font-mono mt-0.5 flex items-center gap-0.5 ${
                  isDayUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {isDayUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                <span>
                  {isDayUp ? '+' : ''}{p.dayPnlPercent.toFixed(2)}% Today
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Available Margin */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
              Available Margin
            </span>
            <div className="mt-2">
              <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-slate-50 tabular-nums">
                {formatINR(p.availableMargin)}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span>Used: {formatINR(p.usedMargin)}</span>
              </div>
            </div>
          </div>

          {/* Card 4: Overall Unrealized P&L */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
              Overall Realized P&L
            </span>
            <div className="mt-2">
              <div
                className={`text-xl sm:text-2xl font-black font-mono tabular-nums ${
                  isOverallUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {isOverallUp ? '+' : ''}{formatINR(p.overallPnl)}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                Win Rate: <strong className="text-slate-700 dark:text-slate-300">{p.winRate}%</strong> (Past 30 Sessions)
              </div>
            </div>
          </div>
        </div>

        {/* Recent Closed Execution Stream */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              Recent Trade Executions
            </span>
            <span className="text-[10px] lowercase font-normal">FIFO book matching</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {MOCK_RECENT_TRADES.map((trade) => {
              const isProfit = trade.netPnl >= 0;
              return (
                <div
                  key={trade.id}
                  className="p-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/70 text-xs font-mono flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 text-xs leading-none">
                      {trade.instrument}
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                      {trade.entryTime} → {trade.exitTime}
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`font-bold tabular-nums ${
                        isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isProfit ? '+' : ''}{formatINR(trade.netPnl)}
                    </div>
                    <span className="text-[9px] px-1 py-0.2 rounded font-sans font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {trade.exitReason === 'TARGET_HIT' ? 'Target' : 'SL'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

