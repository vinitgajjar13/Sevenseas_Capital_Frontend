/**
 * Sevenseas Capital - Backend API & WebSocket Service
 * Connects Frontend directly to FastAPI + Groww Market Services running on http://localhost:8000
 */

export interface BackendHealthResponse {
  status: string;
  service: string;
}

export interface GrowwAuthStatus {
  authenticated: boolean;
  authenticated_at?: string;
  ucc?: string;
  vendor_user_id?: string;
}

export interface GrowwUserProfile {
  vendor_user_id: string;
  ucc: string;
  nse_enabled: boolean;
  bse_enabled: boolean;
  ddpi_enabled: boolean;
  active_segments: string[];
}

export interface GrowwMargins {
  clear_cash?: number | null;
  net_margin_used?: number | null;
  brokerage_and_charges?: number | null;
  collateral_used?: number | null;
  collateral_available?: number | null;
  equity_margin_details?: Record<string, unknown> | null;
  fno_margin_details?: Record<string, unknown> | null;
  commodity_margin_details?: Record<string, unknown> | null;
}

export interface GrowwHolding {
  isin: string;
  trading_symbol: string;
  quantity: number;
  average_price: number;
  pledge_quantity: number;
  demat_free_quantity: number;
  tradable_exchanges: string[];
}

export interface GrowwQuote {
  trading_symbol: string;
  exchange: string;
  segment: string;
  last_price: number;
  price?: number;
  previousClose?: number;
  day_change?: number;
  day_change_perc?: number;
  marketStatus?: 'OPEN' | 'CLOSED';
  priceType?: 'LIVE' | 'LAST_CLOSE';
  lastUpdated?: string;
  ohlc?: {
    open: number;
    high: number;
    low: number;
    close: number;
  };
  volume?: number;
  week_52_high?: number;
  week_52_low?: number;
}

export interface MarketStatusResponse {
  marketStatus: 'OPEN' | 'CLOSED';
  priceType: 'LIVE' | 'LAST_CLOSE';
  reason: 'REGULAR_TRADING' | 'WEEKEND' | 'TRADING_HOLIDAY' | 'PRE_MARKET' | 'AFTER_HOURS';
  currentTime: string;
  isTradingDay: boolean;
  holidayName?: string | null;
  lastTradingSessionDate: string;
  previousTradingSessionDate: string;
  nextTradingSessionTime?: string | null;
  tradingHours: {
    open: string;
    close: string;
    timezone: string;
    exchange: string;
  };
}

export interface MarketStockPriceItem {
  symbol: string;
  price: number | null;
  previousClose: number | null;
  change: number | null;
  changePercent: number | null;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  volume?: number | null;
  lastUpdated?: string | null;
  marketStatus: 'OPEN' | 'CLOSED';
  priceType: 'LIVE' | 'LAST_CLOSE';
}

export interface MarketPricesResponse {
  marketStatus: 'OPEN' | 'CLOSED';
  priceType: 'LIVE' | 'LAST_CLOSE';
  lastUpdated: string;
  prices: Record<string, MarketStockPriceItem>;
  quotes?: Record<string, MarketStockPriceItem>;
  ltp?: Record<string, number>;
}

export interface BackendStockItem {
  id: number;
  symbol: string;
  name: string;
  sector_id: number;
  exchange: string;
  instrument_token?: number | null;
  groww_exchange_token?: number | null;
  groww_symbol?: string | null;
}

export interface SectorOverviewStock {
  id: number;
  symbol: string;
  name: string;
  groww_symbol?: string;
  groww_exchange_token?: number;
  exchange: string;
  ltp?: number | null;
}

export interface SectorOverviewGroup {
  sector_id: number;
  sector_name: string;
  stock_count: number;
  stocks: SectorOverviewStock[];
}

export interface MarketOverviewStock {
  id: number;
  symbol: string;
  name: string;
  sector_id: number;
  sector: string;
  exchange: string;
  groww_symbol?: string | null;
  groww_exchange_token?: number | null;
  ltp: number | null;
  change: number | null;
  change_percent: number | null;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  previous_close?: number | null;
  volume?: number | null;
  data_source: 'groww' | 'unavailable' | string;
}

export interface MarketOverviewSector {
  sector: string;
  total: number;
  advances: number;
  declines: number;
  unchanged: number;
  average_change_percent: number | null;
}

export interface MarketOverview {
  source: string;
  updated_at: string;
  total_stocks: number;
  advances: number;
  declines: number;
  unchanged: number;
  sectors: MarketOverviewSector[];
  stocks: MarketOverviewStock[];
}

export interface GrowwIndexQuote {
  name: string;
  symbol: string;
  exchange?: string;
  price?: number;
  last_price?: number;
  previousClose?: number;
  change?: number;
  day_change?: number;
  changePercent?: number;
  day_change_perc?: number;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  week52High?: number | null;
  week52Low?: number | null;
  marketStatus?: 'OPEN' | 'CLOSED';
  priceType?: 'LIVE' | 'LAST_CLOSE';
  lastUpdated?: string;
  ohlc?: {
    open?: number | null;
    high?: number | null;
    low?: number | null;
    close?: number | null;
  };
  volume?: number | null;
  data_source?: string;
}

