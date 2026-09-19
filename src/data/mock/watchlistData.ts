import { WatchlistStockItem, StockRadarItem } from '../../types';
import { MOCK_STOCK_UNIVERSE } from './stocks';

// ==========================================
// MASTER STOCK SECTOR MAPPING & UNIVERSE
// Standardized sectors for automatic resolution
// ==========================================

export interface MasterStockEntry {
  symbol: string;
  name: string;
  sector: string;
  ltp: number;
  change: number;
  changePercent: number;
  open915: number;
  high: number;
  low: number;
  volume: number;
  sparkline: number[];
}

export const MASTER_STOCK_UNIVERSE: MasterStockEntry[] = [
  // --- ENERGY ---
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    sector: 'Energy',
    ltp: 2984.50,
    change: 36.20,
    changePercent: 1.23,
    open915: 2955.00,
    high: 2998.00,
    low: 2948.00,
    volume: 8420000,
    sparkline: [2955, 2962, 2970, 2980, 2984.5],
  },
  {
    symbol: 'ONGC',
    name: 'Oil & Natural Gas Corp Ltd.',
    sector: 'Energy',
    ltp: 294.60,
    change: 4.80,
    changePercent: 1.66,
    open915: 290.00,
    high: 296.50,
    low: 289.40,
    volume: 14250000,
    sparkline: [290, 291.5, 293, 292.5, 294.6],
  },
  {
    symbol: 'BPCL',
    name: 'Bharat Petroleum Corp Ltd.',
    sector: 'Energy',
    ltp: 348.20,
    change: 3.10,
    changePercent: 0.90,
    open915: 345.50,
    high: 351.00,
    low: 344.20,
    volume: 6850000,
    sparkline: [345.5, 346, 347.5, 347, 348.2],
  },
  {
    symbol: 'IOC',
    name: 'Indian Oil Corporation Ltd.',
    sector: 'Energy',
    ltp: 172.40,
    change: 1.80,
    changePercent: 1.06,
    open915: 170.80,
    high: 173.50,
    low: 170.20,
    volume: 9800000,
    sparkline: [170.8, 171.2, 172, 171.8, 172.4],
  },
  {
    symbol: 'NTPC',
    name: 'NTPC Limited',
    sector: 'Energy',
    ltp: 412.50,
    change: 5.40,
    changePercent: 1.33,
    open915: 407.50,
    high: 415.00,
    low: 406.80,
    volume: 11200000,
    sparkline: [407.5, 409, 411, 410.5, 412.5],
  },
  {
    symbol: 'POWERGRID',
    name: 'Power Grid Corporation of India',
    sector: 'Energy',
    ltp: 338.90,
    change: 2.70,
    changePercent: 0.80,
    open915: 336.50,
    high: 341.20,
    low: 335.80,
    volume: 7600000,
    sparkline: [336.5, 337.2, 338, 337.8, 338.9],
  },

  // --- FINANCIAL SERVICES ---
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd.',
    sector: 'Financial Services',
    ltp: 1648.20,
    change: 18.50,
    changePercent: 1.13,
    open915: 1632.00,
    high: 1655.00,
    low: 1629.50,
    volume: 18500000,
    sparkline: [1632, 1638, 1644, 1642, 1648.2],
  },
  {
    symbol: 'SBIN',
    name: 'State Bank of India',
    sector: 'Financial Services',
    ltp: 824.50,
    change: 12.30,
    changePercent: 1.51,
    open915: 813.00,
    high: 828.00,
    low: 811.20,
    volume: 15400000,
    sparkline: [813, 816.5, 820, 822, 824.5],
  },
  {
    symbol: 'ICICIBANK',
    name: 'ICICI Bank Ltd.',
    sector: 'Financial Services',
    ltp: 1215.80,
    change: 14.60,
    changePercent: 1.22,
    open915: 1202.00,
    high: 1222.00,
    low: 1198.50,
    volume: 12800000,
    sparkline: [1202, 1208, 1212, 1211, 1215.8],
  },
  {
    symbol: 'KOTAKBANK',
    name: 'Kotak Mahindra Bank Ltd.',
    sector: 'Financial Services',
    ltp: 1822.40,
    change: 11.20,
    changePercent: 0.62,
    open915: 1812.00,
    high: 1830.00,
    low: 1808.50,
    volume: 4900000,
    sparkline: [1812, 1815, 1819, 1820, 1822.4],
  },
  {
    symbol: 'AXISBANK',
    name: 'Axis Bank Ltd.',
    sector: 'Financial Services',
    ltp: 1184.20,
    change: 9.80,
    changePercent: 0.83,
    open915: 1176.00,
    high: 1192.00,
    low: 1172.50,
    volume: 7200000,
    sparkline: [1176, 1179, 1182, 1181, 1184.2],
  },
  {
    symbol: 'BAJFINANCE',
    name: 'Bajaj Finance Ltd.',
    sector: 'Financial Services',
    ltp: 7420.00,
    change: 85.00,
    changePercent: 1.16,
    open915: 7340.00,
    high: 7460.00,
    low: 7320.00,
    volume: 1850000,
    sparkline: [7340, 7370, 7400, 7390, 7420],
  },
  {
    symbol: 'BAJAJFINSV',
    name: 'Bajaj Finserv Ltd.',
    sector: 'Financial Services',
    ltp: 1845.50,
    change: 22.00,
    changePercent: 1.21,
    open915: 1825.00,
    high: 1855.00,
    low: 1820.00,
    volume: 2400000,
    sparkline: [1825, 1832, 1840, 1838, 1845.5],
  },

  // --- IT ---
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services Ltd.',
    sector: 'IT',
    ltp: 4215.80,
    change: 48.20,
    changePercent: 1.16,
    open915: 4170.00,
    high: 4235.00,
    low: 4165.00,
    volume: 2150000,
    sparkline: [4170, 4185, 4200, 4195, 4215.8],
  },
  {
    symbol: 'INFY',
    name: 'Infosys Limited',
    sector: 'IT',
    ltp: 1852.40,
    change: 30.10,
    changePercent: 1.65,
    open915: 1828.00,
    high: 1862.00,
    low: 1824.00,
    volume: 4820000,
    sparkline: [1828, 1836, 1845, 1842, 1852.4],
  },
  {
    symbol: 'HCLTECH',
    name: 'HCL Technologies Ltd.',
    sector: 'IT',
    ltp: 1785.60,
    change: 19.40,
    changePercent: 1.10,
    open915: 1768.00,
    high: 1795.00,
    low: 1764.00,
    volume: 2950000,
    sparkline: [1768, 1774, 1780, 1778, 1785.6],
  },
  {
    symbol: 'WIPRO',
    name: 'Wipro Limited',
    sector: 'IT',
    ltp: 542.80,
    change: 4.20,
    changePercent: 0.78,
    open915: 539.00,
    high: 546.00,
    low: 537.50,
    volume: 5400000,
    sparkline: [539, 540.5, 542, 541, 542.8],
  },
  {
    symbol: 'TECHM',
    name: 'Tech Mahindra Ltd.',
    sector: 'IT',
    ltp: 1568.00,
    change: 24.50,
    changePercent: 1.59,
    open915: 1545.00,
    high: 1575.00,
    low: 1540.00,
    volume: 2100000,
    sparkline: [1545, 1552, 1560, 1558, 1568],
  },
  {
    symbol: 'LTIM',
    name: 'LTIMindtree Ltd.',
    sector: 'IT',
    ltp: 6120.00,
    change: 78.00,
    changePercent: 1.29,
    open915: 6050.00,
    high: 6150.00,
    low: 6030.00,
    volume: 980000,
    sparkline: [6050, 6080, 6110, 6100, 6120],
  },

  // --- AUTO ---
  {
    symbol: 'M&M',
    name: 'Mahindra & Mahindra Ltd.',
    sector: 'Auto',
    ltp: 3124.50,
    change: 64.20,
    changePercent: 2.10,
    open915: 3068.00,
    high: 3140.00,
    low: 3062.00,
    volume: 3820000,
    sparkline: [3068, 3085, 3105, 3110, 3124.5],
  },
  {
    symbol: 'TATAMOTORS',
    name: 'Tata Motors Ltd.',
    sector: 'Auto',
    ltp: 986.50,
    change: 16.40,
    changePercent: 1.69,
    open915: 973.00,
    high: 994.00,
    low: 971.00,
    volume: 7850000,
    sparkline: [973, 978, 984, 982, 986.5],
  },
  {
    symbol: 'MARUTI',
    name: 'Maruti Suzuki India Ltd.',
    sector: 'Auto',
    ltp: 12450.00,
    change: 145.00,
    changePercent: 1.18,
    open915: 12320.00,
    high: 12510.00,
    low: 12290.00,
    volume: 680000,
    sparkline: [12320, 12380, 12420, 12410, 12450],
  },
  {
    symbol: 'BAJAJ-AUTO',
    name: 'Bajaj Auto Ltd.',
    sector: 'Auto',
    ltp: 9840.00,
    change: 110.00,
    changePercent: 1.13,
    open915: 9740.00,
    high: 9890.00,
    low: 9720.00,
    volume: 450000,
    sparkline: [9740, 9780, 9820, 9810, 9840],
  },
  {
    symbol: 'HEROMOTOCO',
    name: 'Hero MotoCorp Ltd.',
    sector: 'Auto',
    ltp: 5420.00,
    change: 55.00,
    changePercent: 1.03,
    open915: 5370.00,
    high: 5450.00,
    low: 5360.00,
    volume: 720000,
    sparkline: [5370, 5390, 5410, 5405, 5420],
  },

  // --- METALS & MINING ---
  {
    symbol: 'TATASTEEL',
    name: 'Tata Steel Ltd.',
    sector: 'Metals & Mining',
    ltp: 154.20,
    change: 2.20,
    changePercent: 1.45,
    open915: 152.40,
    high: 155.80,
    low: 151.80,
    volume: 18400000,
    sparkline: [152.4, 153, 153.8, 153.5, 154.2],
  },
  {
    symbol: 'JSWSTEEL',
    name: 'JSW Steel Ltd.',
    sector: 'Metals & Mining',
    ltp: 945.60,
    change: 11.80,
    changePercent: 1.26,
    open915: 935.00,
    high: 952.00,
    low: 932.00,
    volume: 3400000,
    sparkline: [935, 938, 943, 941, 945.6],
  },
  {
    symbol: 'HINDALCO',
    name: 'Hindalco Industries Ltd.',
    sector: 'Metals & Mining',
    ltp: 682.40,
    change: 8.60,
    changePercent: 1.28,
    open915: 675.00,
    high: 688.00,
    low: 672.00,
    volume: 4800000,
    sparkline: [675, 678, 681, 680, 682.4],
  },
  {
    symbol: 'VEDL',
    name: 'Vedanta Limited',
    sector: 'Metals & Mining',
    ltp: 462.80,
    change: 5.40,
    changePercent: 1.18,
    open915: 458.00,
    high: 466.00,
    low: 456.50,
    volume: 8900000,
    sparkline: [458, 460, 462, 461, 462.8],
  },

  // --- PHARMA & HEALTHCARE ---
  {
    symbol: 'SUNPHARMA',
    name: 'Sun Pharmaceutical Industries Ltd.',
    sector: 'Pharma & Healthcare',
    ltp: 1782.50,
    change: 16.20,
    changePercent: 0.92,
    open915: 1768.00,
    high: 1792.00,
    low: 1764.00,
    volume: 2400000,
    sparkline: [1768, 1772, 1779, 1778, 1782.5],
  },
  {
    symbol: 'CIPLA',
    name: 'Cipla Limited',
    sector: 'Pharma & Healthcare',
    ltp: 1548.00,
    change: 14.50,
    changePercent: 0.95,
    open915: 1535.00,
    high: 1558.00,
    low: 1530.00,
    volume: 1850000,
    sparkline: [1535, 1540, 1546, 1544, 1548],
  },
  {
    symbol: 'DRREDDY',
    name: "Dr. Reddy's Laboratories Ltd.",
    sector: 'Pharma & Healthcare',
    ltp: 6680.00,
    change: 62.00,
    changePercent: 0.94,
    open915: 6625.00,
    high: 6710.00,
    low: 6610.00,
    volume: 780000,
    sparkline: [6625, 6645, 6670, 6660, 6680],
  },

  // --- FMCG ---
  {
    symbol: 'ITC',
    name: 'ITC Limited',
    sector: 'FMCG',
    ltp: 512.40,
    change: 3.80,
    changePercent: 0.75,
    open915: 509.00,
    high: 515.00,
    low: 508.00,
    volume: 12500000,
    sparkline: [509, 510, 511.5, 511, 512.4],
  },
  {
    symbol: 'HINDUNILVR',
    name: 'Hindustan Unilever Ltd.',
    sector: 'FMCG',
    ltp: 2840.00,
    change: 18.00,
    changePercent: 0.64,
    open915: 2825.00,
    high: 2855.00,
    low: 2820.00,
    volume: 1950000,
    sparkline: [2825, 2830, 2838, 2835, 2840],
  },
  {
    symbol: 'NESTLEIND',
    name: 'Nestle India Ltd.',
    sector: 'FMCG',
    ltp: 2540.00,
    change: -12.00,
    changePercent: -0.47,
    open915: 2555.00,
    high: 2562.00,
    low: 2535.00,
    volume: 680000,
    sparkline: [2555, 2550, 2542, 2545, 2540],
  },

  // --- INFRASTRUCTURE ---
  {
    symbol: 'LT',
    name: 'Larsen & Toubro Ltd.',
    sector: 'Infrastructure',
    ltp: 3640.00,
    change: 42.00,
    changePercent: 1.17,
    open915: 3605.00,
    high: 3660.00,
    low: 3598.00,
    volume: 2450000,
    sparkline: [3605, 3620, 3635, 3630, 3640],
  },
  {
    symbol: 'ADANIPORTS',
    name: 'Adani Ports & SEZ Ltd.',
    sector: 'Infrastructure',
    ltp: 1445.00,
    change: 19.50,
    changePercent: 1.37,
    open915: 1428.00,
    high: 1455.00,
    low: 1424.00,
    volume: 3800000,
    sparkline: [1428, 1434, 1442, 1440, 1445],
  },

  // --- TELECOM ---
  {
    symbol: 'BHARTIARTL',
    name: 'Bharti Airtel Ltd.',
    sector: 'Telecommunication',
    ltp: 1542.10,
    change: 21.40,
    changePercent: 1.41,
    open915: 1524.00,
    high: 1550.00,
    low: 1520.00,
    volume: 5200000,
    sparkline: [1524, 1530, 1538, 1536, 1542.1],
  },
];

