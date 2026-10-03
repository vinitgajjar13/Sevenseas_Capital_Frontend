import { useEffect, useMemo, useRef, useState } from 'react';
import {
  createChart, ColorType, CrosshairMode, LineStyle,
  CandlestickSeries, BarSeries, LineSeries, AreaSeries, BaselineSeries, HistogramSeries,
  type UTCTimestamp, type ISeriesApi, type SeriesType,
} from 'lightweight-charts';
import type { Candle, IndicatorToggles, PriceMode } from './types';
import { UP, DOWN } from './types';
import { bollinger, ema, heikinAshi, macd, renko, rsi, sma, vwap } from './indicators';

interface Props {
  candles: Candle[];
  mode: PriceMode;
  indicators: IndicatorToggles;
  theme: 'light' | 'dark';
  brickSize: number;
  height?: number;
}

const t = (x: number) => x as UTCTimestamp;
const clean = (times: number[], vals: (number | null)[]) =>
  times.flatMap((time, i) => (vals[i] === null ? [] : [{ time: t(time), value: vals[i] as number }]));

export default function AdvancedChart({ candles, mode, indicators, theme, brickSize, height = 560 }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const [legend, setLegend] = useState<string>('');
  const dark = theme === 'dark';

  // Renko uses synthetic, evenly-spaced "time" so bricks are not tied to the clock.
  const renkoBase = 1_700_000_000;
  const renkoData = useMemo(
    () => (mode === 'renko' ? renko(candles, brickSize).map((b, i) => ({
      time: t(renkoBase + i * 86400), open: b.open, close: b.close,
      high: Math.max(b.open, b.close), low: Math.min(b.open, b.close),
    })) : []),
    [candles, mode, brickSize],
  );

  useEffect(() => {
    if (!host.current || !candles.length) return;
    const grid = dark ? '#1c232d' : '#eceff3';
    const chart = createChart(host.current, {
      autoSize: true,
      layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: dark ? '#9aa4b2' : '#475467', fontSize: 12 },
      grid: { vertLines: { color: grid }, horzLines: { color: grid } },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: grid },
      timeScale: {
        borderColor: grid, timeVisible: true, secondsVisible: false,
        ...(mode === 'renko' ? { tickMarkFormatter: (x: number) => `#${Math.round((x - renkoBase) / 86400) + 1}` } : {}),
      },
    });

    const times = candles.map((c) => c.time);
    const closes = candles.map((c) => c.close);
    const ohlc = candles.map((c) => ({ time: t(c.time), open: c.open, high: c.high, low: c.low, close: c.close }));
    const candleOpts = { upColor: UP, downColor: DOWN, borderVisible: false, wickUpColor: UP, wickDownColor: DOWN };

    // ---- main series ----
    let main: ISeriesApi<SeriesType>;
    switch (mode) {
      case 'ohlc':
        main = chart.addSeries(BarSeries, { upColor: UP, downColor: DOWN }); main.setData(ohlc); break;
      case 'heikin':
        main = chart.addSeries(CandlestickSeries, candleOpts);
        main.setData(heikinAshi(candles).map((c) => ({ time: t(c.time), open: c.open, high: c.high, low: c.low, close: c.close }))); break;
      case 'line':
        main = chart.addSeries(LineSeries, { color: '#3b82f6', lineWidth: 2 });
        main.setData(candles.map((c) => ({ time: t(c.time), value: c.close }))); break;
      case 'area':
        main = chart.addSeries(AreaSeries, { lineColor: '#3b82f6', topColor: 'rgba(59,130,246,.35)', bottomColor: 'rgba(59,130,246,0)' });
        main.setData(candles.map((c) => ({ time: t(c.time), value: c.close }))); break;
      case 'baseline':
        main = chart.addSeries(BaselineSeries, {
          baseValue: { type: 'price', price: candles[0].close },
          topLineColor: UP, topFillColor1: 'rgba(31,169,113,.28)', topFillColor2: 'rgba(31,169,113,.04)',
          bottomLineColor: DOWN, bottomFillColor1: 'rgba(229,72,77,.04)', bottomFillColor2: 'rgba(229,72,77,.28)',
        });
        main.setData(candles.map((c) => ({ time: t(c.time), value: c.close }))); break;
      case 'renko':
        main = chart.addSeries(CandlestickSeries, candleOpts); main.setData(renkoData); break;
      default:
        main = chart.addSeries(CandlestickSeries, candleOpts); main.setData(ohlc);
    }

    const overlays = mode !== 'renko'; // indicators are time-based, so skip them on Renko
    if (overlays) {
      if (indicators.volume) {
        const vol = chart.addSeries(HistogramSeries, { priceFormat: { type: 'volume' }, priceScaleId: 'vol', lastValueVisible: false, priceLineVisible: false });
        vol.setData(candles.map((c) => ({ time: t(c.time), value: c.volume, color: c.close >= c.open ? 'rgba(31,169,113,.45)' : 'rgba(229,72,77,.45)' })));
        chart.priceScale('vol').applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
        main.priceScale().applyOptions({ scaleMargins: { top: 0.06, bottom: 0.2 } });
      }
      const line = (color: string, vals: (number | null)[], style = LineStyle.Solid, w: 1 | 2 = 1) => {
        const s = chart.addSeries(LineSeries, { color, lineWidth: w, lineStyle: style, priceLineVisible: false, lastValueVisible: false });
        s.setData(clean(times, vals));
      };
      if (indicators.vwap) line('#f59e0b', vwap(candles), LineStyle.Solid, 2);
      if (indicators.sma20) line('#a855f7', sma(closes, 20));
      if (indicators.ema50) line('#06b6d4', ema(closes, 50));
      if (indicators.bollinger) {
        const b = bollinger(closes);
        line('#64748b', b.map((x) => x.upper)); line('#64748b', b.map((x) => x.lower)); line('#64748b', b.map((x) => x.mid), LineStyle.Dashed);
      }

      let pane = 1;
      if (indicators.rsi) {
        const s = chart.addSeries(LineSeries, { color: '#8b5cf6', lineWidth: 2, priceLineVisible: false }, pane);
        s.setData(clean(times, rsi(closes)));
        [70, 30].forEach((p) => s.createPriceLine({ price: p, color: '#64748b', lineStyle: LineStyle.Dotted, lineWidth: 1, axisLabelVisible: true, title: '' }));
        pane++;
      }
      if (indicators.macd) {
        const m = macd(closes);
        const h = chart.addSeries(HistogramSeries, { priceLineVisible: false, lastValueVisible: false }, pane);
        h.setData(times.flatMap((time, i) => (m.hist[i] === null ? [] : [{ time: t(time), value: m.hist[i] as number, color: (m.hist[i] as number) >= 0 ? 'rgba(31,169,113,.6)' : 'rgba(229,72,77,.6)' }])));
        chart.addSeries(LineSeries, { color: '#3b82f6', lineWidth: 1, priceLineVisible: false, lastValueVisible: false }, pane).setData(clean(times, m.line));
        chart.addSeries(LineSeries, { color: '#f97316', lineWidth: 1, priceLineVisible: false, lastValueVisible: false }, pane).setData(clean(times, m.signal));
      }
      try { chart.panes().forEach((p, i) => i > 0 && p.setHeight(120)); } catch { /* older v5 builds */ }
    }

    // ---- OHLC readout ----
    chart.subscribeCrosshairMove((p) => {
      const d = p.seriesData.get(main) as { open?: number; high?: number; low?: number; close?: number; value?: number } | undefined;
      if (!d) return setLegend('');
      setLegend(d.open !== undefined
        ? `O ${d.open.toFixed(2)}   H ${d.high!.toFixed(2)}   L ${d.low!.toFixed(2)}   C ${d.close!.toFixed(2)}`
        : `Close ${d.value?.toFixed(2)}`);
    });

    chart.timeScale().fitContent();
    return () => chart.remove();
  }, [candles, mode, indicators, dark, renkoData]);

  return (
    <div className="relative w-full" style={{ height }}>
      {legend && (
        <div className="pointer-events-none absolute left-3 top-2 z-10 rounded bg-white/80 px-2 py-1 text-xs tabular-nums text-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
          {legend}
        </div>
      )}
      {mode === 'renko' && (
        <div className="absolute right-3 top-2 z-10 rounded bg-white/80 px-2 py-1 text-xs text-slate-500 dark:bg-slate-900/80 dark:text-slate-400">
          Indicators are hidden on Renko (bricks are not time-based)
        </div>
      )}
      <div ref={host} className="h-full w-full" role="img" aria-label={`${mode} price chart`} />
    </div>
  );
}
