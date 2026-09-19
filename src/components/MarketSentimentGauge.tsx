import React, { useState, useMemo } from 'react';
import {
  Gauge,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronUp,
  Activity,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { StockRadarItem } from '../types';
import { getStockClassification } from '../utils/stockRanking';
import { formatINR } from '../data/mockData';

interface MarketSentimentGaugeProps {
  stocks: StockRadarItem[];
  onSelectStock?: (stock: StockRadarItem) => void;
}

export const MarketSentimentGauge: React.FC<MarketSentimentGaugeProps> = ({
  stocks = [],
  onSelectStock,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'BULLISH' | 'NEUTRAL' | 'BEARISH'>('ALL');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Classify all current radar stocks
  const { bullishStocks, bearishStocks, neutralStocks } = useMemo(() => {
    const bull: StockRadarItem[] = [];
    const bear: StockRadarItem[] = [];
    const neutral: StockRadarItem[] = [];

    stocks.forEach((stock) => {
      const classification = stock.marketClassification || getStockClassification(stock);
      if (classification === 'BULLISH') bull.push(stock);
      else if (classification === 'BEARISH') bear.push(stock);
      else neutral.push(stock);
    });

    return {
      bullishStocks: bull,
      bearishStocks: bear,
      neutralStocks: neutral,
    };
  }, [stocks]);

  const bullCount = bullishStocks.length;
  const bearCount = bearishStocks.length;
  const neutralCount = neutralStocks.length;
  const totalCount = stocks.length || 1;

  // Bull to Bear ratio
  const bullBearRatio = bearCount > 0 ? bullCount / bearCount : bullCount > 0 ? bullCount : 1;
  const bullBearRatioFormatted = `${(bullCount / Math.max(1, bearCount)).toFixed(2)} : 1`;

  // Sentiment Score on 0 - 100 scale (0 = 100% Bear, 50 = Balanced, 100 = 100% Bull)
  // Neutral stocks give 0.5 bull and 0.5 bear contribution
  const sentimentScore = Math.min(
    100,
    Math.max(0, Math.round(((bullCount + 0.5 * neutralCount) / totalCount) * 100))
  );

  // Percentages
  const bullPct = Math.round((bullCount / totalCount) * 100);
  const bearPct = Math.round((bearCount / totalCount) * 100);
  const neutralPct = Math.round((neutralCount / totalCount) * 100);

  // Sentiment State & Styling
  const sentimentMeta = useMemo(() => {
    if (sentimentScore >= 75) {
      return {
        label: 'Strong Bullish',
        badgeColor: 'bg-emerald-600 text-white border-emerald-700',
        textColor: 'text-emerald-700',
        bgColor: 'bg-emerald-50/70 border-emerald-200',
        summary: 'Aggressive buying dominance across radar constituents with widespread momentum.',
        dominant: 'BULLISH',
      };
    }
    if (sentimentScore >= 60) {
      return {
        label: 'Mild Bullish',
        badgeColor: 'bg-emerald-500 text-white border-emerald-600',
        textColor: 'text-emerald-600',
        bgColor: 'bg-emerald-50/40 border-emerald-100',
        summary: 'Bulls lead with clear ratio advantage. Selective long setups in high-beta leaders.',
        dominant: 'BULLISH',
      };
    }
    if (sentimentScore <= 25) {
      return {
        label: 'Strong Bearish',
        badgeColor: 'bg-rose-700 text-white border-rose-800',
        textColor: 'text-rose-700',
        bgColor: 'bg-rose-50/70 border-rose-200',
        summary: 'Heavy selling pressure under intraday VWAP across radar universe.',
        dominant: 'BEARISH',
      };
    }
    if (sentimentScore <= 40) {
      return {
        label: 'Mild Bearish',
        badgeColor: 'bg-rose-500 text-white border-rose-600',
        textColor: 'text-rose-600',
        bgColor: 'bg-rose-50/40 border-rose-100',
        summary: 'Bears maintain upper hand. Long trades warrant tighter risk parameters.',
        dominant: 'BEARISH',
      };
    }
    return {
      label: 'Neutral / Balanced',
      badgeColor: 'bg-slate-600 text-white border-slate-700',
      textColor: 'text-slate-700',
      bgColor: 'bg-slate-50 border-slate-200',
      summary: 'Equal bull/bear distribution. Market consolidating within intraday balance channels.',
      dominant: 'NEUTRAL',
    };
  }, [sentimentScore]);

  // Recharts Gauge Slices (clockwise from 180° to 0°)
  // 180° is bottom-left (Bearish), 90° is top-center (Neutral), 0° is bottom-right (Bullish)
  const gaugeData = useMemo(
    () => [
      {
        name: 'Bearish Stocks',
        value: bearCount || 0.001,
        actualCount: bearCount,
        percentage: bearPct,
        color: '#f43f5e', // rose-500
        category: 'BEARISH',
      },
      {
        name: 'Neutral / Ranging',
        value: neutralCount || 0.001,
        actualCount: neutralCount,
        percentage: neutralPct,
        color: '#94a3b8', // slate-400
        category: 'NEUTRAL',
      },
      {
        name: 'Bullish Stocks',
        value: bullCount || 0.001,
        actualCount: bullCount,
        percentage: bullPct,
        color: '#10b981', // emerald-500
        category: 'BULLISH',
      },
    ],
    [bearCount, neutralCount, bullCount, bearPct, neutralPct, bullPct]
  );

  // Reference Benchmark Zones for the outer background dial track
  const referenceZones = useMemo(
    () => [
      { name: 'Extreme Bearish', value: 20, color: '#fecdd3' }, // rose-200
      { name: 'Mild Bearish', value: 20, color: '#ffe4e6' },    // rose-100
      { name: 'Neutral', value: 20, color: '#f1f5f9' },         // slate-100
      { name: 'Mild Bullish', value: 20, color: '#d1fae5' },     // emerald-100
      { name: 'Extreme Bullish', value: 20, color: '#a7f3d0' },  // emerald-200
    ],
    []
  );

  // Top gainers and decliners in the radar
  const sortedByChange = useMemo(() => {
    return [...stocks].sort((a, b) => b.changePercent - a.changePercent);
  }, [stocks]);

  const topGainers = sortedByChange.slice(0, 2);
  const topDecliners = [...sortedByChange].reverse().slice(0, 2);

  // Filtered stocks for the category drill-down drawer
  const displayedStocks = useMemo(() => {
    if (selectedCategory === 'BULLISH') return bullishStocks;
    if (selectedCategory === 'BEARISH') return bearishStocks;
    if (selectedCategory === 'NEUTRAL') return neutralStocks;
    return stocks;
  }, [selectedCategory, bullishStocks, bearishStocks, neutralStocks, stocks]);

  // Needle Math on 280 x 145 viewBox
  // cx = 140 (50%), cy = 130.5 (90%)
  const cx = 140;
  const cy = 130.5;
  const needleLength = 54;
  // Angle: score 0 -> 180° (left), score 50 -> 90° (top), score 100 -> 0° (right)
  const needleAngle = 180 - (sentimentScore / 100) * 180;
  const rad = (needleAngle * Math.PI) / 180;
  const nx = cx + needleLength * Math.cos(rad);
  const ny = cy - needleLength * Math.sin(rad);

  // Tapered base perpendicular coordinates
  const perpRad = rad + Math.PI / 2;
  const baseR = 4;
  const bx1 = cx + baseR * Math.cos(perpRad);
  const by1 = cy - baseR * Math.sin(perpRad);
  const bx2 = cx - baseR * Math.cos(perpRad);
  const by2 = cy + baseR * Math.sin(perpRad);

  return (
    <section
      id="market-sentiment-gauge-card"
      className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3.5 transition-all"
    >
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Market Sentiment Gauge
              </h2>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-semibold">
                Radar Breadth
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Aggregate Bullish vs. Bearish stock count ratio across {totalCount} live radar constituents
            </p>
          </div>
        </div>

        {/* Status Badge & Ratio Indicator */}
        <div className="flex items-center gap-2">
          <span
            id="sentiment-regime-badge"
            className={`inline-flex items-center gap-1 text-[11px] font-bold font-mono px-2.5 py-1 rounded-full border shadow-2xs ${sentimentMeta.badgeColor}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            <span>{sentimentMeta.label}</span>
          </span>

          <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
            Ratio: <strong className={sentimentMeta.textColor}>{bullBearRatioFormatted}</strong>
          </span>
        </div>
      </div>

      {/* Main Grid: Gauge Dial + Breakdown Stats + Key Contributors */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Left Column: Recharts Semi-Circle Gauge (Cols 1-5 on desktop) */}
        <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 relative">
          <div className="relative w-full max-w-[280px] h-[145px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height={145}>
              <PieChart margin={{ top: 8, right: 10, bottom: 0, left: 10 }}>
                {/* Outer Reference Benchmark Track */}
                <Pie
                  data={referenceZones}
                  cx="50%"
                  cy="90%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={68}
                  outerRadius={76}
                  paddingAngle={1.5}
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {referenceZones.map((z, i) => (
                    <Cell key={`ref-cell-${i}`} fill={z.color} />
                  ))}
                </Pie>

                {/* Inner Data Arc: Actual Bullish / Neutral / Bearish Stock Proportions */}
                <Pie
                  data={gaugeData}
                  cx="50%"
                  cy="90%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={46}
                  outerRadius={65}
                  paddingAngle={2.5}
                  dataKey="value"
                  isAnimationActive={true}
                >
                  {gaugeData.map((entry, index) => (
                    <Cell
                      key={`gauge-cell-${index}`}
                      fill={entry.color}
                      stroke="#ffffff"
                      strokeWidth={1.5}
                    />
                  ))}
                </Pie>

                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white text-[10px] font-mono px-2.5 py-1.5 rounded-lg shadow-md border border-slate-800">
                          <div className="font-bold text-slate-200">{item.name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-white font-bold">{item.actualCount} Stocks</span>
                            <span className="text-slate-400">({item.percentage}%)</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Overlaid Custom Needle & Dial Hub (SVG Coordinates matching 280 x 145) */}
            <svg
              viewBox="0 0 280 145"
              className="absolute inset-0 w-full h-full pointer-events-none"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Dial Scale Tick Labels */}
              <text x="14" y="132" fill="#e11d48" fontSize="9" fontWeight="bold" fontFamily="monospace">
                BEAR
              </text>
              <text x="126" y="24" fill="#64748b" fontSize="9" fontWeight="bold" fontFamily="monospace">
                50 (NEU)
              </text>
              <text x="240" y="132" fill="#059669" fontSize="9" fontWeight="bold" fontFamily="monospace">
                BULL
              </text>

              {/* Tapered Gauge Needle */}
              <polygon
                points={`${bx1},${by1} ${nx},${ny} ${bx2},${by2}`}
                fill="#0f172a"
                filter="drop-shadow(0px 1px 1px rgba(0,0,0,0.3))"
              />

              {/* Center Hub */}
              <circle cx={cx} cy={cy} r="6.5" fill="#0f172a" />
              <circle cx={cx} cy={cy} r="2.5" fill="#ffffff" />
            </svg>
          </div>

          {/* Under-Gauge Primary Sentiment Readout */}
          <div className="text-center mt-1">
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="text-2xl font-black font-mono text-slate-900 tracking-tight">
                {sentimentScore}
              </span>
              <span className="text-xs text-slate-400 font-mono">/ 100</span>
              <span className={`text-xs font-bold font-mono ml-1 ${sentimentMeta.textColor}`}>
                ({sentimentMeta.label})
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Net Bias: {bullCount > bearCount ? `+${bullCount - bearCount} Bullish` : bearCount > bullCount ? `${bullCount - bearCount} Bearish` : 'Even Split'}
            </p>
          </div>
        </div>

        {/* Right Column: Quantitative Breakdown + Top Drivers (Cols 6-12 on desktop) */}
        <div className="md:col-span-7 space-y-3">
          {/* Quick Metrics 3-Box Strip */}
          <div className="grid grid-cols-3 gap-2">
            {/* Bullish Stocks Box */}
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('BULLISH');
                setIsDrawerOpen(true);
              }}
              className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200/90 text-left hover:bg-emerald-100/70 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                  Bullish
                </span>
                <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded">
                  {bullPct}%
                </span>
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-black font-mono text-emerald-900">{bullCount}</span>
                <span className="text-[10px] text-emerald-700 font-medium">stocks</span>
              </div>
            </button>

            {/* Neutral Stocks Box */}
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('NEUTRAL');
                setIsDrawerOpen(true);
              }}
              className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-left hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                  <Minus className="w-3 h-3 text-slate-400" />
                  Neutral
                </span>
                <span className="text-[9px] font-mono font-bold text-slate-600 bg-slate-200/80 px-1 py-0.2 rounded">
                  {neutralPct}%
                </span>
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-black font-mono text-slate-800">{neutralCount}</span>
                <span className="text-[10px] text-slate-500 font-medium">stocks</span>
              </div>
            </button>

            {/* Bearish Stocks Box */}
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('BEARISH');
                setIsDrawerOpen(true);
              }}
              className="p-2.5 rounded-lg bg-rose-50/80 border border-rose-200/90 text-left hover:bg-rose-100/70 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3 text-rose-600" />
                  Bearish
                </span>
                <span className="text-[9px] font-mono font-bold text-rose-700 bg-rose-100 px-1 py-0.2 rounded">
                  {bearPct}%
                </span>
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-black font-mono text-rose-900">{bearCount}</span>
                <span className="text-[10px] text-rose-700 font-medium">stocks</span>
              </div>
            </button>
          </div>

          {/* Aggregate Distribution Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-emerald-700 font-bold">Bulls: {bullCount} ({bullPct}%)</span>
              <span className="text-slate-500">Neutral: {neutralCount} ({neutralPct}%)</span>
              <span className="text-rose-700 font-bold">Bears: {bearCount} ({bearPct}%)</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${bullPct}%` }}
                className="h-full bg-emerald-500 transition-all duration-300"
                title={`Bullish: ${bullCount} stocks (${bullPct}%)`}
              />
              <div
                style={{ width: `${neutralPct}%` }}
                className="h-full bg-slate-300 transition-all duration-300"
                title={`Neutral: ${neutralCount} stocks (${neutralPct}%)`}
              />
              <div
                style={{ width: `${bearPct}%` }}
                className="h-full bg-rose-500 transition-all duration-300"
                title={`Bearish: ${bearCount} stocks (${bearPct}%)`}
              />
            </div>
          </div>

          {/* Top Momentum Drivers (Advancing vs Declining radar stocks) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {/* Top Gainers */}
            <div className="p-2 rounded-lg bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                Top Bull:
              </span>
              <div className="flex items-center gap-1.5">
                {topGainers.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => onSelectStock?.(g)}
                    className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50 cursor-pointer"
                    title={`View ${g.symbol} detail`}
                  >
                    {g.symbol} <span className="text-emerald-600">+{g.changePercent.toFixed(1)}%</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Top Decliners */}
            <div className="p-2 rounded-lg bg-rose-50/50 border border-rose-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1">
                <ArrowDownRight className="w-3 h-3 text-rose-600" />
                Top Bear:
              </span>
              <div className="flex items-center gap-1.5">
                {topDecliners.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => onSelectStock?.(d)}
                    className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white border border-rose-200 text-rose-800 hover:bg-rose-50 cursor-pointer"
                    title={`View ${d.symbol} detail`}
                  >
                    {d.symbol} <span className="text-rose-600">{d.changePercent.toFixed(1)}%</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Analytical Summary Note */}
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] leading-relaxed text-slate-600 flex items-start justify-between gap-2">
            <div className="flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>{sentimentMeta.summary}</span>
            </div>

            {/* Toggle Drawer Button */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="shrink-0 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 font-mono cursor-pointer"
            >
              <span>{isDrawerOpen ? 'Hide Stocks' : 'Inspect Stocks'}</span>
              {isDrawerOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Stock Inspector Drawer for Category Verification */}
      {isDrawerOpen && (
        <div
          id="sentiment-stocks-drawer"
          className="pt-2 border-t border-slate-100 space-y-2 animate-in fade-in duration-150"
        >
          {/* Category Filter Tabs */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 mr-1 font-mono">
                Category:
              </span>
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`px-2 py-0.5 text-[11px] font-mono rounded cursor-pointer ${
                  selectedCategory === 'ALL'
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({totalCount})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('BULLISH')}
                className={`px-2 py-0.5 text-[11px] font-mono rounded cursor-pointer ${
                  selectedCategory === 'BULLISH'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                Bullish ({bullCount})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('NEUTRAL')}
                className={`px-2 py-0.5 text-[11px] font-mono rounded cursor-pointer ${
                  selectedCategory === 'NEUTRAL'
                    ? 'bg-slate-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Neutral ({neutralCount})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('BEARISH')}
                className={`px-2 py-0.5 text-[11px] font-mono rounded cursor-pointer ${
                  selectedCategory === 'BEARISH'
                    ? 'bg-rose-600 text-white font-bold'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                }`}
              >
                Bearish ({bearCount})
              </button>
            </div>

            <span className="text-[10px] text-slate-400 font-mono">
              Click any stock for full candlestick analysis
            </span>
          </div>

          {/* Compact Stock Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-1">
            {displayedStocks.map((stk) => {
              const classification = stk.marketClassification || getStockClassification(stk);
              const isBull = classification === 'BULLISH';
              const isBear = classification === 'BEARISH';

              return (
                <button
                  key={stk.id}
                  type="button"
                  onClick={() => onSelectStock?.(stk)}
                  className={`p-2 rounded-lg border text-left transition-all cursor-pointer hover:shadow-xs ${
                    isBull
                      ? 'bg-emerald-50/50 border-emerald-200/80 hover:bg-emerald-100/50'
                      : isBear
                      ? 'bg-rose-50/50 border-rose-200/80 hover:bg-rose-100/50'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs font-mono text-slate-900">{stk.symbol}</span>
                    <span
                      className={`text-[9px] font-mono font-bold px-1 rounded ${
                        isBull
                          ? 'bg-emerald-100 text-emerald-800'
                          : isBear
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isBull ? '▲ BULL' : isBear ? '▼ BEAR' : '■ NEU'}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mt-1 text-[11px] font-mono">
                    <span className="font-semibold text-slate-700">{formatINR(stk.ltp)}</span>
                    <span
                      className={`font-bold ${
                        stk.changePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {stk.changePercent >= 0 ? '+' : ''}
                      {stk.changePercent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-[9px] text-slate-400 truncate mt-0.5">{stk.sector}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
