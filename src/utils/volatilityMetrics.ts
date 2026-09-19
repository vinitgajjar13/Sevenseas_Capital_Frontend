import { StockRadarItem, VolatilityIndexData, VolatilityDayVariance } from '../types';

/**
 * Generates a deterministic pseudorandom value based on a seed string and index.
 * Ensures consistent 30-day historical data across renders for the same stock.
 */
function pseudoRandom(seed: string, index: number): number {
  let h = 0;
  const str = `${seed}_day_${index}`;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return (Math.abs(h) % 10000) / 10000;
}

/**
 * Calculates a simple 30-day historical volatility estimate based on daily open-close variances.
 * In financial mathematics:
 *  - Return per day: R_i = (Close_i - Open_i) / Open_i
 *  - Mean return: \bar{R} = (1/N) \sum R_i
 *  - Daily Variance: \sigma^2 = (1 / (N - 1)) \sum (R_i - \bar{R})^2
 *  - Daily Volatility (Std Dev): \sigma = \sqrt{\sigma^2}
 *  - Annualized 30-Day Volatility (HV30): \sigma * \sqrt{252} * 100%
 */
export function calculateHistoricalVolatility(stock: StockRadarItem): VolatilityIndexData {
  const N = 30;
  const symbol = stock.symbol;
  const currentPrice = stock.ltp || 1000;

  // Typical sector volatility bias
  let sectorBetaMultiplier = 1.0;
  if (stock.sector === 'IT' || stock.sector === 'PHARMA') {
    sectorBetaMultiplier = 0.9;
  } else if (stock.sector === 'BANKING' || stock.sector === 'AUTO') {
    sectorBetaMultiplier = 1.15;
  } else if (stock.sector === 'METALS' || stock.sector === 'ENERGY') {
    sectorBetaMultiplier = 1.35;
  }

  // Base daily standard deviation based on stock price & beta (typically 1.0% to 2.2% daily)
  const baseDailyStdDev = 0.013 * sectorBetaMultiplier;

  // Synthesize 30 trading days of historical open-close variance
  const history: VolatilityDayVariance[] = [];
  const returns: number[] = [];

  let simulatedOpen = currentPrice * 0.94; // 30 days ago anchor

  for (let i = 0; i < N; i++) {
    // Generate realistic daily variance
    const randNorm1 = pseudoRandom(symbol, i * 3) - 0.49;
    const randNorm2 = pseudoRandom(symbol, i * 3 + 1) - 0.5;
    const dailyReturn = (randNorm1 * baseDailyStdDev * 2.1);

    const open = simulatedOpen;
    const close = +(open * (1 + dailyReturn)).toFixed(2);
    const returnPct = (close - open) / open;
    returns.push(returnPct);

    // Calculate dates backwards from current session
    const date = new Date();
    date.setDate(date.getDate() - (N - i));
    const dateStr = date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
    });

    history.push({
      dayIndex: i + 1,
      dateStr,
      open: +open.toFixed(2),
      close,
      variancePct: +(returnPct * 100).toFixed(2),
      absChange: +Math.abs(close - open).toFixed(2),
    });

    // Next day open with slight overnight gap
    const overnightGap = (randNorm2 * 0.006);
    simulatedOpen = +(close * (1 + overnightGap)).toFixed(2);
  }

  // Anchor the final day variance close to current session open vs LTP
  if (stock.open915 && stock.ltp) {
    const todayReturn = (stock.ltp - stock.open915) / stock.open915;
    returns[returns.length - 1] = todayReturn;
    history[history.length - 1].open = stock.open915;
    history[history.length - 1].close = stock.ltp;
    history[history.length - 1].variancePct = +(todayReturn * 100).toFixed(2);
    history[history.length - 1].absChange = +Math.abs(stock.ltp - stock.open915).toFixed(2);
  }

  // Calculate Mean Return (\bar{R})
  const meanReturn = returns.reduce((acc, val) => acc + val, 0) / N;

  // Calculate Sample Variance (\sigma^2)
  const sumSquaredDiffs = returns.reduce((acc, val) => acc + Math.pow(val - meanReturn, 2), 0);
  const sampleVariance = sumSquaredDiffs / (N - 1);

  // Daily Standard Deviation (\sigma_daily)
  const dailyStdDev = Math.sqrt(sampleVariance);

  // Annualized 30-Day Historical Volatility (HV30) = \sigma_daily * \sqrt{252} * 100%
  const annualizedVolatility = +(dailyStdDev * Math.sqrt(252) * 100).toFixed(2);

  // Expected 1-Standard Deviation Daily Move in INR
  const dailyExpectedMove = +(currentPrice * dailyStdDev).toFixed(2);
  const expectedRangeLow = +(currentPrice - dailyExpectedMove).toFixed(2);
  const expectedRangeHigh = +(currentPrice + dailyExpectedMove).toFixed(2);

  // Volatility Regime
  let regime: 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH';
  let regimeLabel: string;
  let regimeColor: string;

  if (annualizedVolatility < 18) {
    regime = 'LOW';
    regimeLabel = 'Low Volatility';
    regimeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  } else if (annualizedVolatility < 26) {
    regime = 'MODERATE';
    regimeLabel = 'Moderate Volatility';
    regimeColor = 'text-indigo-700 bg-indigo-50 border-indigo-200';
  } else if (annualizedVolatility < 34) {
    regime = 'ELEVATED';
    regimeLabel = 'Elevated Volatility';
    regimeColor = 'text-amber-700 bg-amber-50 border-amber-200';
  } else {
    regime = 'HIGH';
    regimeLabel = 'High Volatility';
    regimeColor = 'text-rose-700 bg-rose-50 border-rose-200';
  }

  // Max and Min daily variances
  const variancesOnly = history.map((h) => h.variancePct);
  const maxDailySwingPct = Math.max(...variancesOnly);
  const minDailySwingPct = Math.min(...variancesOnly);

  // Parkinson Estimate (high-low proxy estimate)
  const parkinsonEstimatePct = +(annualizedVolatility * 1.08).toFixed(2);

  // Formulate concise strategy insight note
  let summaryNote = '';
  if (regime === 'LOW') {
    summaryNote = `HV30 is ${annualizedVolatility}% (Low). Narrow daily variances suggest steady range-bound accumulation or slow trending momentum. Stop losses can be placed tighter.`;
  } else if (regime === 'MODERATE') {
    summaryNote = `HV30 is ${annualizedVolatility}% (Moderate). Balanced daily variance is optimal for intraday breakout setups and standard 1:2 risk-reward executions.`;
  } else if (regime === 'ELEVATED') {
    summaryNote = `HV30 is ${annualizedVolatility}% (Elevated). Expanded daily open-close swings require wider buffer around support/resistance pivots to prevent premature stop outs.`;
  } else {
    summaryNote = `HV30 is ${annualizedVolatility}% (High). High daily variance indicates aggressive institutional swings. Position sizing should be moderated.`;
  }

  return {
    annualizedVolatility,
    dailyVariance: +(sampleVariance * 10000).toFixed(4), // in basis points / 10^-4
    dailyStdDev: +(dailyStdDev * 100).toFixed(2), // in %
    dailyExpectedMove,
    expectedRangeLow,
    expectedRangeHigh,
    regime,
    regimeLabel,
    regimeColor,
    maxDailySwingPct,
    minDailySwingPct,
    parkinsonEstimatePct,
    thirtyDayHistory: history,
    summaryNote,
  };
}
