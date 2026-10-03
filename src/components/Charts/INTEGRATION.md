# Charts module: integration

## 1. Install / verify
```bash
npm i lightweight-charts@^5 recharts
```
The module uses the **lightweight-charts v5 API** (`chart.addSeries(CandlestickSeries, …)`, panes). If your repo is on v4, upgrade (v4 uses `addCandlestickSeries`).

## 2. Copy
Copy this `Charts/` folder to `src/components/Charts/`.

## 3. Use
```tsx
import { ChartWorkspace } from '@/src/components/Charts';

// Stock Detail view
<ChartWorkspace symbol={stock.symbol} theme={theme} onSelectSymbol={handleStockSelect} />
```
With no `candles`, `heatmap`, or `orderBook` props it renders deterministic mock data.
To use your own data, map your stock's `chartData` to `Candle[]`:
`{ time /* UTC seconds */, open, high, low, close, volume }`.

Suggested placement:
- **Stock Detail**: `<ChartWorkspace candles={…} />` (replaces the existing chart)
- **Dashboard / Sector Radar**: `<MarketHeatmap items={…} />`
- **Paper Trading**: `<DepthChart book={…} />`

## 4. Lazy-load (recommended)
```tsx
const ChartWorkspace = lazy(() => import('@/src/components/Charts/ChartWorkspace'));
<Suspense fallback={<div className="h-[560px] animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />}>…</Suspense>
```

## What's included
| Chart | File |
|---|---|
| Candlestick, OHLC bars, Heikin-Ashi, Line, Area, Baseline, Renko | `AdvancedChart.tsx` |
| Volume, VWAP, Bollinger, SMA 20, EMA 50, RSI, MACD | `AdvancedChart.tsx` + `indicators.ts` |
| Point & Figure (3-box reversal) | `PointFigureChart.tsx` |
| Sector/stock heatmap (treemap) | `MarketHeatmap.tsx` |
| Market depth | `DepthChart.tsx` |
| Timeframes 5m / 15m / 30m / 1h | `resample()` in `indicators.ts` |

## Notes
- Green = up, red = down (Indian market convention).
- Renko and P&F ignore time, so indicators are hidden for them.
- VWAP resets each UTC day; adjust to IST if you feed multi-day data.
- Type-checked with strict TS against React 19, lightweight-charts 5, recharts 3.
