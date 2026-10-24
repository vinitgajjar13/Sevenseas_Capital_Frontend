/**
 * Sevenseas Capital - Indian Stock Market (NSE / BSE) Trading Hours & Calendar Utility
 *
 * Trading Hours (IST / Asia/Kolkata):
 * - Normal Trading Session: 09:15:00 to 15:30:00 IST (Monday - Friday)
 * - Pre-Market Session: 09:00:00 to 09:15:00 IST
 * - Closed: Weekends (Saturday, Sunday) and official Indian exchange trading holidays.
 */

export interface MarketStatusDetail {
  marketStatus: 'OPEN' | 'CLOSED';
  priceType: 'LIVE' | 'LAST_CLOSE';
  reason: 'REGULAR_TRADING' | 'WEEKEND' | 'TRADING_HOLIDAY' | 'PRE_MARKET' | 'AFTER_HOURS';
  currentTime: string;
  isTradingDay: boolean;
  holidayName?: string;
  lastTradingSessionDate: string; // YYYY-MM-DD
  previousTradingSessionDate: string; // YYYY-MM-DD
  nextTradingSessionTime?: string;
  formattedLastCloseLabel: string;
}

// Official NSE & BSE Trading Holidays (2024 - 2027)
export const INDIAN_MARKET_HOLIDAYS: Record<string, string> = {
  // 2024
  '2024-01-22': 'Special Ram Mandir Holiday',
  '2024-01-26': 'Republic Day',
  '2024-03-08': 'Mahashivratri',
  '2024-03-25': 'Holi',
  '2024-03-29': 'Good Friday',
  '2024-04-11': 'Id-Ul-Fitr',
  '2024-04-17': 'Ram Navami',
  '2024-05-01': 'Maharashtra Day',
  '2024-05-20': 'General Parliamentary Election',
  '2024-06-17': 'Bakri Id',
  '2024-07-17': 'Muharram',
  '2024-08-15': 'Independence Day',
  '2024-10-02': 'Mahatma Gandhi Jayanti',
  '2024-11-01': 'Diwali Laxmi Pujan',
  '2024-11-15': 'Gurunanak Jayanti',
  '2024-11-20': 'Maharashtra Assembly Election',
  '2024-12-25': 'Christmas',
  // 2025
  '2025-01-26': 'Republic Day',
  '2025-02-26': 'Mahashivratri',
  '2025-03-14': 'Holi',
  '2025-03-31': 'Id-Ul-Fitr',
  '2025-04-10': 'Mahavir Jayanti',
  '2025-04-14': 'Dr. Ambedkar Jayanti',
  '2025-04-18': 'Good Friday',
  '2025-05-01': 'Maharashtra Day',
  '2025-06-07': 'Bakri Id',
  '2025-08-15': 'Independence Day',
  '2025-08-27': 'Ganesh Chaturthi',
  '2025-10-02': 'Mahatma Gandhi Jayanti',
  '2025-10-21': 'Dussehra',
  '2025-10-22': 'Diwali Balipratipada',
  '2025-11-05': 'Gurunanak Jayanti',
  '2025-12-25': 'Christmas',
  // 2026
  '2026-01-26': 'Republic Day',
  '2026-03-03': 'Holi',
  '2026-03-20': 'Id-Ul-Fitr',
  '2026-04-03': 'Good Friday',
  '2026-04-14': 'Dr. Ambedkar Jayanti',
  '2026-05-01': 'Maharashtra Day',
  '2026-05-27': 'Bakri Id',
  '2026-06-26': 'Muharram',
  '2026-08-15': 'Independence Day',
  '2026-10-02': 'Mahatma Gandhi Jayanti',
  '2026-10-20': 'Dussehra',
  '2026-11-08': 'Diwali Laxmi Pujan',
  '2026-11-10': 'Diwali Balipratipada',
  '2026-11-24': 'Gurunanak Jayanti',
  '2026-12-25': 'Christmas',
  // 2027
  '2027-01-26': 'Republic Day',
  '2027-03-10': 'Id-Ul-Fitr',
  '2027-03-22': 'Holi',
  '2027-03-26': 'Good Friday',
  '2027-04-14': 'Dr. Ambedkar Jayanti',
  '2027-05-01': 'Maharashtra Day',
  '2027-08-15': 'Independence Day',
  '2027-10-02': 'Mahatma Gandhi Jayanti',
  '2027-10-11': 'Dussehra',
  '2027-10-29': 'Diwali Laxmi Pujan',
  '2027-11-14': 'Gurunanak Jayanti',
  '2027-12-25': 'Christmas',
};

/**
 * Convert any Date to components in Asia/Kolkata timezone
 */
