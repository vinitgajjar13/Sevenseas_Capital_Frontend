import React from 'react';
import { TrendingUp, TrendingDown, Trash2, ArrowUpRight } from 'lucide-react';
import { WatchlistStockItem } from '../../types';
import { formatINR, formatNumber } from '../../data/mockData';

interface WatchlistStockCardProps {
  stock: WatchlistStockItem;
  onSelectStock: (stock: WatchlistStockItem) => void;
  onRemoveStock: (symbol: string) => void;
}

export const WatchlistStockCard: React.FC<WatchlistStockCardProps> = ({
  stock,
  onSelectStock,
  onRemoveStock,
}) => {
  const isPositive = stock.changePercent >= 0;

  // Mini Sparkline SVG renderer
  const renderSparkline = () => {
    if (!stock.sparkline || stock.sparkline.length < 2) return null;
    const data = stock.sparkline;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 64;
    const height = 24;

    const points = data
      .map((val, idx) => {
        const x = (idx / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 4) - 2;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

    const strokeColor = isPositive ? '#10b981' : '#f43f5e';

    return (
      <svg
        className="w-16 h-6 hidden sm:block shrink-0"
        viewBox={`0 0 ${width} ${height}`}
        aria-hidden="true"
      >
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelectStock(stock)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectStock(stock);
        }
      }}
      className="group relative flex items-center justify-between p-3 sm:px-4 sm:py-3 rounded-xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xs dark:hover:bg-slate-800 transition-all cursor-pointer select-none"
      title={`Open ${stock.symbol} detailed analysis`}
    >
      {/* Left: Symbol, Name & Sector Tag */}
      <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
        <div
          className={`w-1 h-8 rounded-full transition-colors ${
            isPositive ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-rose-500 dark:bg-rose-400'
          }`}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {stock.symbol}
            </span>
            <span className="hidden xs:inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              {stock.sector}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[140px] sm:max-w-[220px]">
            {stock.name}
          </p>
        </div>
      </div>

      {/* Middle: Sparkline Chart (Desktop & Tablet) */}
      <div className="mx-2 shrink-0">{renderSparkline()}</div>

      {/* Right: LTP, Change & Remove Button */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <div className="font-mono font-bold text-sm sm:text-base text-slate-900 dark:text-white tabular-nums">
            {formatINR(stock.ltp)}
          </div>
          <div
            className={`inline-flex items-center gap-0.5 text-xs font-mono font-semibold tabular-nums ${
              isPositive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>
              {isPositive ? '+' : ''}
              {stock.change.toFixed(2)} ({isPositive ? '+' : ''}
              {stock.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Remove Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemoveStock(stock.symbol);
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
          title={`Remove ${stock.symbol} from Watchlist`}
          aria-label={`Remove ${stock.symbol} from Watchlist`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

