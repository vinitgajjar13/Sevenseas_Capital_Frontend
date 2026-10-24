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
  day_change?: number;
  day_change_perc?: number;
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
}

// Configurable API Base URL (defaults to proxy or localhost:8000)
const isBrowser = typeof window !== 'undefined';
const wsProto = isBrowser && window.location.protocol === 'https:' ? 'wss:' : 'ws:';

const API_BASE_URL = isBrowser && window.location.port === '3000'
  ? '' // uses Vite proxy for seamless CORS & local development
  : 'http://localhost:8000';

const WS_BASE_URL = isBrowser && window.location.port === '3000'
  ? `${wsProto}//${window.location.host}/ws/market`
  : `${wsProto}//localhost:8000/ws/market`;

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
    const symList = symbols.slice(0, 50).join(',');
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
