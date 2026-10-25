import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getStockClassification,
  assignDynamicRanks,
  sortStocksByChangePercent,
  assignChangePercentRanks,
} from './stockRanking';
import { StockRadarItem } from '../types';

const createBaseStock = (overrides: Partial<StockRadarItem> = {}): StockRadarItem =>
  ({
    id: 'stk-1',
    symbol: 'RELIANCE',
    name: 'Reliance Industries',
    sector: 'ENERGY',
    rank: 1,
    prevRank: 1,
    ltp: 2850.0,
    open915: 2840.0,
    high: 2865.0,
    low: 2835.0,
    dayHigh: 2865.0,
    dayLow: 2835.0,
    change: 10.0,
    changePercent: 0.35,
    rvol: 1.2,
    score: 65,
    status: 'STAY',
    action: 'HOLD / STAY',
    slot: 'Slot 1: Alpha Leader',
    ...overrides,
  } as unknown as StockRadarItem);

test('getStockClassification prioritizes backend strategyState', () => {
  const bullStock = createBaseStock({
    strategyState: 'BULLISH',
    changePercent: -1.5, // Even if raw intraday change is negative, strategyState takes precedence
  });
  assert.equal(getStockClassification(bullStock), 'BULLISH');

  const bearStock = createBaseStock({
    strategyState: 'BEARISH',
    changePercent: 2.5, // Even if raw intraday change is positive, strategyState takes precedence
  });
  assert.equal(getStockClassification(bearStock), 'BEARISH');
});

test('getStockClassification respects backend watch_status and watch flags', () => {
  const watchBull = createBaseStock({
    watchStatus: '🟢 WATCH',
  });
  assert.equal(getStockClassification(watchBull), 'BULLISH');

  const watchBear = createBaseStock({
    watchStatus: '🔴 WATCH',
  });
  assert.equal(getStockClassification(watchBear), 'BEARISH');

  const flagBull = createBaseStock({
    bullishWatch: true,
  });
  assert.equal(getStockClassification(flagBull), 'BULLISH');

  const flagBear = createBaseStock({
    bearishWatch: true,
  });
  assert.equal(getStockClassification(flagBear), 'BEARISH');
});

test('getStockClassification respects SPIKE and DUMP signals', () => {
  const spikeStock = createBaseStock({
    signal: '🔥 SPIKE',
  });
  assert.equal(getStockClassification(spikeStock), 'BULLISH');

  const dumpStock = createBaseStock({
    signal: '🚨 DUMP',
  });
  assert.equal(getStockClassification(dumpStock), 'BEARISH');
});

test('getStockClassification respects Teacher Action alignment', () => {
  const bullAligned = createBaseStock({
    teacherAction: '🟢 BULL ALIGNED',
  });
  assert.equal(getStockClassification(bullAligned), 'BULLISH');

  const bearAligned = createBaseStock({
    teacherAction: '🔴 BEAR ALIGNED',
  });
  assert.equal(getStockClassification(bearAligned), 'BEARISH');
});

test('getStockClassification handles missing reference data without fabricating signals', () => {
  const noRefStock = createBaseStock({
    hasReferenceData: false,
    pdHigh: null,
    pdLow: null,
    signal: null,
    watchStatus: null,
    strategyState: 'NEUTRAL',
    changePercent: 0.1,
    score: 45,
  });

  // Must not fabricate BULLISH or BEARISH when reference data is missing and strategy is neutral
  assert.equal(getStockClassification(noRefStock), 'NEUTRAL');
  assert.equal(noRefStock.hasReferenceData, false);
});

test('assignDynamicRanks sets ranks sequentially and updates prevRank', () => {
  const stocks: StockRadarItem[] = [
    createBaseStock({ id: 's1', symbol: 'INFY', score: 85, rank: 2, prevRank: 1 }),
    createBaseStock({ id: 's2', symbol: 'TCS', score: 70, rank: 1, prevRank: 2 }),
    createBaseStock({ id: 's3', symbol: 'WIPRO', score: 50, rank: 3, prevRank: 3 }),
  ];

  const ranked = assignDynamicRanks(stocks);
  assert.equal(ranked.length, 3);
  assert.equal(ranked[0].rank, 1);
  assert.equal(ranked[0].prevRank, 2); // Recorded previous rank of 2
  assert.equal(ranked[1].rank, 2);
  assert.equal(ranked[1].prevRank, 1);
  assert.equal(ranked[2].rank, 3);
  assert.equal(ranked[2].prevRank, 3);
});

test('assignDynamicRanks handles empty array safely', () => {
  const ranked = assignDynamicRanks([]);
  assert.deepEqual(ranked, []);
});

test('sortStocksByChangePercent automatically orders stocks descending by Change %', () => {
  const stocks: StockRadarItem[] = [
    createBaseStock({ id: 's1', symbol: 'INFY', changePercent: 1.25 }),
    createBaseStock({ id: 's2', symbol: 'TCS', changePercent: 3.40 }),
    createBaseStock({ id: 's3', symbol: 'WIPRO', changePercent: -0.80 }),
    createBaseStock({ id: 's4', symbol: 'HDFCBANK', changePercent: 0.15 }),
  ];

  const sorted = sortStocksByChangePercent(stocks, true);
  assert.deepEqual(
    sorted.map((s) => s.symbol),
    ['TCS', 'INFY', 'HDFCBANK', 'WIPRO']
  );
  assert.equal(sorted[0].changePercent, 3.40);
  assert.equal(sorted[3].changePercent, -0.80);
});

