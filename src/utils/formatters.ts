import { StockRadarItem } from '../types';

/**
 * Formats a numeric currency value into Indian Rupee (INR) representation with ₹ symbol.
 */
export const formatINR = (val: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(val);
};

/**
 * Formats numbers into Indian Numbering System representation (lakhs/crores formatting).
 */
export const formatNumber = (val: number): string => {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
  }).format(val);
};

/**
 * Exports the active Stock Radar universe to a formatted CSV spreadsheet.
 */
export const exportRadarToCSV = (stocks: StockRadarItem[]): void => {
  const headers = [
    'Rank',
    'Symbol',
    'Company Name',
    'Sector',
    'Slot',
    'Status',
    'Action',
    'Quant Score',
    'LTP (₹)',
    'Change %',
    'VWAP',
    '9:15 High',
    '9:15 Low',
    'RVol',
    'RSI',
    'Breakout Status',
    'Target 1',
    'Target 2',
    'Stop Loss',
  ];

  const rows = stocks.map((s) => [
    s.rank,
    s.symbol,
    `"${s.name}"`,
    `"${s.sector}"`,
    `"${s.slot}"`,
    s.status,
    `"${s.action}"`,
    s.score,
    s.ltp,
    `${s.changePercent}%`,
    s.vwap,
    s.high915,
    s.low915,
    `${s.rvol}x`,
    s.rsi,
    s.breakoutType,
    s.target1,
    s.target2,
    s.stopLoss,
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute(
    'download',
    `NSE_Stock_Radar_Export_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
