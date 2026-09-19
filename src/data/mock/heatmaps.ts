import { HeatmapStockItem, HeatmapSectorItem } from '../../types';

export const MOCK_OVERALL_MARKET_HEATMAP: HeatmapStockItem[] = [
  // Tier 1 Mega Caps
  { id: 'hm-rel', symbol: 'RELIANCE', name: 'Reliance Industries', price: 2984.50, changePercent: 1.23, marketCap: 2018000, volume: 4820000, sector: 'Energy' },
  { id: 'hm-tcs', symbol: 'TCS', name: 'Tata Consultancy Services', price: 4280.10, changePercent: 1.15, marketCap: 1548000, volume: 2120000, sector: 'IT' },
  { id: 'hm-hdfc', symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', price: 1684.20, changePercent: 0.50, marketCap: 1284000, volume: 6240000, sector: 'Banking' },
  { id: 'hm-bharti', symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd.', price: 1542.10, changePercent: 1.41, marketCap: 892000, volume: 3410000, sector: 'Telecom' },
  { id: 'hm-icici', symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', price: 1245.80, changePercent: 1.15, marketCap: 875000, volume: 5890000, sector: 'Banking' },
  { id: 'hm-infy', symbol: 'INFY', name: 'Infosys Limited', price: 1852.40, changePercent: 1.65, marketCap: 768000, volume: 5412300, sector: 'IT' },
  { id: 'hm-sbin', symbol: 'SBIN', name: 'State Bank of India', price: 814.60, changePercent: 0.84, marketCap: 726000, volume: 6720000, sector: 'Banking' },
  { id: 'hm-hul', symbol: 'HINDUNILVR', name: 'Hindustan Unilever', price: 2715.40, changePercent: -0.67, marketCap: 638000, volume: 1420000, sector: 'FMCG' },
  { id: 'hm-itc', symbol: 'ITC', name: 'ITC Ltd.', price: 482.30, changePercent: 0.15, marketCap: 602000, volume: 7890000, sector: 'FMCG' },
  { id: 'hm-lt', symbol: 'LT', name: 'Larsen & Toubro Ltd.', price: 3640.00, changePercent: -0.34, marketCap: 501000, volume: 1840000, sector: 'Capital Goods' },

  // Large Caps
  { id: 'hm-mm', symbol: 'M&M', name: 'Mahindra & Mahindra', price: 3124.50, changePercent: 2.10, marketCap: 388000, volume: 3820450, sector: 'Auto' },
  { id: 'hm-tatamotors', symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.', price: 986.50, changePercent: 1.69, marketCap: 362000, volume: 8945200, sector: 'Auto' },
  { id: 'hm-sun', symbol: 'SUNPHARMA', name: 'Sun Pharma Ltd.', price: 1884.30, changePercent: 0.81, marketCap: 452000, volume: 2310000, sector: 'Pharma' },
  { id: 'hm-maruti', symbol: 'MARUTI', name: 'Maruti Suzuki India', price: 12450.00, changePercent: 0.89, marketCap: 391000, volume: 620000, sector: 'Auto' },
  { id: 'hm-tatasteel', symbol: 'TATASTEEL', name: 'Tata Steel Ltd.', price: 154.20, changePercent: 1.45, marketCap: 192000, volume: 18450000, sector: 'Metal' },
  { id: 'hm-axis', symbol: 'AXISBANK', name: 'Axis Bank Ltd.', price: 1198.40, changePercent: 1.06, marketCap: 370000, volume: 4120000, sector: 'Banking' },
  { id: 'hm-kotak', symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', price: 1782.10, changePercent: -0.30, marketCap: 354000, volume: 2310000, sector: 'Banking' },
  { id: 'hm-wipro', symbol: 'WIPRO', name: 'Wipro Ltd.', price: 542.80, changePercent: 0.95, marketCap: 284000, volume: 3820000, sector: 'IT' },
  { id: 'hm-dlf', symbol: 'DLF', name: 'DLF Limited', price: 842.10, changePercent: -1.80, marketCap: 208000, volume: 3120000, sector: 'Realty' },
  { id: 'hm-godrej', symbol: 'GODREJPROP', name: 'Godrej Properties', price: 2840.00, changePercent: -1.54, marketCap: 78000, volume: 1240000, sector: 'Realty' },
  { id: 'hm-dabur', symbol: 'DABUR', name: 'Dabur India Ltd.', price: 528.30, changePercent: -1.20, marketCap: 93000, volume: 2450000, sector: 'FMCG' },
  { id: 'hm-cipla', symbol: 'CIPLA', name: 'Cipla Ltd.', price: 1612.40, changePercent: 0.45, marketCap: 130000, volume: 1450000, sector: 'Pharma' },
];

export const MOCK_SECTOR_HEATMAP: HeatmapSectorItem[] = [
  { name: 'Nifty Auto', changePercent: 1.35, stockCount: 15, bullishCount: 12, bearishCount: 3 },
  { name: 'Nifty IT', changePercent: 1.42, stockCount: 10, bullishCount: 8, bearishCount: 2 },
  { name: 'Nifty Metal', changePercent: 1.15, stockCount: 15, bullishCount: 10, bearishCount: 5 },
  { name: 'Nifty Bank', changePercent: 0.67, stockCount: 12, bullishCount: 8, bearishCount: 4 },
  { name: 'Nifty Energy', changePercent: 0.45, stockCount: 10, bullishCount: 6, bearishCount: 4 },
  { name: 'Nifty Pharma', changePercent: 0.28, stockCount: 20, bullishCount: 11, bearishCount: 9 },
  { name: 'Nifty FMCG', changePercent: -0.48, stockCount: 15, bullishCount: 4, bearishCount: 11 },
  { name: 'Nifty Realty', changePercent: -1.25, stockCount: 10, bullishCount: 2, bearishCount: 8 },
  { name: 'Nifty Media', changePercent: -0.85, stockCount: 10, bullishCount: 3, bearishCount: 7 },
];

