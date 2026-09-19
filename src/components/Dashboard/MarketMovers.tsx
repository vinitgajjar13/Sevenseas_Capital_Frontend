import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  ArrowUpDown,
  Search,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { MarketMoverCategory, MarketMoverStock } from '../../types';
import { formatINR, formatNumber } from '../../data/mockData';
import {
  MOCK_MOVERS_GAINERS,
  MOCK_MOVERS_LOSERS,
  MOCK_MOVERS_MOST_ACTIVE,
  MOCK_MOVERS_VOLUME,
} from '../../data/mock/movers';

interface MarketMoversProps {
  onSelectStock: (symbol: string) => void;
}

type SortField = 'symbol' | 'price' | 'changePercent' | 'volume';
type SortDirection = 'asc' | 'desc';

export const MarketMovers: React.FC<MarketMoversProps> = ({ onSelectStock }) => {
  const [activeTab, setActiveTab] = useState<MarketMoverCategory>('GAINERS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [sortField, setSortField] = useState<SortField>('changePercent');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');
  const [rowLimit, setRowLimit] = useState<number>(6);

  // Tab definitions
  const tabs: { id: MarketMoverCategory; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'GAINERS', label: 'Top Gainers', icon: TrendingUp },
    { id: 'LOSERS', label: 'Top Losers', icon: TrendingDown },
    { id: 'MOST_ACTIVE', label: 'Most Active', icon: Activity },
    { id: 'VOLUME', label: 'Volume Buzzers', icon: BarChart3 },
  ];

  // Base data source per tab
  const rawData: MarketMoverStock[] = useMemo(() => {
    switch (activeTab) {
      case 'GAINERS':
        return MOCK_MOVERS_GAINERS;
      case 'LOSERS':
        return MOCK_MOVERS_LOSERS;
      case 'MOST_ACTIVE':
        return MOCK_MOVERS_MOST_ACTIVE;
      case 'VOLUME':
        return MOCK_MOVERS_VOLUME;
      default:
        return MOCK_MOVERS_GAINERS;
    }
  }, [activeTab]);

  // Sector list from current dataset
  const sectors = useMemo(() => {
    const set = new Set<string>();
    rawData.forEach((item) => set.add(item.sector));
    return ['ALL', ...Array.from(set)];
  }, [rawData]);

  // Filter & Sort
  const processedData = useMemo(() => {
    return rawData
      .filter((item) => {
        const matchesQuery =
          item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSector = selectedSector === 'ALL' || item.sector === selectedSector;
        return matchesQuery && matchesSector;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'symbol') diff = a.symbol.localeCompare(b.symbol);
        else if (sortField === 'price') diff = a.price - b.price;
        else if (sortField === 'changePercent') diff = a.changePercent - b.changePercent;
        else if (sortField === 'volume') diff = a.volume - b.volume;
        return sortDir === 'asc' ? diff : -diff;
      });
  }, [rawData, searchQuery, selectedSector, sortField, sortDir]);

  const displayedData = processedData.slice(0, rowLimit);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  return (
    <section id="market-movers-section" aria-label="Market Movers" className="w-full">
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        {/* Header: Title + Category Segmented Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-slate-50 font-mono">
                Market Movers
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Live Breadth
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Momentum leaders, value leaders, and volume breakouts across Indian equities
            </p>
          </div>

          {/* Segmented Category Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSearchQuery('');
                    setSelectedSector('ALL');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      tab.id === 'GAINERS'
                        ? 'text-emerald-500'
                        : tab.id === 'LOSERS'
                        ? 'text-rose-500'
                        : 'text-indigo-500'
                    }`}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Controls Bar: Search + Sector Filter + Rows Toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 py-3 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search symbol or company..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Sector Dropdown */}
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1">
              <Filter className="w-3 h-3 text-slate-400" />
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="bg-transparent text-xs text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                {sectors.map((sec) => (
                  <option key={sec} value={sec} className="bg-white dark:bg-slate-800">
                    {sec === 'ALL' ? 'All Sectors' : sec}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row limit toggle */}
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 self-end sm:self-auto font-mono">
            <span>Show:</span>
            {[6, 8, 12].map((count) => (
              <button
                key={count}
                onClick={() => setRowLimit(count)}
                className={`px-2 py-0.5 rounded text-xs font-semibold cursor-pointer ${
                  rowLimit === count
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        {/* DESKTOP / TABLET: Table View */}
        <div className="hidden md:block overflow-x-auto mt-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
                <th
                  onClick={() => handleSort('symbol')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Stock</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="py-2.5 px-3">Sector</th>
                <th
                  onClick={() => handleSort('price')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>LTP</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('changePercent')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Change (%)</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('volume')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Volume</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-right">Turnover</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {displayedData.length > 0 ? (
                displayedData.map((item) => {
                  const isUp = item.change >= 0;
                  return (
                    <tr
                      key={item.id}
                      onClick={() => onSelectStock(item.symbol)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    >
                      {/* Stock Symbol + Name */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {item.symbol}
                          </span>
                          <span className="text-[11px] text-slate-400 font-sans truncate max-w-[180px]">
                            {item.name}
                          </span>
                        </div>
                      </td>

                      {/* Sector Badge */}
                      <td className="py-3 px-3">
                        <span className="text-[11px] font-sans font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {item.sector}
                        </span>
                      </td>

                      {/* LTP */}
                      <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                        {formatINR(item.price)}
                      </td>

                      {/* Point Change & % Change */}
                      <td className="py-3 px-3 text-right tabular-nums">
                        <span
                          className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded ${
                            isUp
                              ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
                              : 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60'
                          }`}
                        >
                          {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          <span>
                            {isUp ? '+' : ''}
                            {item.change.toFixed(2)} ({isUp ? '+' : ''}
                            {item.changePercent.toFixed(2)}%)
                          </span>
                        </span>
                      </td>

                      {/* Volume */}
                      <td className="py-3 px-3 text-right font-medium text-slate-600 dark:text-slate-400 tabular-nums">
                        {formatNumber(item.volume)}
                      </td>

                      {/* Turnover (Cr) */}
                      <td className="py-3 px-3 text-right font-medium text-slate-500 dark:text-slate-400 tabular-nums">
                        ₹{item.turnover ? item.turnover.toFixed(1) : '—'} Cr
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          className="inline-flex items-center gap-0.5 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-600 group-hover:text-white text-slate-700 dark:text-slate-300 transition-all font-sans font-bold text-[11px]"
                        >
                          <span>Chart</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-slate-400">
                    No mover stocks found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE: Responsive Hybrid Cards */}
        <div className="block md:hidden mt-3 space-y-2.5">
          {displayedData.length > 0 ? (
            displayedData.map((item) => {
              const isUp = item.change >= 0;
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectStock(item.symbol)}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 active:scale-[0.99] transition-transform cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm font-mono text-slate-900 dark:text-slate-100">
                          {item.symbol}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {item.sector}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block max-w-[200px]">
                        {item.name}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="font-bold font-mono text-sm text-slate-900 dark:text-slate-100">
                        {formatINR(item.price)}
                      </div>
                      <span
                        className={`inline-flex items-center gap-0.5 text-[11px] font-bold font-mono px-1.5 py-0.5 rounded ${
                          isUp
                            ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/70'
                            : 'text-rose-700 dark:text-rose-400 bg-rose-100/70 dark:bg-rose-950/70'
                        }`}
                      >
                        {isUp ? '+' : ''}
                        {item.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    <span>Vol: {formatNumber(item.volume)}</span>
                    <span>Range: ₹{item.dayLow.toFixed(0)} - ₹{item.dayHigh.toFixed(0)}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 text-xs text-slate-400">
              No mover stocks matching filters.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

