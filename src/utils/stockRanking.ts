import { StockRadarItem, MarketClassification, StateChangeTransition } from '../types';

export type { MarketClassification };

/**
 * Determines current market classification for a stock based on real trading criteria:
 * 1. BULLISH
 * 2. NEUTRAL
 * 3. BEARISH
 * 
 * Priority is strictly:
 * - BULLISH: Positive momentum, breakout, above VWAP / high percentage gain or bullish status.
 * - NEUTRAL: Flat / range-bound / consolidating / minimal price deviation (-0.35% to +0.35%).
 * - BEARISH: Negative momentum, breakdown, below VWAP / negative drop or bearish status.
 */
export function getStockClassification(stock: StockRadarItem): MarketClassification {
  const pct = stock.changePercent;
  const isAboveVwap = stock.ltp >= (stock.vwap || stock.open915);

  // Severe directional moves override legacy static flags
  if (pct >= 0.40) return 'BULLISH';
  if (pct <= -0.40) return 'BEARISH';

  // Explicit Bull status with positive/flat momentum
  if (
    (stock.status === 'BULL' || stock.status === 'RE-ENTRY' || stock.action === 'BUY CALL (CE)') &&
    pct >= -0.15
  ) {
    return 'BULLISH';
  }

  // Explicit Bear status with negative/flat momentum
  if (
    (stock.status === 'BEAR' || stock.status === 'EXIT' || stock.action === 'BUY PUT (PE)') &&
    pct <= 0.15
  ) {
    return 'BEARISH';
  }

  // Consolidating, staying, or tight range (-0.35% to +0.35%)
  if (stock.status === 'CONSOLIDATING' || Math.abs(pct) <= 0.35) {
    return 'NEUTRAL';
  }

  if (pct > 0 && isAboveVwap) return 'BULLISH';
  if (pct < 0 && !isAboveVwap) return 'BEARISH';

  return 'NEUTRAL';
}

/**
 * Primary priority score for tier grouping:
 * BULLISH = 1
 * NEUTRAL = 2
 * BEARISH = 3
 */
export function getClassificationPriority(classification: MarketClassification): number {
  switch (classification) {
    case 'BULLISH':
      return 1;
    case 'NEUTRAL':
      return 2;
    case 'BEARISH':
      return 3;
    default:
      return 2;
  }
}

/**
 * Automatically sorts a stock list strictly by:
 * 1. Primary: BULLISH (1) → NEUTRAL (2) → BEARISH (3)
 * 2. Secondary within each group: strongest to weakest
 *    - BULLISH: highest percentage gain (changePercent desc), then score desc, then rvol desc
 *    - NEUTRAL: changePercent desc, then score desc
 *    - BEARISH: changePercent desc (e.g. -1.5% then -2.1% as per user example), then score desc
 */
export function sortStocksByDynamicMarketState(stocks: StockRadarItem[]): StockRadarItem[] {
  return [...stocks].sort((a, b) => {
    const classA = a.marketClassification || getStockClassification(a);
    const classB = b.marketClassification || getStockClassification(b);

    const prioA = getClassificationPriority(classA);
    const prioB = getClassificationPriority(classB);

    // Primary priority: BULLISH (1) -> NEUTRAL (2) -> BEARISH (3)
    if (prioA !== prioB) {
      return prioA - prioB;
    }

    // Secondary priority within same category:
    // Highest percentage change first (strongest to weakest)
    if (Math.abs(b.changePercent - a.changePercent) > 0.001) {
      return b.changePercent - a.changePercent;
    }

    // Tie breaker 1: Quant strength score
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    // Tie breaker 2: Relative volume (RVol)
    return b.rvol - a.rvol;
  });
}

export interface GroupedMarketStateStocks {
  bullish: StockRadarItem[];
  neutral: StockRadarItem[];
  bearish: StockRadarItem[];
  allRanked: StockRadarItem[];
  strongestBull?: StockRadarItem;
  strongestBear?: StockRadarItem;
  recentStateChanges: StockRadarItem[];
  totalVisible: number;
}

/**
 * Splits and ranks visible stocks into distinct market categories with metadata
 */
export function getGroupedMarketStateStocks(stocks: StockRadarItem[]): GroupedMarketStateStocks {
  const sorted = sortStocksByDynamicMarketState(stocks);

  const bullish: StockRadarItem[] = [];
  const neutral: StockRadarItem[] = [];
  const bearish: StockRadarItem[] = [];
  const recentStateChanges: StockRadarItem[] = [];

  for (const stk of sorted) {
    const cls = stk.marketClassification || getStockClassification(stk);
    if (cls === 'BULLISH') bullish.push(stk);
    else if (cls === 'BEARISH') bearish.push(stk);
    else neutral.push(stk);

    if (stk.lastStateChange) {
      recentStateChanges.push(stk);
    }
  }

  // Strongest Bull: first in bullish list (highest gain)
  const strongestBull = bullish.length > 0 ? bullish[0] : undefined;

  // Strongest Bear: in short-selling, strongest bear is the deepest breakdown / biggest decline
  // (i.e. the last in bearish or lowest changePercent)
  let strongestBear: StockRadarItem | undefined;
  if (bearish.length > 0) {
    strongestBear = [...bearish].sort((a, b) => a.changePercent - b.changePercent)[0];
  }

  return {
    bullish,
    neutral,
    bearish,
    allRanked: sorted,
    strongestBull,
    strongestBear,
    recentStateChanges,
    totalVisible: sorted.length,
  };
}
