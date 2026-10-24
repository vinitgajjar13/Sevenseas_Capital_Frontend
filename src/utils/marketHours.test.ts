import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getIndianMarketStatus,
  isTradingDay,
  isWeekend,
  isHoliday,
  getPreviousTradingDate,
  formatTradingSessionDate,
  INDIAN_MARKET_HOLIDAYS,
} from './marketHours';

test('isWeekend properly identifies Saturdays and Sundays in UTC', () => {
  // 2026-10-24 is Saturday, 2026-10-25 is Sunday, 2026-10-23 is Friday
  assert.equal(isWeekend(2026, 10, 24), true, 'Saturday must be weekend');
  assert.equal(isWeekend(2026, 10, 25), true, 'Sunday must be weekend');
  assert.equal(isWeekend(2026, 10, 23), false, 'Friday must not be weekend');
  assert.equal(isWeekend(2026, 10, 26), false, 'Monday must not be weekend');
});

test('isHoliday correctly flags official NSE/BSE holidays', () => {
  assert.equal(isHoliday('2026-10-02'), true, 'Gandhi Jayanti 2026 must be holiday');
  assert.equal(isHoliday('2026-01-26'), true, 'Republic Day 2026 must be holiday');
  assert.equal(isHoliday('2026-10-23'), false, 'Normal Friday is not holiday');
  assert.equal(INDIAN_MARKET_HOLIDAYS['2026-10-02'], 'Mahatma Gandhi Jayanti');
});

test('isTradingDay correctly combines weekend and holiday checks', () => {
  assert.equal(isTradingDay(2026, 10, 23, '2026-10-23'), true, 'Friday trading day');
  assert.equal(isTradingDay(2026, 10, 24, '2026-10-24'), false, 'Saturday closed');
  assert.equal(isTradingDay(2026, 10, 25, '2026-10-25'), false, 'Sunday closed');
  assert.equal(isTradingDay(2026, 10, 2, '2026-10-02'), false, 'Holiday closed');
});

test('getPreviousTradingDate rolls back past weekends and holidays', () => {
  // Saturday 2026-10-24 rolls back to Friday 2026-10-23
  assert.equal(getPreviousTradingDate('2026-10-24'), '2026-10-23');
  // Sunday 2026-10-25 rolls back to Friday 2026-10-23
  assert.equal(getPreviousTradingDate('2026-10-25'), '2026-10-23');
  // Monday 2026-10-26 rolls back to Friday 2026-10-23
  assert.equal(getPreviousTradingDate('2026-10-26'), '2026-10-23');
  // Friday 2026-10-02 (Gandhi Jayanti) rolls back to Thursday 2026-10-01
  assert.equal(getPreviousTradingDate('2026-10-02'), '2026-10-01');
  // Saturday 2026-10-03 (following Gandhi Jayanti) rolls back to Thursday 2026-10-01
  assert.equal(getPreviousTradingDate('2026-10-03'), '2026-10-01');
});

test('formatTradingSessionDate returns clean readable format', () => {
  const formatted = formatTradingSessionDate('2026-10-23');
  assert.match(formatted, /23/);
  assert.match(formatted, /Oct/i);
  assert.match(formatted, /2026/);
});

test('getIndianMarketStatus: regular trading hours (market open)', () => {
  // Wednesday 2026-10-21 11:30:00 IST = 06:00:00 UTC
  const testDate = new Date('2026-10-21T06:00:00Z');
  const status = getIndianMarketStatus(testDate);

  assert.equal(status.marketStatus, 'OPEN');
  assert.equal(status.priceType, 'LIVE');
  assert.equal(status.reason, 'REGULAR_TRADING');
  assert.equal(status.isTradingDay, true);
});

test('getIndianMarketStatus: pre-market hours (market closed)', () => {
  // Wednesday 2026-10-21 08:30:00 IST = 03:00:00 UTC
  const testDate = new Date('2026-10-21T03:00:00Z');
  const status = getIndianMarketStatus(testDate);

  assert.equal(status.marketStatus, 'CLOSED');
  assert.equal(status.priceType, 'LAST_CLOSE');
  assert.equal(status.reason, 'PRE_MARKET');
  // Previous trading session before Wednesday was Tuesday 2026-10-20 (or earlier if Dussehra)
  assert.ok(status.lastTradingSessionDate.length > 0);
});

test('getIndianMarketStatus: after-hours (market closed)', () => {
  // Wednesday 2026-10-21 17:00:00 IST = 11:30:00 UTC
  const testDate = new Date('2026-10-21T11:30:00Z');
  const status = getIndianMarketStatus(testDate);

  assert.equal(status.marketStatus, 'CLOSED');
  assert.equal(status.priceType, 'LAST_CLOSE');
  assert.equal(status.reason, 'AFTER_HOURS');
  // For completed trading day after 15:30 IST, latest completed session is today
  assert.equal(status.lastTradingSessionDate, '2026-10-21');
});

test('getIndianMarketStatus: weekend (Saturday closed, rolls back to Friday)', () => {
  // Saturday 2026-10-24 14:00:00 IST = 08:30:00 UTC
  const testDate = new Date('2026-10-24T08:30:00Z');
  const status = getIndianMarketStatus(testDate);

  assert.equal(status.marketStatus, 'CLOSED');
  assert.equal(status.priceType, 'LAST_CLOSE');
  assert.equal(status.reason, 'WEEKEND');
  assert.equal(status.isTradingDay, false);
  assert.equal(status.lastTradingSessionDate, '2026-10-23');
  assert.equal(status.previousTradingSessionDate, '2026-10-22');
});

test('getIndianMarketStatus: trading holiday (Gandhi Jayanti Friday)', () => {
  // Friday 2026-10-02 11:00:00 IST = 05:30:00 UTC
  const testDate = new Date('2026-10-02T05:30:00Z');
  const status = getIndianMarketStatus(testDate);

  assert.equal(status.marketStatus, 'CLOSED');
  assert.equal(status.priceType, 'LAST_CLOSE');
  assert.equal(status.reason, 'TRADING_HOLIDAY');
  assert.equal(status.holidayName, 'Mahatma Gandhi Jayanti');
  // Rolls back past the holiday Friday to Thursday
  assert.equal(status.lastTradingSessionDate, '2026-10-01');
});
