import React, { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  Search,
  Flame,
  TrendingUp,
  Minus,
  TrendingDown,
  AlertTriangle,
  ChevronRight,
  Filter,
  Check,
} from 'lucide-react';
import { SectorAnalysisItem, SectorDirectionType } from '../../types';
import { formatNumber } from '../../data/mockData';

interface SectorAnalysisTableProps {
  sectors: SectorAnalysisItem[];
  selectedSectorId?: string | null;
  onSelectSector: (sector: SectorAnalysisItem) => void;
  directionFilter?: SectorDirectionType | 'ALL';
  onDirectionFilterChange?: (dir: SectorDirectionType | 'ALL') => void;
}

type SortColumn =
  | 'overallRank'
  | 'name'
  | 'totalStocks'
  | 'avgChangePercent'
  | 'positiveStocks'
  | 'negativeStocks'
  | 'bullishPercent'
  | 'bearishPercent'
  | 'totalVolume'
  | 'volumePerStock'
  | 'bullishVolume'
  | 'bearishVolume'
  | 'bullishVolumePercent'
  | 'bearishVolumePercent'
  | 'direction'
  | 'score'
  | 'bullishRank'
  | 'bearishRank';

export const SectorAnalysisTable: React.FC<SectorAnalysisTableProps> = ({
  sectors,
  selectedSectorId,
  onSelectSector,
  directionFilter = 'ALL',
  onDirectionFilterChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortCol, setSortCol] = useState<SortColumn>('overallRank');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const handleSort = (col: SortColumn) => {
    if (sortCol === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(col);
      setSortAsc(col === 'overallRank' || col === 'bullishRank' || col === 'name');
    }
  };

  const getDirectionVisual = (dir: SectorDirectionType) => {
    switch (dir) {
      case 'Strong Bullish':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-md bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <Flame className="w-3 h-3 text-emerald-500" />
            <span>Strong Bullish</span>
          </span>
        );
      case 'Bullish':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-md bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            <TrendingUp className="w-3 h-3 text-teal-500" />
            <span>Bullish</span>
          </span>
        );
      case 'Strong Bearish':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-md bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <AlertTriangle className="w-3 h-3 text-rose-500" />
            <span>Strong Bearish</span>
          </span>
        );
      case 'Bearish':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-md bg-orange-50 dark:bg-orange-950/70 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
            <TrendingDown className="w-3 h-3 text-orange-500" />
            <span>Bearish</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Minus className="w-3 h-3 text-slate-400" />
            <span>Neutral</span>
          </span>
        );
    }
  };

  const filteredAndSortedSectors = useMemo(() => {
    let result = [...sectors];

    // Direction filter
    if (directionFilter !== 'ALL') {
      result = result.filter((s) => s.direction === directionFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) => s.name.toLowerCase().includes(q) || s.indexSymbol.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      let valA = a[sortCol];
      let valB = b[sortCol];

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }

      return 0;
    });

    return result;
  }, [sectors, directionFilter, searchQuery, sortCol, sortAsc]);

  const directions: (SectorDirectionType | 'ALL')[] = [
    'ALL',
    'Strong Bullish',
    'Bullish',
    'Neutral',
    'Bearish',
    'Strong Bearish',
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
      {/* Table Controls Bar */}
      <div className="p-3.5 sm:p-4 border-b border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Main Sector Analysis</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
              {filteredAndSortedSectors.length} of {sectors.length} Sectors
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Institutional multi-factor breakdown: breadth participation, volume intensity, and momentum scoring.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sector or symbol..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-indigo-400 w-44 sm:w-56"
            />
          </div>

          {/* Direction Filter Dropdown */}
          {onDirectionFilterChange && (
            <div className="flex items-center gap-1">
              <select
                value={directionFilter}
                onChange={(e) => onDirectionFilterChange(e.target.value as any)}
                className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                {directions.map((d) => (
                  <option key={d} value={d}>
                    {d === 'ALL' ? 'All Directions' : d}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 18-Column Analytical Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 select-none">
              {/* 1. Overall Rank */}
              <th
                onClick={() => handleSort('overallRank')}
                className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white whitespace-nowrap text-center"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>#</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              {/* 2. Sector */}
              <th
                onClick={() => handleSort('name')}
                className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Sector</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              {/* 3. Direction */}
              <th
                onClick={() => handleSort('direction')}
                className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white whitespace-nowrap text-center"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Sector Direction</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              {/* 4. Score */}
              <th
                onClick={() => handleSort('score')}
                className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Sector Score</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              {/* 5. Avg % Change */}
              <th
                onClick={() => handleSort('avgChangePercent')}
                className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white whitespace-nowrap text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Avg % Change</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              {/* 6. Total Stocks */}
              <th
                onClick={() => handleSort('totalStocks')}
                className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white whitespace-nowrap text-center"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Stocks</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              {/* 7. Positive Stocks */}
              <th
                onClick={() => handleSort('positiveStocks')}
                className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white whitespace-nowrap text-center text-emerald-600 dark:text-emerald-400"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Positive</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              {/* 8. Negative Stocks */}
              <th
                onClick={() => handleSort('negativeStocks')}
                className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white whitespace-nowrap text-center text-rose-600 dark:text-rose-400"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Negative</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              {/* 9. Bullish % */}
              <th
                onClick={() => handleSort('bullishPercent')}
                className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white whitespace-nowrap text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Bullish %</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              {/* 10. Bearish % */}
              <th
                onClick={() => handleSort('bearishPercent')}
                className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white whitespace-nowrap text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Bearish %</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              {/* 11. Total Volume */}
              <th
                onClick={() => handleSort('totalVolume')}
                className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white whitespace-nowrap text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Total Volume</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              {/* 12. Volume / Stock */}
              <th
                onClick={() => handleSort('volumePerStock')}
                className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white whitespace-nowrap text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Vol / Stock</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              {/* 13. Bullish Volume */}
              <th
                onClick={() => handleSort('bullishVolume')}
                className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white whitespace-nowrap text-right text-emerald-600 dark:text-emerald-400"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Bullish Vol</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              {/* 14. Bearish Volume */}
              <th
                onClick={() => handleSort('bearishVolume')}
                className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white whitespace-nowrap text-right text-rose-600 dark:text-rose-400"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Bearish Vol</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              {/* 15. Bullish Vol % */}
              <th
                onClick={() => handleSort('bullishVolumePercent')}
                className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white whitespace-nowrap text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Bull Vol %</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              {/* 16. Bearish Vol % */}
              <th
                onClick={() => handleSort('bearishVolumePercent')}
                className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white whitespace-nowrap text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Bear Vol %</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              {/* 17. Bullish Rank */}
              <th
                onClick={() => handleSort('bullishRank')}
                className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white whitespace-nowrap text-center text-emerald-600 dark:text-emerald-400"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Bull Rank</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              {/* 18. Bearish Rank */}
              <th
                onClick={() => handleSort('bearishRank')}
                className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white whitespace-nowrap text-center text-rose-600 dark:text-rose-400"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Bear Rank</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              <th className="py-2.5 px-2 text-center">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800">
            {filteredAndSortedSectors.map((sector) => {
              const isSelected = selectedSectorId === sector.id || selectedSectorId === sector.name;
              const isUp = sector.avgChangePercent >= 0;

              return (
                <tr
                  key={sector.id}
                  onClick={() => onSelectSector(sector)}
                  className={`transition-colors cursor-pointer font-mono ${
                    isSelected
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-50 dark:hover:bg-indigo-950/60'
                      : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {/* 1. Overall Rank */}
                  <td className="py-2.5 px-3 text-center font-bold text-slate-700 dark:text-slate-300">
                    #{sector.overallRank}
                  </td>

                  {/* 2. Sector Name & Symbol */}
                  <td className="py-2.5 px-3 font-sans">
                    <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span>{sector.name}</span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">{sector.indexSymbol}</div>
                  </td>

                  {/* 3. Direction */}
                  <td className="py-2.5 px-3 text-center font-sans">
                    {getDirectionVisual(sector.direction)}
                  </td>

                  {/* 4. Score */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100 w-6">
                        {sector.score}
                      </span>
                      <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            sector.score >= 70
                              ? 'bg-emerald-500'
                              : sector.score >= 50
                              ? 'bg-indigo-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${sector.score}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* 5. Avg % Change */}
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
                        isUp
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isUp ? '+' : ''}
                      {sector.avgChangePercent.toFixed(2)}%
                    </span>
                  </td>

                  {/* 6. Total Stocks */}
                  <td className="py-2.5 px-3 text-center font-bold text-slate-800 dark:text-slate-200">
                    {sector.totalStocks}
                  </td>

                  {/* 7. Positive Stocks */}
                  <td className="py-2.5 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                    {sector.positiveStocks}
                  </td>

                  {/* 8. Negative Stocks */}
                  <td className="py-2.5 px-3 text-center font-bold text-rose-600 dark:text-rose-400">
                    {sector.negativeStocks}
                  </td>

                  {/* 9. Bullish % */}
                  <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400 font-semibold">
                    {sector.bullishPercent}%
                  </td>

                  {/* 10. Bearish % */}
                  <td className="py-2.5 px-3 text-right text-rose-600 dark:text-rose-400 font-semibold">
                    {sector.bearishPercent}%
                  </td>

                  {/* 11. Total Volume */}
                  <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">
                    {formatNumber(sector.totalVolume)}
                  </td>

                  {/* 12. Volume / Stock */}
                  <td className="py-2.5 px-3 text-right text-slate-500 dark:text-slate-400">
                    {formatNumber(sector.volumePerStock)}
                  </td>

                  {/* 13. Bullish Volume */}
                  <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400">
                    {formatNumber(sector.bullishVolume)}
                  </td>

                  {/* 14. Bearish Volume */}
                  <td className="py-2.5 px-3 text-right text-rose-600 dark:text-rose-400">
                    {formatNumber(sector.bearishVolume)}
                  </td>

                  {/* 15. Bullish Vol % */}
                  <td className="py-2.5 px-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                    {sector.bullishVolumePercent}%
                  </td>

                  {/* 16. Bearish Vol % */}
                  <td className="py-2.5 px-3 text-right font-semibold text-rose-600 dark:text-rose-400">
                    {sector.bearishVolumePercent}%
                  </td>

                  {/* 17. Bullish Rank */}
                  <td className="py-2.5 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                    #{sector.bullishRank}
                  </td>

                  {/* 18. Bearish Rank */}
                  <td className="py-2.5 px-3 text-center font-bold text-rose-600 dark:text-rose-400">
                    #{sector.bearishRank}
                  </td>

                  {/* Action drilldown chevron */}
                  <td className="py-2.5 px-2 text-center font-sans">
                    <button
                      type="button"
                      className="p-1 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      title="Drill down into sector stocks"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

