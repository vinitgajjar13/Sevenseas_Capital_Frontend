import { ChartTimeframe, TradeMarkerItem } from '../../types';

export interface OHLCVBar {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Generates realistic chronological OHLCV candlestick series for a given base price and timeframe.
 */
export function generateTimeframeOHLCV(
  basePrice: number,
  timeframe: ChartTimeframe,
  barCount: number = 80
): OHLCVBar[] {
  const bars: OHLCVBar[] = [];
  const nowSec = Math.floor(Date.now() / 1000);

  // Time interval in seconds per timeframe
  const intervalMap: Record<ChartTimeframe, number> = {
    '1m': 60,
    '5m': 300,
    '15m': 900,
    '30m': 1800,
    '1H': 3600,
    '1D': 86400,
    '1W': 604800,
  };

  const stepSec = intervalMap[timeframe] || 300;
  const startSec = nowSec - barCount * stepSec;

  // Volatility multiplier according to timeframe
  const volMultiplier =
    timeframe === '1m' ? 0.0012 :
    timeframe === '5m' ? 0.0025 :
    timeframe === '15m' ? 0.004 :
    timeframe === '30m' ? 0.006 :
    timeframe === '1H' ? 0.009 :
    timeframe === '1D' ? 0.018 : 0.035;

  let currentPrice = basePrice * (1 - (barCount * 0.002));

  for (let i = 0; i < barCount; i++) {
    const time = startSec + i * stepSec;
    const open = currentPrice;
    const changePct = (Math.random() - 0.485) * volMultiplier;
    const close = +(open * (1 + changePct)).toFixed(2);

    const wickBufferHigh = Math.abs(open * Math.random() * (volMultiplier * 0.6));
    const wickBufferLow = Math.abs(open * Math.random() * (volMultiplier * 0.6));

    const high = +(Math.max(open, close) + wickBufferHigh).toFixed(2);
    const low = +(Math.min(open, close) - wickBufferLow).toFixed(2);

    const baseVol = Math.floor(25000 + Math.random() * 45000);
    const volume = Math.random() > 0.85 ? baseVol * 2.8 : baseVol;

    bars.push({
      time,
      open,
      high,
      low,
      close,
      volume: Math.round(volume),
    });

    currentPrice = close;
  }

  // Ensure last candle matches basePrice closely
  if (bars.length > 0) {
    const last = bars[bars.length - 1];
    last.close = basePrice;
    last.high = Math.max(last.high, basePrice);
    last.low = Math.min(last.low, basePrice);
  }

  return bars;
}

/**
 * Calculates Simple Moving Average (SMA)
 */
export function calculateSMA(data: OHLCVBar[], period: number = 20): { time: number; value: number }[] {
  const result: { time: number; value: number }[] = [];
  if (data.length < period) return result;

  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    result.push({
      time: data[i].time,
      value: +(sum / period).toFixed(2),
    });
  }
  return result;
}

/**
 * Calculates Exponential Moving Average (EMA)
 */
export function calculateEMA(data: OHLCVBar[], period: number = 50): { time: number; value: number }[] {
  const result: { time: number; value: number }[] = [];
  if (data.length < period) return result;

  const k = 2 / (period + 1);
  let ema = 0;

  // Initialize with SMA
  for (let i = 0; i < period; i++) {
    ema += data[i].close;
  }
  ema = ema / period;
  result.push({ time: data[period - 1].time, value: +ema.toFixed(2) });

  for (let i = period; i < data.length; i++) {
    ema = data[i].close * k + ema * (1 - k);
    result.push({
      time: data[i].time,
      value: +ema.toFixed(2),
    });
  }
  return result;
}

/**
 * Calculates Relative Strength Index (RSI)
 */
