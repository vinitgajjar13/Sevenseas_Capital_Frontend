import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Globe, Filter, TrendingUp, TrendingDown, X, ArrowRight } from 'lucide-react';
import { StockRadarItem } from '../../types';
import { formatINR } from '../../data/mockData';

interface GlobalMarketSearchProps {
  stocks: StockRadarItem[];
  onSelectStock: (stock: StockRadarItem) => void;
  className?: string;
}

export const GlobalMarketSearch: React.FC<GlobalMarketSearchProps> = ({
  stocks,
  onSelectStock,
  className = '',
}) => {
  const [query, setQuery] = useState<string>('');
  const [searchScope, setSearchScope] = useState<'GLOBAL' | 'MARKET'>('GLOBAL');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filter stocks based on query and search scope
  const filteredStocks = useMemo(() => {
    if (!query.trim()) return [];

    const lower = query.toLowerCase().trim();
    let pool = stocks;

    // In Market scope, prioritize stocks in top active slots or leading sectors
    if (searchScope === 'MARKET') {
      pool = stocks.filter((s) => s.slot.includes('Slot 1') || s.slot.includes('Slot 2') || Math.abs(s.changePercent) >= 1.0);
    }

    return pool
      .filter((s) => s.symbol.toLowerCase().includes(lower) || s.name.toLowerCase().includes(lower) || s.sector.toLowerCase().includes(lower))
      .slice(0, 8);
  }, [stocks, query, searchScope]);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Bar Container */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs focus-within:border-indigo-500 dark:focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/15 transition-all">
        {/* Scope Toggle: Global vs Market */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => setSearchScope('GLOBAL')}
            className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all cursor-pointer ${
              searchScope === 'GLOBAL'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title="Search entire stock universe"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Global</span>
          </button>

          <button
            type="button"
            onClick={() => setSearchScope('MARKET')}
            className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all cursor-pointer ${
              searchScope === 'MARKET'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title="Filter within active market momentum stocks"
          >
            <Filter className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Market</span>
          </button>
        </div>

        {/* Input Field */}
        <div className="flex-1 flex items-center gap-2 px-2 min-w-0">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={
              searchScope === 'GLOBAL'
                ? 'Global Search: RELIANCE, INFY, Auto, IT...'
                : 'Market Search: Active breakout stocks & movers...'
            }
            className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
            aria-label="Stock search input"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setIsOpen(false);
              }}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Instant Results Dropdown */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span>
              {searchScope === 'GLOBAL' ? 'Global Stocks' : 'Market Radar'} ({filteredStocks.length} results)
            </span>
            <span className="font-mono text-[9px] lowercase">click to open detail chart</span>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredStocks.length > 0 ? (
              filteredStocks.map((stock) => {
                const isUp = stock.changePercent >= 0;
                return (
                  <button
                    key={stock.id}
                    onClick={() => {
                      onSelectStock(stock);
                      setIsOpen(false);
                      setQuery('');
                    }}
                    className="w-full flex items-center justify-between p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs sm:text-sm font-mono text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {stock.symbol}
                          </span>
                          <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {stock.sector}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                          {stock.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="font-bold font-mono text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                          {formatINR(stock.ltp)}
                        </div>
                        <div
                          className={`flex items-center justify-end gap-0.5 text-[11px] font-bold font-mono ${
                            isUp
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          <span>
                            {isUp ? '+' : ''}
                            {stock.changePercent.toFixed(2)}%
                          </span>
                        </div>
                      </div>

                      <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                No stocks matching "{query}" in {searchScope.toLowerCase()} scope.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

