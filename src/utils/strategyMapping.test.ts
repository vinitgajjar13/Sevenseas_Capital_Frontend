import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getStockClassification, assignDynamicRanks } from './stockRanking';
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