// Symbol to Master Entry mapping for O(1) lookup
const MASTER_MAP = new Map<string, MasterStockEntry>();
MASTER_STOCK_UNIVERSE.forEach((entry) => {
  MASTER_MAP.set(entry.symbol.toUpperCase(), entry);
});

/**
 * Automatically resolves a stock's sector from symbol or partial stock data.
 * Checks the master universe first, then falls back to MOCK_STOCK_UNIVERSE,
 * or formats 'Nifty IT' -> 'IT', etc.
 */
export function resolveStockSector(symbol: string): string {
  const cleanSymbol = symbol.toUpperCase().trim();
  const master = MASTER_MAP.get(cleanSymbol);
  if (master) return master.sector;

  const fromUniverse = MOCK_STOCK_UNIVERSE.find((s) => s.symbol.toUpperCase() === cleanSymbol);
  if (fromUniverse && fromUniverse.sector) {
    return cleanSectorName(fromUniverse.sector);
  }

  return 'Diversified';
}

/**
 * Helper to normalize sector strings like "Nifty IT" -> "IT", "Nifty Bank" -> "Financial Services"
 */
export function cleanSectorName(rawSector: string): string {
  const s = rawSector.trim();
  if (s.toLowerCase().includes('it')) return 'IT';
  if (s.toLowerCase().includes('energy') || s.toLowerCase().includes('oil')) return 'Energy';
  if (s.toLowerCase().includes('bank') || s.toLowerCase().includes('financial')) return 'Financial Services';
  if (s.toLowerCase().includes('auto')) return 'Auto';
  if (s.toLowerCase().includes('metal')) return 'Metals & Mining';
  if (s.toLowerCase().includes('pharma') || s.toLowerCase().includes('health')) return 'Pharma & Healthcare';
  if (s.toLowerCase().includes('fmcg') || s.toLowerCase().includes('consum')) return 'FMCG';
  if (s.toLowerCase().includes('infra')) return 'Infrastructure';
  if (s.toLowerCase().includes('telecom')) return 'Telecommunication';
  if (s.toLowerCase().includes('realt')) return 'Realty';
  return s.replace(/^Nifty\s+/i, '');
}

