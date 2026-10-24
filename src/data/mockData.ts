import {
  MarketBreadth,
  StockRadarItem,
  ActiveSignal,
  PositionItem,
  TradeHistoryItem,
} from '../types';

export { formatINR, formatNumber, exportRadarToCSV } from '../utils/formatters';

import { STOCKS_UNIVERSE_213 } from './mock/stocksUniverse';

const advancesCount = STOCKS_UNIVERSE_213.filter((s) => s.changePercent > 0).length;
const declinesCount = STOCKS_UNIVERSE_213.filter((s) => s.changePercent < 0).length;
const unchangedCount = STOCKS_UNIVERSE_213.length - advancesCount - declinesCount;

export const INITIAL_BREADTH: MarketBreadth = {
  advances: advancesCount,
  declines: declinesCount,
  unchanged: unchangedCount,
  total: STOCKS_UNIVERSE_213.length,
};

export const generateIntradaySeries = (base: number, volatility: number, trend: number) => {
  const times = ['09:15', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:15'];
  let current = base;
  let runningSum = 0;
  let runningVol = 0;

  return times.map((t, idx) => {
    const delta = (Math.sin(idx * 0.7) * 0.4 + (trend / 14) + (Math.random() - 0.48) * 0.3) * volatility;
    current = +(current + delta).toFixed(2);
    const v = Math.floor(25000 + Math.random() * 40000 + (idx === 0 ? 90000 : 0));
    runningSum += current * v;
    runningVol += v;
    const vwap = +(runningSum / runningVol).toFixed(2);

    return {
      time: t,
      price: current,
      vwap,
      volume: v,
      upperBand: +(current + volatility * 1.5).toFixed(2),
      lowerBand: +(current - volatility * 1.5).toFixed(2),
      projected: +(current + (trend > 0 ? volatility * 0.8 : -volatility * 0.8)).toFixed(2),
    };
  });
};

export const INITIAL_STOCKS_RADAR: StockRadarItem[] = STOCKS_UNIVERSE_213;

export const INITIAL_ACTIVE_SIGNALS: ActiveSignal[] = [
  {
    id: 'sig-101',
    stock: 'M&M',
    companyName: 'Mahindra & Mahindra Ltd.',
    sector: 'Nifty Auto',
    signal: 'BULLISH',
    option: 'CE',
    strike: 3140,
    expiry: '28-AUG-2026',
    entry: 34.50,
    currentPrice: 42.80,
    stopLoss: 24.00,
    target: 58.00,
    status: 'TRIGGERED',
    triggeredAt: '09:28 AM',
    underlyingPrice: 3124.50,
    riskReward: '1 : 2.2',
    logic: 'Slot 1 Leader + 9:15 AM High (₹3088) breakout + 2.8x Vol Spike + Sector Rank #1',
    slot: 'Slot 1: Alpha Leader',
  },
  {
    id: 'sig-102',
    stock: 'INFY',
    companyName: 'Infosys Limited',
    sector: 'Nifty IT',
    signal: 'BULLISH',
    option: 'CE',
    strike: 1860,
    expiry: '28-AUG-2026',
    entry: 22.80,
    currentPrice: 28.10,
    stopLoss: 16.50,
    target: 36.00,
    status: 'TRIGGERED',
    triggeredAt: '09:34 AM',
    underlyingPrice: 1852.40,
    riskReward: '1 : 2.1',
    logic: 'Slot 1 Upgrade + 9:15 AM High Cross + Sustained above VWAP + Heavy IT Inflows',
    slot: 'Slot 1: Alpha Leader',
  },
  {
    id: 'sig-103',
    stock: 'TCS',
    companyName: 'Tata Consultancy Services',
    sector: 'Nifty IT',
    signal: 'BULLISH',
    option: 'CE',
    strike: 4350,
    expiry: '28-AUG-2026',
    entry: 42.00,
    currentPrice: 47.50,
    stopLoss: 31.00,
    target: 65.00,
    status: 'TRIGGERED',
    triggeredAt: '11:18 AM',
    underlyingPrice: 4318.50,
    riskReward: '1 : 2.1',
    logic: 'Re-entry Pattern: VWAP support test + High volume absorption + Slot 4 to Slot 2 shift',
    slot: 'Slot 4: Mean-Reversion',
  },
  {
    id: 'sig-104',
    stock: 'HINDUNILVR',
    companyName: 'Hindustan Unilever Ltd.',
    sector: 'Nifty FMCG',
    signal: 'BEARISH',
    option: 'PE',
    strike: 2660,
    expiry: '28-AUG-2026',
    entry: 26.50,
    currentPrice: 32.80,
    stopLoss: 19.00,
    target: 42.00,
    status: 'TRIGGERED',
    triggeredAt: '10:05 AM',
    underlyingPrice: 2680.50,
    riskReward: '1 : 2.0',
    logic: 'Slot 5 Breakdown + 9:15 AM Low breach (₹2692) + Below VWAP + Weak FMCG Rank #7',
    slot: 'Slot 5: Weak / Distribution',
  },
];

export const INITIAL_POSITIONS: PositionItem[] = [
  {
    id: 'pos-1',
    symbol: 'M&M',
    instrument: 'M&M 3140 CE',
    optionType: 'CE',
    strike: 3140,
    type: 'BUY',
    product: 'MIS (Intraday)',
    lots: 2,
    lotSize: 200,
    quantity: 400,
    entryPrice: 34.50,
    currentPrice: 42.80,
    pnl: 3320.00,
    pnlPercent: 24.06,
    stopLoss: 24.00,
    target: 58.00,
    trailingSL: 36.00,
    entryTime: '09:28 AM',
    status: 'OPEN',
  },
  {
    id: 'pos-2',
    symbol: 'INFY',
    instrument: 'INFY 1860 CE',
    optionType: 'CE',
    strike: 1860,
    type: 'BUY',
    product: 'MIS (Intraday)',
    lots: 2,
    lotSize: 400,
    quantity: 800,
    entryPrice: 22.80,
    currentPrice: 28.10,
    pnl: 4240.00,
    pnlPercent: 23.25,
    stopLoss: 16.50,
    target: 36.00,
    trailingSL: 24.00,
    entryTime: '09:34 AM',
    status: 'OPEN',
  },
  {
    id: 'pos-3',
    symbol: 'TCS',
    instrument: 'TCS 4350 CE',
    optionType: 'CE',
    strike: 4350,
    type: 'BUY',
    product: 'MIS (Intraday)',
    lots: 2,
    lotSize: 175,
    quantity: 350,
    entryPrice: 42.00,
    currentPrice: 47.50,
    pnl: 1925.00,
    pnlPercent: 13.10,
    stopLoss: 31.00,
    target: 65.00,
    trailingSL: 42.00,
    entryTime: '11:18 AM',
    status: 'OPEN',
  },
  {
    id: 'pos-4',
    symbol: 'HINDUNILVR',
    instrument: 'HINDUNILVR 2660 PE',
    optionType: 'PE',
    strike: 2660,
    type: 'BUY',
    product: 'MIS (Intraday)',
    lots: 2,
    lotSize: 300,
    quantity: 600,
    entryPrice: 26.50,
    currentPrice: 32.80,
    pnl: 3780.00,
    pnlPercent: 23.77,
    stopLoss: 19.00,
    target: 42.00,
    trailingSL: 28.00,
    entryTime: '10:05 AM',
    status: 'OPEN',
  },
];

export const INITIAL_TRADE_HISTORY: TradeHistoryItem[] = [
  {
    id: 'th-1',
    instrument: 'TATAMOTORS 1040 CE',
    signal: 'BULLISH',
    type: 'BUY',
    quantity: 750,
    entryTime: '09:22 AM',
    exitTime: '10:45 AM',
    entryPrice: 18.20,
    exitPrice: 28.60,
    netPnl: 7800.00,
    pnlPercent: 57.14,
    exitReason: 'TARGET_HIT',
  },
  {
    id: 'th-2',
    instrument: 'RELIANCE 2980 CE',
    signal: 'BULLISH',
    type: 'BUY',
    quantity: 500,
    entryTime: '09:25 AM',
    exitTime: '11:30 AM',
    entryPrice: 24.50,
    exitPrice: 34.00,
    netPnl: 4750.00,
    pnlPercent: 38.78,
    exitReason: 'TARGET_HIT',
  },
  {
    id: 'th-3',
    instrument: 'DLF 870 PE',
    signal: 'BEARISH',
    type: 'BUY',
    quantity: 825,
    entryTime: '10:12 AM',
    exitTime: '11:40 AM',
    entryPrice: 14.80,
    exitPrice: 21.20,
    netPnl: 5280.00,
    pnlPercent: 43.24,
    exitReason: 'TARGET_HIT',
  },
  {
    id: 'th-4',
    instrument: 'ICICIBANK 1240 CE',
    signal: 'BULLISH',
    type: 'BUY',
    quantity: 700,
    entryTime: '09:40 AM',
    exitTime: '10:55 AM',
    entryPrice: 16.40,
    exitPrice: 20.80,
    netPnl: 3080.00,
    pnlPercent: 26.83,
    exitReason: 'TARGET_HIT',
  },
];
