import React, { useState } from 'react';
import {
  LineChart as LineChartIcon,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Target,
  ArrowRight,
  HelpCircle,
  BarChart2,
  PieChart as PieChartIcon,
  Layers,
  Activity,
  Zap,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts';
import { StrategyForecastModel, StockRadarItem } from '../types';
import { STRATEGY_FORECAST_MODELS, formatINR, formatNumber } from '../data/mockData';

interface StrategyForecastViewProps {
  selectedStockSymbol?: string;
  allStocks: StockRadarItem[];
  onSelectStock: (symbol: string) => void;
}

const PIE_COLORS = ['#4f46e5', '#10b981', '#06b6d4', '#f59e0b', '#8b5cf6', '#ec4899'];
const SCENARIO_COLORS = ['#10b981', '#3b82f6', '#f43f5e'];

export const StrategyForecastView: React.FC<StrategyForecastViewProps> = ({
  selectedStockSymbol = 'M&M',
  allStocks,
  onSelectStock,
}) => {
  const [activeSymbol, setActiveSymbol] = useState<string>(
    STRATEGY_FORECAST_MODELS[selectedStockSymbol] ? selectedStockSymbol : 'M&M'
  );
  const [selectedChartTab, setSelectedChartTab] = useState<'trajectory' | 'factor-pie' | 'scenario-pie' | 'pivot-bars'>('trajectory');

  const forecast = STRATEGY_FORECAST_MODELS[activeSymbol] || STRATEGY_FORECAST_MODELS['M&M'];
  const isBullish = forecast.bias.includes('BULLISH');

  // Quant Factor Weights Pie Data
  const factorPieData = [
    { name: 'Opening Range Breakout (9:15 AM)', value: 25, color: '#4f46e5', desc: 'Breakout above high with volume confirmation' },
    { name: 'Sector Relative Strength', value: 25, color: '#10b981', desc: 'Top sector ranking on Sector Radar' },
    { name: 'Slot Assignment Momentum', value: 20, color: '#06b6d4', desc: 'Slot 1 Alpha Leader / Slot 2 Breakout status' },
    { name: 'Relative Volume (RVol > 2x)', value: 15, color: '#f59e0b', desc: 'Institutional volume surge & absorption' },
    { name: 'VWAP & Moving Average Trend', value: 15, color: '#8b5cf6', desc: 'Price sustained above rising VWAP' },
  ];

  // Scenario Probability Pie Data
  const target1Prob = Math.round(forecast.confidencePercentage * 0.72);
  const target2Prob = Math.round(forecast.confidencePercentage * 0.28);
  const stopLossProb = Math.max(5, 100 - (target1Prob + target2Prob));
  const scenarioPieData = [
    { name: 'Target 1 Reached (High Prob)', value: target1Prob, color: '#10b981' },
    { name: 'Target 2 Extended (Trend Day)', value: target2Prob, color: '#3b82f6' },
    { name: 'SL Invalidation (Risk Bound)', value: stopLossProb, color: '#f43f5e' },
  ];

  // Pivot Corridor Bar Chart Data
  const pivotBarData = [
    { level: 'Support 2', price: forecast.support2, type: 'Support', fill: '#94a3b8' },
    { level: 'Support 1', price: forecast.support1, type: 'Support', fill: '#64748b' },
    { level: 'Stop Loss', price: forecast.invalidationLevel, type: 'Risk Floor', fill: '#f43f5e' },
    { level: 'Pivot (P)', price: forecast.pivot, type: 'Central Pivot', fill: '#334155' },
    { level: 'Resistance 1', price: forecast.resistance1, type: 'Resistance', fill: '#cbd5e1' },
    { level: 'Target 1', price: forecast.target1, type: 'Target', fill: '#10b981' },
    { level: 'Target 2', price: forecast.target2, type: 'Target', fill: '#059669' },
  ];

  return (
    <div id="strategy-forecast-view" className="space-y-5">
      {/* Mandatory Strategy Forecast Disclaimer Banner */}
      <div
        id="forecast-disclaimer-banner"
        className="p-4 bg-amber-50/90 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-3 shadow-2xs"
      >
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-amber-950">
            Strategy-Based Quantitative Forecast Notice
          </p>
          <p className="text-amber-800 leading-relaxed">
            Forecasts and signals are generated mathematically from the configured algorithmic strategy, price breakout parameters, sector momentum rankings, and historical probability models. 
            <span className="font-bold text-amber-950"> They are not guaranteed predictions, nor do they constitute personal investment advice or return assurances.</span>
          </p>
        </div>
      </div>

      {/* Stock Selection & Horizon Header */}
      <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <LineChartIcon className="w-4 h-4 text-indigo-600" />
                Strategy-Based Quant Forecast & Visual Models
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {forecast.timeframe}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Statistical model projection based on opening 9:15 AM range, VWAP slope, sector relative strength, and historical volatility corridors.
            </p>
          </div>

          {/* Stock Selector Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="forecast-stock-select" className="text-xs font-semibold text-slate-600 whitespace-nowrap">
              Select Stock:
            </label>
            <select
              id="forecast-stock-select"
              value={activeSymbol}
              onChange={(e) => {
                setActiveSymbol(e.target.value);
                onSelectStock(e.target.value);
              }}
              className="py-1.5 px-3 text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              {Object.keys(STRATEGY_FORECAST_MODELS).map((sym) => (
                <option key={sym} value={sym}>
                  {sym} - {STRATEGY_FORECAST_MODELS[sym].name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1: Directional Bias */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">Model Bias</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
              Quant
            </span>
          </div>
          <div
            className={`text-lg font-bold flex items-center gap-1.5 ${
              isBullish ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {isBullish ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            <span>{forecast.bias}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Derived from 5 algorithmic conditions
          </p>
        </div>

        {/* Metric 2: Confidence Probability */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">Probability Score</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
              High Fit
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {forecast.confidencePercentage}%
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-indigo-600 rounded-full"
              style={{ width: `${forecast.confidencePercentage}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Target Corridor */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">Projected Targets</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
              T1 / T2
            </span>
          </div>
          <div className="text-base font-bold font-mono text-slate-900">
            {formatINR(forecast.target1)} <span className="text-slate-400 font-normal text-xs">/</span> {formatINR(forecast.target2)}
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <Target className="w-3 h-3" />
            R:R Ratio: {forecast.riskRewardRatio}
          </div>
        </div>

        {/* Metric 4: Invalidation Level */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">Invalidation Stop</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700">
              Hard Exit
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-rose-600">
            {formatINR(forecast.invalidationLevel)}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Strategy model cancels if breached
          </p>
        </div>
      </div>

      {/* Interactive Visual Chart Suite (Area, Pie & Bar Visuals) */}
      <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        {/* Navigation Tabs for Charts */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-600" />
              Interactive Forecast & Strategy Visuals ({forecast.symbol})
            </h3>
            <p className="text-xs text-slate-500">
              Explore trajectory projections, quant weight distribution pie charts, scenario odds, and price pivot ranges.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/90 rounded-lg border border-slate-200">
            <button
              onClick={() => setSelectedChartTab('trajectory')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                selectedChartTab === 'trajectory'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5" />
              <span>Trajectory Cone</span>
            </button>
            <button
              onClick={() => setSelectedChartTab('factor-pie')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                selectedChartTab === 'factor-pie'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieChartIcon className="w-3.5 h-3.5 text-indigo-600" />
              <span>Strategy Weight Pie</span>
            </button>
            <button
              onClick={() => setSelectedChartTab('scenario-pie')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                selectedChartTab === 'scenario-pie'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieChartIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>Scenario Odds Pie</span>
            </button>
            <button
              onClick={() => setSelectedChartTab('pivot-bars')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                selectedChartTab === 'pivot-bars'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5 text-slate-700" />
              <span>Pivots Bar Chart</span>
            </button>
          </div>
        </div>

        {/* 1. Trajectory Cone Area Chart */}
        {selectedChartTab === 'trajectory' && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-600">
              <span>Expected 5-Day Trajectory Corridor with Support & Resistance Bounds</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="font-medium text-slate-600">Optimistic</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                  <span className="font-medium text-slate-600">Baseline</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                  <span className="font-medium text-slate-600">Conservative</span>
                </div>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecast.projectedTrajectory} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOptimistic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                  <YAxis domain={['auto', 'auto']} stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip
                    formatter={(value: any) => [`₹${Number(value).toFixed(2)}`, '']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '0.5rem',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="optimistic"
                    name="Optimistic Target"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorOptimistic)"
                  />
                  <Area
                    type="monotone"
                    dataKey="baseline"
                    name="Baseline Model"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorBaseline)"
                  />
                  <Area
                    type="monotone"
                    dataKey="conservative"
                    name="Conservative Support"
                    stroke="#94a3b8"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    fillOpacity={0}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 2. Quant Strategy Decision Factors Donut/Pie Chart */}
        {selectedChartTab === 'factor-pie' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center animate-fade-in py-2">
            <div className="md:col-span-6 h-72 w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={factorPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {factorPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-lg text-xs shadow-xl space-y-1">
                            <p className="font-bold flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                              {data.name}
                            </p>
                            <p className="text-slate-300 font-mono">Strategy Weight: {data.value}%</p>
                            <p className="text-[11px] text-slate-400">{data.desc}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-slate-500 font-medium">Model Fit</span>
                <span className="text-xl font-bold font-mono text-slate-900">{forecast.confidencePercentage}%</span>
              </div>
            </div>

            <div className="md:col-span-6 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Decision Factor Weighting Matrix
              </h4>
              <div className="space-y-2">
                {factorPieData.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <div className="truncate">
                        <p className="font-semibold text-slate-900 truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{item.desc}</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-800 shrink-0">
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. Scenario Odds Donut / Pie Chart */}
        {selectedChartTab === 'scenario-pie' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center animate-fade-in py-2">
            <div className="md:col-span-6 h-72 w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={scenarioPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {scenarioPieData.map((entry, index) => (
                      <Cell key={`cell-scenario-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-lg text-xs shadow-xl space-y-1">
                            <p className="font-bold flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                              {data.name}
                            </p>
                            <p className="text-slate-300 font-mono">Odds Probability: {data.value}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-slate-500 font-medium">Win Bias</span>
                <span className="text-xl font-bold font-mono text-emerald-600">
                  {target1Prob + target2Prob}%
                </span>
              </div>
            </div>

            <div className="md:col-span-6 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Probability Scenario Breakdown
              </h4>
              <div className="space-y-2.5">
                <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Target 1 Hit Odds (₹{forecast.target1})
                    </span>
                    <span className="font-mono font-bold text-emerald-700">{target1Prob}%</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    High likelihood of achieving first target corridor based on institutional morning accumulation.
                  </p>
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-900 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-blue-600" />
                      Target 2 Extension (₹{forecast.target2})
                    </span>
                    <span className="font-mono font-bold text-blue-700">{target2Prob}%</span>
                  </div>
                  <p className="text-[11px] text-blue-700">
                    Extension odds triggered if afternoon sector momentum continues above R1 pivot.
                  </p>
                </div>

                <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-rose-900 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      Stop Loss Risk Odds (₹{forecast.invalidationLevel})
                    </span>
                    <span className="font-mono font-bold text-rose-700">{stopLossProb}%</span>
                  </div>
                  <p className="text-[11px] text-rose-700">
                    Model invalidates if price breaks below the 9:15 AM opening candle low.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Pivot Corridor Bar Chart */}
        {selectedChartTab === 'pivot-bars' && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Comparative Price Structure & Pivot Levels</span>
              <span className="font-mono text-slate-500">Central Pivot: ₹{forecast.pivot}</span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pivotBarData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="level" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis domain={['auto', 'auto']} stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-xl space-y-1">
                            <p className="font-bold text-slate-200">{label}</p>
                            <p className="font-mono text-emerald-400">Price: {formatINR(data.price)}</p>
                            <p className="text-[10px] text-slate-400">Classification: {data.type}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine y={forecast.pivot} stroke="#334155" strokeDasharray="3 3" label={{ value: 'Pivot', position: 'left', fontSize: 10, fill: '#64748b' }} />
                  <Bar dataKey="price" radius={[4, 4, 0, 0]}>
                    {pivotBarData.map((entry, index) => (
                      <Cell key={`bar-cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Grid: Key Pivot Levels + Strategy Rule Evaluation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Key Pivot Corridor */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <Target className="w-4 h-4 text-indigo-600" />
            Calculated Key Price Levels (Intraday & Swing)
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded bg-rose-50/60 border border-rose-100">
              <span className="font-medium text-rose-900">Resistance 2 (R2 Extension):</span>
              <span className="font-mono font-bold text-rose-700">{formatINR(forecast.resistance2)}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-rose-50/40 border border-rose-100">
              <span className="font-medium text-rose-800">Resistance 1 (R1 Pivot):</span>
              <span className="font-mono font-bold text-rose-700">{formatINR(forecast.resistance1)}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-100 border border-slate-200">
              <span className="font-bold text-slate-900">Daily Central Pivot Point (P):</span>
              <span className="font-mono font-bold text-slate-900">{formatINR(forecast.pivot)}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-emerald-50/40 border border-emerald-100">
              <span className="font-medium text-emerald-800">Support 1 (S1 VWAP Band):</span>
              <span className="font-mono font-bold text-emerald-700">{formatINR(forecast.support1)}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-emerald-50/60 border border-emerald-100">
              <span className="font-medium text-emerald-900">Support 2 (S2 Major Floor):</span>
              <span className="font-mono font-bold text-emerald-700">{formatINR(forecast.support2)}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <p><span className="font-semibold text-slate-700">Model Rationale:</span> {forecast.rationale}</p>
          </div>
        </div>

        {/* Right: Algorithmic Rules Checklist */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Strategy Condition Evaluation Checklist
          </h3>

          <div className="space-y-2.5">
            {forecast.keyRulesMet.map((rule, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 flex items-start justify-between gap-2"
              >
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{rule.rule}</p>
                    <p className="text-[10px] text-slate-500">Weight: {rule.weight}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 shrink-0">
                  PASSED
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