/**
 * Searches across the entire master universe for adding stocks.
 */
export function searchMasterStockUniverse(query: string): MasterStockEntry[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();

  return MASTER_STOCK_UNIVERSE.filter(
    (s) =>
      s.symbol.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.sector.toLowerCase().includes(q)
  );
}

/**
 * Returns default initial watchlist as requested in prompt:
 * RELIANCE (Energy), ONGC (Energy), HDFCBANK (Financial Services),
 * SBIN (Financial Services), TCS (IT), INFY (IT).
 */
export function getInitialWatchlist(): WatchlistStockItem[] {
  const targetSymbols = ['RELIANCE', 'ONGC', 'HDFCBANK', 'SBIN', 'TCS', 'INFY'];
  const result: WatchlistStockItem[] = [];

  for (const sym of targetSymbols) {
    const entry = MASTER_MAP.get(sym);
    if (entry) {
      result.push({
        id: `watchlist-${entry.symbol.toLowerCase()}`,
        symbol: entry.symbol,
        name: entry.name,
        sector: entry.sector,
        ltp: entry.ltp,
        change: entry.change,
        changePercent: entry.changePercent,
        open915: entry.open915,
        high: entry.high,
        low: entry.low,
        volume: entry.volume,
        sparkline: entry.sparkline,
        addedAt: 'Pre-Market',
      });
    }
  }

  return result;
}

