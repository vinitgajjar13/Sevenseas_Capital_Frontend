export type SignalType = 'BULLISH' | 'BEARISH' | 'NEUTRAL';
export type OptionType = 'CE' | 'PE';
export type SignalStatus = 'ACTIVE' | 'TRIGGERED' | 'TARGET REACHED' | 'TRAILING SL';
export type PositionStatus = 'OPEN' | 'SQUARED_OFF';
export type TradeExitReason = 'TARGET_HIT' | 'SL_HIT' | 'AUTO_SQUARE_OFF' | 'MANUAL_EXIT';

export type TimePeriod = '1D' | '1W' | '1M' | '3M' | '1Y';
export type StockStatus = 'BULL' | 'BEAR' | 'RE-ENTRY' | 'STAY' | 'EXIT' | 'CONSOLIDATING';
export type SectorStrength = 'STRONG_BULL' | 'MILD_BULL' | 'NEUTRAL' | 'MILD_BEAR' | 'STRONG_BEAR';
export type SlotBucket = 'Slot 1: Alpha Leader' | 'Slot 2: Breakout Momentum' | 'Slot 3: Trend Follower' | 'Slot 4: Mean-Reversion' | 'Slot 5: Weak / Distribution';

export type MarketStatusType = 'Market Open' | 'Market Closed' | 'Pre-Open' | 'Post-Market';

export interface IndexConstituentStock {
  id?: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sector?: string;
  volume?: number;
}

export interface MarketIndex {
  name: string;
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  prevClose: number;
  vwap?: number;
  sparkline?: number[];
  week52High?: number;
  week52Low?: number;
  marketStatus?: MarketStatusType;
  constituents?: IndexConstituentStock[];
}

export interface MarketBreadth {
  advances: number;
  declines: number;
  unchanged: number;
  total: number;
}

export interface SectorItem {
  id: string;
  name: string;
  indexSymbol: string;
  rank: number;
  prevRank: number;
  score: number; // 0 to 100
  trend: SectorStrength;
  changePercent: number;
  advances: number;
  declines: number;
  totalStocks: number;
  topStock: string;
  topStockChange: number;
  avgVolumeMultiplier: number;
  slot1Count: number;
  slot2Count: number;
  commentary: string;
  historySparkline: number[];
}

export interface StockPricePoint {
  time: string;
  price: number;
  vwap: number;
  volume: number;
  upperBand?: number;
  lowerBand?: number;
  projected?: number;
}

export interface StockRadarItem {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  rank: number;
  prevRank: number;
  slot: SlotBucket;
  status: StockStatus;
  action: 'BUY CALL (CE)' | 'BUY PUT (PE)' | 'ACCUMULATE' | 'HOLD / STAY' | 'TRAIL STOP' | 'AVOID / EXIT';
  score: number; // Quant score 0-100
  ltp: number;
  change: number;
  changePercent: number;
  open915: number;
  high915: number;
  low915: number;
  prevHigh: number;
  prevLow: number;
  vwap: number;
  rvol: number; // Relative volume multiplier (e.g. 2.4)
  rsi: number;
  breakoutType: 'HIGH_BREAK' | 'LOW_BREAK' | 'IN_RANGE' | '52W_HIGH';
  conditionMet: string;
  reEntryReason?: string;
  suggestedStrike?: string;
  target1: number;
  target2: number;
  stopLoss: number;
  pivot: number;
  resistance1: number;
  support1: number;
  confidenceScore: number; // 0-100%
  chartData: StockPricePoint[];
  analystNote: string;
  marketClassification?: MarketClassification;
  previousClassification?: MarketClassification;
  lastStateChange?: StateChangeTransition;
  totalShares?: number;
  freeFloatShares?: number;
  freeFloatPercent?: number;
  freeFloatTurnover?: number;
  isLiquidityShock?: boolean;
  capital?: number; // Trader/investment capital allocated to stock
  signalDirection?: SignalDirectionType;
  tradingSignal?: TradingSignalType;
  entryPrice?: number;
  target3?: number;
  target4?: number; // Trailing Target
  comment?: string;
  low?: number;
  high?: number;
  volume?: number;
}

export interface PriceAlert {
  id: string;
  stockId: string;
  symbol: string;
  targetPrice: number;
  direction: 'ABOVE' | 'BELOW';
  createdAt: string;
  triggered: boolean;
  initialPrice: number;
  triggeredAt?: string;
}

export interface VolatilityDayVariance {
  dayIndex: number;
  dateStr: string;
  open: number;
  close: number;
  variancePct: number;
  absChange: number;
}

