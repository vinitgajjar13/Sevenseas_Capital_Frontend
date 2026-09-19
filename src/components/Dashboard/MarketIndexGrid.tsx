import React from 'react';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { MarketIndex } from '../../types';
import { formatNumber } from '../../data/mockData';
import { IndexStockScroller } from './IndexStockScroller';

interface MarketIndexGridProps {
  indices: {
    nifty50: MarketIndex;
    bankNifty: MarketIndex;
    sensex: MarketIndex;
  };
  onSelectStock: (symbol: string) => void;
}

export const MarketIndexGrid: React.FC<MarketIndexGridProps> = ({
  indices,
  onSelectStock,
}) => {
  const indexList: MarketIndex[] = [indices.nifty50, indices.bankNifty, indices.sensex];

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
      case 'Pre-Open':
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>Pre-Open</span>
          </span>
        );
      case 'Post-Market':
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            <span>Post-Market</span>
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

  return (
    <section id="market-index-section" aria-label="Market Indexes" className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {indexList.map((idx) => {
          const isUp = idx.change >= 0;
          const daySpan = idx.high - idx.low || 1;
          const dayProgress = Math.min(100, Math.max(5, ((idx.value - idx.low) / daySpan) * 100));

          const week52High = idx.week52High || idx.high * 1.05;
          const week52Low = idx.week52Low || idx.low * 0.88;
          const week52Span = week52High - week52Low || 1;
          const week52Progress = Math.min(100, Math.max(5, ((idx.value - week52Low) / week52Span) * 100));

          return (
            <div
              key={idx.symbol}
              id={`index-card-${idx.symbol.toLowerCase()}`}
              className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-all"
            >
              {/* Top Row: Index Name & Market Status */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    <Activity className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold font-mono tracking-tight text-slate-900 dark:text-slate-50 leading-none">
                      {idx.name}
                    </h2>
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
                      NSE / BSE Benchmark
                    </span>
                  </div>
                </div>

                {getStatusBadge(idx.marketStatus)}
              </div>

              {/* Middle Row: Big Current Value & Day Point / Percentage Movement */}
              <div className="flex items-baseline justify-between gap-2 my-1">
                <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-slate-50 tabular-nums">
                  {formatNumber(idx.value)}
                </div>

                <div
                  className={`flex items-center gap-1 text-xs sm:text-sm font-bold font-mono px-2 py-0.5 rounded-lg ${
                    isUp
                      ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-800/60'
                      : 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200/70 dark:border-rose-800/60'
                  }`}
                >
                  {isUp ? (
                    <ArrowUpRight className="w-4 h-4 shrink-0" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 shrink-0" />
                  )}
                  <span>
                    {isUp ? '+' : ''}
                    {idx.change.toFixed(2)} ({isUp ? '+' : ''}
                    {idx.changePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>

              {/* Intraday Range Bar */}
              <div className="my-2.5 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  <span className="truncate">
                    Low: <strong className="text-slate-700 dark:text-slate-200">{formatNumber(idx.low)}</strong>
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Day Range</span>
                  <span className="truncate text-right">
                    High: <strong className="text-slate-700 dark:text-slate-200">{formatNumber(idx.high)}</strong>
                  </span>
                </div>

                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isUp ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-rose-500 dark:bg-rose-400'
                    }`}
                    style={{ width: `${dayProgress}%` }}
                  />
                </div>
              </div>

              {/* Metrics Grid: Prev Close & 52-Week Range */}
              <div className="grid grid-cols-3 gap-2 py-2 px-2.5 my-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 text-[11px] font-mono">
                <div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-sans">Prev Close</div>
                  <div className="font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                    {formatNumber(idx.prevClose)}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-sans">52W Low</div>
                  <div className="font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                    {formatNumber(week52Low)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-sans">52W High</div>
                  <div className="font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                    {formatNumber(week52High)}
                  </div>
                </div>
              </div>

              {/* Related Stocks Horizontal Scrolling Strip */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 font-mono tracking-wider mb-1.5">
                  <span>Constituent Stocks</span>
                  <span className="text-[9px] lowercase font-normal">scroll or hover to pause</span>
                </div>

                {idx.constituents && idx.constituents.length > 0 ? (
                  <IndexStockScroller
                    stocks={idx.constituents}
                    onSelectStock={onSelectStock}
                  />
                ) : (
                  <div className="text-xs text-slate-400 py-1">No constituents loaded</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

