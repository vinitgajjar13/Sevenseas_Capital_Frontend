import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Layers,
  TrendingUp,
  TrendingDown,
  Clock,
  Filter,
  RefreshCw,
  Sparkles,
  ArrowUpDown,
  Search,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  Table as TableIcon,
  BarChart2,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  TimePeriod,
  StockRadarItem,
  SectorAnalysisItem,
  SectorStockItem,
  SectorDirectionType,
  MarketIndexes,
  MarketBreadth,
} from '../../types';
import {
  getSectorDataForPeriod,
  MOCK_SECTOR_STOCKS,
  getSectorSummaryMetrics,
  getMarketBreadthExtended,
  SECTOR_INDEX_SYMBOLS,
  SECTOR_ALIASES,
} from '../../data/mock/sectorScope';
import { MarketOverview, MarketOverviewSector } from '../../services/backendApi';
import { SectorMarketOverview } from './SectorMarketOverview';
import { SectorSummaryCards } from './SectorSummaryCards';
import { SectorAnalysisTable } from './SectorAnalysisTable';
import { SectorBreadthCharts } from './SectorBreadthCharts';
import { SectorHeatmapView } from './SectorHeatmapView';
import { SectorStockDrilldown } from './SectorStockDrilldown';
import { StockDetailDrawer } from './StockDetailDrawer';
import MarketHeatmap from '../Charts/MarketHeatmap';
import type { HeatmapItem } from '../Charts/types';
import { generateHeatmap } from '../Charts/mockChartData';

interface SectorRadarViewProps {
  timePeriod: TimePeriod;
  setTimePeriod: (val: TimePeriod) => void;
  stocks?: StockRadarItem[];
  indices?: MarketIndexes;
  breadth?: MarketBreadth;
  marketOverview?: MarketOverview | null;
  radarSectors?: MarketOverviewSector[] | null;
  isLiveConnected?: boolean;
  onSelectStock?: (stock: StockRadarItem) => void;
  selectedSectorName?: string | null;
  onSelectSector?: (sectorName: string | null) => void;
  onSimulateStateTransition?: () => void;
  theme?: 'light' | 'dark';
}

function mapBackendSectorToAnalysisItem(s: MarketOverviewSector, index: number): SectorAnalysisItem {
  const secName = s.sector;
  const id = 'sec-' + secName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const indexSymbol = SECTOR_INDEX_SYMBOLS[secName] || 'SECTOR';
  const total = s.total_stocks ?? s.total ?? 0;
  const avg = s.avg_change ?? s.average_change_percent ?? 0;
  const pos = s.positive_stocks ?? s.advances ?? 0;
  const neg = s.negative_stocks ?? s.declines ?? 0;
  const bullPct = s.bullish_pct ?? (total > 0 ? Math.round((pos / total) * 100) : 50);
  const bearPct = s.bearish_pct ?? (total > 0 ? Math.round((neg / total) * 100) : 50);
  const totVol = s.live_volume ?? 0;
  const volPerStock = s.volume_per_stock ?? (total > 0 ? Math.round(totVol / total) : 0);
  const bullVol = s.bullish_volume ?? 0;
  const bearVol = s.bearish_volume ?? 0;
  const bullVolPct = s.bullish_volume_pct ?? 0;
  const bearVolPct = s.bearish_volume_pct ?? 0;

  let dir: SectorDirectionType = 'Neutral';
  if (s.direction?.includes('BULL')) dir = 'Bullish';
  else if (s.direction?.includes('BEAR')) dir = 'Bearish';

  const score = s.score ?? 0;
  const topBull = s.top_bullish_stocks && s.top_bullish_stocks.length > 0 ? s.top_bullish_stocks[0] : null;
  const topBear = s.top_bearish_stocks && s.top_bearish_stocks.length > 0 ? s.top_bearish_stocks[0] : null;

  let topStock = 'N/A';
  let topStockChange = 0;
  if (topBull) {
    topStock = `${topBull.symbol} (+${topBull.change_pct.toFixed(2)}%)`;
    topStockChange = topBull.change_pct;
  } else if (topBear) {
    topStock = `${topBear.symbol} (${topBear.change_pct.toFixed(2)}%)`;
    topStockChange = topBear.change_pct;
  }

  const indexBase = 15000 + Math.round(score * 180);
  const dayChange = +(indexBase * (avg / 100)).toFixed(2);

  return {
    id,
    name: secName,
    indexSymbol,
    totalStocks: total,
    avgChangePercent: avg,
    positiveStocks: pos,
    negativeStocks: neg,
    bullishPercent: bullPct,
    bearishPercent: bearPct,
    totalVolume: totVol,
    volumePerStock: volPerStock,
    bullishVolume: bullVol,
    bearishVolume: bearVol,
    bullishVolumePercent: bullVolPct,
    bearishVolumePercent: bearVolPct,
    direction: dir,
    rawDirection: s.direction,
    score,
    overallRank: index + 1,
    bullishRank: s.bullish_rank ?? 0,
    bearishRank: s.bearish_rank ?? 0,
    topStock,
    topStockChange,
    topBullishStocks: s.top_bullish_stocks,
    topBearishStocks: s.top_bearish_stocks,
    historySparkline: [
      Math.max(10, Math.min(100, score - 8)),
      Math.max(10, Math.min(100, score - 5)),
      Math.max(10, Math.min(100, score - 2)),
      Math.max(10, Math.min(100, score + 1)),
      score,
    ],
    indexPrice: indexBase,
    change: dayChange,
    changePct: avg,
    dayHigh: +(indexBase * 1.008).toFixed(2),
    dayLow: +(indexBase * 0.992).toFixed(2),
  };
}

