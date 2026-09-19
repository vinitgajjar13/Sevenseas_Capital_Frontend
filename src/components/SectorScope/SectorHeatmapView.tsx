import React from 'react';
import { Flame, TrendingUp, Minus, TrendingDown, AlertTriangle } from 'lucide-react';
import { SectorAnalysisItem, SectorDirectionType } from '../../types';

interface SectorHeatmapViewProps {
  sectors: SectorAnalysisItem[];
  selectedSectorId?: string | null;
  onSelectSector: (sector: SectorAnalysisItem) => void;
}

export const SectorHeatmapView: React.FC<SectorHeatmapViewProps> = ({
  sectors,
  selectedSectorId,
  onSelectSector,
}) => {
  const getIntensityStyle = (change: number) => {
    if (change >= 1.5) {
      return 'bg-emerald-600 dark:bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-500';
    }
    if (change >= 0.8) {
      return 'bg-emerald-500/90 dark:bg-emerald-700/80 text-white hover:bg-emerald-600 border-emerald-400';
    }
    if (change > 0) {
      return 'bg-emerald-100/90 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-200 border-emerald-300 dark:border-emerald-800';
    }
    if (change === 0) {
      return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border-slate-300 dark:border-slate-700';
    }
    if (change > -0.8) {
      return 'bg-rose-100/90 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 hover:bg-rose-200 border-rose-300 dark:border-rose-800';
    }
    if (change > -1.5) {
      return 'bg-rose-500/90 dark:bg-rose-700/80 text-white hover:bg-rose-600 border-rose-400';
    }
    return 'bg-rose-600 dark:bg-rose-600 text-white hover:bg-rose-700 border-rose-500';
  };

  const getDirectionIcon = (dir: SectorDirectionType) => {
    switch (dir) {
      case 'Strong Bullish':
        return <Flame className="w-3.5 h-3.5 shrink-0" />;
      case 'Bullish':
        return <TrendingUp className="w-3.5 h-3.5 shrink-0" />;
      case 'Strong Bearish':
        return <AlertTriangle className="w-3.5 h-3.5 shrink-0" />;
      case 'Bearish':
        return <TrendingDown className="w-3.5 h-3.5 shrink-0" />;
      default:
        return <Minus className="w-3.5 h-3.5 shrink-0" />;
    }
  };

  return (
    <section id="sector-heatmap-section" className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs p-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Sector Heatmap</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              Interactive Intensity Grid
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Color intensity weighted by average % performance. Click any sector to view its constituent stocks.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 dark:text-slate-400">
          <span>-2%</span>
          <div className="flex items-center gap-0.5">
            <span className="w-3.5 h-3 rounded bg-rose-600" />
            <span className="w-3.5 h-3 rounded bg-rose-500" />
            <span className="w-3.5 h-3 rounded bg-rose-200 dark:bg-rose-950" />
            <span className="w-3.5 h-3 rounded bg-slate-200 dark:bg-slate-800" />
            <span className="w-3.5 h-3 rounded bg-emerald-200 dark:bg-emerald-950" />
            <span className="w-3.5 h-3 rounded bg-emerald-500" />
            <span className="w-3.5 h-3 rounded bg-emerald-600" />
          </div>
          <span>+2%</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {sectors.map((sector) => {
          const isSelected = selectedSectorId === sector.id || selectedSectorId === sector.name;
          const isUp = sector.avgChangePercent >= 0;

          return (
            <button
              key={sector.id}
              type="button"
              onClick={() => onSelectSector(sector)}
              className={`p-3 rounded-xl border transition-all duration-150 text-left flex flex-col justify-between cursor-pointer ${getIntensityStyle(
                sector.avgChangePercent
              )} ${
                isSelected
                  ? 'ring-2 ring-indigo-500 dark:ring-indigo-400 shadow-md scale-[1.02]'
                  : 'hover:scale-[1.01]'
              }`}
            >
              <div className="flex items-start justify-between gap-1 mb-2">
                <div>
                  <div className="font-extrabold text-xs tracking-tight line-clamp-1">
                    {sector.name}
                  </div>
                  <div className="text-[10px] opacity-80 font-mono">
                    {sector.indexSymbol}
                  </div>
                </div>

                <div className="opacity-90">
                  {getDirectionIcon(sector.direction)}
                </div>
              </div>

              <div className="pt-2 border-t border-current/15 flex items-baseline justify-between mt-auto">
                <div className="text-base font-black font-mono">
                  {isUp ? '+' : ''}
                  {sector.avgChangePercent.toFixed(2)}%
                </div>
                <div className="text-[10px] font-mono opacity-85">
                  Score: {sector.score}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

