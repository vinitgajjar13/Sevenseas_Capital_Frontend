import { useMemo, useState } from 'react';
import type { Candle, ChartTab, HeatmapItem, IndicatorToggles, OrderBook } from './types';
import { atr, resample } from './indicators';
import AdvancedChart from './AdvancedChart';
import PointFigureChart from './PointFigureChart';
import MarketHeatmap from './MarketHeatmap';
import DepthChart from './DepthChart';
import { generateHeatmap, generateOhlc, generateOrderBook } from './mockChartData';

interface Props {
  symbol?: string;
  candles?: Candle[];          // base timeframe bars (default 5m). Falls back to mock data.
  heatmap?: HeatmapItem[];
  orderBook?: OrderBook;
  theme: 'light' | 'dark';
  onSelectSymbol?: (symbol: string) => void;
  height?: number;
  dataSourceLabel?: string;
}

const TABS: { id: ChartTab; label: string }[] = [
  { id: 'candles', label: 'Candles' },
  { id: 'ohlc', label: 'OHLC' },
  { id: 'heikin', label: 'Heikin-Ashi' },
  { id: 'line', label: 'Line' },
  { id: 'area', label: 'Area' },
  { id: 'baseline', label: 'Baseline' },
  { id: 'renko', label: 'Renko' },
  { id: 'pnf', label: 'Point & Figure' },
  { id: 'heatmap', label: 'Heatmap' },
  { id: 'depth', label: 'Depth' },
];

const TIMEFRAMES = [
  { label: '5m', factor: 1 },
  { label: '15m', factor: 3 },
  { label: '30m', factor: 6 },
  { label: '1h', factor: 12 },
];

const INDICATORS: { key: keyof IndicatorToggles; label: string }[] = [
  { key: 'volume', label: 'Volume' },
  { key: 'vwap', label: 'VWAP' },
  { key: 'bollinger', label: 'Bollinger' },
  { key: 'sma20', label: 'SMA 20' },
  { key: 'ema50', label: 'EMA 50' },
  { key: 'rsi', label: 'RSI' },
  { key: 'macd', label: 'MACD' },
];

const chip = (on: boolean) =>
  `rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 ${
    on
      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
  }`;

export default function ChartWorkspace({ symbol = 'RELIANCE', candles, heatmap, orderBook, theme, onSelectSymbol, height = 560, dataSourceLabel }: Props) {
  const [tab, setTab] = useState<ChartTab>('candles');
  const [tf, setTf] = useState(1);
  const [ind, setInd] = useState<IndicatorToggles>({ volume: true, vwap: true, bollinger: false, sma20: false, ema50: false, rsi: false, macd: false });
  const [brickOverride, setBrickOverride] = useState<number | null>(null);

  const base = useMemo(() => candles ?? generateOhlc(), [candles]);
  const bars = useMemo(() => resample(base, tf), [base, tf]);
  const items = useMemo(() => heatmap ?? generateHeatmap(), [heatmap]);
  const book = useMemo(
    () => orderBook ?? generateOrderBook(base.length ? base[base.length - 1].close : 1500),
    [orderBook, base],
  );

  const autoBox = useMemo(() => {
    const raw = atr(bars, 14);
    const step = raw >= 10 ? 1 : raw >= 1 ? 0.5 : 0.05;
    return Math.max(step, Math.round(raw / step) * step);
  }, [bars]);
  const box = brickOverride ?? autoBox;

  const last = bars[bars.length - 1];
  const first = bars[0];
  const chg = last && first ? ((last.close - first.open) / first.open) * 100 : 0;
  const isPrice = tab !== 'heatmap' && tab !== 'depth';
  const timeBased = tab !== 'renko' && tab !== 'pnf' && isPrice;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <header className="mb-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{symbol}</h2>
        {isPrice && last && (
          <p className="text-sm tabular-nums text-slate-600 dark:text-slate-300">
            ₹{last.close.toFixed(2)}{' '}
            <span className={chg >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{chg >= 0 ? '+' : ''}{chg.toFixed(2)}%</span>
          </p>
        )}
        <p className="ml-auto text-xs text-slate-400">{dataSourceLabel || 'Simulated data'}</p>
      </header>

      <div role="tablist" aria-label="Chart type" className="mb-2 flex flex-wrap gap-1.5">
        {TABS.map((x) => (
          <button key={x.id} role="tab" aria-selected={tab === x.id} className={chip(tab === x.id)} onClick={() => setTab(x.id)}>{x.label}</button>
        ))}
      </div>

      {isPrice && (
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex gap-1" aria-label="Timeframe">
            {TIMEFRAMES.map((x) => (
              <button key={x.label} className={chip(tf === x.factor)} onClick={() => setTf(x.factor)}>{x.label}</button>
            ))}
          </div>

          {timeBased && (
            <div className="flex flex-wrap gap-1" aria-label="Indicators">
              {INDICATORS.map((x) => (
                <button key={x.key} aria-pressed={ind[x.key]} className={chip(ind[x.key])} onClick={() => setInd((p) => ({ ...p, [x.key]: !p[x.key] }))}>{x.label}</button>
              ))}
            </div>
          )}

          {(tab === 'renko' || tab === 'pnf') && (
            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              {tab === 'renko' ? 'Brick size' : 'Box size'}
              <input
                type="number" min={0.05} step={0.05} value={box}
                onChange={(e) => setBrickOverride(Math.max(0.05, Number(e.target.value) || autoBox))}
                className="w-20 rounded border border-slate-300 bg-transparent px-2 py-1 text-xs tabular-nums dark:border-slate-700"
              />
              <button className="underline" onClick={() => setBrickOverride(null)}>Auto</button>
            </label>
          )}
        </div>
      )}

      {tab === 'pnf' ? (
        <PointFigureChart candles={bars} boxSize={box} theme={theme} height={height} />
      ) : tab === 'heatmap' ? (
        <MarketHeatmap items={items} onSelect={onSelectSymbol} height={height} theme={theme} />
      ) : tab === 'depth' ? (
        <DepthChart book={book} height={height} theme={theme} />
      ) : (
        <AdvancedChart candles={bars} mode={tab} indicators={ind} theme={theme} brickSize={box} height={height} />
      )}
    </section>
  );
}