export function calculateRSI(data: OHLCVBar[], period: number = 14): { time: number; value: number }[] {
  const result: { time: number; value: number }[] = [];
  if (data.length <= period) return result;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = data[i].close - data[i - 1].close;
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  const firstRS = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const firstRSI = 100 - 100 / (1 + firstRS);
  result.push({ time: data[period].time, value: +firstRSI.toFixed(2) });

  for (let i = period + 1; i < data.length; i++) {
    const diff = data[i].close - data[i - 1].close;
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);

    result.push({
      time: data[i].time,
      value: +rsi.toFixed(2),
    });
  }

  return result;
}

/**
 * Calculates MACD (12, 26, 9)
 */
export function calculateMACD(data: OHLCVBar[]): {
  macdLine: { time: number; value: number }[];
  signalLine: { time: number; value: number }[];
  histogram: { time: number; value: number; color: string }[];
} {
  const ema12 = calculateEMA(data, 12);
  const ema26 = calculateEMA(data, 26);

  const macdMap = new Map<number, number>();
  const macdLine: { time: number; value: number }[] = [];

  ema26.forEach((pt26) => {
    const pt12 = ema12.find((p) => p.time === pt26.time);
    if (pt12) {
      const val = +(pt12.value - pt26.value).toFixed(2);
      macdLine.push({ time: pt26.time, value: val });
      macdMap.set(pt26.time, val);
    }
  });

  // Signal line = 9 EMA of MACD Line
  const signalLine: { time: number; value: number }[] = [];
  const histogram: { time: number; value: number; color: string }[] = [];

  if (macdLine.length >= 9) {
    const k = 2 / 10;
    let signal = 0;
    for (let i = 0; i < 9; i++) {
      signal += macdLine[i].value;
    }
    signal = signal / 9;
    signalLine.push({ time: macdLine[8].time, value: +signal.toFixed(2) });

    for (let i = 9; i < macdLine.length; i++) {
      signal = macdLine[i].value * k + signal * (1 - k);
      const hist = +(macdLine[i].value - signal).toFixed(2);
      signalLine.push({ time: macdLine[i].time, value: +signal.toFixed(2) });
      histogram.push({
        time: macdLine[i].time,
        value: hist,
        color: hist >= 0 ? '#10b981' : '#f43f5e',
      });
    }
  }

  return { macdLine, signalLine, histogram };
}

/**
 * Generates realistic mock trade markers (Buy, Sell, Entry, Exit) mapped to candles
 */
export function generateMockTradeMarkers(bars: OHLCVBar[]): TradeMarkerItem[] {
  if (bars.length < 30) return [];

  const markers: TradeMarkerItem[] = [];
  const n = bars.length;

  // Entry Marker ~ 25 bars ago
  const entryIdx = Math.max(5, n - 28);
  const entryBar = bars[entryIdx];
  markers.push({
    id: 'marker-entry',
    time: entryBar.time,
    type: 'ENTRY',
    price: entryBar.low * 0.998,
    text: `ENTRY @ ₹${entryBar.close.toFixed(1)}`,
  });

  // Buy Marker ~ 22 bars ago
  const buyIdx = Math.max(10, n - 22);
  const buyBar = bars[buyIdx];
  markers.push({
    id: 'marker-buy',
    time: buyBar.time,
    type: 'BUY',
    price: buyBar.low * 0.997,
    text: `BUY (CE) @ ₹${buyBar.close.toFixed(1)}`,
  });

  // Sell Marker ~ 12 bars ago
  const sellIdx = Math.max(18, n - 12);
  const sellBar = bars[sellIdx];
  markers.push({
    id: 'marker-sell',
    time: sellBar.time,
    type: 'SELL',
    price: sellBar.high * 1.003,
    text: `SELL (Partial) @ ₹${sellBar.close.toFixed(1)}`,
  });

  // Exit Marker ~ 4 bars ago
  const exitIdx = Math.max(22, n - 4);
  const exitBar = bars[exitIdx];
  markers.push({
    id: 'marker-exit',
    time: exitBar.time,
    type: 'EXIT',
    price: exitBar.high * 1.004,
    text: `EXIT (Target) @ ₹${exitBar.close.toFixed(1)}`,
  });

  return markers;
}

