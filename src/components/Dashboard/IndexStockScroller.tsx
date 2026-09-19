import React, { useRef, useEffect, useState, useCallback } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { IndexConstituentStock } from '../../types';
import { formatINR } from '../../data/mockData';

interface IndexStockScrollerProps {
  stocks: IndexConstituentStock[];
  onSelectStock: (stockSymbol: string) => void;
  speed?: number; // pixels per frame, e.g. 0.6
}

export const IndexStockScroller: React.FC<IndexStockScrollerProps> = ({
  stocks,
  onSelectStock,
  speed = 0.65,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const animFrameRef = useRef<number | null>(null);

  // Seamless looping by duplicating items
  const duplicatedStocks = [...stocks, ...stocks, ...stocks];

  const handleScrollStep = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!isPaused) {
      container.scrollLeft += speed;

      // When half-way through the duplicated content, loop smoothly back
      const oneSetWidth = container.scrollWidth / 3;
      if (container.scrollLeft >= oneSetWidth * 2) {
        container.scrollLeft -= oneSetWidth;
      }
    }

    animFrameRef.current = requestAnimationFrame(handleScrollStep);
  }, [isPaused, speed]);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(handleScrollStep);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [handleScrollStep]);

  return (
    <div
      className="relative w-full overflow-hidden rounded-lg bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 select-none group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => {
        // slight delay before resuming after touch interaction
        setTimeout(() => setIsPaused(false), 800);
      }}
    >
      {/* Subtle fade masks at left and right edges */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-slate-50 dark:from-slate-900 to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-slate-50 dark:from-slate-900 to-transparent z-10" />

      <div
        ref={containerRef}
        className="flex items-center gap-2 px-2 py-1.5 overflow-x-auto no-scrollbar scroll-smooth cursor-grab active:cursor-grabbing"
      >
        {duplicatedStocks.map((stock, idx) => {
          const isUp = stock.change >= 0;
          return (
            <button
              key={`${stock.symbol}-${idx}`}
              onClick={(e) => {
                e.stopPropagation();
                onSelectStock(stock.symbol);
              }}
              className="shrink-0 flex items-center gap-2 px-2.5 py-1 rounded-md bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xs transition-all cursor-pointer text-left"
              title={`View ${stock.symbol} detail chart`}
            >
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 font-mono leading-none">
                  {stock.symbol}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-medium leading-tight">
                  {formatINR(stock.price)}
                </span>
              </div>

              <div
                className={`flex items-center gap-0.5 text-[10px] font-bold font-mono px-1 py-0.5 rounded ${
                  isUp
                    ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
                    : 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60'
                }`}
              >
                {isUp ? (
                  <TrendingUp className="w-2.5 h-2.5 shrink-0" />
                ) : (
                  <TrendingDown className="w-2.5 h-2.5 shrink-0" />
                )}
                <span>
                  {isUp ? '+' : ''}
                  {stock.changePercent.toFixed(2)}%
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

