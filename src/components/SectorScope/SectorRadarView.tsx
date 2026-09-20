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
  MarketIndexes,
  MarketBreadth,
} from '../../types';
import {
  getSectorDataForPeriod,
  MOCK_SECTOR_STOCKS,
  getSectorSummaryMetrics,
  getMarketBreadthExtended,
} from '../../data/mock/sectorScope';
import { SectorMarketOverview } from './SectorMarketOverview';
import { SectorSummaryCards } from './SectorSummaryCards';
import { SectorAnalysisTable } from './SectorAnalysisTable';
import { SectorBreadthCharts } from './SectorBreadthCharts';
import { SectorHeatmapView } from './SectorHeatmapView';
import { SectorStockDrilldown } from './SectorStockDrilldown';
import { StockDetailDrawer } from './StockDetailDrawer';

interface SectorRadarViewProps {
  timePeriod: TimePeriod;
  setTimePeriod: (val: TimePeriod) => void;
  stocks?: StockRadarItem[];
  indices?: MarketIndexes;
  breadth?: MarketBreadth;
  onSelectStock?: (stock: StockRadarItem) => void;
  selectedSectorName?: string | null;
  onSelectSector?: (sectorName: string | null) => void;
  onSimulateStateTransition?: () => void;
  theme?: 'light' | 'dark';
}

export const SectorRadarView: React.FC<SectorRadarViewProps> = ({
  timePeriod,
  setTimePeriod,
  stocks,
  indices,
  breadth,
  onSelectStock,
  selectedSectorName,
  onSelectSector,
  onSimulateStateTransition,
  theme = 'light',
}) => {
  // Sector analytical data initialized for chosen timePeriod
  const [sectors, setSectors] = useState<SectorAnalysisItem[]>(() =>
    getSectorDataForPeriod(timePeriod)
  );

  // Constituent stocks map state
  const [sectorStocks, setSectorStocks] = useState<Record<string, SectorStockItem[]>>(
    MOCK_SECTOR_STOCKS
  );

  // Active sector selection
  const [activeSector, setActiveSector] = useState<SectorAnalysisItem | null>(() => {
    const list = getSectorDataForPeriod(timePeriod);
    if (selectedSectorName) {
      return (
        list.find(
          (s) =>
            s.name.toLowerCase() === selectedSectorName.toLowerCase() ||
            s.indexSymbol.toLowerCase() === selectedSectorName.toLowerCase()
        ) || list[0]
      );
    }
    return list[0]; // Default to top sector (e.g. NIFTY IT)
  });

  // Selected stock for Drawer inspection
  const [drawerStock, setDrawerStock] = useState<SectorStockItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // View presentation mode for Sector section (Table, Heatmap, or Both)
  const [presentationMode, setPresentationMode] = useState<'both' | 'table' | 'heatmap'>('both');

  // Ref for constituent drilldown section to scroll into view when selected
  const drilldownRef = useRef<HTMLDivElement>(null);

  // Re-load sector data whenever timePeriod changes
  useEffect(() => {
    const freshData = getSectorDataForPeriod(timePeriod);
    setSectors(freshData);

    // Maintain or update active sector
    if (activeSector) {
      const matching = freshData.find((s) => s.id === activeSector.id || s.name === activeSector.name);
      if (matching) {
        setActiveSector(matching);
      } else {
        setActiveSector(freshData[0]);
      }
    } else {
      setActiveSector(freshData[0]);
    }
  }, [timePeriod]);

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

  // Simulated live tick updates with interval cleanup on unmount
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Small tick updates to sector analytical metrics
      setSectors((prevSectors) => {
        return prevSectors.map((sector) => {
          // 40% probability of tick per sector
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

      // 2. Small tick updates to active sector constituent stocks
      if (activeSector) {
        setSectorStocks((prevMap) => {
          const activeList = prevMap[activeSector.name] || prevMap[activeSector.indexSymbol];
          if (!activeList || activeList.length === 0) return prevMap;

          const updatedList = activeList.map((stk) => {
            if (Math.random() > 0.5) return stk;
            const tick = (Math.random() - 0.49) * 0.003;
            const newLtp = +(stk.ltp * (1 + tick)).toFixed(2);
            const newChg = +(stk.change + (newLtp - stk.ltp)).toFixed(2);
            const newChgPct = +(((newLtp - (stk.ltp - stk.change)) / (stk.ltp - stk.change)) * 100).toFixed(2);

            return {
              ...stk,
              ltp: newLtp,
              change: newChg,
              changePct: newChgPct,
              high: Math.max(stk.high, newLtp),
              low: Math.min(stk.low, newLtp),
            };
          });

          return {
            ...prevMap,
            [activeSector.name]: updatedList,
          };
        });
      }
    }, 2800);

    return () => clearInterval(interval);
  }, [activeSector]);

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
        <SectorHeatmapView
          sectors={sectors}
          selectedSectorId={activeSector?.id}
          onSelectSector={handleSelectSector}
        />
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