export interface VolatilityIndexData {
  annualizedVolatility: number; // percentage, e.g. 24.8%
  dailyVariance: number; // decimal or percentage, e.g. 0.024%
  dailyStdDev: number; // percentage, e.g. 1.56%
  dailyExpectedMove: number; // in INR, e.g. 42.50
  expectedRangeLow: number;
  expectedRangeHigh: number;
  regime: 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH';
  regimeLabel: string;
  regimeColor: string;
  maxDailySwingPct: number;
  minDailySwingPct: number;
  parkinsonEstimatePct: number;
  thirtyDayHistory: VolatilityDayVariance[];
  summaryNote: string;
}

export type MarketClassification = 'BULLISH' | 'NEUTRAL' | 'BEARISH';

export interface StateChangeTransition {
  from: MarketClassification;
  to: MarketClassification;
  timestamp: string;
}

export interface ActiveSignal {
  id: string;
  stock: string;
  companyName: string;
  sector: string;
  signal: 'BULLISH' | 'BEARISH';
  option: OptionType;
  strike: number;
  expiry: string;
  entry: number;
  currentPrice: number;
  stopLoss: number;
  target: number;
  status: SignalStatus;
  triggeredAt: string;
  underlyingPrice: number;
  riskReward: string;
  logic: string;
  slot: string;
}

export interface PositionItem {
  id: string;
  symbol: string;
  instrument: string;
  optionType: OptionType;
  strike: number;
  type: 'BUY';
  product: string;
  lots: number;
  lotSize: number;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  stopLoss: number;
  target: number;
  trailingSL?: number;
  entryTime: string;
  status: PositionStatus;
}

export interface TradeHistoryItem {
  id: string;
  instrument: string;
  signal: 'BULLISH' | 'BEARISH';
  type: 'BUY';
  quantity: number;
  entryTime: string;
  exitTime: string;
  entryPrice: number;
  exitPrice: number;
  netPnl: number;
  pnlPercent: number;
  exitReason: TradeExitReason;
}

export interface HistoricalRadarLog {
  id: string;
  date: string;
  time: string;
  symbol: string;
  sector: string;
  slot: string;
  status: StockStatus;
  action: string;
  quantScore: number;
  entryPrice: number;
  exitPrice: number;
  outcome: 'TARGET_1_HIT' | 'TARGET_2_HIT' | 'TRAILING_SL' | 'SL_HIT' | 'DAY_END_CLOSE';
  pnlPercent: number;
  duration: string;
  rVolAtTrigger: number;
  analystComment: string;
}

export interface StrategyForecastModel {
  symbol: string;
  name: string;
  timeframe: string;
  bias: 'STRONGLY BULLISH' | 'MODERATELY BULLISH' | 'NEUTRAL / RANGE' | 'MODERATELY BEARISH' | 'STRONGLY BEARISH';
  confidencePercentage: number;
  expectedRangeLow: number;
  expectedRangeHigh: number;
  pivot: number;
  support1: number;
  support2: number;
  resistance1: number;
  resistance2: number;
  target1: number;
  target2: number;
  invalidationLevel: number;
  riskRewardRatio: string;
  projectedTrajectory: { day: string; baseline: number; optimistic: number; conservative: number }[];
  keyRulesMet: { rule: string; satisfied: boolean; weight: string }[];
  rationale: string;
}

export interface TimelineStep {
  time: string;
  title: string;
  description: string;
  status: 'COMPLETED' | 'ACTIVE' | 'PENDING';
  detail: string;
}