export const SectorRadarView: React.FC<SectorRadarViewProps> = ({
  timePeriod,
  setTimePeriod,
  stocks,
  indices,
  breadth,
  marketOverview,
  radarSectors,
  isLiveConnected = false,
  onSelectStock,
  selectedSectorName,
  onSelectSector,
  onSimulateStateTransition,
  theme = 'light',
}) => {
  // Sector analytical data initialized for chosen timePeriod or live backend data
  const [sectors, setSectors] = useState<SectorAnalysisItem[]>(() => {
    const rawBackendSectors = radarSectors || marketOverview?.sectors;
    if (rawBackendSectors && rawBackendSectors.length > 0) {
      return rawBackendSectors.map(mapBackendSectorToAnalysisItem);
    }
    return getSectorDataForPeriod(timePeriod);
  });

  // Constituent stocks map state
  const [sectorStocks, setSectorStocks] = useState<Record<string, SectorStockItem[]>>(
    MOCK_SECTOR_STOCKS
  );

  // Active sector selection
  const [activeSector, setActiveSector] = useState<SectorAnalysisItem | null>(() => {
    const list = sectors;
    if (selectedSectorName) {
      return (
        list.find(
          (s) =>
            s.name.toLowerCase() === selectedSectorName.toLowerCase() ||
            s.indexSymbol.toLowerCase() === selectedSectorName.toLowerCase()
        ) || list[0]
      );
    }
    return list[0];
  });

  // Selected stock for Drawer inspection
  const [drawerStock, setDrawerStock] = useState<SectorStockItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // View presentation mode for Sector section (Table, Heatmap, or Both)
  const [presentationMode, setPresentationMode] = useState<'both' | 'table' | 'heatmap'>('both');

  // Ref for constituent drilldown section to scroll into view when selected
  const drilldownRef = useRef<HTMLDivElement>(null);

  // Synchronize backend sector data when available
  useEffect(() => {
    const rawBackendSectors = radarSectors || marketOverview?.sectors;
    if (rawBackendSectors && rawBackendSectors.length > 0) {
      const liveSectors = rawBackendSectors.map(mapBackendSectorToAnalysisItem);
      setSectors(liveSectors);

      if (activeSector) {
        const matching = liveSectors.find((s) => s.id === activeSector.id || s.name === activeSector.name);
        if (matching) setActiveSector(matching);
      } else if (liveSectors.length > 0) {
        setActiveSector(liveSectors[0]);
      }
    } else {
      const freshData = getSectorDataForPeriod(timePeriod);
      setSectors(freshData);
    }
  }, [radarSectors, marketOverview, timePeriod]);

  // Synchronize live stock radar items into sector stocks map
  useEffect(() => {
    if (stocks && stocks.length > 0) {
      const grouped: Record<string, SectorStockItem[]> = {};
      stocks.forEach((stk) => {
        const sec = stk.sector;
        if (!grouped[sec]) grouped[sec] = [];

        const isBull = stk.marketClassification === 'BULLISH' || stk.changePercent >= 0.4;
        const isBear = stk.marketClassification === 'BEARISH' || stk.changePercent <= -0.4;

        const capital = stk.capital || Math.round(stk.ltp * (stk.volume && stk.volume > 5000000 ? 500 : 250));

        grouped[sec].push({
          id: stk.id,
          symbol: stk.symbol,
          name: stk.name,
          sector: stk.sector,
          ltp: stk.ltp,
          change: stk.change,
          changePercent: stk.changePercent,
          changePct: stk.changePercent,
          low: stk.low ?? stk.low915,
          high: stk.high ?? stk.high915,
          capital,
          volume: stk.volume || 100000,
          signalDirection: isBull ? 'Bullish' : isBear ? 'Bearish' : 'Neutral',
          tradingSignal: stk.teacherAction?.includes('BULL')
            ? 'Buy Call'
            : stk.teacherAction?.includes('BEAR')
            ? 'Buy Put'
            : isBull
            ? 'Buy Call'
            : isBear
            ? 'Buy Put'
            : 'Hold',
          entryPrice: stk.open915 || stk.ltp,
          target1: stk.target1,
          target2: stk.target2,
          target3: stk.target3 || +(stk.target2 * 1.015).toFixed(2),
          target4: stk.target4 || +(stk.target2 * 1.03).toFixed(2),
          stopLoss: stk.stopLoss,
          comment: stk.teacherAction
            ? `Teacher: ${stk.teacherAction}`
            : stk.watchStatus
            ? `Watch: ${stk.watchStatus}`
            : stk.analystNote || stk.conditionMet,
          vwap: stk.vwap,
          rsi: stk.rsi,
          score: stk.score,
        });
      });

      // Sort descending by changePercent
      Object.keys(grouped).forEach((sec) => {
        grouped[sec].sort((a, b) => b.changePercent - a.changePercent);
        const alias = SECTOR_INDEX_SYMBOLS[sec];
        if (alias) grouped[alias] = grouped[sec];
      });

      // Link legacy aliases
      Object.entries(SECTOR_ALIASES).forEach(([alias, targetSec]) => {
        if (grouped[targetSec]) grouped[alias] = grouped[targetSec];
      });

      setSectorStocks(grouped);
    }
  }, [stocks]);

  // Sync external selectedSectorName prop
  useEffect(() => {
    if (selectedSectorName) {
      const match = sectors.find(
        (s) =>
          s.name.toLowerCase() === selectedSectorName.toLowerCase() ||
          s.indexSymbol.toLowerCase() === selectedSectorName.toLowerCase()
      );
      if (match) {
        setActiveSector(match);
      }
    }
  }, [selectedSectorName, sectors]);

  // Simulation timer only runs when NOT connected to live backend data
  useEffect(() => {
    if (isLiveConnected) return;

    const interval = setInterval(() => {
      setSectors((prevSectors) => {
        return prevSectors.map((sector) => {
          if (Math.random() > 0.4) return sector;
          const pctTick = (Math.random() - 0.49) * 0.05;
          const newPct = +(sector.changePct || sector.avgChangePercent + pctTick).toFixed(2);
          const currentPrice = sector.indexPrice || 25000;
          const newPrice = +(currentPrice * (1 + pctTick / 100)).toFixed(2);
          const currentChange = sector.change || 0;
          const newChange = +(newPrice - (currentPrice - currentChange)).toFixed(2);
          const newHigh = Math.max(sector.dayHigh || newPrice, newPrice);
          const newLow = Math.min(sector.dayLow || newPrice, newPrice);

          return {
            ...sector,
            indexPrice: newPrice,
            change: newChange,
            changePct: newPct,
            dayHigh: newHigh,
            dayLow: newLow,
          };
        });
      });
    }, 2800);

    return () => clearInterval(interval);
  }, [isLiveConnected]);

  // Sector Summary Metrics (Total, Strong Bullish, etc.)
  const summaryMetrics = useMemo(() => {
    return getSectorSummaryMetrics(sectors);
  }, [sectors]);

  // Extended Market Breadth
  const extendedBreadth = useMemo(() => {
    return getMarketBreadthExtended(sectors);
  }, [sectors]);

  // Active sector constituents
  const currentConstituents = useMemo(() => {
    if (!activeSector) return [];
    return (
      sectorStocks[activeSector.name] ||
      sectorStocks[activeSector.indexSymbol] ||
      MOCK_SECTOR_STOCKS[activeSector.name] ||
      MOCK_SECTOR_STOCKS[activeSector.indexSymbol] ||
      []
    );
  }, [activeSector, sectorStocks]);

  // Handle sector selection (from Table or Heatmap)
  const handleSelectSector = (sector: SectorAnalysisItem) => {
    setActiveSector(sector);
    if (onSelectSector) {
      onSelectSector(sector.name);
    }
    // Smooth scroll down to constituent drilldown section
    setTimeout(() => {
      drilldownRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  // Map stocks radar data to HeatmapItem[] for the Treemap
  const stockHeatmapItems: HeatmapItem[] = useMemo(() => {
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

  const handleStockHeatmapSelect = (symbol: string) => {
    const found = stocks?.find((s) => s.symbol === symbol);
    if (found && onSelectStock) {
      onSelectStock(found);
    }
  };

  // Handle stock click inside constituent drilldown table
  const handleStockClick = (stock: SectorStockItem) => {
    setDrawerStock(stock);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. Header Bar: Title, Breadcrumbs, Timeframe Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-slate-900 dark:text-white">
                Sector Scope & Radar Matrix
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Comprehensive sectoral rotation, relative strength rankings, market breadth & constituent stock signals
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls: Time Period Switcher & View Switcher */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Timeframe Pill Selector */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
            {(['1D', '1W', '1M', '3M', '1Y'] as TimePeriod[]).map((period) => (
              <button
                key={period}
                onClick={() => setTimePeriod(period)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  timePeriod === period
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          {/* Presentation Toggle */}
          <div className="hidden sm:flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
            <button
              onClick={() => setPresentationMode('both')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                presentationMode === 'both'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
              title="Show both Table and Heatmap"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPresentationMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                presentationMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
              title="Table view only"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPresentationMode('heatmap')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                presentationMode === 'heatmap'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
              title="Heatmap view only"
            >
              <BarChart2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Market Overview: NIFTY 50, BANK NIFTY, SENSEX + Market Breadth */}
      <SectorMarketOverview indices={indices} breadth={extendedBreadth} />

      {/* 3. Sector Summary KPI Cards (6 cards: Total, Strong Bullish, Bullish, Neutral, Bearish, Strong Bearish) */}
      <SectorSummaryCards metrics={summaryMetrics} />

      {/* 4. Heatmap View (shown if presentationMode === 'both' or 'heatmap') */}
      {(presentationMode === 'both' || presentationMode === 'heatmap') && (
        <div className="space-y-4">
          <SectorHeatmapView
            sectors={sectors}
            selectedSectorId={activeSector?.id}
            onSelectSector={handleSelectSector}
          />

          <section id="sector-stock-treemap" className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>Stock Radar Heatmap (Sector Treemap)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    Live Weights
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Real stock radar items grouped by sector. Size indicates capital weighting, color indicates price % change. Click any tile to open Stock Detail.
                </p>
              </div>
              <p className="text-xs text-slate-400 font-mono">Simulated data</p>
            </div>
            <MarketHeatmap
              items={stockHeatmapItems}
              onSelect={handleStockHeatmapSelect}
              height={420}
              theme={theme}
            />
          </section>
        </div>
      )}

      {/* 5. Sector Breadth Dual Graphs (Stock Count Breadth + Volume Breadth) */}
      <SectorBreadthCharts sectors={sectors} />

      {/* 6. Comprehensive 18-Column Sector Analysis Table (shown if presentationMode === 'both' or 'table') */}
      {(presentationMode === 'both' || presentationMode === 'table') && (
        <SectorAnalysisTable
          sectors={sectors}
          selectedSectorId={activeSector?.id}
          onSelectSector={handleSelectSector}
        />
      )}

      {/* 7. Sector Constituent Stock Drilldown Section */}
      <div ref={drilldownRef} className="pt-2">
        <SectorStockDrilldown
          sector={activeSector}
          stocks={currentConstituents}
          onSelectStock={handleStockClick}
        />
      </div>

      {/* 8. Stock Detail Sliding Drawer (Desktop & Mobile drawer with Candlestick Chart, Capital, Targets & Commentary) */}
      <StockDetailDrawer
        stock={drawerStock}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onNavigateFull={onSelectStock}
        theme={theme}
      />
    </div>
  );
};