/**
 * Converts a WatchlistStockItem into a full StockRadarItem for seamless opening
 * inside the existing StockDetailView.
 */
export function watchlistToStockRadarItem(
  item: WatchlistStockItem,
  existingRadarList: StockRadarItem[] = []
): StockRadarItem {
  const existing = existingRadarList.find((s) => s.symbol === item.symbol) ||
    MOCK_STOCK_UNIVERSE.find((s) => s.symbol === item.symbol);

  if (existing) {
    return {
      ...existing,
      ltp: item.ltp,
      change: item.change,
      changePercent: item.changePercent,
      sector: item.sector,
    };
  }

  // Create clean template from first universe stock to fulfill all required fields
  const template = MOCK_STOCK_UNIVERSE[0];
  return {
    ...template,
    id: `stk-${item.symbol.toLowerCase()}`,
    symbol: item.symbol,
    name: item.name,
    sector: item.sector,
    rank: 1,
    prevRank: 1,
    slot: 'Slot 1: Alpha Leader',
    status: item.changePercent >= 0 ? 'BULL' : 'BEAR',
    action: item.changePercent >= 0 ? 'BUY CALL (CE)' : 'BUY PUT (PE)',
    score: 85,
    ltp: item.ltp,
    change: item.change,
    changePercent: item.changePercent,
    open915: item.open915 || +(item.ltp * 0.99).toFixed(2),
    high915: item.high || +(item.ltp * 1.01).toFixed(2),
    low915: item.low || +(item.ltp * 0.98).toFixed(2),
    prevHigh: item.high || +(item.ltp * 1.01).toFixed(2),
    prevLow: item.low || +(item.ltp * 0.98).toFixed(2),
    vwap: item.ltp,
    rvol: 1.8,
    rsi: 62,
    breakoutType: 'HIGH_BREAK',
    conditionMet: 'Active momentum in sector watchlist',
    suggestedStrike: `${item.symbol} Spot / MIS`,
    target1: +(item.ltp * 1.02).toFixed(2),
    target2: +(item.ltp * 1.04).toFixed(2),
    stopLoss: +(item.ltp * 0.98).toFixed(2),
    pivot: +(item.ltp * 0.995).toFixed(2),
    resistance1: +(item.ltp * 1.015).toFixed(2),
    support1: +(item.ltp * 0.985).toFixed(2),
  };
}
