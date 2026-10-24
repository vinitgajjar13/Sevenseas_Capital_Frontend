import {
  SectorAnalysisItem,
  SectorStockItem,
  SectorDirectionType,
  TradingSignalType,
  SignalDirectionType,
  MarketBreadthExtended,
  SectorSummaryMetrics,
  TimePeriod,
} from '../../types';
import { STOCKS_UNIVERSE_213 } from './stocksUniverse';

// ==========================================
// 1. SECTOR INDEX SYMBOL MAPPING
// ==========================================

export const SECTOR_INDEX_SYMBOLS: Record<string, string> = {
  'Packaging & Materials': 'NIFTYPKG',
  'Real Estate': 'NIFTYREALTY',
  'Building Materials': 'NIFTYMAT',
  'Automobile': 'NIFTYAUTO',
  'Consumer Discretionary': 'NIFTYCONSR',
  'Diversified': 'NIFTYDIV',
  'Industrials': 'NIFTYIND',
  'Power & Utilities': 'NIFTYPOWER',
  'Banking': 'BANKNIFTY',
  'FMCG': 'NIFTYFMCG',
  'Services & Logistics': 'NIFTYSERV',
  'Textiles & Apparels': 'NIFTYTEX',
  'Financial Services': 'NIFTYFIN',
  'Chemicals': 'NIFTYCHEM',
  'Information Technology': 'NIFTYIT',
  'Energy': 'NIFTYENERGY',
  'Aerospace & Defence': 'NIFTYDEFENCE',
  'Metals & Mining': 'NIFTYMETAL',
  'Logistics & Transportation': 'NIFTYLOGI',
  'Telecommunication': 'NIFTYCOMM',
  'Pharma & Healthcare': 'NIFTYPHARMA',
};

export const SECTOR_ALIASES: Record<string, string> = {
  'Nifty IT': 'Information Technology',
  'Nifty Auto': 'Automobile',
  'Nifty Metal': 'Metals & Mining',
  'Nifty Bank': 'Banking',
  'Nifty Fin Services': 'Financial Services',
  'Nifty Energy': 'Energy',
  'Nifty Infra': 'Industrials',
  'Nifty Pharma': 'Pharma & Healthcare',
  'Nifty FMCG': 'FMCG',
  'Nifty Realty': 'Real Estate',
  'Nifty Media': 'Telecommunication',
  'Nifty PSU Bank': 'Banking',
  'NIFTYIT': 'Information Technology',
  'NIFTYAUTO': 'Automobile',
  'NIFTYMETAL': 'Metals & Mining',
  'BANKNIFTY': 'Banking',
  'NIFTYFINSERVICE': 'Financial Services',
  'NIFTYENERGY': 'Energy',
  'NIFTYINFRA': 'Industrials',
  'NIFTYPHARMA': 'Pharma & Healthcare',
  'NIFTYFMCG': 'FMCG',
  'NIFTYREALTY': 'Real Estate',
  'NIFTYMEDIA': 'Telecommunication',
  'NIFTYPSUBANK': 'Banking',
};

// ==========================================
// 2. CONVERT STOCK TO SECTOR CONSTITUENT
// ==========================================

export function convertToSectorStock(stk: typeof STOCKS_UNIVERSE_213[0]): SectorStockItem {
  const isStrongBull = stk.changePercent >= 2.0;
  const isBull = stk.changePercent >= 0.40;
  const isStrongBear = stk.changePercent <= -2.0;
  const isBear = stk.changePercent <= -0.40;

  const signalDirection: SignalDirectionType = isStrongBull
    ? 'Strong Bullish'
    : isBull
    ? 'Bullish'
    : isStrongBear
    ? 'Strong Bearish'
    : isBear
    ? 'Bearish'
    : 'Neutral';

  const tradingSignal: TradingSignalType = isBull
    ? 'Buy Call'
    : isBear
    ? 'Buy Put'
    : 'Hold';

  const capital = Math.max(250000, Math.min(2500000, Math.round(stk.ltp * (stk.volume > 5000000 ? 500 : 250))));

  return {
    id: stk.id,
    symbol: stk.symbol,
    name: stk.name,
    sector: stk.sector,
    ltp: stk.ltp,
    change: stk.change,
    changePercent: stk.changePercent,
    changePct: stk.changePercent,
    low: stk.low915,
    high: stk.high915,
    capital,
    volume: stk.volume || 1000000,
    signalDirection,
    tradingSignal,
    entryPrice: stk.open915,
    target1: stk.target1,
    target2: stk.target2,
    target3: +(stk.target2 * 1.015).toFixed(2),
    target4: +(stk.target2 * 1.03).toFixed(2),
    stopLoss: stk.stopLoss,
    comment: stk.analystNote || stk.conditionMet,
    vwap: stk.vwap,
    rsi: stk.rsi,
    score: stk.score,
  };
}

