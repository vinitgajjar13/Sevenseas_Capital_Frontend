import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  ExternalLink,
  Target,
  ShieldAlert,
  Info,
} from 'lucide-react';
import {
  SectorAnalysisItem,
  SectorStockItem,
  SignalDirectionType,
  TradingSignalType,
} from '../../types';
import { formatINR, formatNumber } from '../../data/mockData';

interface SectorStockDrilldownProps {
  sector: SectorAnalysisItem | null;
  stocks: SectorStockItem[];
  onBack?: () => void;
  onSelectStock: (stock: SectorStockItem) => void;
}

type StockSortField =
  | 'symbol'
  | 'ltp'
  | 'changePercent'
  | 'capital'
  | 'volume'
  | 'signalDirection'
  | 'target1'
  | 'stopLoss';

export const SectorStockDrilldown: React.FC<SectorStockDrilldownProps> = ({
  sector,
  stocks,
  onBack,
  onSelectStock,
}) => {
  if (!sector) return null;
  const [searchQuery, setSearchQuery] = useState('');
  const [signalFilter, setSignalFilter] = useState<'ALL' | SignalDirectionType>('ALL');
  const [sortField, setSortField] = useState<StockSortField>('changePercent');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const handleSort = (field: StockSortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === 'symbol');
    }
  };

  const getSignalBadge = (dir: SignalDirectionType, action: TradingSignalType) => {
    let dirStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    let actionStyle = 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200';

    if (dir === 'Bullish') {
      dirStyle = 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      actionStyle = 'bg-emerald-600 text-white';
    } else if (dir === 'Bearish' || (dir as any) === 'Strong Bearish') {
      dirStyle = 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      actionStyle = 'bg-rose-600 text-white';
    }

    return (
      <div className="flex flex-col items-start gap-1">
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold rounded border ${dirStyle}`}>
          {dir === 'Bullish' ? (
            <TrendingUp className="w-3 h-3 text-emerald-500" />
          ) : dir === 'Bearish' ? (
            <TrendingDown className="w-3 h-3 text-rose-500" />
          ) : (
            <Minus className="w-3 h-3 text-slate-400" />
          )}
          <span>{dir}</span>
        </span>
        <span className={`px-1.5 py-0.2 text-[9px] font-mono font-bold rounded uppercase ${actionStyle}`}>
          {action}
        </span>
      </div>
    );
  };

  const filteredAndSortedStocks = useMemo(() => {
    let result = [...stocks];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
      );
    }

    if (signalFilter !== 'ALL') {
      result = result.filter((s) => s.signalDirection === signalFilter);
    }

    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }

      return 0;
    });

    return result;
  }, [stocks, searchQuery, signalFilter, sortField, sortAsc]);

  // Aggregate total capital allocated in this sector
  const totalAllocatedCapital = useMemo(() => {
    return stocks.reduce((acc, s) => acc + (s.capital || 0), 0);
  }, [stocks]);

  return (
    <div id="sector-stock-drilldown" className="space-y-3 animate-in fade-in duration-150">
      {/* Sector Header Strip */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Return to Sector Overview"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Sectors</span>
          </button>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                {sector.name}
              </h2>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {sector.indexSymbol}
              </span>
              <span
                className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                  sector.avgChangePercent >= 0
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                }`}
              >
                {sector.avgChangePercent >= 0 ? '+' : ''}
                {sector.avgChangePercent.toFixed(2)}%
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Rank #{sector.overallRank} • RS Score: {sector.score}/100 • Total Allocated Capital:{' '}
              <strong className="text-slate-900 dark:text-slate-100 font-mono">
                {formatINR(totalAllocatedCapital)}
              </strong>
            </p>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stock symbol..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-indigo-400 w-44 sm:w-48"
            />
          </div>

          {/* Direction / Sentiment Filter */}
          <select
            value={signalFilter}
            onChange={(e) => setSignalFilter(e.target.value as any)}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Signals</option>
            <option value="Bullish">Bullish Signals</option>
            <option value="Neutral">Neutral Signals</option>
            <option value="Bearish">Bearish Signals</option>
          </select>
        </div>
      </div>

      {/* Stock Table with all 13 Required Fields */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 select-none">
                {/* 1. Symbol & Name */}
                <th
                  onClick={() => handleSort('symbol')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Symbol</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                {/* 2. Current Price (LTP) */}
                <th
                  onClick={() => handleSort('ltp')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white whitespace-nowrap text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Current Price</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                {/* 3. Low */}
                <th className="py-2.5 px-3 text-right text-rose-600 dark:text-rose-400 whitespace-nowrap">
                  Low
                </th>

                {/* 4. High */}
                <th className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                  High
                </th>

                {/* 5. Capital (Allocated trading capital) */}
                <th
                  onClick={() => handleSort('capital')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white whitespace-nowrap text-right text-indigo-600 dark:text-indigo-400"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Capital</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                {/* 6. Volume */}
                <th
                  onClick={() => handleSort('volume')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white whitespace-nowrap text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Volume</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                {/* 7. Signal (Direction + Trading Signal) */}
                <th
                  onClick={() => handleSort('signalDirection')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Signal</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                {/* Entry (Neutral) */}
                <th className="py-2.5 px-2 text-right text-slate-600 dark:text-slate-300 whitespace-nowrap font-mono">
                  Entry
                </th>

                {/* 8. Target 1 (Positive) */}
                <th className="py-2.5 px-2 text-right text-emerald-600 dark:text-emerald-400 whitespace-nowrap font-mono">
                  Target 1
                </th>

                {/* 9. Target 2 (Positive) */}
                <th className="py-2.5 px-2 text-right text-emerald-600 dark:text-emerald-400 whitespace-nowrap font-mono">
                  Target 2
                </th>

                {/* 10. Target 3 (Positive) */}
                <th className="py-2.5 px-2 text-right text-emerald-600 dark:text-emerald-400 whitespace-nowrap font-mono">
                  Target 3
                </th>

                {/* 11. Target 4 / Trailing Target (Positive) */}
                <th className="py-2.5 px-2 text-right text-emerald-700 dark:text-emerald-300 whitespace-nowrap font-mono">
                  Target 4 (Trail)
                </th>

                {/* 12. Stop Loss (Negative) */}
                <th className="py-2.5 px-2 text-right text-rose-600 dark:text-rose-400 whitespace-nowrap font-mono">
                  Stop Loss
                </th>

                {/* 13. Comment */}
                <th className="py-2.5 px-3 min-w-[220px]">
                  Analysis Comment
                </th>

                <th className="py-2.5 px-2 text-center">Chart</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800 font-mono">
              {filteredAndSortedStocks.map((stock) => {
                const isUp = stock.changePercent >= 0;

                return (
                  <tr
                    key={stock.id}
                    onClick={() => onSelectStock(stock)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    {/* 1. Symbol & Name */}
                    <td className="py-2.5 px-3 font-sans">
                      <div className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <span className="font-mono text-xs">{stock.symbol}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                        {stock.name}
                      </div>
                    </td>

                    {/* 2. Current Price (LTP) & Change % */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                        ₹{stock.ltp.toFixed(2)}
                      </div>
                      <div
                        className={`text-[10px] font-semibold ${
                          isUp
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isUp ? '+' : ''}
                        {stock.change.toFixed(2)} ({isUp ? '+' : ''}
                        {stock.changePercent.toFixed(2)}%)
                      </div>
                    </td>

                    {/* 3. Low */}
                    <td className="py-2.5 px-3 text-right text-rose-600 dark:text-rose-400">
                      ₹{stock.low.toFixed(2)}
                    </td>

                    {/* 4. High */}
                    <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400">
                      ₹{stock.high.toFixed(2)}
                    </td>

                    {/* 5. Capital (Allocated Capital) */}
                    <td className="py-2.5 px-3 text-right font-bold text-indigo-700 dark:text-indigo-400">
                      {formatINR(stock.capital)}
                    </td>

                    {/* 6. Volume */}
                    <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-300">
                      {formatNumber(stock.volume)}
                    </td>

                    {/* 7. Signal (Direction + Trading Signal) */}
                    <td className="py-2.5 px-3 font-sans">
                      {getSignalBadge(stock.signalDirection, stock.tradingSignal)}
                    </td>

                    {/* Entry (Neutral) */}
                    <td className="py-2.5 px-2 text-right font-semibold text-slate-700 dark:text-slate-300">
                      ₹{stock.entryPrice.toFixed(2)}
                    </td>

                    {/* 8. Target 1 (Positive) */}
                    <td className="py-2.5 px-2 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{stock.target1.toFixed(2)}
                    </td>

                    {/* 9. Target 2 (Positive) */}
                    <td className="py-2.5 px-2 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{stock.target2.toFixed(2)}
                    </td>

                    {/* 10. Target 3 (Positive) */}
                    <td className="py-2.5 px-2 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{stock.target3.toFixed(2)}
                    </td>

                    {/* 11. Target 4 / Trailing Target (Positive) */}
                    <td className="py-2.5 px-2 text-right font-bold text-emerald-700 dark:text-emerald-300">
                      ₹{stock.target4.toFixed(2)}
                    </td>

                    {/* 12. Stop Loss (Negative) */}
                    <td className="py-2.5 px-2 text-right font-bold text-rose-600 dark:text-rose-400">
                      ₹{stock.stopLoss.toFixed(2)}
                    </td>

                    {/* 13. Comment (Actual stock analysis commentary) */}
                    <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-300 text-[11px] leading-snug">
                      {stock.comment}
                    </td>

                    {/* Action */}
                    <td className="py-2.5 px-2 text-center font-sans">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectStock(stock);
                        }}
                        className="p-1 rounded-md text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                        title="Open Interactive Candlestick Chart"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

