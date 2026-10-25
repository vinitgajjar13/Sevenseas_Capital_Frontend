import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Download,
  CheckCircle2,
  AlertTriangle,
  Eye,
  X,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { StockRadarItem, StockStatus, SlotBucket } from '../../types';
import { formatINR, formatNumber, exportRadarToCSV } from '../../utils/formatters';
import { detectCandlestickPattern, calculateSupportResistance } from '../../utils/technicalPatterns';
import { getFloatAndLiquidity } from '../../utils/liquidityMetrics';
import {
  getStockClassification,
  sortStocksByDynamicMarketState,
  sortStocksByChangePercent,
  getGroupedMarketStateStocks,
  MarketClassification,
} from '../../utils/stockRanking';

// Tiny Recharts Inline Sparkline
const RechartsSparkline: React.FC<{ data?: { price: number }[]; isUp: boolean }> = ({ data, isUp }) => {
  if (!data || data.length === 0) return <span className="text-slate-300">-</span>;
  const strokeColor = isUp ? '#10b981' : '#f43f5e';

  return (
    <div className="w-16 h-5 inline-block shrink-0" title="Intraday Trend Line">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <Line
            type="monotone"
            dataKey="price"
            stroke={strokeColor}
            strokeWidth={1.8}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

interface StockRadarTableProps {
  stocks: StockRadarItem[];
  onSelectStock: (stock: StockRadarItem) => void;
  onSelectForecast?: (stock: StockRadarItem) => void;
  onSimulateTrade?: (stock: StockRadarItem) => void;
  onSimulateStateTransition?: () => void;
  priceType?: 'LIVE' | 'LAST_CLOSE';
  marketStatus?: 'OPEN' | 'CLOSED';
}

export const StockRadarTable: React.FC<StockRadarTableProps> = ({
  stocks,
  onSelectStock,
  onSelectForecast,
  onSimulateTrade,
  onSimulateStateTransition,
  priceType,
  marketStatus,
}) => {
  // Primary Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [sentimentFilter, setSentimentFilter] = useState<'ALL' | 'BULL' | 'NEUTRAL' | 'BEAR' | 'WATCH' | 'SPIKE_DUMP'>('ALL');

  // Secondary Collapsible Filters
  const [showSecondaryFilters, setShowSecondaryFilters] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string>('ALL');
  const [minScore, setMinScore] = useState<number>(0);
  const [minRvol, setMinRvol] = useState<number>(0);
  const [selectedPattern, setSelectedPattern] = useState<string>('ALL');

  // Table View & Sorting (Default to Change % descending to reflect live market momentum ranking)
  const [sortBy, setSortBy] = useState<'changePercent' | 'rank' | 'score' | 'rvol' | 'ltp'>('changePercent');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isCompact, setIsCompact] = useState<boolean>(false);
  const [showLiquidityColumn, setShowLiquidityColumn] = useState<boolean>(true);

  // Grouped and ranked statistics for the entire stock radar
  const groupedRadarStats = useMemo(() => {
    return getGroupedMarketStateStocks(stocks);
  }, [stocks]);

  // Strategy Watch and Spike/Dump counts from backend
  const watchCount = useMemo(() => {
    return stocks.filter((s) => s.bullishWatch || s.bearishWatch || (s.watchStatus && s.watchStatus.includes('WATCH'))).length;
  }, [stocks]);

  const spikeDumpCount = useMemo(() => {
    return stocks.filter((s) => s.signal && (s.signal.includes('SPIKE') || s.signal.includes('DUMP'))).length;
  }, [stocks]);

  // Extract unique sectors
  const sectors = useMemo(() => {
    const set = new Set(stocks.map((s) => s.sector));
    return ['ALL', ...Array.from(set)];
  }, [stocks]);

  // Active secondary filters count
  const activeSecondaryCount = useMemo(() => {
    let count = 0;
    if (selectedSlot !== 'ALL') count++;
    if (minScore > 0) count++;
    if (minRvol > 0) count++;
    if (selectedPattern !== 'ALL') count++;
    return count;
  }, [selectedSlot, minScore, minRvol, selectedPattern]);

  const resetAllFilters = () => {
    setSearchTerm('');
    setSelectedSector('ALL');
    setSentimentFilter('ALL');
    setSelectedSlot('ALL');
    setMinScore(0);
    setMinRvol(0);
    setSelectedPattern('ALL');
  };

  // Filter and dynamically sort stocks based on the active ranking mode
  const filteredStocks = useMemo(() => {
    const result = stocks.filter((stock) => {
      const matchesSearch =
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.sector.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSector = selectedSector === 'ALL' || stock.sector === selectedSector;

      // Sentiment / Market Classification: BULLISH, NEUTRAL, BEARISH, WATCH, SPIKE_DUMP
      const classification = stock.marketClassification || getStockClassification(stock);
      const isWatch = Boolean(stock.bullishWatch || stock.bearishWatch || (stock.watchStatus && stock.watchStatus.includes('WATCH')));
      const isSpikeDump = Boolean(stock.signal && (stock.signal.includes('SPIKE') || stock.signal.includes('DUMP')));

      const matchesSentiment =
        sentimentFilter === 'ALL'
          ? true
          : sentimentFilter === 'BULL'
          ? classification === 'BULLISH'
          : sentimentFilter === 'NEUTRAL'
          ? classification === 'NEUTRAL'
          : sentimentFilter === 'BEAR'
          ? classification === 'BEARISH'
          : sentimentFilter === 'WATCH'
          ? isWatch
          : isSpikeDump;

      // Slot
      const matchesSlot = selectedSlot === 'ALL' || stock.slot.includes(selectedSlot);

      // Score
      const matchesScore = stock.score >= minScore;

      // Volume RVol
      const matchesRvol = stock.rvol >= minRvol;

      // Pattern
      const pattern = detectCandlestickPattern(stock);
      const matchesPattern =
        selectedPattern === 'ALL' ||
        pattern.pattern.toUpperCase().includes(selectedPattern.toUpperCase());

      return (
        matchesSearch &&
        matchesSector &&
        matchesSentiment &&
        matchesSlot &&
        matchesScore &&
        matchesRvol &&
        matchesPattern
      );
    });

    // 1. Dynamic Change % Ranking (top gainers descending down to deepest losers)
    if (sortBy === 'changePercent') {
      return sortStocksByChangePercent(result, sortOrder === 'desc');
    }

    // 2. Dynamic Live Stock Ranking (Strategy State: Bullish -> Neutral -> Bearish)
    if (sortBy === 'rank') {
      const sorted = sortStocksByDynamicMarketState(result);
      return sortOrder === 'desc' ? sorted.reverse() : sorted;
    }

    // 3. User-selected column sorting with stable deterministic tie-breaker
    return [...result].sort((a, b) => {
      let diff = 0;
      if (sortBy === 'score') diff = (a.score || 0) - (b.score || 0);
      else if (sortBy === 'rvol') diff = (a.rvol || 0) - (b.rvol || 0);
      else if (sortBy === 'ltp') diff = (a.ltp || 0) - (b.ltp || 0);

      if (Math.abs(diff) > 0.0001) {
        return sortOrder === 'asc' ? diff : -diff;
      }
      return a.symbol.localeCompare(b.symbol);
    });
  }, [
    stocks,
    searchTerm,
    selectedSector,
    sentimentFilter,
    selectedSlot,
    minScore,
    minRvol,
    selectedPattern,
    sortBy,
    sortOrder,
  ]);

  // Track previous ranks per symbol for real-time rank delta indicator and row transitions
  const prevRankMapRef = React.useRef<Map<string, number>>(new Map());

  // Real-time rank changes (deltas) calculated immediately when filteredStocks order updates
  const rankDeltas = useMemo(() => {
    const deltas = new Map<string, number>();
    filteredStocks.forEach((stk, idx) => {
      const currentRank = idx + 1;
      const prev = prevRankMapRef.current.get(stk.symbol);
      if (prev !== undefined && prev !== currentRank) {
        deltas.set(stk.symbol, prev - currentRank); // positive = rose up, negative = dropped
      }
    });
    return deltas;
  }, [filteredStocks]);

  React.useEffect(() => {
    const nextMap = new Map<string, number>();
    filteredStocks.forEach((stk, idx) => {
      nextMap.set(stk.symbol, idx + 1);
    });
    prevRankMapRef.current = nextMap;
  }, [filteredStocks]);

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder(field === 'rank' ? 'asc' : 'desc');
    }
  };

  const getStatusBadge = (stock: StockRadarItem) => {
    const classification = stock.marketClassification || getStockClassification(stock);
    const hasRef = stock.hasReferenceData !== false;
    const isWatch = stock.bullishWatch || stock.bearishWatch || (stock.watchStatus && stock.watchStatus !== '-');
    const hasSignal = stock.signal && stock.signal !== '-' && stock.signal !== 'null';

    return (
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center justify-center gap-1 flex-wrap">
          <span
            className={`inline-flex items-center justify-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-extrabold font-mono tracking-wide shadow-2xs whitespace-nowrap ${
              classification === 'BULLISH'
                ? 'bg-emerald-600 text-white border border-emerald-700'
                : classification === 'NEUTRAL'
                ? 'bg-slate-600 text-white border border-slate-700'
                : 'bg-rose-600 text-white border border-rose-700'
            }`}
            title={`Market Classification: ${classification} (${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%)`}
          >
            <span>
              {classification === 'BULLISH'
                ? '▲'
                : classification === 'NEUTRAL'
                ? '■'
                : '▼'}
            </span>
            <span>{classification}</span>
          </span>

          {/* WATCH Badge */}
          {isWatch && (
            <span
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-black font-mono shadow-2xs whitespace-nowrap ${
                stock.bullishWatch || (stock.watchStatus && stock.watchStatus.includes('🟢'))
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                  : 'bg-rose-50 text-rose-800 border border-rose-300'
              }`}
              title={`Excel Strategy Watch Status: ${stock.watchStatus || (stock.bullishWatch ? 'BULLISH WATCH' : 'BEARISH WATCH')}`}
            >
              <span>{stock.watchStatus || (stock.bullishWatch ? '🟢 WATCH' : '🔴 WATCH')}</span>
            </span>
          )}

          {/* SPIKE / DUMP Signal Badge */}
          {hasSignal && (
            <span
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-black font-mono shadow-2xs whitespace-nowrap ${
                stock.signal?.includes('SPIKE')
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                  : 'bg-rose-100 text-rose-900 border border-rose-300 animate-pulse'
              }`}
              title={`Excel Strategy Signal: ${stock.signal}`}
            >
              <span>{stock.signal}</span>
            </span>
          )}

          {/* Missing Reference Data Indicator */}
          {!hasRef && (
            <span
              className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[8px] font-bold font-mono bg-slate-100 text-slate-600 border border-slate-300"
              title="Reference data (pd_high/pd_low/open_915) unavailable. Signals cannot be computed."
            >
              ⚠️ No Ref
            </span>
          )}
        </div>

        {/* Teacher Action Pill */}
        {stock.teacherAction && stock.teacherAction !== '-' && (
          <span
            className={`inline-flex items-center px-1.5 py-0.2 rounded text-[8px] font-black font-mono uppercase tracking-wider ${
              stock.teacherAction.includes('BULL')
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : stock.teacherAction.includes('BEAR')
                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                : stock.teacherAction.includes('CONFLICT')
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}
            title={`Teacher Alignment Action: ${stock.teacherAction}`}
          >
            {stock.teacherAction}
          </span>
        )}
      </div>
    );
  };

  return (
    <div id="stock-radar-container" className="space-y-3">
      {/* 13. CLEAN FILTER SYSTEM BAR */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* Primary Quick Filters (Search + Sector + Sentiment) */}
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Search Box */}
            <div className="relative w-48 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                id="input-radar-search"
                type="text"
                placeholder="Search symbol, sector..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-900"
              />
            </div>

            {/* Sector Dropdown */}
            <select
              id="select-radar-sector"
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-700 font-medium"
            >
              {sectors.map((sec) => (
                <option key={sec} value={sec}>
                  {sec === 'ALL' ? 'All Sectors' : sec}
                </option>
              ))}
            </select>

            {/* Dynamic Ranking Mode Dropdown */}
            <select
              id="select-radar-ranking-mode"
              value={sortBy}
              onChange={(e) => {
                const val = e.target.value as typeof sortBy;
                setSortBy(val);
                setSortOrder(val === 'rank' ? 'asc' : 'desc');
              }}
              className="px-2.5 py-1.5 text-xs bg-indigo-50/70 border border-indigo-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 text-indigo-950 font-bold"
              title="Select dynamic ranking and sorting mode"
            >
              <option value="changePercent">Rank: Change % (Top Gainers)</option>
              <option value="rank">Rank: Strategy State (Bull → Neutral → Bear)</option>
              <option value="score">Rank: Quant Strength</option>
              <option value="rvol">Rank: Volume Multiplier</option>
              <option value="ltp">Rank: Price (LTP)</option>
            </select>

            {/* Last Close indicator when market is closed */}
            {(priceType === 'LAST_CLOSE' || marketStatus === 'CLOSED') && (
              <span
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 text-[11px] font-bold font-mono whitespace-nowrap shadow-2xs"
                title="Indian markets are closed. Prices & ranking order reflect official Last Close."
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>LAST CLOSE</span>
              </span>
            )}

            {/* Quick Bullish / Neutral / Bearish / Watch / Spike-Dump Filter */}
            <div className="flex flex-wrap items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setSentimentFilter('ALL')}
                className={`px-2 py-1 rounded font-semibold transition-colors ${
                  sentimentFilter === 'ALL'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({stocks.length})
              </button>
              <button
                onClick={() => setSentimentFilter('BULL')}
                className={`px-2 py-1 rounded font-semibold transition-colors ${
                  sentimentFilter === 'BULL'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-emerald-700'
                }`}
              >
                Bull ({groupedRadarStats.bullish.length})
              </button>
              <button
                onClick={() => setSentimentFilter('NEUTRAL')}
                className={`px-2 py-1 rounded font-semibold transition-colors ${
                  sentimentFilter === 'NEUTRAL'
                    ? 'bg-slate-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Neutral ({groupedRadarStats.neutral.length})
              </button>
              <button
                onClick={() => setSentimentFilter('BEAR')}
                className={`px-2 py-1 rounded font-semibold transition-colors ${
                  sentimentFilter === 'BEAR'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-rose-700'
                }`}
              >
                Bear ({groupedRadarStats.bearish.length})
              </button>
              <button
                onClick={() => setSentimentFilter('WATCH')}
                className={`px-2 py-1 rounded font-semibold transition-colors ${
                  sentimentFilter === 'WATCH'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-amber-800'
                }`}
                title="Excel Strategy Watch Status (Bullish or Bearish Watch Triggered)"
              >
                Watch ({watchCount})
              </button>
              <button
                onClick={() => setSentimentFilter('SPIKE_DUMP')}
                className={`px-2 py-1 rounded font-semibold transition-colors ${
                  sentimentFilter === 'SPIKE_DUMP'
                    ? 'bg-purple-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-purple-800'
                }`}
                title="Excel Strategy Spike / Dump Signals"
              >
                Spike/Dump ({spikeDumpCount})
              </button>
            </div>

            {/* Test State Transition simulation button */}
            {onSimulateStateTransition && (
              <button
                onClick={onSimulateStateTransition}
                className="px-2.5 py-1 text-[11px] font-bold font-mono rounded-lg bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 shadow-2xs transition-colors flex items-center gap-1"
                title="Simulate a live market tick shifting a stock's classification to test automatic re-ranking"
              >
                <span>⚡</span>
                <span>Test Re-Rank</span>
              </button>
            )}

            {/* "Filters" Button to Toggle Secondary Drawer */}
            <button
              id="btn-toggle-filters"
              onClick={() => setShowSecondaryFilters(!showSecondaryFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                showSecondaryFilters || activeSecondaryCount > 0
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeSecondaryCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center font-bold font-mono">
                  {activeSecondaryCount}
                </span>
              )}
            </button>

            {activeSecondaryCount > 0 && (
              <button
                onClick={resetAllFilters}
                className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-0.5 cursor-pointer"
                title="Reset all filters"
              >
                <X className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Quick Actions (Export & Dense View) */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
              {filteredStocks.length} of {stocks.length} stocks
            </span>

            <button
              id="btn-radar-export"
              onClick={() => exportRadarToCSV(filteredStocks)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>CSV</span>
            </button>

            <button
              id="btn-toggle-compact"
              onClick={() => setIsCompact(!isCompact)}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                isCompact
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {isCompact ? 'Standard' : 'Dense'}
            </button>

            {/* Toggle Float & Liquidity Column */}
            <button
              id="btn-toggle-liquidity"
              onClick={() => setShowLiquidityColumn(!showLiquidityColumn)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                showLiquidityColumn
                  ? 'bg-amber-500/10 text-amber-900 border-amber-500/30'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title="Toggle Free Float Turnover & Liquidity Shock column"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>Float T/O</span>
            </button>
          </div>
        </div>

        {/* SECONDARY COLLAPSIBLE FILTERS PANEL */}
        {showSecondaryFilters && (
          <div className="pt-2.5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 animate-in fade-in duration-100">
            {/* Strategy Slot */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Strategy Slot
              </label>
              <select
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
                className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-800"
              >
                <option value="ALL">All Strategy Slots</option>
                <option value="Slot 1">Slot 1 (Alpha Leader)</option>
                <option value="Slot 2">Slot 2 (Breakout Momentum)</option>
                <option value="Slot 3">Slot 3 (Trend Follower)</option>
                <option value="Slot 4">Slot 4 (Mean Reversion)</option>
                <option value="Slot 5">Slot 5 (Distribution)</option>
              </select>
            </div>

            {/* Candlestick Pattern */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Candlestick Pattern
              </label>
              <select
                value={selectedPattern}
                onChange={(e) => setSelectedPattern(e.target.value)}
                className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-800 font-mono"
              >
                <option value="ALL">All Patterns</option>
                <option value="HAMMER">Hammer (Reversal)</option>
                <option value="DOJI">Doji (Indecision)</option>
                <option value="MARUBOZU">Marubozu (Trend Force)</option>
                <option value="ENGULFING">Engulfing</option>
                <option value="BREAKOUT">ORB Breakout</option>
              </select>
            </div>

            {/* Minimum Quant Score */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Min Strength / Score: {minScore > 0 ? `${minScore}+` : 'Any'}
              </label>
              <select
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-800 font-mono"
              >
                <option value={0}>Any Score</option>
                <option value={80}>Score &gt; 80 (High Strength)</option>
                <option value={60}>Score &gt; 60 (Medium Strength)</option>
                <option value={40}>Score &gt; 40</option>
              </select>
            </div>

            {/* Volume Surge / RVol */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Volume Multiplier: {minRvol > 0 ? `${minRvol}x+` : 'Any'}
              </label>
              <select
                value={minRvol}
                onChange={(e) => setMinRvol(Number(e.target.value))}
                className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-800 font-mono"
              >
                <option value={0}>Any Volume</option>
                <option value={1.5}>RVol &gt; 1.5x (Volume Surge)</option>
                <option value={2.0}>RVol &gt; 2.0x (Institutional Volume)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Main Stock Radar Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto max-h-[640px]">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none">
              <tr>
                <th
                  onClick={() => handleSort('rank')}
                  className={`py-2.5 px-3 cursor-pointer transition-colors ${
                    sortBy === 'rank' ? 'bg-indigo-50/70 text-indigo-900 font-black' : 'hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span>Rank</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-3">Stock & Sector</th>
                <th
                  onClick={() => handleSort('ltp')}
                  className={`py-2.5 px-3 text-right cursor-pointer transition-colors ${
                    sortBy === 'ltp' ? 'bg-indigo-50/70 text-indigo-900 font-black' : 'hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>LTP / Live</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('changePercent')}
                  className={`py-2.5 px-3 text-right cursor-pointer transition-colors ${
                    sortBy === 'changePercent' ? 'bg-indigo-50/70 text-indigo-900 font-black' : 'hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Change %</span>
                    {sortBy === 'changePercent' ? (
                      sortOrder === 'desc' ? (
                        <span className="text-indigo-600 font-mono text-[10px]">▼</span>
                      ) : (
                        <span className="text-indigo-600 font-mono text-[10px]">▲</span>
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>
                <th className="py-2.5 px-3 text-center">Trend</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3">Pattern</th>
                <th className="py-2.5 px-3 text-right">Support</th>
                <th className="py-2.5 px-3 text-right">Resistance</th>
                <th
                  onClick={() => handleSort('rvol')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Volume</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('score')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Strength</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                {showLiquidityColumn && (
                  <th className="py-2.5 px-3 text-right whitespace-nowrap">
                    <div
                      className="flex items-center justify-end gap-1"
                      title="Free Float Turnover % and Institutional Liquidity Shock Flag"
                    >
                      <span>Float T/O</span>
                      <Zap className="w-2.5 h-2.5 text-amber-600" />
                    </div>
                  </th>
                )}
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredStocks.length === 0 ? (
                <tr>
                  <td colSpan={showLiquidityColumn ? 13 : 12} className="py-12 text-center text-slate-500">
                    <AlertTriangle className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                    <p className="font-semibold text-sm text-slate-700">No stocks match selected criteria</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try broadening your search or resetting secondary filters.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStocks.map((stock, index) => {
                  const isUp = stock.changePercent >= 0;
                  const classification = stock.marketClassification || getStockClassification(stock);
                  const pattern = detectCandlestickPattern(stock);
                  const levels = calculateSupportResistance(stock);
                  const currentRank = index + 1;
                  const rankDelta = rankDeltas.get(stock.symbol) || 0;

                  // Check if we should insert a category divider row (only in Strategy State ranking mode)
                  const prevStock = index > 0 ? filteredStocks[index - 1] : null;
                  const prevClassification = prevStock ? (prevStock.marketClassification || getStockClassification(prevStock)) : null;
                  const isNewCategory =
                    sentimentFilter === 'ALL' &&
                    sortBy === 'rank' &&
                    (!prevClassification || prevClassification !== classification);

                  return (
                    <React.Fragment key={stock.id}>
                      {/* Section Divider Row between Bullish, Neutral, and Bearish */}
                      {isNewCategory && (
                        <tr className="bg-slate-100/90 border-y border-slate-200">
                          <td colSpan={showLiquidityColumn ? 13 : 12} className="px-3 py-1.5 text-[11px] font-bold tracking-wider">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    classification === 'BULLISH'
                                      ? 'bg-emerald-600'
                                      : classification === 'NEUTRAL'
                                      ? 'bg-slate-500'
                                      : 'bg-rose-600'
                                  }`}
                                />
                                <span
                                  className={`font-mono font-extrabold uppercase ${
                                    classification === 'BULLISH'
                                      ? 'text-emerald-800'
                                      : classification === 'NEUTRAL'
                                      ? 'text-slate-700'
                                      : 'text-rose-800'
                                  }`}
                                >
                                  {classification} STOCKS (
                                  {classification === 'BULLISH'
                                    ? groupedRadarStats.bullish.length
                                    : classification === 'NEUTRAL'
                                    ? groupedRadarStats.neutral.length
                                    : groupedRadarStats.bearish.length}
                                  )
                                </span>
                                <span className="text-[10px] text-slate-500 font-normal">
                                  • Priority rank (strongest to weakest)
                                </span>
                              </div>
                              {classification === 'BULLISH' && groupedRadarStats.strongestBull && (
                                <span className="text-[10px] font-mono text-emerald-800">
                                  Top Bull: {groupedRadarStats.strongestBull.symbol} (+{groupedRadarStats.strongestBull.changePercent.toFixed(2)}%)
                                </span>
                              )}
                              {classification === 'BEARISH' && groupedRadarStats.strongestBear && (
                                <span className="text-[10px] font-mono text-rose-800">
                                  Top Bear: {groupedRadarStats.strongestBear.symbol} ({groupedRadarStats.strongestBear.changePercent.toFixed(2)}%)
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}

                      <tr
                        id={`radar-row-${stock.symbol}`}
                        onClick={() => onSelectStock(stock)}
                        className={`transition-colors duration-300 cursor-pointer group ${
                          isCompact ? 'py-1' : 'py-2.5'
                        } ${
                          rankDelta > 0
                            ? 'bg-emerald-50/40 hover:bg-emerald-100/40'
                            : rankDelta < 0
                            ? 'bg-rose-50/40 hover:bg-rose-100/40'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        {/* Dynamic Live Rank with transition delta indicator */}
                        <td className={`${isCompact ? 'py-1.5' : 'py-2.5'} px-3 font-mono font-bold text-slate-800`}>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span>#{currentRank}</span>
                              {rankDelta > 0 && (
                                <span
                                  className="inline-flex items-center text-[10px] font-extrabold text-emerald-600 animate-in fade-in"
                                  title={`Rose ${rankDelta} position${rankDelta > 1 ? 's' : ''} on latest update`}
                                >
                                  ▲{rankDelta}
                                </span>
                              )}
                              {rankDelta < 0 && (
                                <span
                                  className="inline-flex items-center text-[10px] font-extrabold text-rose-600 animate-in fade-in"
                                  title={`Dropped ${Math.abs(rankDelta)} position${Math.abs(rankDelta) > 1 ? 's' : ''} on latest update`}
                                >
                                  ▼{Math.abs(rankDelta)}
                                </span>
                              )}
                            </div>
                            {stock.bullishRank && classification === 'BULLISH' && (
                              <span className="text-[9px] text-emerald-700 font-semibold">Bull #{stock.bullishRank}</span>
                            )}
                            {stock.bearishRank && classification === 'BEARISH' && (
                              <span className="text-[9px] text-rose-700 font-semibold">Bear #{stock.bearishRank}</span>
                            )}
                          </div>
                        </td>

                        {/* Stock & Sector */}
                        <td className={`${isCompact ? 'py-1.5' : 'py-2.5'} px-3`}>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-900 group-hover:text-indigo-600 font-mono">
                                {stock.symbol}
                              </span>
                              {/* State Transition Alert Tag */}
                              {stock.lastStateChange && (
                                <span
                                  className="inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs"
                                  title={`State transition: ${stock.lastStateChange.from} → ${stock.lastStateChange.to} at ${stock.lastStateChange.timestamp}`}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                  <span>{stock.lastStateChange.timestamp}</span>
                                  <span className="text-[8px] text-amber-700">
                                    ({stock.lastStateChange.from.slice(0, 4)}→{stock.lastStateChange.to.slice(0, 4)})
                                  </span>
                                </span>
                              )}
                              <span
                                className={`inline-flex items-center gap-1 text-[9px] font-bold font-mono px-1.5 py-0.5 rounded border leading-none shadow-2xs whitespace-nowrap ${
                                  pattern.bias === 'BULLISH'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    : pattern.bias === 'BEARISH'
                                    ? 'bg-rose-50 text-rose-800 border-rose-300'
                                    : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                }`}
                                title={`Candlestick Pattern: ${pattern.pattern} (${pattern.bias})`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                    pattern.bias === 'BULLISH'
                                      ? 'bg-emerald-600'
                                      : pattern.bias === 'BEARISH'
                                      ? 'bg-rose-600'
                                      : 'bg-indigo-600'
                                  }`}
                                />
                                <span>{pattern.pattern}</span>
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 truncate max-w-[140px]">
                              {stock.sector}
                            </span>
                          </div>
                        </td>

                        {/* LTP / Price */}
                        <td className={`${isCompact ? 'py-1.5' : 'py-2.5'} px-3 text-right font-mono font-bold text-slate-900 tabular-nums`}>
                          <div>{stock.ltp != null && stock.ltp > 0 ? formatINR(stock.ltp) : '—'}</div>
                          <span
                            className={`inline-block px-1 py-0.2 text-[8px] font-black uppercase tracking-wider rounded ${
                              stock.dataSource === 'UNAVAILABLE' || stock.ltp == null
                                ? 'bg-slate-100 text-slate-600 border border-slate-300'
                                : stock.priceType === 'LAST_CLOSE'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : stock.priceType === 'STALE'
                                ? 'bg-slate-100 text-slate-700 border border-slate-300'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            }`}
                          >
                            {stock.dataSource === 'UNAVAILABLE' || stock.ltp == null
                              ? 'UNAVAILABLE'
                              : stock.priceType === 'LAST_CLOSE'
                              ? 'LAST CLOSE'
                              : stock.priceType === 'STALE'
                              ? 'STALE'
                              : 'LIVE'}
                          </span>
                        </td>

                        {/* Change % */}
                        <td className={`${isCompact ? 'py-1.5' : 'py-2.5'} px-3 text-right font-mono font-bold tabular-nums`}>
                          <span className={`inline-flex items-center gap-0.5 ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isUp ? '+' : ''}
                            {stock.changePercent.toFixed(2)}%
                          </span>
                        </td>

                        {/* Trend Sparkline */}
                        <td className={`${isCompact ? 'py-1' : 'py-2'} px-3 text-center`}>
                          <RechartsSparkline data={stock.chartData} isUp={isUp} />
                        </td>

                        {/* Status / Dynamic Market State */}
                        <td className={`${isCompact ? 'py-1.5' : 'py-2.5'} px-3 text-center`}>
                          {getStatusBadge(stock)}
                        </td>

                      {/* Candlestick Pattern Indicator Badge */}
                      <td className={`${isCompact ? 'py-1.5' : 'py-2.5'} px-3`}>
                        <span
                          className={`inline-flex items-center gap-1.5 text-[10px] font-bold font-mono px-2 py-0.5 rounded-md border shadow-2xs whitespace-nowrap ${
                            pattern.bias === 'BULLISH'
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                              : pattern.bias === 'BEARISH'
                              ? 'bg-rose-50 text-rose-900 border-rose-300'
                              : 'bg-indigo-50 text-indigo-900 border-indigo-200'
                          }`}
                          title={`${pattern.pattern}: ${pattern.description} (Reliability: ${pattern.reliability})`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              pattern.bias === 'BULLISH'
                                ? 'bg-emerald-600'
                                : pattern.bias === 'BEARISH'
                                ? 'bg-rose-600'
                                : 'bg-indigo-600'
                            }`}
                          />
                          <span>{pattern.pattern}</span>
                        </span>
                      </td>

                      {/* Support */}
                      <td className={`${isCompact ? 'py-1.5' : 'py-2.5'} px-3 text-right font-mono text-emerald-700 font-semibold tabular-nums`}>
                        {formatINR(levels.support)}
                      </td>

                      {/* Resistance */}
                      <td className={`${isCompact ? 'py-1.5' : 'py-2.5'} px-3 text-right font-mono text-rose-700 font-semibold tabular-nums`}>
                        {formatINR(levels.resistance)}
                      </td>

                      {/* Volume */}
                      <td className={`${isCompact ? 'py-1.5' : 'py-2.5'} px-3 text-right font-mono text-slate-700 font-semibold tabular-nums`}>
                        {stock.rvol.toFixed(1)}x
                      </td>

                      {/* Strength Score */}
                      <td className={`${isCompact ? 'py-1.5' : 'py-2.5'} px-3 text-right font-mono font-bold text-slate-900 tabular-nums`}>
                        {stock.score}/100
                      </td>

                      {/* Float Turnover & Liquidity Shock */}
                      {showLiquidityColumn && (() => {
                        const liq = getFloatAndLiquidity(stock);
                        return (
                          <td className={`${isCompact ? 'py-1.5' : 'py-2.5'} px-3 text-right font-mono tabular-nums whitespace-nowrap`}>
                            <div className="flex items-center justify-end gap-1.5">
                              <span
                                className={`font-bold ${
                                  liq.isLiquidityShock ? 'text-amber-900' : 'text-slate-700'
                                }`}
                              >
                                {liq.freeFloatTurnover.toFixed(2)}%
                              </span>
                              {liq.isLiquidityShock && (
                                <span
                                  className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-500/15 text-amber-800 border border-amber-500/30"
                                  title={liq.statusNote}
                                >
                                  SHOCK
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })()}

                      {/* Action */}
                      <td className={`${isCompact ? 'py-1.5' : 'py-2.5'} px-3 text-center`}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectStock(stock);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                          title="Open Stock Detail View"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })
            )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