// ==========================================
// 3. CONSTITUENT STOCKS GROUPED SECTOR-WISE
// ==========================================

export const MOCK_SECTOR_STOCKS: Record<string, SectorStockItem[]> = {};

// Group all 213 stocks by sector
STOCKS_UNIVERSE_213.forEach((stock) => {
  const sec = stock.sector;
  if (!MOCK_SECTOR_STOCKS[sec]) {
    MOCK_SECTOR_STOCKS[sec] = [];
  }
  MOCK_SECTOR_STOCKS[sec].push(convertToSectorStock(stock));
});

// Sort stocks in each sector descending by changePercent (strongest performers to weakest)
Object.keys(MOCK_SECTOR_STOCKS).forEach((sec) => {
  MOCK_SECTOR_STOCKS[sec].sort((a, b) => b.changePercent - a.changePercent);

  // Link index symbol alias
  const sym = SECTOR_INDEX_SYMBOLS[sec];
  if (sym) {
    MOCK_SECTOR_STOCKS[sym] = MOCK_SECTOR_STOCKS[sec];
  }
});

// Link legacy aliases
Object.entries(SECTOR_ALIASES).forEach(([alias, targetSec]) => {
  if (MOCK_SECTOR_STOCKS[targetSec]) {
    MOCK_SECTOR_STOCKS[alias] = MOCK_SECTOR_STOCKS[targetSec];
  }
});

// ==========================================
// 4. SCORING & CALCULATION HELPERS
// ==========================================

export function calculateSectorScore(sector: Partial<SectorAnalysisItem>): number {
  const avgChg = sector.avgChangePercent || 0;
  const bullPct = sector.bullishPercent || 50;
  const volBullPct = sector.bullishVolumePercent || 50;

  // Weightings: 35% % Change, 35% Breadth participation, 30% Volume conviction
  const chgScore = Math.min(100, Math.max(0, (avgChg + 2) * 25)); // -2% -> 0, +2% -> 100
  const combined = Math.round(chgScore * 0.35 + bullPct * 0.35 + volBullPct * 0.30);
  return Math.min(100, Math.max(5, combined));
}

export function getSectorDirectionFromScore(score: number, avgChg: number): SectorDirectionType {
  if (score >= 85 && avgChg >= 1.0) return 'Strong Bullish';
  if (score >= 68 && avgChg >= 0.3) return 'Bullish';
  if (score <= 35 && avgChg <= -1.0) return 'Strong Bearish';
  if (score <= 48 && avgChg <= -0.3) return 'Bearish';
  return 'Neutral';
}

// ==========================================
// 5. MASTER SECTOR ANALYSIS DATASET (21 Sectors)
// ==========================================

const rawSectors: SectorAnalysisItem[] = Object.keys(SECTOR_INDEX_SYMBOLS).map((secName) => {
  const constituents = MOCK_SECTOR_STOCKS[secName] || [];
  const totalStocks = constituents.length;
  const pos = constituents.filter((s) => s.changePercent > 0).length;
  const neg = constituents.filter((s) => s.changePercent < 0).length;
  const bullPct = totalStocks > 0 ? Math.round((pos / totalStocks) * 100) : 50;
  const bearPct = 100 - bullPct;

  const avgChg = totalStocks > 0
    ? +(constituents.reduce((acc, s) => acc + s.changePercent, 0) / totalStocks).toFixed(2)
    : 0;

  const totVol = constituents.reduce((acc, s) => acc + s.volume, 0);
  const bullVol = constituents.filter((s) => s.changePercent >= 0).reduce((acc, s) => acc + s.volume, 0);
  const bearVol = totVol - bullVol;
  const bullVolPct = totVol > 0 ? Math.round((bullVol / totVol) * 100) : 50;
  const bearVolPct = 100 - bullVolPct;

  const score = calculateSectorScore({
    avgChangePercent: avgChg,
    bullishPercent: bullPct,
    bullishVolumePercent: bullVolPct,
  });

  const direction = getSectorDirectionFromScore(score, avgChg);

  const top = constituents[0] || { symbol: 'N/A', changePercent: 0 };
  const topStock = `${top.symbol} (${top.changePercent >= 0 ? '+' : ''}${top.changePercent}%)`;

  const indexSymbol = SECTOR_INDEX_SYMBOLS[secName] || 'SECTOR';
  const id = 'sec-' + secName.toLowerCase().replace(/[^a-z0-9]/g, '');

  const indexBase = 15000 + Math.round(score * 180);
  const dayChange = +(indexBase * (avgChg / 100)).toFixed(2);

  return {
    id,
    name: secName,
    indexSymbol,
    totalStocks,
    avgChangePercent: avgChg,
    positiveStocks: pos,
    negativeStocks: neg,
    bullishPercent: bullPct,
    bearishPercent: bearPct,
    totalVolume: totVol,
    volumePerStock: totalStocks > 0 ? Math.round(totVol / totalStocks) : 0,
    bullishVolume: bullVol,
    bearishVolume: bearVol,
    bullishVolumePercent: bullVolPct,
    bearishVolumePercent: bearVolPct,
    direction,
    score,
    overallRank: 0,
    bullishRank: 0,
    bearishRank: 0,
    topStock,
    topStockChange: top.changePercent,
    historySparkline: [
      Math.max(10, Math.min(100, score - 8)),
      Math.max(10, Math.min(100, score - 5)),
      Math.max(10, Math.min(100, score - 2)),
      Math.max(10, Math.min(100, score + 1)),
      score,
    ],
    indexPrice: indexBase,
    change: dayChange,
    changePct: avgChg,
    dayHigh: +(indexBase * 1.008).toFixed(2),
    dayLow: +(indexBase * 0.992).toFixed(2),
  };
});

