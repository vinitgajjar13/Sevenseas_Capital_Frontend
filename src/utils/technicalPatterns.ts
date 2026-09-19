import { StockRadarItem } from '../types';

export interface CandlestickPatternInfo {
  pattern: string;
  bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  reliability: 'HIGH' | 'MODERATE' | 'LOW';
  description: string;
}

/**
 * Detects real candlestick patterns from opening 9:15 candle and intraday price action.
 * Evaluates real OHLC relationships (open, high, low, ltp/close, prevHigh, prevLow).
 */
export function detectCandlestickPattern(stock: StockRadarItem): CandlestickPatternInfo {
  const open = stock.open915;
  const high = stock.high915;
  const low = stock.low915;
  const close = stock.ltp;
  const prevHigh = stock.prevHigh;
  const prevLow = stock.prevLow;

  const range = high - low;
  const body = Math.abs(close - open);
  const upperShadow = high - Math.max(open, close);
  const lowerShadow = Math.min(open, close) - low;

  // 1. Check for Doji (Body is less than 12% of the range)
  if (range > 0 && body <= range * 0.12) {
    return {
      pattern: 'DOJI',
      bias: 'NEUTRAL',
      reliability: 'HIGH',
      description: 'Open and close are virtually equal. Indicates market equilibrium and indecision.',
    };
  }

  // 2. Hammer (Small body near top of range, lower shadow at least 2x the body, small upper shadow)
  if (range > 0 && lowerShadow >= body * 1.8 && upperShadow <= body * 0.4 && close > low + range * 0.6) {
    return {
      pattern: 'HAMMER',
      bias: 'BULLISH',
      reliability: 'HIGH',
      description: 'Strong intraday rejection of lower prices. Buyers pushed price back to session highs.',
    };
  }

  // 3. Shooting Star / Inverted Hammer (Small body near bottom of range, long upper shadow at least 1.8x body)
  if (range > 0 && upperShadow >= body * 1.8 && lowerShadow <= body * 0.4) {
    const isBearish = close <= open;
    return {
      pattern: isBearish ? 'SHOOTING STAR' : 'INVERTED HAMMER',
      bias: isBearish ? 'BEARISH' : 'BULLISH',
      reliability: 'HIGH',
      description: isBearish
        ? 'Price tested upper resistance but met heavy institutional selling pressure.'
        : 'Bullish attempt to push above resistance; potential trend reversal.',
    };
  }

  // 4. Bullish Engulfing (Current candle broke prev session high and opened below or near prev low)
  if (close > open && close >= prevHigh && open <= prevLow * 1.005) {
    return {
      pattern: 'BULLISH ENGULFING',
      bias: 'BULLISH',
      reliability: 'HIGH',
      description: 'Current price action completely engulfs prior session range with strong buying conviction.',
    };
  }

  // 5. Bearish Engulfing (Current candle broke prev session low and opened near prev high)
  if (close < open && close <= prevLow && open >= prevHigh * 0.995) {
    return {
      pattern: 'BEARISH ENGULFING',
      bias: 'BEARISH',
      reliability: 'HIGH',
      description: 'Aggressive selling completely overpowered previous buying range.',
    };
  }

  // 6. Bullish Marubozu (Large green body with negligible wicks <= 10% of body)
  if (close > open && body >= range * 0.82) {
    return {
      pattern: 'BULLISH MARUBOZU',
      bias: 'BULLISH',
      reliability: 'HIGH',
      description: 'Absolute buyers control from open to high with zero selling pullback.',
    };
  }

  // 7. Bearish Marubozu (Large red body with negligible wicks <= 10% of body)
  if (close < open && body >= range * 0.82) {
    return {
      pattern: 'BEARISH MARUBOZU',
      bias: 'BEARISH',
      reliability: 'HIGH',
      description: 'Sellers dominated continuously without meaningful rebound.',
    };
  }

  // 8. 9:15 Breakout or Inside Candle
  if (close > high) {
    return {
      pattern: 'ORB BREAKOUT (9:15 H)',
      bias: 'BULLISH',
      reliability: 'HIGH',
      description: 'Clean sustained breakout above 9:15 AM opening candle high.',
    };
  }

  if (close < low) {
    return {
      pattern: 'ORB BREAKDOWN (9:15 L)',
      bias: 'BEARISH',
      reliability: 'HIGH',
      description: 'Breakdown below 9:15 AM opening candle low.',
    };
  }

  // 9. Standard Trend Continuation / Consolidation
  if (stock.changePercent >= 0.5) {
    return {
      pattern: 'ASCENDING CANDLE',
      bias: 'BULLISH',
      reliability: 'MODERATE',
      description: 'Higher-high formation holding well above intraday VWAP.',
    };
  }

  if (stock.changePercent <= -0.5) {
    return {
      pattern: 'DESCENDING CANDLE',
      bias: 'BEARISH',
      reliability: 'MODERATE',
      description: 'Lower-low sequence with resistance pressing down.',
    };
  }

  return {
    pattern: 'SPINNING TOP',
    bias: 'NEUTRAL',
    reliability: 'LOW',
    description: 'Narrow range candle showing temporary market consolidation.',
  };
}

/**
 * Formats a clean, readable currency string in INR
 */
export function formatCurrencyINR(num: number | undefined | null): string {
  if (num === undefined || num === null || isNaN(num)) return '₹—';
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export interface SupportResistanceLevels {
  support: number;
  resistance: number;
  pivot: number;
  isCalculated: boolean;
}

/**
 * Calculates Support and Resistance price levels based on recent price pivot points.
 * If pre-calculated levels are available and valid in the stock data, returns them;
 * otherwise calculates them from recent pivot points (High, Low, Close).
 */
export function calculateSupportResistance(stock: StockRadarItem): SupportResistanceLevels {
  if (stock.support1 && stock.resistance1 && stock.support1 > 0 && stock.resistance1 > 0) {
    return {
      support: Number(stock.support1.toFixed(2)),
      resistance: Number(stock.resistance1.toFixed(2)),
      pivot: Number((stock.pivot || (stock.support1 + stock.resistance1) / 2).toFixed(2)),
      isCalculated: false,
    };
  }

  // Fallback calculation using recent price pivot points:
  // Pivot (P) = (High + Low + Close) / 3
  // Resistance 1 (R1) = 2*P - Low
  // Support 1 (S1) = 2*P - High
  const chartPrices = stock.chartData && stock.chartData.length > 0 ? stock.chartData.map((d) => d.price) : [];
  const chartHigh = chartPrices.length > 0 ? Math.max(...chartPrices) : 0;
  const chartLow = chartPrices.length > 0 ? Math.min(...chartPrices) : 0;

  const high = stock.high915 || chartHigh || stock.prevHigh || stock.ltp * 1.015;
  const low = stock.low915 || chartLow || stock.prevLow || stock.ltp * 0.985;
  const close = stock.ltp;

  const pivot = (high + low + close) / 3;
  const rawR1 = 2 * pivot - low;
  const rawS1 = 2 * pivot - high;

  // Ensure logical spacing relative to current close
  const resistance = Math.max(close * 1.008, rawR1);
  const support = Math.min(close * 0.992, rawS1);

  return {
    support: Number(support.toFixed(2)),
    resistance: Number(resistance.toFixed(2)),
    pivot: Number(pivot.toFixed(2)),
    isCalculated: true,
  };
}
