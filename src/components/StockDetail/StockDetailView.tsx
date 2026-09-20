import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  BarChart2,
  Sparkles,
  CandlestickChart as CandleIcon,
  LineChart as LineChartIcon,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  MoveVertical,
  Droplets,
  Zap,
  Info,
  Bell,
  Gauge,
  X,
  Trash2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { StockRadarItem, PriceAlert } from '../../types';
import { formatINR, formatNumber } from '../../utils/formatters';
import { detectCandlestickPattern, calculateSupportResistance } from '../../utils/technicalPatterns';
import { getFloatAndLiquidity, formatShares } from '../../utils/liquidityMetrics';
import { calculateHistoricalVolatility } from '../../utils/volatilityMetrics';
import { LightweightCandlestickChart } from './LightweightCandlestickChart';

interface StockDetailViewProps {
  stock: StockRadarItem;
  onBack?: () => void;
  onSimulateTrade?: (stock: StockRadarItem) => void;
  onNavigateToForecast?: (symbol: string) => void;
  alerts?: PriceAlert[];
  onSetAlert?: (alert: PriceAlert) => void;
  onRemoveAlert?: (alertId: string) => void;
  theme?: 'light' | 'dark';
}

interface CandlePoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  vwap: number;
  volume: number;
  isGreen: boolean;
  change: number;
  changePct: number;
}

interface RechartsTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  patternInfo?: { pattern: string; signal: string; bias: string } | null;
}

