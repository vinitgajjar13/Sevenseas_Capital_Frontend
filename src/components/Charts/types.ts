/** Time is UTC seconds (what lightweight-charts expects). */
export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type PriceMode =
  | 'candles'
  | 'ohlc'
  | 'heikin'
  | 'line'
  | 'area'
  | 'baseline'
  | 'renko';

export type ChartTab = PriceMode | 'pnf' | 'heatmap' | 'depth';

export interface IndicatorToggles {
  volume: boolean;
  vwap: boolean;
  bollinger: boolean;
  sma20: boolean;
  ema50: boolean;
  rsi: boolean;
  macd: boolean;
}

export interface HeatmapItem {
  name: string;      // symbol
  sector: string;
  size: number;      // weight (market cap / turnover)
  change: number;    // % change
}

export interface DepthLevel {
  price: number;
  qty: number;
}

export interface OrderBook {
  bids: DepthLevel[]; // best bid first
  asks: DepthLevel[]; // best ask first
}

export const UP = '#1fa971';
export const DOWN = '#e5484d';