export interface GrowwMarketIndicesResponse {
  source?: string;
  updated_at?: string;
  marketStatus?: 'OPEN' | 'CLOSED';
  priceType?: 'LIVE' | 'LAST_CLOSE';
  lastUpdated?: string;
  indices: Partial<Record<'nifty50' | 'bankNifty' | 'sensex', GrowwIndexQuote>>;
}

export interface HistoricalCandleResponse {
  symbol: string;
  candle_interval: string;
  candles: unknown[];
}

export interface LiveMarketTick {
  instrument_token?: number | string;
  exchange_token?: number | string;
  symbol?: string;
  last_price?: number;
  ltp?: number;
  volume_traded?: number;
  volume?: number;
  day_change?: number;
  day_change_perc?: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  timestamp?: number;
  marketStatus?: 'OPEN' | 'CLOSED';
  priceType?: 'LIVE' | 'LAST_CLOSE';
}

// Keep API credentials on the backend. Configure deployment URLs via Vite env vars.
// Local development defaults to the Vite proxy (/api, /health, /ws).
const isBrowser = typeof window !== 'undefined';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');
const WS_BASE_URL = (() => {
  const configured = (import.meta.env.VITE_WS_BASE_URL || '').trim();
  if (configured) return configured;
  if (!isBrowser) return 'ws://localhost:8000/ws/market';
  const apiOrigin = API_BASE_URL ? new URL(API_BASE_URL, window.location.origin) : window.location;
  const protocol = apiOrigin.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${apiOrigin.host}/ws/market`;
})();

/**
 * 1. Health & Connection Checks
 */
export async function checkBackendHealth(): Promise<BackendHealthResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * 2. Groww Authentication Status
 */
export async function fetchGrowwAuthStatus(): Promise<GrowwAuthStatus | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/groww/auth/status`, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * 3. Groww User Profile
 */
export async function fetchGrowwUserProfile(): Promise<GrowwUserProfile | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/groww/user/profile`, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * 4. Fetch Active Database Stocks
 */
export async function fetchBackendStocks(): Promise<BackendStockItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/stocks`, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

/**
 * 5. Fetch Groww Live LTP for Batch Symbols
 */
export async function fetchGrowwBatchLTP(symbols: string[]): Promise<Record<string, number>> {
  if (symbols.length === 0) return {};
  try {
    // The backend splits large requests into Groww-compliant batches.
    const symList = [...new Set(symbols.map((s) => s.trim()).filter(Boolean))].join(',');
    const res = await fetch(`${API_BASE_URL}/api/v1/groww/market/ltp?symbols=${encodeURIComponent(symList)}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return {};
    const data = await res.json();
    return data.ltp || {};
  } catch {
    return {};
  }
}

/** Authenticate the Groww session using the backend's configured credentials. */
export async function connectGroww(force = false): Promise<{ status?: string; message?: string } | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/groww/auth/connect?force=${force}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Fetch actual Groww prices/OHLC and sector breadth for the backend's active stock universe. */
export async function fetchMarketOverview(limit = 250): Promise<MarketOverview | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/market/overview?limit=${encodeURIComponent(String(limit))}`, {
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Fetch Groww index quotes for the dashboard index cards. */
export async function fetchGrowwMarketIndices(): Promise<GrowwMarketIndicesResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/market/indices`, {
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Fetch market trading hours and calendar status (live vs last close). */
export async function fetchMarketStatus(): Promise<MarketStatusResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/market/status`, {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Fetch batch prices with verified live vs closing price metadata. */
export async function fetchMarketPrices(symbols: string[]): Promise<MarketPricesResponse | null> {
  const unique = [...new Set(symbols.map((s) => s.trim()).filter(Boolean))];
  if (!unique.length) return null;
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/v1/groww/market/prices?symbols=${encodeURIComponent(unique.join(','))}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Fetch OHLC data for a symbol batch. */
export async function fetchGrowwBatchOHLC(symbols: string[]): Promise<Record<string, any>> {
  const unique = [...new Set(symbols.map((s) => s.trim()).filter(Boolean))];
  if (!unique.length) return {};
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/groww/market/ohlc?symbols=${encodeURIComponent(unique.join(','))}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return {};
    const data = await res.json();
    return data.ohlc || {};
  } catch {
    return {};
  }
}

/** Fetch real historical candles and normalize common Groww SDK response shapes. */
export async function fetchGrowwHistoricalCandles(
  symbol: string,
  startTime: string,
  endTime: string,
  candleInterval = '5minute',
): Promise<Array<{ time: number; open: number; high: number; low: number; close: number; volume: number }> | null> {
  try {
    const params = new URLSearchParams({
      start_time: startTime,
      end_time: endTime,
      candle_interval: candleInterval,
      exchange: 'NSE',
      segment: 'CASH',
    });
    const res = await fetch(
      `${API_BASE_URL}/api/v1/groww/market/historical/${encodeURIComponent(symbol)}?${params.toString()}`,
      { signal: AbortSignal.timeout(15000) },
    );
    if (!res.ok) return null;
    const payload: HistoricalCandleResponse = await res.json();
    const rows = payload.candles || [];
    const toEpochSeconds = (value: unknown, index: number): number => {
      if (typeof value === 'number' && Number.isFinite(value)) {
        return Math.floor(value > 1e12 ? value / 1000 : value);
      }
      if (typeof value === 'string') {
        // Groww's candle API may return an ISO-like timestamp without an offset.
        // Treat those as exchange-local IST so charts line up on browsers in any timezone.
        const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value);
        const normalized = hasTimezone ? value : `${value.replace(' ', 'T')}+05:30`;
        const parsed = Date.parse(normalized);
        if (Number.isFinite(parsed)) return Math.floor(parsed / 1000);
      }
      return Math.floor(Date.now() / 1000) - (rows.length - index) * 300;
    };
    return rows.map((raw: any, index) => {
      const row = Array.isArray(raw)
        ? { time: raw[0], open: raw[1], high: raw[2], low: raw[3], close: raw[4], volume: raw[5] }
        : raw || {};
      return {
        time: toEpochSeconds(row.time ?? row.timestamp ?? row.ts ?? row.date, index),
        open: Number(row.open),
        high: Number(row.high),
        low: Number(row.low),
        close: Number(row.close),
        volume: Number(row.volume ?? row.volume_traded ?? 0),
      };
    }).filter((c) => Number.isFinite(c.open) && Number.isFinite(c.high) && Number.isFinite(c.low) && Number.isFinite(c.close))
      .sort((a, b) => a.time - b.time);
  } catch {
    return null;
  }
}

/**
 * 6. Fetch Full Groww Market Quote
 */
export async function fetchGrowwQuote(symbol: string): Promise<GrowwQuote | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/groww/market/quote/${encodeURIComponent(symbol)}`, {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * 7. Fetch Live Sectors Overview from Backend
 */
export async function fetchGrowwSectorsOverview(): Promise<SectorOverviewGroup[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/groww/sectors/overview`, {
      signal: AbortSignal.timeout(7000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.sectors || [];
  } catch {
    return [];
  }
}

/**
 * 8. Fetch Real Groww Portfolio Holdings
 */
export async function fetchGrowwHoldings(): Promise<GrowwHolding[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/groww/portfolio/holdings`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.holdings || [];
  } catch {
    return [];
  }
}

/** Fetch actual Groww margin/funds details from the backend. */
export async function fetchGrowwMargins(): Promise<GrowwMargins | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/groww/user/margins`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * 9. Fetch Real Groww Positions
 */
export async function fetchGrowwPositions(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/groww/portfolio/positions`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.positions || [];
  } catch {
    return [];
  }
}

/**
 * 10. Trigger Backend Groww Market Feed Connect
 */
export async function connectGrowwMarketFeed(): Promise<{ status: string; instrument_count?: number } | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/market/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * 11. Real-time Market WebSocket Client
 */
export class MarketWebSocketClient {
  private ws: WebSocket | null = null;
  private isIntentionalClose = false;
  private reconnectTimer: any = null;
  private listeners: ((tick: LiveMarketTick) => void)[] = [];
  private statusListeners: ((connected: boolean) => void)[] = [];

  constructor(private url: string = WS_BASE_URL) {}

  public connect() {
    this.isIntentionalClose = false;
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.notifyStatus(true);
      };

      this.ws.onmessage = (event) => {
        try {
          const raw = typeof event.data === 'string' ? JSON.parse(event.data) : null;
          if (raw) {
            this.notifyListeners(raw);
          }
        } catch {
          // ignore malformed frame
        }
      };

      this.ws.onclose = () => {
        this.notifyStatus(false);
        if (!this.isIntentionalClose) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = () => {
        this.notifyStatus(false);
        this.ws?.close();
      };
    } catch {
      this.notifyStatus(false);
      this.scheduleReconnect();
    }
  }

  public disconnect() {
    this.isIntentionalClose = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.notifyStatus(false);
  }

  public onTick(listener: (tick: LiveMarketTick) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public onStatusChange(listener: (connected: boolean) => void) {
    this.statusListeners.push(listener);
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(tick: LiveMarketTick) {
    this.listeners.forEach((l) => {
      try {
        l(tick);
      } catch {}
    });
  }

  private notifyStatus(connected: boolean) {
    this.statusListeners.forEach((l) => {
      try {
        l(connected);
      } catch {}
    });
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, 5000);
  }
}
