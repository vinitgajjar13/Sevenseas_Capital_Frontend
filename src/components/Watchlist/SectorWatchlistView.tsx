import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  Layers,
  ChevronDown,
  ChevronUp,
  X,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookmarkPlus,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import {
  WatchlistStockItem,
  WatchlistSortField,
  WatchlistSortOrder,
  StockRadarItem,
} from '../../types';
import {
  searchMasterStockUniverse,
  resolveStockSector,
  MasterStockEntry,
  getInitialWatchlist,
  watchlistToStockRadarItem,
} from '../../data/mock/watchlistData';
import { WatchlistStockCard } from './WatchlistStockCard';
import { formatINR } from '../../data/mockData';

interface SectorWatchlistViewProps {
  watchlistStocks: WatchlistStockItem[];
  onSelectStock: (stock: StockRadarItem) => void;
  onAddStock: (stockEntry: MasterStockEntry) => boolean;
  onRemoveStock: (symbol: string) => void;
  onResetDefaultWatchlist: () => void;
  existingRadarList?: StockRadarItem[];
}

export const SectorWatchlistView: React.FC<SectorWatchlistViewProps> = ({
  watchlistStocks,
  onSelectStock,
  onAddStock,
  onRemoveStock,
  onResetDefaultWatchlist,
  existingRadarList = [],
}) => {
  // Search & Filter state within Watchlist
  const [filterQuery, setFilterQuery] = useState<string>('');

  // Sorting state within sectors
  const [sortField, setSortField] = useState<WatchlistSortField>('changePercent');
  const [sortOrder, setSortOrder] = useState<WatchlistSortOrder>('desc');

  // Add Stock Dialog / Autocomplete State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [addSearchQuery, setAddSearchQuery] = useState<string>('');
  const [addFeedback, setAddFeedback] = useState<{ type: 'success' | 'warning'; message: string } | null>(null);

  // Collapsed sectors set
  const [collapsedSectors, setCollapsedSectors] = useState<Set<string>>(new Set());

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus add input when modal opens
  useEffect(() => {
    if (isAddModalOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
      setAddFeedback(null);
    }
  }, [isAddModalOpen]);

  // Toggle single sector collapse
  const toggleSectorCollapse = (sectorName: string) => {
    setCollapsedSectors((prev) => {
      const next = new Set(prev);
      if (next.has(sectorName)) {
        next.delete(sectorName);
      } else {
        next.add(sectorName);
      }
      return next;
    });
  };

  // Expand all or collapse all sectors
  const handleExpandAll = () => setCollapsedSectors(new Set());
  const handleCollapseAll = () => {
    const allSectors = new Set(watchlistStocks.map((s) => s.sector));
    setCollapsedSectors(allSectors);
  };

  // Available stocks for Add search dropdown
  const searchResults = useMemo(() => {
    return searchMasterStockUniverse(addSearchQuery);
  }, [addSearchQuery]);

  // Set of already added symbols for O(1) duplicate check
  const addedSymbolsSet = useMemo(() => {
    return new Set(watchlistStocks.map((s) => s.symbol.toUpperCase()));
  }, [watchlistStocks]);

  // Handle adding stock
  const handleSelectToAdd = (entry: MasterStockEntry) => {
    if (addedSymbolsSet.has(entry.symbol.toUpperCase())) {
      setAddFeedback({
        type: 'warning',
        message: `${entry.symbol} is already in your Watchlist under ${entry.sector}.`,
      });
      return;
    }

    const added = onAddStock(entry);
    if (added) {
      setAddFeedback({
        type: 'success',
        message: `Added ${entry.symbol} to ${entry.sector}!`,
      });
      // Clear search query after brief delay or keep open for multiple additions
      setTimeout(() => {
        setAddSearchQuery('');
        setAddFeedback(null);
      }, 1400);
    }
  };

  // Filtered & Grouped Watchlist Data
  const { sectorGroups, totalFilteredCount } = useMemo(() => {
    const query = filterQuery.toLowerCase().trim();

    // 1. Filter stocks
    const filtered = watchlistStocks.filter(
      (stk) =>
        stk.symbol.toLowerCase().includes(query) ||
        stk.name.toLowerCase().includes(query) ||
        stk.sector.toLowerCase().includes(query)
    );

    // 2. Group by sector
    const groupsMap = new Map<string, WatchlistStockItem[]>();
    filtered.forEach((stk) => {
      const sector = stk.sector || resolveStockSector(stk.symbol);
      const existing = groupsMap.get(sector) || [];
      existing.push(stk);
      groupsMap.set(sector, existing);
    });

    // 3. Sort stocks inside each sector group
    const groups: {
      sectorName: string;
      stocks: WatchlistStockItem[];
      avgChangePercent: number;
      gainersCount: number;
      losersCount: number;
    }[] = [];

    groupsMap.forEach((stocks, sectorName) => {
      const sortedStocks = [...stocks].sort((a, b) => {
        let cmp = 0;
        if (sortField === 'symbol') {
          cmp = a.symbol.localeCompare(b.symbol);
        } else if (sortField === 'name') {
          cmp = a.name.localeCompare(b.name);
        } else if (sortField === 'price') {
          cmp = a.ltp - b.ltp;
        } else if (sortField === 'changePercent') {
          cmp = a.changePercent - b.changePercent;
        }
        return sortOrder === 'asc' ? cmp : -cmp;
      });

      const totalChange = sortedStocks.reduce((acc, s) => acc + s.changePercent, 0);
      const avgChangePercent = +(totalChange / sortedStocks.length).toFixed(2);
      const gainersCount = sortedStocks.filter((s) => s.changePercent >= 0).length;
      const losersCount = sortedStocks.length - gainersCount;

      groups.push({
        sectorName,
        stocks: sortedStocks,
        avgChangePercent,
        gainersCount,
        losersCount,
      });
    });

    // 4. Sort sector groups alphabetically by sector name
    groups.sort((a, b) => a.sectorName.localeCompare(b.sectorName));

    return {
      sectorGroups: groups,
      totalFilteredCount: filtered.length,
    };
  }, [watchlistStocks, filterQuery, sortField, sortOrder]);

  return (
    <section id="sector-watchlist-section" className="space-y-4">
      {/* 1. Header Toolbar & Quick Actions */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Section Title & Counters */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Sector-Organized Watchlist
                </h2>
                <span className="text-xs font-semibold font-mono px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {watchlistStocks.length} Stocks
                </span>
                <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {sectorGroups.length} Sectors
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Stocks automatically resolve and group by sector. No manual assignment required.
              </p>
            </div>
          </div>

          {/* Add Stock Button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs hover:shadow-indigo-500/20 cursor-pointer shrink-0"
            title="Search and add a stock to your watchlist"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stock</span>
          </button>
        </div>

        {/* Filters & Sorting Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 pt-1 border-t border-slate-100 dark:border-slate-800/80">
          {/* Search within Watchlist */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter watchlist (e.g. RELIANCE, IT, Bank)..."
              className="w-full pl-8 pr-8 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
            />
            {filterQuery && (
              <button
                type="button"
                onClick={() => setFilterQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title="Clear filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Controls: Sorting + Expand/Collapse */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Intra-sector Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hidden sm:inline">
                Sort:
              </span>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as WatchlistSortField)}
                className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                title="Sort stocks inside each sector"
              >
                <option value="changePercent">% Change</option>
                <option value="price">LTP (Price)</option>
                <option value="symbol">Stock Symbol</option>
                <option value="name">Company Name</option>
              </select>

              <button
                type="button"
                onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                title={sortOrder === 'asc' ? 'Ascending (click for Descending)' : 'Descending (click for Ascending)'}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Expand / Collapse All */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleExpandAll}
                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-medium text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title="Expand all sector groups"
              >
                Expand All
              </button>
              <button
                type="button"
                onClick={handleCollapseAll}
                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-medium text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title="Collapse all sector groups"
              >
                Collapse All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sector Groups Display */}
      {sectorGroups.length > 0 ? (
        <div className="space-y-4">
          {sectorGroups.map((group) => {
            const isCollapsed = collapsedSectors.has(group.sectorName);
            const isSectorPositive = group.avgChangePercent >= 0;

            return (
              <div
                key={group.sectorName}
                id={`sector-group-${group.sectorName.toLowerCase().replace(/\s+/g, '-')}`}
                className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden transition-all"
              >
                {/* Sector Header (Clickable for Expand / Collapse) */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleSectorCollapse(group.sectorName)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleSectorCollapse(group.sectorName);
                    }
                  }}
                  className="flex items-center justify-between p-3.5 sm:px-4 bg-slate-50/80 dark:bg-slate-850/90 border-b border-slate-200/80 dark:border-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-colors cursor-pointer select-none"
                  title={`${isCollapsed ? 'Expand' : 'Collapse'} ${group.sectorName} sector`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                      {group.sectorName}
                    </h3>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {group.stocks.length} {group.stocks.length === 1 ? 'Stock' : 'Stocks'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Sector Average % Change Badge */}
                    <div
                      className={`hidden sm:flex items-center gap-1 text-xs font-mono font-semibold px-2 py-0.5 rounded-md ${
                        isSectorPositive
                          ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {isSectorPositive ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span>
                        Avg {isSectorPositive ? '+' : ''}
                        {group.avgChangePercent}%
                      </span>
                    </div>

                    {/* Expand/Collapse Chevron */}
                    <div className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                      {isCollapsed ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronUp className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Sector Stocks List */}
                {!isCollapsed && (
                  <div className="p-3 sm:p-4 space-y-2">
                    {group.stocks.map((stock) => (
                      <WatchlistStockCard
                        key={stock.symbol}
                        stock={stock}
                        onSelectStock={(stk) => {
                          const radarItem = watchlistToStockRadarItem(stk, existingRadarList);
                          onSelectStock(radarItem);
                        }}
                        onRemoveStock={onRemoveStock}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : watchlistStocks.length === 0 ? (
        // 3. Full Empty State (Zero stocks in entire watchlist)
        <div
          id="watchlist-empty-state"
          className="p-8 sm:p-12 text-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4"
        >
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
            <BookmarkPlus className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              No stocks in your watchlist
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Search and add stocks to automatically organize them by sector.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Search & Add Stocks</span>
            </button>
            <button
              type="button"
              onClick={onResetDefaultWatchlist}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Populate with RELIANCE, TCS, INFY, HDFCBANK, SBIN, ONGC"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Load Sample Stocks</span>
            </button>
          </div>
        </div>
      ) : (
        // 4. Search Filter Empty State (Stocks exist, but query matches none)
        <div
          id="watchlist-filter-empty"
          className="p-8 text-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3"
        >
          <div className="w-10 h-10 mx-auto rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
            <Search className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              No stocks matched "{filterQuery}"
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Try searching by symbol (e.g. INFY), company name, or sector name.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFilterQuery('')}
            className="px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            Clear Search Filter
          </button>
        </div>
      )}

      {/* 5. ADD STOCK MODAL DIALOG */}
      {isAddModalOpen && (
        <div
          id="add-stock-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            id="add-stock-modal-card"
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Add Stock to Watchlist
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Select any stock to automatically categorize it into its sector.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Search Input */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="relative">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={addSearchQuery}
                  onChange={(e) => setAddSearchQuery(e.target.value)}
                  placeholder="Search symbol, company name or sector (e.g. RELIANCE, Auto, IT)..."
                  className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
                />
                {addSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setAddSearchQuery('')}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Status/Feedback Banner */}
              {addFeedback && (
                <div
                  className={`mt-2.5 p-2 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                    addFeedback.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  }`}
                >
                  {addFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  )}
                  <span>{addFeedback.message}</span>
                </div>
              )}
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60">
              {searchResults.length > 0 ? (
                searchResults.map((entry) => {
                  const isAdded = addedSymbolsSet.has(entry.symbol.toUpperCase());
                  const isPositive = entry.changePercent >= 0;

                  return (
                    <div
                      key={entry.symbol}
                      onClick={() => !isAdded && handleSelectToAdd(entry)}
                      className={`flex items-center justify-between p-2.5 rounded-lg transition-colors select-none ${
                        isAdded
                          ? 'opacity-60 bg-slate-50/50 dark:bg-slate-850/40 cursor-default'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer'
                      }`}
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                            {entry.symbol}
                          </span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            {entry.sector}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {entry.name}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-white block">
                            {formatINR(entry.ltp)}
                          </span>
                          <span
                            className={`text-[11px] font-mono font-semibold ${
                              isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {isPositive ? '+' : ''}
                            {entry.changePercent.toFixed(2)}%
                          </span>
                        </div>

                        {isAdded ? (
                          <span className="text-[11px] font-semibold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            Added
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectToAdd(entry);
                            }}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white dark:bg-indigo-950 dark:hover:bg-indigo-600 dark:text-indigo-300 rounded text-xs font-bold transition-colors cursor-pointer"
                          >
                            + Add
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  {addSearchQuery ? (
                    <span>No stocks found matching "{addSearchQuery}"</span>
                  ) : (
                    <span>Type a stock symbol, company or sector to search</span>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{searchResults.length} stocks available in universe</span>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

