import React, { useState, useMemo } from 'react';
import { LayoutGrid, Layers, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { HeatmapStockItem, HeatmapSectorItem, StockRadarItem } from '../../types';
import { MOCK_OVERALL_MARKET_HEATMAP, MOCK_SECTOR_HEATMAP } from '../../data/mock/heatmaps';
import { formatINR, formatNumber } from '../../data/mockData';
import MarketHeatmap from '../Charts/MarketHeatmap';
import type { HeatmapItem } from '../Charts/types';
import { generateHeatmap } from '../Charts/mockChartData';
import type { MarketOverview } from '../../services/backendApi';

interface MarketHeatmapsProps {
  stocks?: StockRadarItem[];
  onSelectStock: (symbol: string) => void;
  theme?: 'light' | 'dark';
  marketOverview?: MarketOverview | null;
  liveDataConnected?: boolean;
}

export const MarketHeatmaps: React.FC<MarketHeatmapsProps> = ({ stocks, onSelectStock, theme = 'light', marketOverview, liveDataConnected = false }) => {
  const [heatmapMode, setHeatmapMode] = useState<'STOCKS' | 'SECTORS'>('STOCKS');
  const [stockViewType, setStockViewType] = useState<'TREEMAP' | 'GRID'>('TREEMAP');
  const [hoveredStock, setHoveredStock] = useState<StockRadarItem | HeatmapStockItem | null>(null);

  // Map real stock radar data to Treemap HeatmapItem[]
  const heatmapItems: HeatmapItem[] = useMemo(() => {
    if (stocks && stocks.length > 0) {
      return stocks.map((s) => ({
        name: s.symbol,
        sector: s.sector,
        size: Math.max(1, s.capital || Math.round(s.ltp * (s.rvol || 1))),
        change: s.changePercent,
      }));
    }
    return generateHeatmap();
  }, [stocks]);

  const sectorHeatmapData: HeatmapSectorItem[] = useMemo(() => {
    if (!liveDataConnected) return MOCK_SECTOR_HEATMAP;
    return (marketOverview?.sectors || []).map((sector) => ({
      name: sector.sector,
      changePercent: sector.average_change_percent ?? 0,
      stockCount: sector.total,
      bullishCount: sector.advances,
      bearishCount: sector.declines,
    }));
  }, [liveDataConnected, marketOverview]);

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

  const displayStocks = stocks && stocks.length > 0 ? stocks : MOCK_OVERALL_MARKET_HEATMAP;

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
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                Simulated
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {heatmapMode === 'STOCKS'
                ? 'Weighted market performance across radar equities (Green = Gain, Red = Loss)'
                : 'Sector-level dispersion and breadth ratios'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Sub-Toggle (Treemap vs Grid) when in STOCKS mode */}
            {heatmapMode === 'STOCKS' && (
              <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setStockViewType('TREEMAP')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    stockViewType === 'TREEMAP'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Treemap
                </button>
                <button
                  type="button"
                  onClick={() => setStockViewType('GRID')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    stockViewType === 'GRID'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Grid
                </button>
              </div>
            )}

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
        </div>

        {/* MODE 1: OVERALL MARKET STOCKS HEATMAP */}
        {heatmapMode === 'STOCKS' && (
          <div className="space-y-3">
            {stockViewType === 'TREEMAP' ? (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-2 bg-slate-50/50 dark:bg-slate-900/50">
                <MarketHeatmap
                  items={heatmapItems}
                  onSelect={onSelectStock}
                  height={420}
                  theme={theme}
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                {displayStocks.map((stock) => {
                  const colorClass = getHeatmapColorClass(stock.changePercent);
                  const price = 'ltp' in stock ? stock.ltp : stock.price;
                  const volume = 'rvol' in stock ? (stock.rvol * 35000) : stock.volume;

                  return (
                    <button
                      key={stock.symbol}
                      type="button"
                      onClick={() => onSelectStock(stock.symbol)}
                      onMouseEnter={() => setHoveredStock(stock)}
                      onMouseLeave={() => setHoveredStock(null)}
                      className={`p-3 rounded-xl border flex flex-col justify-between transition-all hover:scale-[1.02] hover:z-10 cursor-pointer text-left ${colorClass} col-span-1`}
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
                        <span className="opacity-90">{formatINR(price)}</span>
                        <span className="opacity-75">{formatNumber(volume)} vol</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

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
                  {hoveredStock.name} ({hoveredStock.symbol}) • {hoveredStock.sector} • ₹{'ltp' in hoveredStock ? hoveredStock.ltp : hoveredStock.price} (
                  {hoveredStock.changePercent >= 0 ? '+' : ''}
                  {hoveredStock.changePercent.toFixed(2)}%)
                </div>
              ) : (
                <div className="text-slate-400 text-[10px]">
                  Click any stock tile to open Stock Detail view
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODE 2: SECTOR HEATMAP */}
        {heatmapMode === 'SECTORS' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sectorHeatmapData.map((sector) => {
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

