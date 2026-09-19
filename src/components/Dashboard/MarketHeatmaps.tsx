import React, { useState } from 'react';
import { LayoutGrid, Layers, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { HeatmapStockItem, HeatmapSectorItem } from '../../types';
import { MOCK_OVERALL_MARKET_HEATMAP, MOCK_SECTOR_HEATMAP } from '../../data/mock/heatmaps';
import { formatINR, formatNumber } from '../../data/mockData';

interface MarketHeatmapsProps {
  onSelectStock: (symbol: string) => void;
}

export const MarketHeatmaps: React.FC<MarketHeatmapsProps> = ({ onSelectStock }) => {
  const [heatmapMode, setHeatmapMode] = useState<'STOCKS' | 'SECTORS'>('STOCKS');
  const [hoveredStock, setHoveredStock] = useState<HeatmapStockItem | null>(null);

  // Helper to calculate traditional green/red intensity background class
  const getHeatmapColorClass = (changePct: number) => {
    if (changePct >= 2.0) return 'bg-emerald-600 text-white border-emerald-700 shadow-sm';
    if (changePct >= 1.0) return 'bg-emerald-500 text-white border-emerald-600';
    if (changePct > 0) return 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800';
    if (changePct === 0) return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    if (changePct <= -2.0) return 'bg-rose-600 text-white border-rose-700 shadow-sm';
    if (changePct <= -1.0) return 'bg-rose-500 text-white border-rose-600';
    return 'bg-rose-100 text-rose-900 dark:bg-rose-950/80 dark:text-rose-200 border-rose-300 dark:border-rose-800';
  };

  return (
    <section id="market-heatmaps-section" aria-label="Market Heatmaps" className="w-full">
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
        {/* Header: Title + Mode Toggle (Overall Market vs Sector Heatmap) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-slate-50 font-mono">
                Market Heatmaps
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Visual Momentum
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {heatmapMode === 'STOCKS'
                ? 'Weighted market performance across tier-1 equities (Green = Gain, Red = Loss)'
                : 'Sector-level dispersion and breadth ratios'}
            </p>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setHeatmapMode('STOCKS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                heatmapMode === 'STOCKS'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Overall Market</span>
            </button>

            <button
              type="button"
              onClick={() => setHeatmapMode('SECTORS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                heatmapMode === 'SECTORS'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Sector Heatmap</span>
            </button>
          </div>
        </div>

        {/* MODE 1: OVERALL MARKET STOCKS HEATMAP */}
        {heatmapMode === 'STOCKS' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {MOCK_OVERALL_MARKET_HEATMAP.map((stock) => {
                const colorClass = getHeatmapColorClass(stock.changePercent);
                const isMega = stock.marketCap > 1000000;

                return (
                  <button
                    key={stock.id}
                    type="button"
                    onClick={() => onSelectStock(stock.symbol)}
                    onMouseEnter={() => setHoveredStock(stock)}
                    onMouseLeave={() => setHoveredStock(null)}
                    className={`p-3 rounded-xl border flex flex-col justify-between transition-all hover:scale-[1.02] hover:z-10 cursor-pointer text-left ${colorClass} ${
                      isMega ? 'col-span-1 sm:col-span-2' : 'col-span-1'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <span className="font-mono font-black text-xs sm:text-sm tracking-tight leading-tight block">
                          {stock.symbol}
                        </span>
                        <span className="text-[10px] opacity-80 truncate block max-w-[120px]">
                          {stock.sector}
                        </span>
                      </div>
                      <span className="font-mono font-extrabold text-xs sm:text-sm leading-none whitespace-nowrap">
                        {stock.changePercent >= 0 ? '+' : ''}
                        {stock.changePercent.toFixed(2)}%
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between mt-2 pt-1 border-t border-current/20 text-[10px] font-mono">
                      <span className="opacity-90">{formatINR(stock.price)}</span>
                      <span className="opacity-75">{formatNumber(stock.volume)} vol</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legend & Hover Info Strip */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <span>Loss:</span>
                <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white font-bold">&lt;-2%</span>
                <span className="px-1.5 py-0.5 rounded bg-rose-400 text-white font-bold">-1%</span>
                <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-300 font-bold">&lt;0%</span>
                <span className="mx-1">|</span>
                <span>Gain:</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold">&gt;0%</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-400 text-white font-bold">+1%</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold">&gt;+2%</span>
              </div>

              {hoveredStock ? (
                <div className="text-slate-700 dark:text-slate-200 font-semibold truncate">
                  {hoveredStock.name} ({hoveredStock.symbol}) • {hoveredStock.sector} • ₹{hoveredStock.price} (
                  {hoveredStock.changePercent >= 0 ? '+' : ''}
                  {hoveredStock.changePercent.toFixed(2)}%)
                </div>
              ) : (
                <div className="text-slate-400 text-[10px]">
                  Hover any tile to preview stock details • Click to view candlestick chart
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODE 2: SECTOR HEATMAP */}
        {heatmapMode === 'SECTORS' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {MOCK_SECTOR_HEATMAP.map((sector) => {
              const colorClass = getHeatmapColorClass(sector.changePercent);
              const total = sector.stockCount;
              const bullPct = Math.round((sector.bullishCount / total) * 100);

              return (
                <div
                  key={sector.name}
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${colorClass}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-mono font-black text-sm tracking-tight">{sector.name}</h3>
                      <span className="text-[10px] opacity-80">
                        {sector.stockCount} constituent stocks
                      </span>
                    </div>
                    <span className="font-mono font-black text-base">
                      {sector.changePercent >= 0 ? '+' : ''}
                      {sector.changePercent.toFixed(2)}%
                    </span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-current/20 flex items-center justify-between text-xs font-mono">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {sector.bullishCount} Bullish ({bullPct}%)
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5" />
                      {sector.bearishCount} Bearish
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

