import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Shield,
  Layers,
  Sparkles,
  Zap,
  BarChart3,
  Info,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Sliders,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { StockRadarItem } from '../types';
import { formatINR, formatNumber } from '../data/mockData';

interface StockVisualAnalyzerProps {
  stocks: StockRadarItem[];
  selectedSymbol?: string;
  onSelectStock: (stock: StockRadarItem) => void;
  onSelectForecast: (stock: StockRadarItem) => void;
  onSimulateTrade?: (stock: StockRadarItem) => void;
}

export const StockVisualAnalyzer: React.FC<StockVisualAnalyzerProps> = ({
  stocks,
  selectedSymbol,
  onSelectStock,
  onSelectForecast,
  onSimulateTrade,
}) => {
  const [currentSymbol, setCurrentSymbol] = useState<string>(selectedSymbol || stocks[0]?.symbol || 'M&M');
  const [chartViewMode, setChartViewMode] = useState<'price-vwap' | 'vol-surge' | 'strategy-levels'>('price-vwap');
  const [activeRange, setActiveRange] = useState<'INTRADAY' | 'PIVOTS'>('INTRADAY');

  const currentStock = useMemo(() => {
    return stocks.find((s) => s.symbol === currentSymbol) || stocks[0] || null;
  }, [stocks, currentSymbol]);

  if (!currentStock) return null;

  const isBullish = currentStock.changePercent >= 0;
  const isAboveVwap = currentStock.ltp >= currentStock.vwap;
  const vwapDiff = currentStock.ltp - currentStock.vwap;
  const vwapDiffPct = (vwapDiff / currentStock.vwap) * 100;
  
  // Risk to reward calculation
  const potentialReward = Math.abs(currentStock.target1 - currentStock.ltp);
  const potentialRisk = Math.abs(currentStock.ltp - currentStock.stopLoss);
  const rrRatio = potentialRisk > 0 ? (potentialReward / potentialRisk).toFixed(2) : '1.50';

  // Format chart series
  const chartData = currentStock.chartData || [];

  return (
    <div
      id="stock-visual-analyzer"
      className="bg-white rounded-lg border border-slate-200 shadow-2xs p-4 sm:p-5 space-y-4"
    >
      {/* 1. Header & Stock Quick Selector Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-slate-900 text-white">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Visual Stock Chart & Strategy Analyzer
              </h2>
              <span className="px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded">
                Live Analysis
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Interactive multi-layer chart breaking down price action, VWAP confluence, 9:15 AM breakout, and volume surge.
            </p>
          </div>
        </div>

        {/* Chart View Modes */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-md border border-slate-200/80 self-start md:self-auto">
          <button
            onClick={() => setChartViewMode('price-vwap')}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition-all ${
              chartViewMode === 'price-vwap'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Price & VWAP
          </button>
          <button
            onClick={() => setChartViewMode('strategy-levels')}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition-all ${
              chartViewMode === 'strategy-levels'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Strategy Targets
          </button>
          <button
            onClick={() => setChartViewMode('vol-surge')}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition-all ${
              chartViewMode === 'vol-surge'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Volume Surge
          </button>
        </div>
      </div>

      {/* 2. Horizontal Quick Stock Carousel */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200">
        {stocks.slice(0, 8).map((stk) => {
          const isSelected = stk.symbol === currentSymbol;
          const up = stk.changePercent >= 0;
          return (
            <button
              key={stk.id}
              onClick={() => setCurrentSymbol(stk.symbol)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left border transition-all shrink-0 ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold font-mono">{stk.symbol}</span>
                  <span
                    className={`text-[9px] font-semibold px-1 py-0.2 rounded ${
                      isSelected
                        ? 'bg-slate-800 text-slate-200'
                        : up
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {up ? '+' : ''}
                    {stk.changePercent.toFixed(2)}%
                  </span>
                </div>
                <span className={`text-[10px] font-mono ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {formatINR(stk.ltp)}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Main Chart & Anatomy Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Visual Chart Canvas */}
        <div className="lg:col-span-8 space-y-4">
          {/* Stock Header & Key Snapshot */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/70">
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold font-mono text-slate-900">{currentStock.symbol}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                    {currentStock.sector}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${
                      currentStock.status === 'BULL'
                        ? 'bg-emerald-100 text-emerald-800'
                        : currentStock.status === 'BEAR'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {currentStock.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{currentStock.name}</p>
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-900">
                {formatINR(currentStock.ltp)}
              </span>
              <span
                className={`flex items-center text-xs font-bold ${
                  isBullish ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {isBullish ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
                {isBullish ? '+' : ''}
                {formatINR(currentStock.change)} ({isBullish ? '+' : ''}
                {currentStock.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>

          {/* Interactive Chart Canvas */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative">
            {/* Chart Legend / Guide */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-2 border-b border-slate-800/80 text-xs">
              <div className="flex items-center gap-4 text-[11px] font-mono">
                <span className="flex items-center gap-1.5 text-slate-200">
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500"></span>
                  LTP Price ({formatINR(currentStock.ltp)})
                </span>
                <span className="flex items-center gap-1.5 text-blue-400">
                  <span className="w-3 h-0.5 bg-blue-400"></span>
                  VWAP ({formatINR(currentStock.vwap)})
                </span>
                {chartViewMode === 'strategy-levels' && (
                  <>
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="w-3 h-0.5 border-t-2 border-emerald-400 border-dashed"></span>
                      T1 ({formatINR(currentStock.target1)})
                    </span>
                    <span className="flex items-center gap-1.5 text-rose-400">
                      <span className="w-3 h-0.5 border-t-2 border-rose-400 border-dashed"></span>
                      SL ({formatINR(currentStock.stopLoss)})
                    </span>
                  </>
                )}
                {chartViewMode === 'price-vwap' && (
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <span className="w-3 h-0.5 border-t-2 border-amber-400 border-dashed"></span>
                    9:15 High ({formatINR(currentStock.high915)})
                  </span>
                )}
              </div>

              <div className="text-[11px] text-slate-400">
                Timeframe: <span className="font-semibold text-slate-200">Intraday 5M</span>
              </div>
            </div>

            {/* Recharts Area / Composed Chart */}
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartViewMode === 'vol-surge' ? (
                  <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis
                      dataKey="time"
                      stroke="#94a3b8"
                      fontSize={10}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={10}
                      tickLine={false}
                      tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                              <p className="font-bold text-slate-300">Time: {label}</p>
                              <p className="text-emerald-400 font-mono">
                                Volume: {data.volume.toLocaleString('en-IN')} shares
                              </p>
                              <p className="text-blue-300 font-mono">
                                Price: {formatINR(data.price)}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="volume" fill="#10b981" radius={[3, 3, 0, 0]} opacity={0.85} />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#38bdf8"
                      dot={false}
                      strokeWidth={1.5}
                      yAxisId="right"
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#38bdf8"
                      fontSize={10}
                      domain={['auto', 'auto']}
                      tickFormatter={(val) => `₹${val}`}
                    />
                  </ComposedChart>
                ) : (
                  <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="bullGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="bearGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis
                      dataKey="time"
                      stroke="#94a3b8"
                      fontSize={10}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={10}
                      tickLine={false}
                      domain={['auto', 'auto']}
                      tickFormatter={(val) => `₹${val}`}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const above = data.price >= data.vwap;
                          return (
                            <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs space-y-1.5 font-mono">
                              <p className="font-bold text-slate-300 font-sans">Time: {label}</p>
                              <div className="flex justify-between gap-4">
                                <span className="text-slate-400">Price:</span>
                                <span className="font-bold text-white">{formatINR(data.price)}</span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-blue-400">VWAP:</span>
                                <span className="font-bold text-blue-300">{formatINR(data.vwap)}</span>
                              </div>
                              <div className="flex justify-between gap-4 pt-1 border-t border-slate-800">
                                <span className="text-slate-400">Status:</span>
                                <span className={above ? 'text-emerald-400' : 'text-rose-400'}>
                                  {above ? '▲ Above VWAP (Bullish)' : '▼ Below VWAP (Bearish)'}
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />

                    {/* Reference Lines */}
                    {chartViewMode === 'price-vwap' && (
                      <ReferenceLine
                        y={currentStock.high915}
                        stroke="#f59e0b"
                        strokeDasharray="4 4"
                        label={{
                          value: '9:15 High',
                          fill: '#fbbf24',
                          fontSize: 10,
                          position: 'insideTopRight',
                        }}
                      />
                    )}

                    {chartViewMode === 'strategy-levels' && (
                      <>
                        <ReferenceLine
                          y={currentStock.target1}
                          stroke="#10b981"
                          strokeDasharray="4 4"
                          label={{
                            value: `Target 1: ₹${currentStock.target1}`,
                            fill: '#34d399',
                            fontSize: 10,
                            position: 'insideTopRight',
                          }}
                        />
                        <ReferenceLine
                          y={currentStock.stopLoss}
                          stroke="#ef4444"
                          strokeDasharray="4 4"
                          label={{
                            value: `SL: ₹${currentStock.stopLoss}`,
                            fill: '#f87171',
                            fontSize: 10,
                            position: 'insideBottomRight',
                          }}
                        />
                      </>
                    )}

                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke={isBullish ? '#10b981' : '#f43f5e'}
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill={isBullish ? 'url(#bullGradient)' : 'url(#bearGradient)'}
                    />

                    <Line
                      type="monotone"
                      dataKey="vwap"
                      stroke="#3b82f6"
                      strokeWidth={1.8}
                      strokeDasharray="3 3"
                      dot={false}
                    />
                  </ComposedChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Quick Chart Meaning Bar */}
            <div className="mt-3 p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 flex items-start gap-2 text-xs text-slate-300">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Chart Interpretation: </strong>
                {isAboveVwap
                  ? `Stock is trading strongly above VWAP (+${vwapDiffPct.toFixed(2)}%), indicating strong institutional support on every intraday pullback.`
                  : `Stock is trading below VWAP (${vwapDiffPct.toFixed(2)}%), showing sellers active at resistance levels.`}
                {currentStock.rvol >= 2.0 && ` Volume is elevated at ${currentStock.rvol}x standard daily volume.`}
              </span>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: "Why This Stock?" Quant Anatomy & Strategy Targets */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Strategy Signals & Anatomy
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                Score: {currentStock.score}/100
              </span>
            </div>

            {/* Metric 1: Opening Range Breakout */}
            <div className="flex items-start gap-2.5 p-2.5 bg-white rounded-lg border border-slate-200/60 shadow-xs">
              <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-700 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-900">9:15 AM Range Status</p>
                <p className="text-slate-500 text-[11px]">
                  {currentStock.ltp > currentStock.high915
                    ? `Broke above 9:15 High (₹${currentStock.high915})`
                    : `Inside 9:15 Range (₹${currentStock.low915} - ₹${currentStock.high915})`}
                </p>
              </div>
            </div>

            {/* Metric 2: VWAP Alignment */}
            <div className="flex items-start gap-2.5 p-2.5 bg-white rounded-lg border border-slate-200/60 shadow-xs">
              <div className={`p-1.5 rounded-md shrink-0 ${isAboveVwap ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'}`}>
                <Activity className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-900">Institutional VWAP Edge</p>
                <p className="text-slate-500 text-[11px]">
                  {isAboveVwap
                    ? `+₹${vwapDiff.toFixed(2)} (+${vwapDiffPct.toFixed(2)}%) Above VWAP`
                    : `-₹${Math.abs(vwapDiff).toFixed(2)} Below VWAP`}
                </p>
              </div>
            </div>

            {/* Metric 3: Relative Volume */}
            <div className="flex items-start gap-2.5 p-2.5 bg-white rounded-lg border border-slate-200/60 shadow-xs">
              <div className="p-1.5 rounded-md bg-purple-50 text-purple-700 shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-900">Relative Volume (RVol)</p>
                <p className="text-slate-500 text-[11px]">
                  {currentStock.rvol}x standard volume (Institutional Participation)
                </p>
              </div>
            </div>

            {/* Strategy Targets & Risk/Reward Gauge */}
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Risk : Reward Ratio</span>
                <span className="font-bold text-emerald-700 font-mono">1 : {rrRatio}</span>
              </div>

              {/* Visual Target Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span className="text-rose-600 font-semibold">SL ₹{currentStock.stopLoss}</span>
                  <span className="text-slate-800 font-bold">LTP ₹{currentStock.ltp}</span>
                  <span className="text-emerald-600 font-semibold">T1 ₹{currentStock.target1}</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
                  <div className="w-1/3 bg-rose-400"></div>
                  <div className="w-2/3 bg-emerald-500"></div>
                </div>
              </div>

              {/* Recommended Strike */}
              {currentStock.suggestedStrike && (
                <div className="p-2.5 bg-indigo-50/80 rounded-lg border border-indigo-200/60 text-xs">
                  <div className="flex items-center justify-between text-indigo-900 font-semibold mb-0.5">
                    <span>Suggested Option Strike:</span>
                    <span className="font-mono font-bold">{currentStock.suggestedStrike}</span>
                  </div>
                  <p className="text-[11px] text-indigo-700">
                    High delta contract aligned with {currentStock.slot}.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
            <button
              onClick={() => onSelectStock(currentStock)}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
            >
              <Eye className="w-4 h-4" />
              <span>Inspect Full Technicals</span>
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => onSelectForecast(currentStock)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-xl transition-colors"
              >
                <Target className="w-3.5 h-3.5" />
                <span>Forecast Model</span>
              </button>

              {onSimulateTrade && (
                <button
                  onClick={() => onSimulateTrade(currentStock)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Paper Trade</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
