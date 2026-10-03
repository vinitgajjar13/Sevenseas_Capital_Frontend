import type { Candle } from './types';

type N = number | null;

export const sma = (v: number[], p: number): N[] =>
  v.map((_, i) => {
    if (i < p - 1) return null;
    let s = 0;
    for (let j = i - p + 1; j <= i; j++) s += v[j];
    return s / p;
  });

/** EMA that tolerates leading nulls (needed for MACD signal line). */
export function ema(v: N[], p: number): N[] {
  const out: N[] = v.map(() => null);
  const first = v.findIndex((x) => x !== null);
  if (first < 0 || v.length - first < p) return out;
  const seedEnd = first + p - 1;
  let prev = 0;
  for (let i = first; i <= seedEnd; i++) prev += v[i] as number;
  prev /= p;
  out[seedEnd] = prev;
  const k = 2 / (p + 1);
  for (let i = seedEnd + 1; i < v.length; i++) {
    prev = (v[i] as number) * k + prev * (1 - k);
    out[i] = prev;
  }
  return out;
}

export function bollinger(closes: number[], p = 20, mult = 2) {
  const mid = sma(closes, p);
  return closes.map((_, i) => {
    if (mid[i] === null) return { mid: null, upper: null, lower: null };
    let s = 0;
    for (let j = i - p + 1; j <= i; j++) s += (closes[j] - (mid[i] as number)) ** 2;
    const sd = Math.sqrt(s / p);
    return { mid: mid[i], upper: (mid[i] as number) + mult * sd, lower: (mid[i] as number) - mult * sd };
  });
}

/** Wilder's RSI. */
export function rsi(closes: number[], p = 14): N[] {
  const out: N[] = closes.map(() => null);
  if (closes.length <= p) return out;
  let gain = 0, loss = 0;
  for (let i = 1; i <= p; i++) {
    const d = closes[i] - closes[i - 1];
    d >= 0 ? (gain += d) : (loss -= d);
  }
  gain /= p; loss /= p;
  const calc = () => (loss === 0 ? 100 : 100 - 100 / (1 + gain / loss));
  out[p] = calc();
  for (let i = p + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    gain = (gain * (p - 1) + Math.max(d, 0)) / p;
    loss = (loss * (p - 1) + Math.max(-d, 0)) / p;
    out[i] = calc();
  }
  return out;
}

export function macd(closes: number[], fast = 12, slow = 26, signal = 9) {
  const f = ema(closes, fast);
  const s = ema(closes, slow);
  const line: N[] = closes.map((_, i) => (f[i] !== null && s[i] !== null ? (f[i] as number) - (s[i] as number) : null));
  const sig = ema(line, signal);
  const hist: N[] = line.map((m, i) => (m !== null && sig[i] !== null ? m - (sig[i] as number) : null));
  return { line, signal: sig, hist };
}

/** Session VWAP — resets at the start of each UTC day. */
export function vwap(c: Candle[]): number[] {
  let day = -1, pv = 0, vol = 0;
  return c.map((x) => {
    const d = Math.floor(x.time / 86400);
    if (d !== day) { day = d; pv = 0; vol = 0; }
    const tp = (x.high + x.low + x.close) / 3;
    pv += tp * x.volume; vol += x.volume;
    return vol ? pv / vol : x.close;
  });
}

export function heikinAshi(c: Candle[]): Candle[] {
  const out: Candle[] = [];
  c.forEach((x, i) => {
    const close = (x.open + x.high + x.low + x.close) / 4;
    const open = i === 0 ? (x.open + x.close) / 2 : (out[i - 1].open + out[i - 1].close) / 2;
    out.push({ ...x, open, close, high: Math.max(x.high, open, close), low: Math.min(x.low, open, close) });
  });
  return out;
}

/** Group every `factor` bars into one (e.g. 5m -> 15m with factor 3). */
export function resample(c: Candle[], factor: number): Candle[] {
  if (factor <= 1) return c;
  const out: Candle[] = [];
  for (let i = 0; i < c.length; i += factor) {
    const g = c.slice(i, i + factor);
    out.push({
      time: g[0].time,
      open: g[0].open,
      high: Math.max(...g.map((x) => x.high)),
      low: Math.min(...g.map((x) => x.low)),
      close: g[g.length - 1].close,
      volume: g.reduce((a, x) => a + x.volume, 0),
    });
  }
  return out;
}

export function atr(c: Candle[], p = 14): number {
  if (c.length < 2) return 1;
  const tr = c.map((x, i) => (i === 0 ? x.high - x.low : Math.max(x.high - x.low, Math.abs(x.high - c[i - 1].close), Math.abs(x.low - c[i - 1].close))));
  const slice = tr.slice(-p);
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}

export interface RenkoBrick { open: number; close: number; up: boolean }

/** Traditional Renko: continuation needs 1 brick, reversal needs 2. */
export function renko(c: Candle[], brick: number): RenkoBrick[] {
  const out: RenkoBrick[] = [];
  if (!c.length || brick <= 0) return out;
  let last = Math.round(c[0].close / brick) * brick;
  let dir = 0; // 1 up, -1 down, 0 none
  for (const { close: p } of c) {
    for (;;) {
      if (dir >= 0 && p >= last + brick) {
        out.push({ open: last, close: last + brick, up: true }); last += brick; dir = 1;
      } else if (dir <= 0 && p <= last - brick) {
        out.push({ open: last, close: last - brick, up: false }); last -= brick; dir = -1;
      } else if (dir === 1 && p <= last - 2 * brick) {
        out.push({ open: last - brick, close: last - 2 * brick, up: false }); last -= 2 * brick; dir = -1;
      } else if (dir === -1 && p >= last + 2 * brick) {
        out.push({ open: last + brick, close: last + 2 * brick, up: true }); last += 2 * brick; dir = 1;
      } else break;
    }
  }
  return out;
}

export interface PnFColumn { type: 'X' | 'O'; lo: number; hi: number } // box indexes

/** Point & Figure on closing prices, default 3-box reversal. */
export function pointAndFigure(c: Candle[], box: number, reversal = 3): PnFColumn[] {
  const cols: PnFColumn[] = [];
  if (!c.length || box <= 0) return cols;
  const ref = Math.floor(c[0].close / box);
  let cur: PnFColumn | null = null;
  for (const { close } of c) {
    const b = Math.floor(close / box);
    if (!cur) {
      if (b >= ref + 1) cur = { type: 'X', lo: ref, hi: b };
      else if (b <= ref - 1) cur = { type: 'O', hi: ref, lo: b };
      continue;
    }
    if (cur.type === 'X') {
      if (b > cur.hi) cur.hi = b;
      else if (b <= cur.hi - reversal) { cols.push(cur); cur = { type: 'O', hi: cur.hi - 1, lo: b }; }
    } else {
      if (b < cur.lo) cur.lo = b;
      else if (b >= cur.lo + reversal) { cols.push(cur); cur = { type: 'X', lo: cur.lo + 1, hi: b }; }
    }
  }
  if (cur) cols.push(cur);
  return cols;
}

/** Cumulative depth series for the depth chart. */
export function cumulativeDepth(levels: { price: number; qty: number }[]) {
  let sum = 0;
  return levels.map((l) => ({ price: l.price, total: (sum += l.qty) }));
}
