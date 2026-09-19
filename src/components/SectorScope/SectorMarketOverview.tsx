import React from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Compass,
} from 'lucide-react';
import { MarketIndex, MarketBreadthExtended, SectorDirectionType } from '../../types';
import { formatNumber } from '../../data/mockData';

interface SectorMarketOverviewProps {
  indices: {
    nifty50: MarketIndex;
    bankNifty: MarketIndex;
    sensex: MarketIndex;
  };
  breadth: MarketBreadthExtended;
}

export const SectorMarketOverview: React.FC<SectorMarketOverviewProps> = ({
  indices,
  breadth,
}) => {
  const indexList = [indices.nifty50, indices.bankNifty, indices.sensex];

  const getStatusBadge = (status: string = 'Market Open') => {
    switch (status) {
      case 'Market Open':
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span className="relative flex w-1.5 h-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-emerald-500"></span>
            </span>
            <span>Market Open</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            <span>Market Closed</span>
          </span>
        );
    }
  };

  const getDirectionBadge = (dir: SectorDirectionType) => {
    switch (dir) {
      case 'Strong Bullish':
      case 'Bullish':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{dir}</span>
          </span>
        );
      case 'Strong Bearish':
      case 'Bearish':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <TrendingDown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>{dir}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Compass className="w-3.5 h-3.5 text-slate-500" />
            <span>Neutral Bias</span>
          </span>
        );
    }
  };

  return (
    <section id="sector-market-overview" aria-label="Top Market Overview" className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {/* Index Cards: NIFTY 50, BANK NIFTY, SENSEX */}
        {indexList.map((idx) => {
          const isUp = idx.change >= 0;
          const daySpan = idx.high - idx.low || 1;
          const dayProgress = Math.min(100, Math.max(5, ((idx.value - idx.low) / daySpan) * 100));

          const week52High = idx.week52High || idx.high * 1.05;
          const week52Low = idx.week52Low || idx.low * 0.88;

          return (
            <div
              key={idx.symbol}
              className="flex flex-col justify-between p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-all"
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <Activity className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold font-mono tracking-tight text-slate-900 dark:text-slate-100 leading-none">
                      {idx.name}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      {idx.symbol}
                    </span>
                  </div>
                </div>

                {getStatusBadge(idx.marketStatus)}
              </div>

              {/* Price & Change */}
              <div className="flex items-baseline justify-between gap-2 my-1">
                <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-slate-50 tabular-nums">
                  {formatNumber(idx.value)}
                </div>
                <div
                  className={`flex items-center gap-0.5 text-xs font-bold font-mono px-2 py-0.5 rounded ${
                    isUp
                      ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  <span>
                    {isUp ? '+' : ''}
                    {idx.change.toFixed(2)} ({isUp ? '+' : ''}
                    {idx.changePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>

              {/* Day Range Progress Bar */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1 text-[11px] font-mono">
                <div className="flex justify-between text-slate-500 dark:text-slate-400 text-[10px]">
                  <span>Day L: ₹{formatNumber(idx.low)}</span>
                  <span>Day H: ₹{formatNumber(idx.high)}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isUp ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    style={{ width: `${dayProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-0.5">
                  <span>Prev Close: ₹{formatNumber(idx.prevClose)}</span>
                  <span>52W: ₹{formatNumber(week52Low)} - ₹{formatNumber(week52High)}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* 4. Market Breadth Summary Card */}
        <div className="flex flex-col justify-between p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <BarChart3 className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold font-mono tracking-tight text-slate-900 dark:text-slate-100 leading-none">
                  Market Breadth
                </h3>
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  NSE Universe Ratio
                </span>
              </div>
            </div>

            {getDirectionBadge(breadth.marketDirection)}
          </div>

          {/* Counts & Percentages */}
          <div className="grid grid-cols-2 gap-2 my-1">
            <div className="p-2 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60">
              <div className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                Advances ({breadth.bullishPercent}%)
              </div>
              <div className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                {breadth.positiveStocks} <span className="text-[10px] font-sans font-normal text-slate-400">stocks</span>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-rose-50/70 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/60">
              <div className="text-[10px] font-semibold text-rose-700 dark:text-rose-400">
                Declines ({breadth.bearishPercent}%)
              </div>
              <div className="text-lg font-black font-mono text-rose-600 dark:text-rose-400">
                {breadth.negativeStocks} <span className="text-[10px] font-sans font-normal text-slate-400">stocks</span>
              </div>
            </div>
          </div>

          {/* Dual Breadth Ratio Progress Bar */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1">
            <div className="flex justify-between text-[10px] font-mono font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400">{breadth.bullishPercent}% Bullish</span>
              <span className="text-slate-400">Total: {breadth.totalStocks}</span>
              <span className="text-rose-600 dark:text-rose-400">{breadth.bearishPercent}% Bearish</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${breadth.bullishPercent}%` }}
              />
              <div
                className="bg-rose-500 h-full transition-all duration-300"
                style={{ width: `${breadth.bearishPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