// Memory-efficient and styled OHLC Tooltip for Recharts
const RechartsOHLCTooltip: React.FC<RechartsTooltipProps> = ({ active, payload, patternInfo }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload as CandlePoint;
  if (!data) return null;

  return (
    <div
      id="recharts-ohlc-tooltip"
      className="bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/80 rounded-lg p-3 shadow-2xl font-mono text-xs pointer-events-none min-w-[210px] z-50 animate-in fade-in duration-100"
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-slate-100">{data.time}</span>
          <span className="text-[10px] text-slate-400 font-sans">IST</span>
        </div>
        <span
          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
            data.isGreen
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              : 'bg-rose-950 text-rose-300 border border-rose-800'
          }`}
        >
          {data.isGreen ? '▲ BULL' : '▼ BEAR'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] mb-2">
        <div className="flex justify-between">
          <span className="text-slate-400">Open:</span>
          <span className="font-bold text-white">₹{data.open}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">High:</span>
          <span className="font-bold text-emerald-400">₹{data.high}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Low:</span>
          <span className="font-bold text-rose-400">₹{data.low}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Close:</span>
          <span className="font-bold text-white">₹{data.close}</span>
        </div>
      </div>

      <div className="border-t border-slate-800 pt-1.5 space-y-1 text-[11px]">
        <div className="flex justify-between">
          <span className="text-slate-400">Chg:</span>
          <span className={`font-bold ${data.isGreen ? 'text-emerald-400' : 'text-rose-400'}`}>
            {data.isGreen ? '+' : ''}{data.change} ({data.changePct}%)
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">VWAP:</span>
          <span className="font-bold text-indigo-300">₹{data.vwap}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Volume:</span>
          <span className="text-slate-200">{formatNumber(data.volume)}</span>
        </div>
      </div>

      {patternInfo && (
        <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
          <span className="text-amber-400/90 font-sans">Pattern:</span>
          <span className="text-amber-300 font-bold">{patternInfo.pattern}</span>
        </div>
      )}
    </div>
  );
};

export const StockDetailView: React.FC<StockDetailViewProps> = ({
  stock,
  onBack,
  onSimulateTrade,
  alerts,
  onSetAlert,
  onRemoveAlert,
  theme = 'light',
}) => {
  const [chartMode, setChartMode] = useState<'CANDLE' | 'AREA'>('CANDLE');
  const [hoveredCandleIndex, setHoveredCandleIndex] = useState<number | null>(null);

  // Set Alert Modal States
  const [showAlertModal, setShowAlertModal] = useState<boolean>(false);
  const [alertTargetPrice, setAlertTargetPrice] = useState<string>('');
  const [alertDirection, setAlertDirection] = useState<'ABOVE' | 'BELOW'>('ABOVE');

  // Initialize or reset alert target price when stock changes
  useEffect(() => {
    if (stock.ltp) {
      setAlertTargetPrice(stock.ltp.toFixed(2));
      setAlertDirection('ABOVE');
    }
  }, [stock.id]);

  const activeStockAlerts = useMemo(() => {
    if (!alerts) return [];
    return alerts.filter((a) => a.stockId === stock.id || a.symbol === stock.symbol);
  }, [alerts, stock.id, stock.symbol]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(640);

  // Memory-efficient ResizeObserver with robust cleanup pattern
  useEffect(() => {
    let isMounted = true;
    const updateWidth = () => {
      if (isMounted && containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth || 640);
      }
    };
    updateWidth();

    let ro: ResizeObserver | null = null;
    if (containerRef.current && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(updateWidth);
      ro.observe(containerRef.current);
    }

    return () => {
      isMounted = false;
      if (ro) {
        ro.disconnect();
      }
    };
  }, [stock.id]);

  const isUp = stock.changePercent >= 0;
  const isAboveVwap = stock.ltp >= stock.vwap;
  const patternInfo = detectCandlestickPattern(stock);
  const levels = useMemo(() => calculateSupportResistance(stock), [stock]);
  const liquidityData = useMemo(() => getFloatAndLiquidity(stock), [stock]);
  const volatilityData = useMemo(() => calculateHistoricalVolatility(stock), [stock]);

  // Small intraday price action sparkline data (Recharts)
  const sparklineData = useMemo(() => {
    if (!stock.chartData || stock.chartData.length === 0) return [];
    const pts = stock.chartData.map((pt) => ({
      time: pt.time,
      price: pt.price,
    }));
    if (pts.length > 0 && stock.ltp) {
      pts[pts.length - 1] = { ...pts[pts.length - 1], price: stock.ltp };
    }
    return pts;
  }, [stock.chartData, stock.ltp]);

  const handlePriceInputChange = useCallback(
    (val: string) => {
      setAlertTargetPrice(val);
      const num = parseFloat(val);
      if (!isNaN(num) && stock.ltp) {
        setAlertDirection(num >= stock.ltp ? 'ABOVE' : 'BELOW');
      }
    },
    [stock.ltp]
  );

  const handlePresetClick = useCallback(
    (price: number) => {
      setAlertTargetPrice(price.toFixed(2));
      setAlertDirection(price >= stock.ltp ? 'ABOVE' : 'BELOW');
    },
    [stock.ltp]
  );

  const handleCreateAlert = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const target = parseFloat(alertTargetPrice);
      if (isNaN(target) || target <= 0) return;

      const newAlert: PriceAlert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        stockId: stock.id,
        symbol: stock.symbol,
        targetPrice: +target.toFixed(2),
        direction: alertDirection,
        createdAt: new Date().toLocaleTimeString('en-IN', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        triggered: false,
        initialPrice: stock.ltp,
      };

      onSetAlert?.(newAlert);
      setShowAlertModal(false);
    },
    [alertTargetPrice, alertDirection, stock.id, stock.symbol, stock.ltp, onSetAlert]
  );

  const isBullish = stock.status === 'BULL' || stock.status === 'RE-ENTRY' || (isUp && isAboveVwap);
  const isBearish = stock.status === 'BEAR' || stock.status === 'EXIT' || (!isUp && !isAboveVwap);
  const stockBias: 'Bullish' | 'Bearish' | 'Neutral' = isBullish
    ? 'Bullish'
    : isBearish
    ? 'Bearish'
    : 'Neutral';

  const positionLabel = stock.slot.includes('Slot 1')
    ? 'Slot 1 (Alpha Leader)'
    : stock.slot.includes('Slot 2')
    ? 'Slot 2 (Breakout Momentum)'
    : stock.slot.includes('Slot 3')
    ? 'Slot 3 (Trend Follower)'
    : stock.slot.includes('Slot 4')
    ? 'Slot 4 (Mean-Reversion)'
    : 'Slot 5 (Distribution)';

  // Build authentic 5-Min Intraday Candlestick series from chartData & OHLC
  const candleData: CandlePoint[] = useMemo(() => {
    if (!stock.chartData || stock.chartData.length === 0) return [];

    let prevClose = stock.open915;

    return stock.chartData.map((pt, idx) => {
      const open = idx === 0 ? stock.open915 : prevClose;
      let close = pt.price;
      if (idx === stock.chartData.length - 1) {
        close = stock.ltp;
      }

      // Compute realistic upper & lower wicks
      const candleDiff = Math.abs(close - open);
      const isFirst = idx === 0;

      const wickBuffer = isFirst
        ? 0
        : Math.max(stock.ltp > 1000 ? 2.5 : 0.6, candleDiff * 0.45);

      const high = isFirst
        ? Math.max(open, close, stock.high915)
        : Math.max(open, close) + wickBuffer;

      const low = isFirst
        ? Math.min(open, close, stock.low915)
        : Math.min(open, close) - wickBuffer;

      prevClose = close;
      const isGreen = close >= open;
      const change = +(close - open).toFixed(2);
      const changePct = +((change / (open || 1)) * 100).toFixed(2);

      return {
        time: pt.time,
        open: +open.toFixed(2),
        high: +high.toFixed(2),
        low: +low.toFixed(2),
        close: +close.toFixed(2),
        vwap: +pt.vwap.toFixed(2),
        volume: pt.volume || Math.floor(30000 + Math.random() * 25000),
        isGreen,
        change,
        changePct,
      };
    });
  }, [stock]);

  // Active Candle for Live Status Bar (hovered candle or the latest session candle)
  const activeCandle = useMemo(() => {
    if (hoveredCandleIndex !== null && candleData[hoveredCandleIndex]) {
      return candleData[hoveredCandleIndex];
    }
    return candleData[candleData.length - 1] || null;
  }, [hoveredCandleIndex, candleData]);

  // Scaled dimensions for the SVG Candlestick Bar chart
  const svgHeight = 310;
  const padding = { top: 22, right: 74, bottom: 44, left: 14 };
  const plotWidth = Math.max(100, containerWidth - padding.left - padding.right);
  const pricePlotHeight = 195;
  const volumePlotHeight = 46;
  const volumeGap = 12;

  // Crosshair & Interaction state
  const svgRef = useRef<SVGSVGElement>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  // Price Scaling state (Interactive Drag & Zoom)
  const [priceScaleMultiplier, setPriceScaleMultiplier] = useState<number>(1.0);
  const [pricePanOffset, setPricePanOffset] = useState<number>(0);
  const [isDraggingYAxis, setIsDraggingYAxis] = useState<boolean>(false);
  const dragCleanupRef = useRef<(() => void) | null>(null);

  // Strict cleanup when switching between different stocks or on unmount
  useEffect(() => {
    setHoveredCandleIndex(null);
    setCursorPos(null);
    setPriceScaleMultiplier(1.0);
    setPricePanOffset(0);
    setIsDraggingYAxis(false);

    // Cancel any active drag listener immediately
    if (dragCleanupRef.current) {
      dragCleanupRef.current();
      dragCleanupRef.current = null;
    }
  }, [stock.id]);

  // Clean up any remaining window listeners on component unmount
  useEffect(() => {
    return () => {
      if (dragCleanupRef.current) {
        dragCleanupRef.current();
        dragCleanupRef.current = null;
      }
    };
  }, []);

  // Calculate Base Price Range
  const { baseMinPrice, baseMaxPrice, maxVolume } = useMemo(() => {
    if (candleData.length === 0) {
      return { baseMinPrice: stock.ltp * 0.98, baseMaxPrice: stock.ltp * 1.02, maxVolume: 100000 };
    }

    let min = Math.min(...candleData.map((c) => c.low));
    let max = Math.max(...candleData.map((c) => c.high));

    // Include reference lines so they fit comfortably on canvas
    if (stock.support1) min = Math.min(min, stock.support1);
    if (stock.low915) min = Math.min(min, stock.low915);
    if (stock.resistance1) max = Math.max(max, stock.resistance1);
    if (stock.high915) max = Math.max(max, stock.high915);
    if (stock.ltp) {
      min = Math.min(min, stock.ltp);
      max = Math.max(max, stock.ltp);
    }

    const pricePadding = (max - min) * 0.08 || 5;
    const maxVol = Math.max(...candleData.map((c) => c.volume), 50000);

    return {
      baseMinPrice: +(min - pricePadding).toFixed(2),
      baseMaxPrice: +(max + pricePadding).toFixed(2),
      maxVolume: maxVol,
    };
  }, [candleData, stock]);

  // Applied Scaled Price Range
  const { minPrice, maxPrice } = useMemo(() => {
    const center = (baseMinPrice + baseMaxPrice) / 2 + pricePanOffset;
    const halfSpan = Math.max(0.5, ((baseMaxPrice - baseMinPrice) / 2) * priceScaleMultiplier);
    return {
      minPrice: +(center - halfSpan).toFixed(2),
      maxPrice: +(center + halfSpan).toFixed(2),
    };
  }, [baseMinPrice, baseMaxPrice, priceScaleMultiplier, pricePanOffset]);

  // Price Y scale converter
  const getY = useCallback(
    (price: number) => {
      const range = maxPrice - minPrice || 1;
      const norm = (price - minPrice) / range;
      return padding.top + pricePlotHeight * (1 - norm);
    },
    [maxPrice, minPrice, padding.top, pricePlotHeight]
  );

  // Inverse: Y coordinate to Price converter
  const getPriceFromY = useCallback(
    (y: number) => {
      const norm = 1 - (y - padding.top) / pricePlotHeight;
      const range = maxPrice - minPrice;
      return +(minPrice + norm * range).toFixed(2);
    },
    [maxPrice, minPrice, padding.top, pricePlotHeight]
  );

  // Volume Y scale converter
  const getVolY = useCallback(
    (vol: number) => {
      const norm = Math.min(1, vol / (maxVolume || 1));
      const baseY = padding.top + pricePlotHeight + volumeGap + volumePlotHeight;
      return baseY - norm * volumePlotHeight;
    },
    [maxVolume, padding.top, pricePlotHeight, volumeGap, volumePlotHeight]
  );

  // Price grid steps (4 horizontal levels)
  const priceGridSteps = useMemo(() => {
    const steps = 4;
    const diff = (maxPrice - minPrice) / steps;
    return Array.from({ length: steps + 1 }).map((_, i) => +(minPrice + i * diff).toFixed(2));
  }, [minPrice, maxPrice]);

  // Interactive Drag-to-Scale on Price Axis
  const handlePriceAxisPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setIsDraggingYAxis(true);
    const startY = e.clientY;
    const initialScale = priceScaleMultiplier;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const deltaY = moveEvent.clientY - startY;
      // Dragging downward expands visible price spread (zoom out), dragging upward contracts (zoom in)
      const newScale = Math.max(0.25, Math.min(3.5, initialScale * (1 + deltaY * 0.007)));
      setPriceScaleMultiplier(+newScale.toFixed(3));
    };

    const cleanup = () => {
      setIsDraggingYAxis(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', cleanup);
      window.removeEventListener('pointercancel', cleanup);
      window.removeEventListener('blur', cleanup);
      dragCleanupRef.current = null;
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', cleanup);
    window.addEventListener('pointercancel', cleanup);
    window.addEventListener('blur', cleanup);
    dragCleanupRef.current = cleanup;
  }, [priceScaleMultiplier]);

  // Crosshair Pointer Movement Handler
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!svgRef.current || candleData.length === 0 || isDraggingYAxis) return;
      const rect = svgRef.current.getBoundingClientRect();
      const rawX = e.clientX - rect.left;
      const rawY = e.clientY - rect.top;

      if (
        rawX >= padding.left &&
        rawX <= padding.left + plotWidth &&
        rawY >= padding.top &&
        rawY <= padding.top + pricePlotHeight + volumeGap + volumePlotHeight
      ) {
        const relativeX = rawX - padding.left;
        const slotWidth = plotWidth / candleData.length;
        const idx = Math.max(0, Math.min(candleData.length - 1, Math.floor(relativeX / slotWidth)));
        setHoveredCandleIndex(idx);
        setCursorPos({ x: rawX, y: rawY });
      } else {
        setHoveredCandleIndex(null);
        setCursorPos(null);
      }
    },
    [candleData.length, isDraggingYAxis, padding.left, padding.top, plotWidth, pricePlotHeight, volumeGap, volumePlotHeight]
  );

  const handlePointerLeave = useCallback(() => {
    if (!isDraggingYAxis) {
      setHoveredCandleIndex(null);
      setCursorPos(null);
    }
  }, [isDraggingYAxis]);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<SVGSVGElement>) => {
      if (!svgRef.current || candleData.length === 0 || e.touches.length === 0) return;
      const rect = svgRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      const rawX = touch.clientX - rect.left;
      const rawY = touch.clientY - rect.top;

      if (
        rawX >= padding.left &&
        rawX <= padding.left + plotWidth &&
        rawY >= padding.top &&
        rawY <= padding.top + pricePlotHeight + volumeGap + volumePlotHeight
      ) {
        const relativeX = rawX - padding.left;
        const slotWidth = plotWidth / candleData.length;
        const idx = Math.max(0, Math.min(candleData.length - 1, Math.floor(relativeX / slotWidth)));
        setHoveredCandleIndex(idx);
        setCursorPos({ x: rawX, y: rawY });
      }
    },
    [candleData.length, padding.left, padding.top, plotWidth, pricePlotHeight, volumeGap, volumePlotHeight]
  );

  const handleTouchEnd = useCallback(() => {
    setHoveredCandleIndex(null);
    setCursorPos(null);
  }, []);

  const handleZoomIn = useCallback(() => {
    setPriceScaleMultiplier((prev) => +(Math.max(0.25, prev * 0.85)).toFixed(3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setPriceScaleMultiplier((prev) => +(Math.min(3.5, prev * 1.18)).toFixed(3));
  }, []);

  const handleResetScale = useCallback(() => {
    setPriceScaleMultiplier(1.0);
    setPricePanOffset(0);
  }, []);

const handleFocusSR = useCallback(() => {
const s1 = stock.support1 || levels.support;
const r1 = stock.resistance1 || levels.resistance;

if (!s1 || !r1 || s1 >= r1) return;

    const targetCenter = (s1 + r1) / 2;
    const targetSpan = (r1 - s1) * 1.25; // 25% margin
    const baseCenter = (baseMinPrice + baseMaxPrice) / 2;
    const baseSpan = baseMaxPrice - baseMinPrice || 1;

    setPricePanOffset(+(targetCenter - baseCenter).toFixed(2));
    setPriceScaleMultiplier(+(targetSpan / baseSpan).toFixed(3));
  }, [
    stock.support1,
    stock.resistance1,
    levels.support,
    levels.resistance,
    baseMinPrice,
    baseMaxPrice,
  ]);

  return (
    <div id="stock-detail-view" className="space-y-4 animate-in fade-in duration-150">
      {/* Top Bar with Back Button & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
              title="Return to previous view"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 dark:text-slate-50 tracking-tight font-mono">
                {stock.symbol}
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {stock.sector}
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded border ${
                  stockBias === 'Bullish'
                    ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    : stockBias === 'Bearish'
                    ? 'bg-rose-50 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {stockBias === 'Bullish' ? '▲ Bullish' : stockBias === 'Bearish' ? '▼ Bearish' : '■ Neutral'}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Market Open</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{stock.name}</p>
          </div>
        </div>

        {/* Intraday Price Action Sparkline using Recharts */}
        <div className="hidden md:flex flex-col items-end pr-3 border-r border-slate-200">
          <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">
            <span>Intraday Action</span>
          </div>
          <div className="w-28 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                <defs>
                  <linearGradient id="headerSparklineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isUp ? '#10b981' : '#f43f5e'} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={isUp ? '#10b981' : '#f43f5e'} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <YAxis domain={['dataMin - 0.2', 'dataMax + 0.2']} hide />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={isUp ? '#059669' : '#e11d48'}
                  strokeWidth={1.8}
                  fill="url(#headerSparklineGrad)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live LTP & Day Change */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="text-right">
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {formatINR(stock.ltp)}
            </div>
            <div
              className={`flex items-center justify-end gap-0.5 text-xs font-bold font-mono ${
                isUp ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>
                {isUp ? '+' : ''}
                {stock.change.toFixed(2)} ({isUp ? '+' : ''}
                {stock.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>

          {/* Set Alert Button */}
          <button
            id="btn-set-price-alert"
            type="button"
            onClick={() => setShowAlertModal(true)}
            className={`px-3 py-2 text-xs font-bold rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs ${
              activeStockAlerts.length > 0
                ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
            title="Set price alert for this stock"
          >
            <Bell className={`w-3.5 h-3.5 ${activeStockAlerts.length > 0 ? 'text-amber-600' : 'text-slate-600'}`} />
            <span>Set Alert</span>
            {activeStockAlerts.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-mono flex items-center justify-center font-bold">
                {activeStockAlerts.length}
              </span>
            )}
          </button>

          {onSimulateTrade && (
            <button
              onClick={() => onSimulateTrade(stock)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span>Paper Trade</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid: Left Column (Snapshot & Pattern) | Right Column (Candlestick Bar Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: STOCK SNAPSHOT + KEY LEVELS */}
        <div className="lg:col-span-5 space-y-3.5">
          {/* STOCK SNAPSHOT CARD */}
          <div
            id="stock-snapshot-card"
            className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-slate-600" />
                Stock Snapshot
              </h2>
              <span className="text-[10px] font-mono font-semibold text-slate-400">
                Instant 5-Sec Scan
              </span>
            </div>

            {/* Intraday Price Action Sparkline Widget using Recharts */}
            <div id="snapshot-sparkline-widget" className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/90 space-y-1">
              <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                <span className="flex items-center gap-1">
                  <LineChartIcon className="w-3 h-3 text-slate-500" />
                  Intraday Price Action Sparkline
                </span>
                <span className="font-mono text-[9px] text-slate-400">
                  {sparklineData.length} Points
                </span>
              </div>
              <div className="h-12 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparklineData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                    <defs>
                      <linearGradient id="snapshotSparklineGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={isUp ? '#10b981' : '#f43f5e'} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={isUp ? '#10b981' : '#f43f5e'} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <YAxis domain={['dataMin - 0.2', 'dataMax + 0.2']} hide />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const pt = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white text-[10px] font-mono px-2 py-1 rounded shadow-md border border-slate-800">
                              <span className="text-slate-400">{pt.time}:</span>{' '}
                              <strong className="text-white">₹{Number(pt.price).toFixed(2)}</strong>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke={isUp ? '#059669' : '#e11d48'}
                      strokeWidth={1.8}
                      fill="url(#snapshotSparklineGrad)"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 pt-0.5 border-t border-slate-200/60">
                <span>Open: ₹{stock.open915}</span>
                <span className="text-slate-400">Low: ₹{stock.low915} • High: ₹{stock.high915}</span>
                <span className={isUp ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                  LTP: ₹{stock.ltp}
                </span>
              </div>
            </div>

            {/* Compact 2-Column Grid Layout for Rapid Scanning */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Stat 1: Trend */}
              <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/90 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Trend</span>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-extrabold font-mono px-2.5 py-0.5 rounded shadow-2xs ${
                      isUp
                        ? 'bg-emerald-600 text-white border border-emerald-700'
                        : 'bg-rose-600 text-white border border-rose-700'
                    }`}
                  >
                    <span>{isUp ? '▲' : '▼'}</span>
                    <span>{isUp ? 'BULLISH' : 'BEARISH'}</span>
                  </span>
                </div>
              </div>

              {/* Stat 2: Volume (RVol) */}
              <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/90 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Volume (RVol)</span>
                <div className="mt-1 flex items-baseline gap-1 font-mono">
                  <span className="text-sm font-black text-slate-900">{stock.rvol.toFixed(1)}x</span>
                  <span className="text-[10px] text-slate-500">Relative</span>
                </div>
              </div>

              {/* Stat 3: Candlestick Pattern Indicator Badge */}
              <div className="col-span-2 p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/90 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Candlestick Pattern
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 font-mono">
                    Reliability: {patternInfo.reliability}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-bold font-mono px-2.5 py-1 rounded-md border shadow-2xs whitespace-nowrap ${
                      patternInfo.bias === 'BULLISH'
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                        : patternInfo.bias === 'BEARISH'
                        ? 'bg-rose-50 text-rose-900 border-rose-300'
                        : 'bg-indigo-50 text-indigo-900 border-indigo-200'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        patternInfo.bias === 'BULLISH'
                          ? 'bg-emerald-600'
                          : patternInfo.bias === 'BEARISH'
                          ? 'bg-rose-600'
                          : 'bg-indigo-600'
                      }`}
                    />
                    <span>{patternInfo.pattern}</span>
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600 truncate text-right">
                    {patternInfo.bias === 'BULLISH' ? 'Bullish Reversal' : patternInfo.bias === 'BEARISH' ? 'Bearish Pressure' : 'Consolidation'}
                  </span>
                </div>
              </div>

              {/* Stat 4: Support Price Field */}
              <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Support</span>
                  <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-100/90 text-emerald-800 border border-emerald-200">
                    {levels.isCalculated ? 'Pivot S1' : 'Key S1'}
                  </span>
                </div>
                <div className="mt-1 font-mono text-sm font-black text-emerald-900 tabular-nums">
                  {formatINR(levels.support)}
                </div>
                <span className="text-[9px] text-emerald-700/80 font-medium mt-0.5">
                  {levels.isCalculated ? 'Est. via Pivot Points' : 'Active Support Level'}
                </span>
              </div>

              {/* Stat 5: Resistance Price Field */}
              <div className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-200 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-rose-800 tracking-wider">Resistance</span>
                  <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-rose-100/90 text-rose-800 border border-rose-200">
                    {levels.isCalculated ? 'Pivot R1' : 'Key R1'}
                  </span>
                </div>
                <div className="mt-1 font-mono text-sm font-black text-rose-900 tabular-nums">
                  {formatINR(levels.resistance)}
                </div>
                <span className="text-[9px] text-rose-700/80 font-medium mt-0.5">
                  {levels.isCalculated ? 'Est. via Pivot Points' : 'Active Resistance Level'}
                </span>
              </div>

              {/* Stat 6: Price & Intraday Change */}
              <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/90 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Price (LTP)</span>
                <div className="mt-1 font-mono flex items-baseline justify-between">
                  <span className="text-sm font-black text-slate-900 tabular-nums">{formatINR(stock.ltp)}</span>
                  <span className={`text-[11px] font-bold ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Stat 7: Pivot Reference Point */}
              <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/90 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Pivot Point (P)</span>
                <div className="mt-1 font-mono text-sm font-bold text-slate-800 tabular-nums">
                  {formatINR(levels.pivot)}
                </div>
              </div>

              {/* Stat 8: Position / Slot */}
              <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/90 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Position / Slot</span>
                <div className="mt-1 font-mono text-xs font-bold text-slate-800 truncate" title={positionLabel}>
                  {positionLabel}
                </div>
              </div>

              {/* Stat 9: Sector */}
              <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/90 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Sector</span>
                <div className="mt-1 text-xs font-bold text-slate-800 truncate">
                  {stock.sector}
                </div>
              </div>
            </div>
          </div>

          {/* FLOAT & LIQUIDITY SECTION */}
          <div
            id="stock-float-liquidity-card"
            className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-indigo-600" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Float & Liquidity
                </h2>
              </div>

              {/* Liquidity Shock Indicator Badge */}
              {liquidityData.isLiquidityShock ? (
                <span
                  id="liquidity-shock-badge"
                  className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/25 shadow-2xs"
                  title={liquidityData.statusNote}
                >
                  <Zap className="w-3 h-3 text-amber-600 shrink-0 animate-pulse" />
                  <span>⚡ Liquidity Shock Active</span>
                </span>
              ) : (
                <span
                  id="liquidity-normal-badge"
                  className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200"
                  title={liquidityData.statusNote}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Normal Flow ({liquidityData.freeFloatTurnover.toFixed(2)}%)</span>
                </span>
              )}
            </div>

            {/* Compact Read-Only Stats Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Stat 1: Total Outstanding Shares */}
              <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/90 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Total Shares
                </span>
                <div className="mt-1">
                  <div className="font-mono font-bold text-slate-900 text-sm">
                    {formatShares(liquidityData.totalShares)}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Outstanding</span>
                </div>
              </div>

              {/* Stat 2: Free Float Shares */}
              <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/90 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Free Float
                </span>
                <div className="mt-1">
                  <div className="font-mono font-bold text-slate-900 text-sm">
                    {formatShares(liquidityData.freeFloatShares)}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {liquidityData.freeFloatPercent.toFixed(1)}% of total
                  </span>
                </div>
              </div>

              {/* Stat 3: Today's Volume */}
              <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/90 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Today's Volume
                </span>
                <div className="mt-1">
                  <div className="font-mono font-bold text-slate-900 text-sm">
                    {formatShares(liquidityData.todayVolume)}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {stock.rvol.toFixed(1)}x RVol
                  </span>
                </div>
              </div>

              {/* Stat 4: Free Float Turnover (Key Metric) */}
              <div
                className={`p-2.5 rounded-lg border flex flex-col justify-between ${
                  liquidityData.isLiquidityShock
                    ? 'bg-amber-50/70 border-amber-300/80'
                    : 'bg-slate-50/80 border-slate-200/90'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Float Turnover
                  </span>
                  {liquidityData.isLiquidityShock && (
                    <span className="text-[9px] font-mono font-bold text-amber-700 bg-amber-100 px-1 rounded">
                      &gt;{liquidityData.threshold}%
                    </span>
                  )}
                </div>
                <div className="mt-1">
                  <div
                    className={`font-mono font-black text-sm ${
                      liquidityData.isLiquidityShock ? 'text-amber-900' : 'text-slate-900'
                    }`}
                  >
                    {liquidityData.freeFloatTurnover.toFixed(2)}%
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Vol / Float Ratio
                  </span>
                </div>
              </div>
            </div>

            {/* Status / Insight Note */}
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] leading-relaxed text-slate-600 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>{liquidityData.statusNote}</span>
            </div>
          </div>

          {/* VOLATILITY INDEX (30-DAY HISTORICAL VOLATILITY) */}
          <div
            id="stock-volatility-index-card"
            className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-indigo-600" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Volatility Index (30-Day)
                </h2>
              </div>

              {/* Volatility Regime Badge */}
              <span
                id="volatility-regime-badge"
                className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border shadow-2xs ${volatilityData.regimeColor}`}
                title={volatilityData.summaryNote}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                <span>
                  {volatilityData.regimeLabel} ({volatilityData.annualizedVolatility}%)
                </span>
              </span>
            </div>

            {/* Compact 4-Box Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {/* Stat 1: Annualized Volatility HV30 */}
              <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/90 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  HV30 (Ann.)
                </span>
                <div className="mt-1">
                  <div className="font-mono font-black text-slate-900 text-sm">
                    {volatilityData.annualizedVolatility}%
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono">30D Historical</span>
                </div>
              </div>

              {/* Stat 2: Daily Std Dev */}
              <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/90 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Daily Std Dev (σ)
                </span>
                <div className="mt-1">
                  <div className="font-mono font-bold text-slate-900 text-sm">
                    ±{volatilityData.dailyStdDev}%
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono">Per Session</span>
                </div>
              </div>

              {/* Stat 3: 1-SD Daily Expected Move */}
              <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/90 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  1-SD Move
                </span>
                <div className="mt-1">
                  <div className="font-mono font-bold text-indigo-900 text-sm">
                    ±{formatINR(volatilityData.dailyExpectedMove)}
                  </div>
                  <span className="text-[9px] text-indigo-600/80 font-mono">Expected Swing</span>
                </div>
              </div>

              {/* Stat 4: Daily Open-Close Variance */}
              <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/90 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Variance (σ²)
                </span>
                <div className="mt-1">
                  <div className="font-mono font-bold text-slate-900 text-sm">
                    {volatilityData.dailyVariance} bp
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono">Open-Close</span>
                </div>
              </div>
            </div>

            {/* 30-Day Open-Close Variance Trend Chart using Recharts */}
            <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/90 space-y-1">
              <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                <span>30-Day Open-Close Variances</span>
                <span className="font-mono text-[9px] text-slate-400">
                  Peak: +{volatilityData.maxDailySwingPct}% • Trough: {volatilityData.minDailySwingPct}%
                </span>
              </div>
              <div className="h-12 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={volatilityData.thirtyDayHistory}
                    margin={{ top: 2, right: 2, bottom: 2, left: 2 }}
                  >
                    <defs>
                      <linearGradient id="volatilityVarianceGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <YAxis domain={['dataMin', 'dataMax']} hide />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white text-[10px] font-mono px-2 py-1 rounded shadow-md border border-slate-800">
                              <span className="text-slate-400">{item.day}:</span>{' '}
                              <strong className="text-white">
                                {item.variancePct >= 0 ? '+' : ''}
                                {item.variancePct}%
                              </strong>
                              <div className="text-[9px] text-slate-400">
                                Range: ₹{item.open.toFixed(1)} → ₹{item.close.toFixed(1)}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="variancePct"
                      stroke="#6366f1"
                      strokeWidth={1.8}
                      fill="url(#volatilityVarianceGrad)"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expected 1-SD Trading Range Box */}
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500 font-sans text-[11px]">1-SD Intraday Range:</span>
              <div className="flex items-center gap-3">
                <span>
                  Low: <strong className="text-rose-600">{formatINR(volatilityData.expectedRangeLow)}</strong>
                </span>
                <span>
                  High: <strong className="text-emerald-600">{formatINR(volatilityData.expectedRangeHigh)}</strong>
                </span>
              </div>
            </div>

            {/* Volatility Analytical Note */}
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] leading-relaxed text-slate-600 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>{volatilityData.summaryNote}</span>
            </div>
          </div>

          {/* CANDLESTICK PATTERN & SUPPORT/RESISTANCE DETAIL CARD */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Detected Candlestick Pattern
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                Reliability: {patternInfo.reliability}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-500 uppercase">Pattern</span>
                <span className="font-mono text-sm font-black text-indigo-900 tracking-wide">
                  {patternInfo.pattern}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                {patternInfo.description}
              </p>
            </div>

            {/* Support & Resistance Table */}
            <div className="space-y-2 pt-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Key Support & Resistance Levels
              </h4>
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] text-emerald-700 font-semibold block uppercase font-sans">
                    Support
                  </span>
                  <span className="font-bold text-emerald-900 text-sm">{formatINR(levels.support)}</span>
                </div>

                <div className="p-2 rounded-lg bg-slate-100 border border-slate-200">
                  <span className="text-[10px] text-slate-600 font-semibold block uppercase font-sans">
                    Pivot
                  </span>
                  <span className="font-bold text-slate-900 text-sm">{formatINR(levels.pivot)}</span>
                </div>

                <div className="p-2 rounded-lg bg-rose-50 border border-rose-200">
                  <span className="text-[10px] text-rose-700 font-semibold block uppercase font-sans">
                    Resistance
                  </span>
                  <span className="font-bold text-rose-900 text-sm">{formatINR(levels.resistance)}</span>
                </div>
              </div>
            </div>

            {/* 9:15 AM Opening Range */}
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500 font-sans">9:15 AM Range:</span>
              <div className="flex items-center gap-3">
                <span>L: <strong className="text-rose-600">{formatINR(stock.low915)}</strong></span>
                <span>H: <strong className="text-emerald-600">{formatINR(stock.high915)}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FOCUSED ELEMENT - CANDLESTICK BAR CHART & STRATEGY DECISION */}
        x   <div className="lg:col-span-7 space-y-3.5">
          {/* FOCUSED ELEMENT: LIGHTWEIGHT CHARTS CANDLESTICK CARD */}
          <div
            id="stock-chart-card"
            className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3"
          >
            <LightweightCandlestickChart
              stockSymbol={stock.symbol}
              stockName={stock.name}
              basePrice={stock.ltp}
              theme={theme}
            />
          </div>

          {/* QUANT STRATEGY & TRADE DECISION SETUP */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-slate-600" />
                Strategy Triggers & Decision Setup
              </h3>
              <span className="text-xs font-mono font-bold text-indigo-700">
                Quant Score: {stock.score}/100
              </span>
            </div>

            {stock.capital && (
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-800 dark:text-indigo-300">
                  Allocated Trading Capital (Position Sizing):
                </span>
                <span className="text-sm font-mono font-bold text-indigo-950 dark:text-indigo-200">
                  {formatINR(stock.capital)}
                </span>
              </div>
            )}

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 font-medium">
              <span className="font-semibold text-slate-900 block mb-0.5">Trigger Condition:</span>
              <p>{stock.conditionMet}</p>
            </div>

            <div className={`grid grid-cols-1 ${stock.target3 ? 'sm:grid-cols-5' : 'sm:grid-cols-3'} gap-2.5 text-xs font-mono`}>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                <span className="text-[10px] text-slate-500 font-sans block">Target 1</span>
                <span className="font-bold text-emerald-600 text-sm">{formatINR(stock.target1)}</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                <span className="text-[10px] text-slate-500 font-sans block">Target 2</span>
                <span className="font-bold text-emerald-700 text-sm">{formatINR(stock.target2)}</span>
              </div>
              {stock.target3 && (
                <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                  <span className="text-[10px] text-slate-500 font-sans block">Target 3</span>
                  <span className="font-bold text-emerald-700 text-sm">{formatINR(stock.target3)}</span>
                </div>
              )}
              {stock.target4 && (
                <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                  <span className="text-[10px] text-slate-500 font-sans block">Target 4 (Trailing)</span>
                  <span className="font-bold text-emerald-800 text-sm">{formatINR(stock.target4)}</span>
                </div>
              )}
              <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                <span className="text-[10px] text-slate-500 font-sans block">Stop Loss</span>
                <span className="font-bold text-rose-600 text-sm">{formatINR(stock.stopLoss)}</span>
              </div>
            </div>

            {stock.comment && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-0.5">
                  Sector Radar Analysis & Commentary:
                </span>
                <p className="text-slate-600 dark:text-slate-300">{stock.comment}</p>
              </div>
            )}

            {/* Suggested Contract & Direct Action */}
            <div className="p-3 rounded-lg bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  Action Bias / Suggested Instrument
                </span>
                <span className="text-sm font-bold font-mono text-emerald-400">
                  {stock.action} • {stock.suggestedStrike || 'Spot MIS'}
                </span>
              </div>

              {onSimulateTrade && (
                <button
                  onClick={() => onSimulateTrade(stock)}
                  className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors shadow-xs shrink-0 cursor-pointer"
                >
                  Execute Paper Trade
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SET ALERT MODAL DIALOG */}
      {showAlertModal && (
        <div
          id="set-alert-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
          onClick={() => setShowAlertModal(false)}
        >
          <div
            id="set-alert-modal-card"
            className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm font-mono">
                    Set Price Alert • {stock.symbol}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Get notified instantly when tick hits target price
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAlertModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Price Banner */}
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between font-mono text-xs">
              <span className="text-slate-500 font-sans">Current LTP:</span>
              <span className="text-sm font-black text-slate-900">{formatINR(stock.ltp)}</span>
            </div>

            <form onSubmit={handleCreateAlert} className="space-y-3.5">
              {/* Target Price Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Target Price (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-mono font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    id="input-alert-target-price"
                    type="number"
                    step="0.05"
                    min="1"
                    required
                    value={alertTargetPrice}
                    onChange={(e) => handlePriceInputChange(e.target.value)}
                    placeholder="Enter target price level..."
                    className="w-full pl-7 pr-3 py-2 text-sm font-mono font-bold border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-900"
                    autoFocus
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Quick Presets
                </span>
                <div className="flex flex-wrap gap-1.5 text-xs font-mono">
                  {stock.target1 && (
                    <button
                      type="button"
                      onClick={() => handlePresetClick(stock.target1)}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] cursor-pointer"
                    >
                      T1 (₹{stock.target1})
                    </button>
                  )}
                  {stock.resistance1 && (
                    <button
                      type="button"
                      onClick={() => handlePresetClick(stock.resistance1)}
                      className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-[11px] cursor-pointer"
                    >
                      R1 (₹{stock.resistance1})
                    </button>
                  )}
                  {stock.support1 && (
                    <button
                      type="button"
                      onClick={() => handlePresetClick(stock.support1)}
                      className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] cursor-pointer"
                    >
                      S1 (₹{stock.support1})
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handlePresetClick(+(stock.ltp * 1.01).toFixed(2))}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] cursor-pointer"
                  >
                    +1% (₹{+(stock.ltp * 1.01).toFixed(2)})
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetClick(+(stock.ltp * 0.99).toFixed(2))}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] cursor-pointer"
                  >
                    -1% (₹{+(stock.ltp * 0.99).toFixed(2)})
                  </button>
                </div>
              </div>

              {/* Alert Direction Toggle */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Trigger Condition
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setAlertDirection('ABOVE')}
                    className={`p-2 rounded-lg border font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                      alertDirection === 'ABOVE'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs font-bold'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Price Rises Above</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlertDirection('BELOW')}
                    className={`p-2 rounded-lg border font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                      alertDirection === 'BELOW'
                        ? 'bg-rose-50 text-rose-800 border-rose-300 shadow-2xs font-bold'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                    <span>Price Drops Below</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAlertModal(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Set Alert</span>
                </button>
              </div>
            </form>

            {/* Existing Active / Triggered Alerts for this stock */}
            {activeStockAlerts.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Active Alerts ({activeStockAlerts.length})
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {activeStockAlerts.map((alt) => (
                    <div
                      key={alt.id}
                      className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${
                            alt.direction === 'ABOVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {alt.direction === 'ABOVE' ? '▲ ≥' : '▼ ≤'}
                        </span>
                        <span className="font-mono font-bold text-slate-900">
                          {formatINR(alt.targetPrice)}
                        </span>
                        {alt.triggered ? (
                          <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            Triggered
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">
                            Created {alt.createdAt}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveAlert?.(alt.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete alert"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
