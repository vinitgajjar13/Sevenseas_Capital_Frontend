import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Layers,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Target,
} from 'lucide-react';
import { SectorParticipationItem, StockRadarItem } from '../../types';
import { MOCK_SECTOR_PARTICIPATION } from '../../data/mock/sectors';
import { MOCK_STOCK_UNIVERSE } from '../../data/mock/stocks';
import { formatINR } from '../../data/mockData';

interface TopSectorsProps {
  onSelectStock: (symbol: string) => void;
  onNavigateToSectorsView?: () => void;
}

export const TopSectors: React.FC<TopSectorsProps> = ({
  onSelectStock,
  onNavigateToSectorsView,
}) => {
  const [showAll, setShowAll] = useState<boolean>(false);
  const [activeDrilldownSector, setActiveDrilldownSector] = useState<SectorParticipationItem | null>(null);

  // Split into Bullish vs Bearish sectors
  const bullishSectors = useMemo(() => {
    return MOCK_SECTOR_PARTICIPATION.filter((s) => s.changePercent >= 0).sort(
      (a, b) => b.changePercent - a.changePercent
    );
  }, []);

  const bearishSectors = useMemo(() => {
    return MOCK_SECTOR_PARTICIPATION.filter((s) => s.changePercent < 0).sort(
      (a, b) => a.changePercent - b.changePercent
    );
  }, []);

  // Stocks belonging to selected drilldown sector
  const drilldownStocks: StockRadarItem[] = useMemo(() => {
    if (!activeDrilldownSector) return [];
    return MOCK_STOCK_UNIVERSE.filter(
      (s) =>
        s.sector.toLowerCase().includes(activeDrilldownSector.name.toLowerCase().replace('nifty', '').trim()) ||
        activeDrilldownSector.name.toLowerCase().includes(s.sector.toLowerCase())
    );
  }, [activeDrilldownSector]);

  const displayedBullish = showAll ? bullishSectors : bullishSectors.slice(0, 3);
  const displayedBearish = showAll ? bearishSectors : bearishSectors.slice(0, 3);

  const renderSectorCard = (sector: SectorParticipationItem, isBull: boolean) => {
    return (
      <div
        key={sector.id}
        onClick={() => setActiveDrilldownSector(sector)}
        className="flex flex-col justify-between p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xs transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs sm:text-sm font-mono text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {sector.name}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              ({sector.totalStocks} stks)
            </span>
          </div>

          <div
            className={`flex items-center gap-0.5 text-xs font-bold font-mono px-2 py-0.5 rounded ${
              isBull
                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/70'
                : 'text-rose-700 dark:text-rose-400 bg-rose-100/70 dark:bg-rose-950/70'
            }`}
          >
            {isBull ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            <span>
              {isBull ? '+' : ''}
              {sector.changePercent.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Bullish % vs Bearish % Participation Bar */}
        <div className="my-2.5 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Bullish {sector.bullishPercent}%
            </span>
            <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
              Bearish {sector.bearishPercent}%
              <TrendingDown className="w-3 h-3" />
            </span>
          </div>

          <div className="w-full h-2 rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${sector.bullishPercent}%` }}
              title={`${sector.advanceCount} stocks advancing`}
            />
            <div
              className="h-full bg-rose-500 transition-all duration-300"
              style={{ width: `${sector.bearishPercent}%` }}
              title={`${sector.declineCount} stocks declining`}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500 pt-0.5">
            <span>Adv: {sector.advanceCount}</span>
            <span>Dec: {sector.declineCount}</span>
          </div>
        </div>

        {/* Top Performer & Click Prompt */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px]">
          <span className="text-slate-500 dark:text-slate-400 truncate max-w-[190px]">
            Leader: <strong className="text-slate-700 dark:text-slate-200">{sector.topStock || '—'}</strong>
          </span>
          <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform text-[10px]">
            <span>View Stocks</span>
            <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    );
  };

  return (
    <section id="top-sectors-section" aria-label="Top Sectors" className="w-full">
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
        {/* Header with Title and View All button */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-slate-50 font-mono">
                Top Sectors
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Participation Matrix
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Proportion of positive vs negative constituent stocks driving overall sector momentum
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
            >
              {showAll ? 'Show Less' : 'View All'}
            </button>
            {onNavigateToSectorsView && (
              <button
                type="button"
                onClick={onNavigateToSectorsView}
                className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Sector Radar</span>
              </button>
            )}
          </div>
        </div>

        {/* Two-Column Grid: Bullish Sectors vs Bearish Sectors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Column: Bullish Sectors */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-mono">
                Bullish Sectors ({bullishSectors.length})
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {displayedBullish.map((sector) => renderSectorCard(sector, true))}
            </div>
          </div>

          {/* Right Column: Bearish Sectors */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-mono">
                Bearish Sectors ({bearishSectors.length})
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {displayedBearish.map((sector) => renderSectorCard(sector, false))}
            </div>
          </div>
        </div>

        {/* Sector Stocks Drill-down Modal / Slideout */}
        {activeDrilldownSector && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>{activeDrilldownSector.name} — Constituent Stocks</span>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      activeDrilldownSector.changePercent >= 0
                        ? 'text-emerald-700 bg-emerald-100 dark:bg-emerald-950/80 dark:text-emerald-300'
                        : 'text-rose-700 bg-rose-100 dark:bg-rose-950/80 dark:text-rose-300'
                    }`}
                  >
                    {activeDrilldownSector.changePercent >= 0 ? '+' : ''}
                    {activeDrilldownSector.changePercent.toFixed(2)}%
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Click any stock to inspect its detailed candlestick chart and technicals
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveDrilldownSector(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                title="Close sector stocks view"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {drilldownStocks.length > 0 ? (
                drilldownStocks.map((stock) => {
                  const isUp = stock.changePercent >= 0;
                  return (
                    <div
                      key={stock.id}
                      onClick={() => onSelectStock(stock.symbol)}
                      className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div>
                        <div className="font-bold text-xs font-mono text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {stock.symbol}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                          {stock.name}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                          {formatINR(stock.ltp)}
                        </div>
                        <div
                          className={`text-[10px] font-bold font-mono ${
                            isUp ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {isUp ? '+' : ''}
                          {stock.changePercent.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-3 text-center py-4 text-xs text-slate-400">
                  No constituent stocks tracked for this sector in the current radar model.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