test('stocks automatically rise to higher rank when Change % increases', () => {
  let stocks: StockRadarItem[] = [
    createBaseStock({ id: 's1', symbol: 'INFY', changePercent: 1.25, rank: 1 }),
    createBaseStock({ id: 's2', symbol: 'TCS', changePercent: 0.50, rank: 2 }),
    createBaseStock({ id: 's3', symbol: 'WIPRO', changePercent: -0.20, rank: 3 }),
  ];

  let ranked = assignChangePercentRanks(stocks);
  assert.equal(ranked[0].symbol, 'INFY');
  assert.equal(ranked[0].rank, 1);
  assert.equal(ranked[1].symbol, 'TCS');
  assert.equal(ranked[1].rank, 2);

  // Live price update pushes TCS Change % from 0.50% to 2.80% (rising above INFY)
  stocks = stocks.map((s) => (s.symbol === 'TCS' ? { ...s, changePercent: 2.80 } : s));

  ranked = assignChangePercentRanks(stocks);
  // TCS must now be Rank #1, and recorded its previous rank of 2
  assert.equal(ranked[0].symbol, 'TCS');
  assert.equal(ranked[0].rank, 1);
  assert.equal(ranked[0].prevRank, 2); // Transitioned from #2 to #1

  // INFY dropped to Rank #2
  assert.equal(ranked[1].symbol, 'INFY');
  assert.equal(ranked[1].rank, 2);
  assert.equal(ranked[1].prevRank, 1); // Transitioned from #1 to #2
});

test('stocks automatically fall to lower rank when Change % decreases', () => {
  let stocks: StockRadarItem[] = [
    createBaseStock({ id: 's1', symbol: 'INFY', changePercent: 2.50, rank: 1 }),
    createBaseStock({ id: 's2', symbol: 'TCS', changePercent: 1.80, rank: 2 }),
    createBaseStock({ id: 's3', symbol: 'WIPRO', changePercent: 0.50, rank: 3 }),
  ];

  let ranked = assignChangePercentRanks(stocks);
  assert.equal(ranked[0].symbol, 'INFY');

  // INFY suffers a sharp price drop, Change % falls from 2.50% to -1.10%
  stocks = stocks.map((s) => (s.symbol === 'INFY' ? { ...s, changePercent: -1.10 } : s));

  ranked = assignChangePercentRanks(stocks);
  assert.equal(ranked[0].symbol, 'TCS');
  assert.equal(ranked[0].rank, 1);
  assert.equal(ranked[1].symbol, 'WIPRO');
  assert.equal(ranked[1].rank, 2);
  assert.equal(ranked[2].symbol, 'INFY');
  assert.equal(ranked[2].rank, 3);
  assert.equal(ranked[2].prevRank, 1); // Recorded drop from #1 to #3
});

test('sortStocksByChangePercent stably breaks ties using quant score, rvol, and symbol', () => {
  const stocks: StockRadarItem[] = [
    createBaseStock({ id: 's1', symbol: 'BETA', changePercent: 1.50, score: 70, rvol: 1.5 }),
    createBaseStock({ id: 's2', symbol: 'ALPHA', changePercent: 1.50, score: 85, rvol: 1.5 }), // higher score
    createBaseStock({ id: 's3', symbol: 'GAMMA', changePercent: 1.50, score: 70, rvol: 2.2 }), // higher rvol
    createBaseStock({ id: 's4', symbol: 'DELTA', changePercent: 1.50, score: 70, rvol: 1.5 }),
  ];

  const sorted = sortStocksByChangePercent(stocks, true);
  // ALPHA first (score 85)
  assert.equal(sorted[0].symbol, 'ALPHA');
  // GAMMA second (rvol 2.2)
  assert.equal(sorted[1].symbol, 'GAMMA');
  // BETA before DELTA (alphabetical tie-breaker: 'BETA' < 'DELTA')
  assert.equal(sorted[2].symbol, 'BETA');
  assert.equal(sorted[3].symbol, 'DELTA');
});

test('sortStocksByChangePercent handles non-finite or missing Change % safely', () => {
  const stocks: StockRadarItem[] = [
    createBaseStock({ id: 's1', symbol: 'CLEAN', changePercent: 1.20 }),
    createBaseStock({ id: 's2', symbol: 'NO_REF', changePercent: NaN, hasReferenceData: false }),
    createBaseStock({ id: 's3', symbol: 'NULL_PCT', changePercent: null as unknown as number }),
  ];

  const sorted = sortStocksByChangePercent(stocks, true);
  assert.equal(sorted[0].symbol, 'CLEAN');
  // Non-finite values safely pushed to the end without crashing
  assert.equal(sorted.length, 3);
});

