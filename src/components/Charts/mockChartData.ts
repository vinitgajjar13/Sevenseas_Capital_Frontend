import type { Candle, HeatmapItem, OrderBook } from './types';

function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic OHLCV generator (5-minute bars by default). */
export function generateOhlc(bars = 400, start = 1500, intervalSec = 300, seed = 7): Candle[] {
  const r = rng(seed);
  const out: Candle[] = [];
  const t0 = Math.floor(Date.now() / 1000 / intervalSec) * intervalSec - bars * intervalSec;
  let price = start;
  for (let i = 0; i < bars; i++) {
    const open = price;
    const drift = (r() - 0.48) * start * 0.004;
    const close = Math.max(1, open + drift);
    const high = Math.max(open, close) + r() * start * 0.0015;
    const low = Math.min(open, close) - r() * start * 0.0015;
    out.push({ time: t0 + i * intervalSec, open, high, low, close, volume: Math.round(20000 + r() * 90000) });
    price = close;
  }
  return out;
}

export function generateHeatmap(): HeatmapItem[] {
  const raw: [string, string, number][] = [
    ['HDFCBANK', 'Banking', 12], ['ICICIBANK', 'Banking', 9], ['SBIN', 'Banking', 7], ['AXISBANK', 'Banking', 5],
    ['TCS', 'IT', 11], ['INFY', 'IT', 8], ['HCLTECH', 'IT', 4], ['WIPRO', 'IT', 3],
    ['RELIANCE', 'Energy', 16], ['ONGC', 'Energy', 4], ['NTPC', 'Energy', 4],
    ['MARUTI', 'Auto', 5], ['M&M', 'Auto', 5], ['TATAMOTORS', 'Auto', 5],
    ['HINDUNILVR', 'FMCG', 7], ['ITC', 'FMCG', 8], ['NESTLEIND', 'FMCG', 3],
    ['SUNPHARMA', 'Pharma', 5], ['DRREDDY', 'Pharma', 3], ['CIPLA', 'Pharma', 3],
  ];
  const r = rng(11);
  return raw.map(([name, sector, size]) => ({ name, sector, size, change: +((r() - 0.5) * 6).toFixed(2) }));
}

export function generateOrderBook(mid = 1500, tick = 0.5, levels = 25, seed = 3): OrderBook {
  const r = rng(seed);
  const bids = Array.from({ length: levels }, (_, i) => ({ price: +(mid - tick * (i + 1)).toFixed(2), qty: Math.round(200 + r() * 1800) }));
  const asks = Array.from({ length: levels }, (_, i) => ({ price: +(mid + tick * (i + 1)).toFixed(2), qty: Math.round(200 + r() * 1800) }));
  return { bids, asks };
}
