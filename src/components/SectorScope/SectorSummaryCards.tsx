import React from 'react';
import {
  Layers,
  Flame,
  TrendingUp,
  Minus,
  TrendingDown,
  AlertTriangle,
} from 'lucide-react';
import { SectorSummaryMetrics, SectorDirectionType } from '../../types';

interface SectorSummaryCardsProps {
  metrics: SectorSummaryMetrics;
  selectedDirectionFilter?: SectorDirectionType | 'ALL';
  onSelectDirectionFilter?: (dir: SectorDirectionType | 'ALL') => void;
}

export const SectorSummaryCards: React.FC<SectorSummaryCardsProps> = ({
  metrics,
  selectedDirectionFilter = 'ALL',
  onSelectDirectionFilter,
}) => {
  const cards: {
    id: SectorDirectionType | 'ALL';
    label: string;
    count: number;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    badgeBg: string;
    textColor: string;
  }[] = [
    {
      id: 'ALL',
      label: 'Total Sectors',
      count: metrics.totalSectors,
      icon: Layers,
      accentColor: 'border-slate-300 dark:border-slate-700',
      badgeBg: 'bg-slate-100 dark:bg-slate-800',
      textColor: 'text-slate-900 dark:text-slate-100',
    },
    {
      id: 'Strong Bullish',
      label: 'Strong Bullish',
      count: metrics.strongBullish,
      icon: Flame,
      accentColor: 'border-emerald-300 dark:border-emerald-800',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/70',
      textColor: 'text-emerald-700 dark:text-emerald-400',
    },
    {
      id: 'Bullish',
      label: 'Bullish',
      count: metrics.bullish,
      icon: TrendingUp,
      accentColor: 'border-teal-300 dark:border-teal-800',
      badgeBg: 'bg-teal-50 dark:bg-teal-950/70',
      textColor: 'text-teal-700 dark:text-teal-400',
    },
    {
      id: 'Neutral',
      label: 'Neutral',
      count: metrics.neutral,
      icon: Minus,
      accentColor: 'border-amber-300 dark:border-amber-800',
      badgeBg: 'bg-amber-50 dark:bg-amber-950/70',
      textColor: 'text-amber-700 dark:text-amber-400',
    },
    {
      id: 'Bearish',
      label: 'Bearish',
      count: metrics.bearish,
      icon: TrendingDown,
      accentColor: 'border-orange-300 dark:border-orange-800',
      badgeBg: 'bg-orange-50 dark:bg-orange-950/70',
      textColor: 'text-orange-700 dark:text-orange-400',
    },
    {
      id: 'Strong Bearish',
      label: 'Strong Bearish',
      count: metrics.strongBearish,
      icon: AlertTriangle,
      accentColor: 'border-rose-300 dark:border-rose-800',
      badgeBg: 'bg-rose-50 dark:bg-rose-950/70',
      textColor: 'text-rose-700 dark:text-rose-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = selectedDirectionFilter === card.id;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectDirectionFilter && onSelectDirectionFilter(card.id)}
            className={`p-3 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between cursor-pointer ${
              isSelected
                ? `ring-2 ring-slate-900 dark:ring-indigo-400 shadow-xs bg-white dark:bg-slate-900 ${card.accentColor}`
                : `bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 border-slate-200/90 dark:border-slate-800`
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                {card.label}
              </span>
              <div className={`p-1 rounded-md ${card.badgeBg}`}>
                <Icon className={`w-3.5 h-3.5 ${card.textColor}`} />
              </div>
            </div>

            <div className="flex items-baseline justify-between mt-0.5">
              <span className={`text-xl font-black font-mono tracking-tight ${card.textColor}`}>
                {card.count}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {card.id === 'ALL'
                  ? 'Active'
                  : `${Math.round((card.count / (metrics.totalSectors || 1)) * 100)}%`}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

