import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  createSeriesMarkers,
  Time,
} from 'lightweight-charts';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  Flag,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { ChartTimeframe, ChartIndicatorType, TradeMarkerItem } from '../../types';
import {
  generateTimeframeOHLCV,
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  generateMockTradeMarkers,
  OHLCVBar,
} from '../../data/mock/stockChart';
import { formatINR, formatNumber } from '../../data/mockData';

interface LightweightCandlestickChartProps {
  stockSymbol: string;
  stockName: string;
  basePrice: number;
  theme?: 'light' | 'dark';
}

export const LightweightCandlestickChart: React.FC<LightweightCandlestickChartProps> = ({
  stockSymbol,
  stockName,
  basePrice,
  theme = 'light',
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  // Series refs
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick', Time> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram', Time> | null>(null);
  const smaSeriesRef = useRef<ISeriesApi<'Line', Time> | null>(null);
  const emaSeriesRef = useRef<ISeriesApi<'Line', Time> | null>(null);

  // Timeframe state
  const [timeframe, setTimeframe] = useState<ChartTimeframe>('5m');
  const timeframes: ChartTimeframe[] = ['1m', '5m', '15m', '30m', '1H', '1D', '1W'];

  // Indicators toggle state
  const [activeIndicators, setActiveIndicators] = useState<Record<ChartIndicatorType, boolean>>({
    MA: true,
    EMA: false,
    RSI: false,
    MACD: false,
  });

  // Trade markers toggle state
  const [showTradeMarkers, setShowTradeMarkers] = useState<boolean>(true);

  // Active hover legend
  const [hoveredBar, setHoveredBar] = useState<OHLCVBar | null>(null);

  // Generate OHLCV data for current timeframe
  const barsData: OHLCVBar[] = useMemo(() => {
    return generateTimeframeOHLCV(basePrice, timeframe, 85);
  }, [basePrice, timeframe]);

  // Current session candle
  const latestBar = barsData[barsData.length - 1] || null;
  const inspectedBar = hoveredBar || latestBar;

  // Initialize and update Lightweight Chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const isDark = theme === 'dark';
    const container = chartContainerRef.current;

    // Create Chart
    const chart = createChart(container, {
      width: container.clientWidth || 700,
      height: 420,
      layout: {
        background: { type: ColorType.Solid, color: isDark ? '#0f172a' : '#ffffff' },
        textColor: isDark ? '#94a3b8' : '#64748b',
        fontFamily: "'Poppins', sans-serif",
      },
      grid: {
        vertLines: { color: isDark ? '#1e293b' : '#f1f5f9' },
        horzLines: { color: isDark ? '#1e293b' : '#f1f5f9' },
      },
      crosshair: {
        vertLine: {
          color: isDark ? '#475569' : '#cbd5e1',
          width: 1,
          style: 1,
          labelBackgroundColor: isDark ? '#334155' : '#475569',
        },
        horzLine: {
          color: isDark ? '#475569' : '#cbd5e1',
          width: 1,
          style: 1,
          labelBackgroundColor: isDark ? '#334155' : '#475569',
        },
      },
      rightPriceScale: {
        borderColor: isDark ? '#1e293b' : '#e2e8f0',
        scaleMargins: {
          top: 0.1,
          bottom: 0.25,
        },
      },
      timeScale: {
        borderColor: isDark ? '#1e293b' : '#e2e8f0',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // 1. Candlestick Series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#f43f5e',
      borderVisible: true,
      borderUpColor: '#059669',
      borderDownColor: '#e11d48',
      wickUpColor: '#10b981',
      wickDownColor: '#f43f5e',
    });
    candleSeriesRef.current = candleSeries;

    // Format bars for Lightweight Charts
    const formattedCandles = barsData.map((b) => ({
      time: b.time as Time,
      open: b.open,
      high: b.high,
      low: b.low,
      close: b.close,
    }));
    candleSeries.setData(formattedCandles);

    // 2. Volume Histogram Series (scaled at bottom)
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#6366f1',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: 'volume',
    });
    volumeSeriesRef.current = volumeSeries;

    chart.priceScale('volume').applyOptions({
      scaleMargins: {
        top: 0.78,
        bottom: 0,
      },
    });

    const formattedVolumes = barsData.map((b) => ({
      time: b.time as Time,
      value: b.volume,
      color: b.close >= b.open ? (isDark ? '#065f46' : '#a7f3d0') : (isDark ? '#881337' : '#fecdd3'),
    }));
    volumeSeries.setData(formattedVolumes);

    // 3. Technical Indicators Series (MA / EMA)
    if (activeIndicators.MA) {
      const smaData = calculateSMA(barsData, 20);
      const smaSeries = chart.addSeries(LineSeries, {
        color: '#f59e0b',
        lineWidth: 2,
        title: 'SMA 20',
      });
      smaSeries.setData(smaData.map((d) => ({ time: d.time as Time, value: d.value })));
      smaSeriesRef.current = smaSeries;
    }

    if (activeIndicators.EMA) {
      const emaData = calculateEMA(barsData, 50);
      const emaSeries = chart.addSeries(LineSeries, {
        color: '#8b5cf6',
        lineWidth: 2,
        title: 'EMA 50',
      });
      emaSeries.setData(emaData.map((d) => ({ time: d.time as Time, value: d.value })));
      emaSeriesRef.current = emaSeries;
    }

    // 4. Trade Markers (Buy, Sell, Entry, Exit)
    if (showTradeMarkers) {
      const markers = generateMockTradeMarkers(barsData);
      const chartMarkers = markers.map((m) => {
        if (m.type === 'BUY') {
          return {
            time: m.time as Time,
            position: 'belowBar' as const,
            color: '#10b981',
            shape: 'arrowUp' as const,
            text: m.text,
          };
        } else if (m.type === 'SELL') {
          return {
            time: m.time as Time,
            position: 'aboveBar' as const,
            color: '#f43f5e',
            shape: 'arrowDown' as const,
            text: m.text,
          };
        } else if (m.type === 'ENTRY') {
          return {
            time: m.time as Time,
            position: 'belowBar' as const,
            color: '#3b82f6',
            shape: 'circle' as const,
            text: m.text,
          };
        } else {
          return {
            time: m.time as Time,
            position: 'aboveBar' as const,
            color: '#f97316',
            shape: 'circle' as const,
            text: m.text,
          };
        }
      });

      // Attach markers via Lightweight Charts plugin
      createSeriesMarkers(candleSeries, chartMarkers);
    }

    // Subscribe to crosshair move for live candle inspector
    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time) {
        setHoveredBar(null);
        return;
      }
      const found = barsData.find((b) => b.time === param.time);
      if (found) {
        setHoveredBar(found);
      }
    });

    chart.timeScale().fitContent();

    // Resize Observer for robust responsive scaling
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length > 0 && chartRef.current) {
        chartRef.current.applyOptions({
          width: entries[0].contentRect.width,
        });
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [barsData, theme, activeIndicators, showTradeMarkers]);

  const toggleIndicator = (ind: ChartIndicatorType) => {
    setActiveIndicators((prev) => ({ ...prev, [ind]: !prev[ind] }));
  };

  const handleResetZoom = () => {
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Chart Control Header: Timeframe Switcher + Indicators + Zoom controls */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80">
        {/* Timeframe Buttons */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
          {timeframes.map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 text-xs font-mono font-bold rounded transition-all cursor-pointer ${
                timeframe === tf
                  ? 'bg-slate-900 text-white dark:bg-indigo-600 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Indicators Selector */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider hidden sm:inline mr-1">
            Indicators:
          </span>

          {/* MA Button */}
          <button
            type="button"
            onClick={() => toggleIndicator('MA')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              activeIndicators.MA
                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-400 font-bold shadow-2xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>SMA 20</span>
          </button>

          {/* EMA Button */}
          <button
            type="button"
            onClick={() => toggleIndicator('EMA')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              activeIndicators.EMA
                ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-400 font-bold shadow-2xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span>EMA 50</span>
          </button>

          {/* RSI Indicator Toggle */}
          <button
            type="button"
            onClick={() => toggleIndicator('RSI')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              activeIndicators.RSI
                ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-400 font-bold shadow-2xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
            }`}
          >
            <TrendingUp className="w-3 h-3 text-indigo-500" />
            <span>RSI (14)</span>
          </button>

          {/* MACD Indicator Toggle */}
          <button
            type="button"
            onClick={() => toggleIndicator('MACD')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              activeIndicators.MACD
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-400 font-bold shadow-2xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
            }`}
          >
            <Sparkles className="w-3 h-3 text-emerald-500" />
            <span>MACD</span>
          </button>

          {/* Trade Markers Toggle */}
          <button
            type="button"
            onClick={() => setShowTradeMarkers(!showTradeMarkers)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              showTradeMarkers
                ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-400 font-bold shadow-2xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
            }`}
            title="Toggle Buy, Sell, Entry, and Exit trade markers"
          >
            <Flag className="w-3 h-3 text-blue-500" />
            <span>Markers</span>
          </button>
        </div>

        {/* Fit / Reset View button */}
        <button
          type="button"
          onClick={handleResetZoom}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer shadow-2xs"
          title="Auto-fit chart view"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Zoom</span>
        </button>
      </div>

      {/* Live Candle OHLCV Strip */}
      {inspectedBar && (
        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 py-1.5 px-3 rounded-lg bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300">
          <span className="font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded">
            {new Date(inspectedBar.time * 1000).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })}{' '}
            IST
          </span>
          <span>
            O: <strong className="text-slate-900 dark:text-white">{formatINR(inspectedBar.open)}</strong>
          </span>
          <span>
            H: <strong className="text-emerald-600 dark:text-emerald-400">{formatINR(inspectedBar.high)}</strong>
          </span>
          <span>
            L: <strong className="text-rose-600 dark:text-rose-400">{formatINR(inspectedBar.low)}</strong>
          </span>
          <span>
            C:{' '}
            <strong
              className={
                inspectedBar.close >= inspectedBar.open
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }
            >
              {formatINR(inspectedBar.close)}
            </strong>
          </span>
          <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">
            Vol: <strong>{formatNumber(inspectedBar.volume)}</strong>
          </span>
          {hoveredBar && (
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-sans ml-auto">
              Inspecting Bar
            </span>
          )}
        </div>
      )}

      {/* Lightweight Charts Canvas Host */}
      <div
        ref={chartContainerRef}
        className="w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xs relative bg-white dark:bg-slate-900"
        style={{ minHeight: 420 }}
      />

      {/* Sub-panel for RSI if enabled */}
      {activeIndicators.RSI && (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 font-mono text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">RSI (14):</span>
            <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
              {calculateRSI(barsData).slice(-1)[0]?.value || 58.4}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
            <span>Overbought: 70</span>
            <span>Neutral: 50</span>
            <span>Oversold: 30</span>
          </div>
        </div>
      )}

      {/* Sub-panel for MACD if enabled */}
      {activeIndicators.MACD && (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 font-mono text-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-800 dark:text-slate-200">MACD (12, 26, 9):</span>
            <span className="text-emerald-600 font-bold">
              Line: {calculateMACD(barsData).macdLine.slice(-1)[0]?.value || '+4.20'}
            </span>
            <span className="text-amber-600 font-bold">
              Signal: {calculateMACD(barsData).signalLine.slice(-1)[0]?.value || '+2.80'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Bullish Cross Momentum
          </span>
        </div>
      )}
    </div>
  );
};