export interface AnalystInsight {
  id: string;
  category: 'SECTOR_ROTATION' | 'VOLUME_SURGE' | 'RE_ENTRY_ALERT' | 'RISK_NOTE';
  timestamp: string;
  headline: string;
  body: string;
  impactedSymbols: string[];
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

export type NavTab =
  | 'dashboard'
  | 'stock-radar'
  | 'sector-radar'
  | 'forecast'
  | 'signals'
  | 'positions'
  | 'paper-trading'
  | 'historical-radar'
  | 'strategy-rules'
  | 'settings'
  | 'stock-detail';

export type MarketMoverCategory = 'GAINERS' | 'LOSERS' | 'MOST_ACTIVE' | 'VOLUME';

export interface MarketMoverStock {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  turnover?: number; // in Crores
  sector: string;
  dayHigh: number;
  dayLow: number;
}

export interface SectorParticipationItem {
  id: string;
  name: string;
  indexSymbol: string;
  changePercent: number;
  bullishPercent: number;
  bearishPercent: number;
  advanceCount: number;
  declineCount: number;
  totalStocks: number;
  topStock?: string;
  topStockChange?: number;
  commentary?: string;
}

export interface HeatmapStockItem {
  id: string;
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  marketCap: number; // Market cap weight in Cr
  volume: number;
  sector: string;
}

export interface HeatmapSectorItem {
  name: string;
  changePercent: number;
  stockCount: number;
  bullishCount: number;
  bearishCount: number;
}

export interface PortfolioSummaryData {
  totalValue: number;
  availableMargin: number;
  usedMargin: number;
  dayPnl: number;
  dayPnlPercent: number;
  overallPnl: number;
  overallPnlPercent: number;
  openPositionsCount: number;
  winRate: number;
}

export type ChartTimeframe = '1m' | '5m' | '15m' | '30m' | '1H' | '1D' | '1W';

export type ChartIndicatorType = 'MA' | 'EMA' | 'RSI' | 'MACD';

export interface IndicatorConfig {
  id: ChartIndicatorType;
  label: string;
  color: string;
  enabled: boolean;
  period?: number;
}

export interface TradeMarkerItem {
  id: string;
  time: string | number;
  type: 'BUY' | 'SELL' | 'ENTRY' | 'EXIT';
  price: number;
  text: string;
  quantity?: number;
}

// ==========================================
// SECTOR SCOPE / SECTOR RADAR SPEC TYPES
// ==========================================

export type SectorDirectionType =
  | 'Strong Bullish'
  | 'Bullish'
  | 'Neutral'
  | 'Bearish'
  | 'Strong Bearish';

export type TradingSignalType =
  | 'Buy'
  | 'Sell'
  | 'Hold'
  | 'Buy Call'
  | 'Buy Put';

export interface MarketIndexes {
  nifty50: MarketIndex;
  bankNifty: MarketIndex;
  sensex: MarketIndex;
  [key: string]: MarketIndex;
}

export type SignalDirectionType =
  | 'Strong Bullish'
  | 'Bullish'
  | 'Bearish'
  | 'Strong Bearish'
  | 'Neutral';

export interface SectorAnalysisItem {
  id: string;
  name: string;
  indexSymbol: string;
  totalStocks: number;
  avgChangePercent: number;
  positiveStocks: number;
  negativeStocks: number;
  bullishPercent: number;
  bearishPercent: number;
  totalVolume: number;
  volumePerStock: number;
  bullishVolume: number;
  bearishVolume: number;
  bullishVolumePercent: number;
  bearishVolumePercent: number;
  direction: SectorDirectionType;
  score: number; // 0 - 100
  overallRank: number;
  bullishRank: number;
  bearishRank: number;
  historySparkline?: number[];
  topStock?: string;
  topStockChange?: number;
  indexPrice?: number;
  change?: number;
  changePct?: number;
  dayHigh?: number;
  dayLow?: number;
}

export interface SectorStockItem {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  ltp: number;
  change: number;
  changePercent: number;
  changePct?: number;
  low: number;
  high: number;
  capital: number; // Trader/investment capital allocated to stock (e.g. ₹5,00,000)
  volume: number;
  signalDirection: SignalDirectionType;
  tradingSignal: TradingSignalType;
  entryPrice: number;
  target1: number;
  target2: number;
  target3: number;
  target4: number; // Trailing Target
  stopLoss: number;
  comment: string; // Stock analysis comment
  vwap?: number;
  rsi?: number;
  score?: number;
}

export interface MarketBreadthExtended {
  totalStocks: number;
  positiveStocks: number;
  negativeStocks: number;
  bullishPercent: number;
  bearishPercent: number;
  marketDirection: SectorDirectionType;
}

export interface SectorSummaryMetrics {
  totalSectors: number;
  strongBullish: number;
  bullish: number;
  neutral: number;
  bearish: number;
  strongBearish: number;
}

// ==========================================
// WATCHLIST SECTION TYPES
// ==========================================

export interface WatchlistStockItem {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  ltp: number;
  change: number;
  changePercent: number;
  open915?: number;
  high?: number;
  low?: number;
  volume?: number;
  sparkline?: number[];
  addedAt?: string;
  tradingSignal?: TradingSignalType;
  signalDirection?: SignalDirectionType;
}

export type WatchlistSortField = 'name' | 'symbol' | 'price' | 'changePercent';
export type WatchlistSortOrder = 'asc' | 'desc';