export function getISTDateParts(date: Date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    weekday: 'short',
  });

  const parts = formatter.formatToParts(date);
  const partMap: Record<string, string> = {};
  parts.forEach((p) => {
    partMap[p.type] = p.value;
  });

  const year = parseInt(partMap.year, 10);
  const month = parseInt(partMap.month, 10);
  const day = parseInt(partMap.day, 10);
  const hour = parseInt(partMap.hour, 10);
  const minute = parseInt(partMap.minute, 10);
  const second = parseInt(partMap.second, 10);
  const weekday = partMap.weekday; // 'Mon', 'Tue', etc.

  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const totalMinutes = hour * 60 + minute;

  return { year, month, day, hour, minute, second, weekday, dateStr, totalMinutes };
}

/**
 * Check if a date string (YYYY-MM-DD) is a weekend
 */
export function isWeekend(year: number, month: number, day: number): boolean {
  const d = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = d.getUTCDay(); // 0 is Sun, 6 is Sat
  return dayOfWeek === 0 || dayOfWeek === 6;
}

/**
 * Check if a date string is an Indian market holiday
 */
export function isHoliday(dateStr: string): boolean {
  return Boolean(INDIAN_MARKET_HOLIDAYS[dateStr]);
}

/**
 * Check if a date is an active Indian stock exchange trading day
 */
export function isTradingDay(year: number, month: number, day: number, dateStr: string): boolean {
  if (isWeekend(year, month, day)) return false;
  if (isHoliday(dateStr)) return false;
  return true;
}

/**
 * Step backwards day-by-day to find the strictly previous trading day
 */
export function getPreviousTradingDate(currentDateStr: string): string {
  const [y, m, d] = currentDateStr.split('-').map(Number);
  const cur = new Date(Date.UTC(y, m - 1, d));

  while (true) {
    cur.setUTCDate(cur.getUTCDate() - 1);
    const yr = cur.getUTCFullYear();
    const mo = cur.getUTCMonth() + 1;
    const dy = cur.getUTCDate();
    const ds = `${yr}-${String(mo).padStart(2, '0')}-${String(dy).padStart(2, '0')}`;
    if (isTradingDay(yr, mo, dy, ds)) {
      return ds;
    }
  }
}

/**
 * Format a YYYY-MM-DD date into human readable Indian trading date (e.g. "23 Oct 2026")
 */
export function formatTradingSessionDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(dt);
  } catch {
    return dateStr;
  }
}

/**
 * Compute the complete market status using the Indian exchange trading calendar
 */
export function getIndianMarketStatus(now: Date = new Date()): MarketStatusDetail {
  const ist = getISTDateParts(now);
  const { year, month, day, dateStr, totalMinutes } = ist;

  const openMinutes = 9 * 60 + 15; // 09:15 AM
  const closeMinutes = 15 * 60 + 30; // 03:30 PM

  const isWknd = isWeekend(year, month, day);
  const holidayName = INDIAN_MARKET_HOLIDAYS[dateStr];
  const isTrdDay = isTradingDay(year, month, day, dateStr);

  let status: 'OPEN' | 'CLOSED';
  let reason: 'REGULAR_TRADING' | 'WEEKEND' | 'TRADING_HOLIDAY' | 'PRE_MARKET' | 'AFTER_HOURS';
  let priceType: 'LIVE' | 'LAST_CLOSE';

  if (isWknd) {
    status = 'CLOSED';
    reason = 'WEEKEND';
    priceType = 'LAST_CLOSE';
  } else if (holidayName) {
    status = 'CLOSED';
    reason = 'TRADING_HOLIDAY';
    priceType = 'LAST_CLOSE';
  } else if (totalMinutes < openMinutes) {
    status = 'CLOSED';
    reason = 'PRE_MARKET';
    priceType = 'LAST_CLOSE';
  } else if (totalMinutes >= closeMinutes) {
    status = 'CLOSED';
    reason = 'AFTER_HOURS';
    priceType = 'LAST_CLOSE';
  } else {
    status = 'OPEN';
    reason = 'REGULAR_TRADING';
    priceType = 'LIVE';
  }

  // Determine latest completed trading session date
  let lastTradingSessionDate: string;
  if (isTrdDay && totalMinutes >= closeMinutes) {
    lastTradingSessionDate = dateStr;
  } else {
    lastTradingSessionDate = getPreviousTradingDate(dateStr);
  }

  const previousTradingSessionDate = getPreviousTradingDate(lastTradingSessionDate);
  const formattedDate = formatTradingSessionDate(lastTradingSessionDate);
  const formattedLastCloseLabel = `Last Close (${formattedDate})`;

  return {
    marketStatus: status,
    priceType,
    reason,
    currentTime: now.toISOString(),
    isTradingDay: isTrdDay,
    holidayName,
    lastTradingSessionDate,
    previousTradingSessionDate,
    formattedLastCloseLabel,
  };
}