// Sort sectors by avgChangePercent descending (proper arrangement from best performing to laggards)
rawSectors.sort((a, b) => {
  if (b.avgChangePercent !== a.avgChangePercent) {
    return b.avgChangePercent - a.avgChangePercent;
  }
  return b.score - a.score;
});

export const INITIAL_SECTOR_ANALYSIS: SectorAnalysisItem[] = rawSectors.map((sec, idx) => ({
  ...sec,
  overallRank: idx + 1,
  bullishRank: idx + 1,
  bearishRank: rawSectors.length - idx,
}));

// ==========================================
// 6. SUMMARY METRICS & PERIOD ANALYTICS
// ==========================================

export function getSectorSummaryMetrics(sectors: SectorAnalysisItem[]): SectorSummaryMetrics {
  return {
    totalSectors: sectors.length,
    strongBullish: sectors.filter((s) => s.direction === 'Strong Bullish').length,
    bullish: sectors.filter((s) => s.direction === 'Bullish').length,
    neutral: sectors.filter((s) => s.direction === 'Neutral').length,
    bearish: sectors.filter((s) => s.direction === 'Bearish').length,
    strongBearish: sectors.filter((s) => s.direction === 'Strong Bearish').length,
  };
}

export function getMarketBreadthExtended(sectors: SectorAnalysisItem[]): MarketBreadthExtended {
  let totalStocks = 0;
  let positiveStocks = 0;
  let negativeStocks = 0;

  sectors.forEach((s) => {
    totalStocks += s.totalStocks;
    positiveStocks += s.positiveStocks;
    negativeStocks += s.negativeStocks;
  });

  const bullishPercent = totalStocks > 0 ? Math.round((positiveStocks / totalStocks) * 100) : 50;
  const bearishPercent = totalStocks > 0 ? 100 - bullishPercent : 50;

  let marketDirection: SectorDirectionType = 'Neutral';
  if (bullishPercent >= 75) marketDirection = 'Strong Bullish';
  else if (bullishPercent >= 60) marketDirection = 'Bullish';
  else if (bullishPercent <= 25) marketDirection = 'Strong Bearish';
  else if (bullishPercent <= 40) marketDirection = 'Bearish';

  return {
    totalStocks,
    positiveStocks,
    negativeStocks,
    bullishPercent,
    bearishPercent,
    marketDirection,
  };
}

// Time period modifier to generate realistic variations for 1D, 1W, 1M, 3M, 1Y
export function getSectorDataForPeriod(period: TimePeriod): SectorAnalysisItem[] {
  const multiplier = period === '1W' ? 1.8 : period === '1M' ? 3.2 : period === '3M' ? 5.5 : period === '1Y' ? 8.4 : 1.0;

  const modified = INITIAL_SECTOR_ANALYSIS.map((sec) => {
    const rawChg = +(sec.avgChangePercent * multiplier).toFixed(2);
    const score = calculateSectorScore({
      ...sec,
      avgChangePercent: rawChg,
    });
    const direction = getSectorDirectionFromScore(score, rawChg);

    return {
      ...sec,
      avgChangePercent: rawChg,
      score,
      direction,
      overallRank: 0,
      bullishRank: 0,
      bearishRank: 0,
    };
  });

  modified.sort((a, b) => {
    if (b.avgChangePercent !== a.avgChangePercent) {
      return b.avgChangePercent - a.avgChangePercent;
    }
    return b.score - a.score;
  });

  return modified.map((sec, idx) => ({
    ...sec,
    overallRank: idx + 1,
    bullishRank: idx + 1,
    bearishRank: modified.length - idx,
  }));
}
