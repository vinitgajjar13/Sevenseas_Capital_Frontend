import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  INITIAL_BREADTH,
  INITIAL_STOCKS_RADAR,
  INITIAL_ACTIVE_SIGNALS,
  INITIAL_POSITIONS,
  INITIAL_TRADE_HISTORY,
  formatINR,
} from './data/mockData';
import { MOCK_MARKET_INDEXES } from './data/mock/indexes';
import { MOCK_STOCK_UNIVERSE } from './data/mock/stocks';
import {
  NavTab,
  TimePeriod,
  StockRadarItem,
  ActiveSignal,
  PositionItem,
  TradeHistoryItem,
  PriceAlert,
  WatchlistStockItem,
} from './types';
import { getInitialWatchlist, MasterStockEntry } from './data/mock/watchlistData';
import { getStockClassification } from './utils/stockRanking';
import {
  Sidebar,
  Header,
  Disclaimer,
  LoginModal,
  UserProfile,
  DashboardView,
  SectorRadarView,
  StockRadarTable,
  StockDetailView,
  ActiveSignals,
  PositionsTable,
  SectorWatchlistView,
  PaperTradingView,
  SettingsView,
} from './components';
import { BellRing } from 'lucide-react';
import {
  checkBackendHealth,
  connectGroww,
  fetchMarketOverview,
  fetchGrowwMarketIndices,
  fetchGrowwAuthStatus,
  fetchGrowwUserProfile,
  fetchGrowwHoldings,
  fetchGrowwMargins,
  fetchGrowwBatchLTP,
  fetchGrowwQuote,
  connectGrowwMarketFeed,
  fetchBackendStocks,
  MarketWebSocketClient,
  GrowwAuthStatus,
  GrowwUserProfile,
  GrowwHolding,
  GrowwMargins,
  LiveMarketTick,
  MarketOverview,
  GrowwMarketIndicesResponse,
} from './services/backendApi';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [previousTab, setPreviousTab] = useState<NavTab>('dashboard');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('1D');
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);

  // Theme State (Light / Dark)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('sevenseas_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sevenseas_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {}
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('quantradar_user');
      return saved ? JSON.parse(saved) : {
        email: 'lead.trader@sevenseascapital.in',
        name: 'Senior Trader',
        provider: 'demo',
        role: 'Pro Trader (13y Exp)',
      };
    } catch {
      return null;
    }
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Sector Drilldown State
  const [selectedSectorName, setSelectedSectorName] = useState<string | null>(null);

  // Stock Detail View State
  const [activeStockDetail, setActiveStockDetail] = useState<StockRadarItem | null>(null);

  // State collections
  const [indices, setIndices] = useState(MOCK_MARKET_INDEXES);
  const [breadth, setBreadth] = useState(INITIAL_BREADTH);
  const [stocksRadar, setStocksRadar] = useState<StockRadarItem[]>(() =>
    INITIAL_STOCKS_RADAR.map((stk) => ({
      ...stk,
      marketClassification: getStockClassification(stk),
    }))
  );
  const [signals, setSignals] = useState<ActiveSignal[]>(INITIAL_ACTIVE_SIGNALS);
  const [positions, setPositions] = useState<PositionItem[]>(INITIAL_POSITIONS);
  const [tradeHistory, setTradeHistory] = useState<TradeHistoryItem[]>(INITIAL_TRADE_HISTORY);
  const [virtualBalance, setVirtualBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('quantradar_virtual_balance');
      return saved ? Number(saved) : 1000000;
    } catch {
      return 1000000;
    }
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Watchlist State & Persistence (automatically categorized sector-wise)
  const [watchlistStocks, setWatchlistStocks] = useState<WatchlistStockItem[]>(() => {
    try {
      const saved = localStorage.getItem('sevenseas_watchlist_stocks');
      return saved ? JSON.parse(saved) : getInitialWatchlist();
    } catch {
      return getInitialWatchlist();
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sevenseas_watchlist_stocks', JSON.stringify(watchlistStocks));
    } catch {}
  }, [watchlistStocks]);

  // Positions / Watchlist & Trades Sub-tab State ('watchlist' | 'positions' | 'signals')
  const [activePositionsSubTab, setActivePositionsSubTab] = useState<'watchlist' | 'positions' | 'signals'>('watchlist');

  // Backend Integration State (FastAPI + Groww Market Service)
  const [backendConnected, setBackendConnected] = useState<boolean>(false);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [growwAuth, setGrowwAuth] = useState<GrowwAuthStatus | null>(null);
  const [growwProfile, setGrowwProfile] = useState<GrowwUserProfile | null>(null);
  const [growwHoldings, setGrowwHoldings] = useState<GrowwHolding[]>([]);
  const [growwMargins, setGrowwMargins] = useState<GrowwMargins | null>(null);
  const [growwHoldingLtps, setGrowwHoldingLtps] = useState<Record<string, number>>({});
  const [marketOverview, setMarketOverview] = useState<MarketOverview | null>(null);
  const [connectPending, setConnectPending] = useState<boolean>(false);
  const wsClientRef = useRef<MarketWebSocketClient | null>(null);
  const tokenToSymbolMapRef = useRef<Map<number | string, string>>(new Map());
  const previousCloseRef = useRef<Map<string, number>>(new Map());

  // Price Alerts State & Persistence
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>(() => {
    try {
      const saved = localStorage.getItem('quantradar_price_alerts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const priceAlertsRef = useRef<PriceAlert[]>(priceAlerts);
  useEffect(() => {
    priceAlertsRef.current = priceAlerts;
    try {
      localStorage.setItem('quantradar_price_alerts', JSON.stringify(priceAlerts));
    } catch {}
  }, [priceAlerts]);

  // Apply only market facts supplied by Groww. Strategy scores/signals remain separate
  // and must not be presented as broker-provided data.
  const applyLiveOverview = useCallback((overview: MarketOverview | null) => {
    if (!overview) return;
    setMarketOverview(overview);
    setBreadth({
      advances: overview.advances,
      declines: overview.declines,
      unchanged: overview.unchanged,
      total: overview.advances + overview.declines + overview.unchanged,
    });

    const liveBySymbol = new Map(
      overview.stocks.map((item) => [item.symbol.toUpperCase(), item])
    );
    previousCloseRef.current = new Map(
      overview.stocks
        .filter((item) => item.previous_close != null && Number.isFinite(item.previous_close))
        .map((item) => [item.symbol.toUpperCase(), Number(item.previous_close)])
    );
    setStocksRadar((previous) => previous.map((stock) => {
      const item = liveBySymbol.get(stock.symbol.toUpperCase());
      if (!item || item.ltp == null) return stock;
      const base = item.previous_close ?? item.open ?? stock.open915;
      const change = item.change ?? (item.ltp - base);
      const changePercent = item.change_percent ?? (base ? (change / base) * 100 : stock.changePercent);
      return {
        ...stock,
        ltp: item.ltp,
        change,
        changePercent,
        open915: item.open ?? stock.open915,
        high: item.high ?? stock.high,
        low: item.low ?? stock.low,
        dayHigh: item.high ?? stock.dayHigh,
        dayLow: item.low ?? stock.dayLow,
        volume: item.volume ?? stock.volume,
      };
    }));

    setWatchlistStocks((previous) => previous.map((watch) => {
      const item = liveBySymbol.get(watch.symbol.toUpperCase());
      if (!item || item.ltp == null) return watch;
      const base = item.previous_close ?? item.open ?? watch.open915 ?? item.ltp;
      const change = item.change ?? item.ltp - base;
      return {
        ...watch,
        ltp: item.ltp,
        change,
        changePercent: item.change_percent ?? (base ? (change / base) * 100 : watch.changePercent),
        open915: item.open ?? watch.open915,
        high: item.high ?? watch.high,
        low: item.low ?? watch.low,
        volume: item.volume ?? watch.volume,
        sparkline: [...(watch.sparkline || []).slice(-5), item.ltp],
      };
    }));
  }, []);

  const applyLiveIndices = useCallback((response: GrowwMarketIndicesResponse | null) => {
    if (!response) return;
    setIndices((previous) => {
      const next = { ...previous };
      (['nifty50', 'bankNifty', 'sensex'] as const).forEach((key) => {
        const quote = response.indices[key];
        if (!quote || !Number.isFinite(quote.last_price)) return;
        const oldIndex = next[key];
        const ohlc = quote.ohlc || {};
        next[key] = {
          ...oldIndex,
          value: quote.last_price,
          change: quote.day_change ?? oldIndex.change,
          changePercent: quote.day_change_perc ?? oldIndex.changePercent,
          open: ohlc.open ?? oldIndex.open,
          high: ohlc.high ?? oldIndex.high,
          low: ohlc.low ?? oldIndex.low,
          prevClose: ohlc.close ?? oldIndex.prevClose,
        };
      });
      return next;
    });
  }, []);

  // Initial Backend Connection & Real-Time WebSocket Handshake
  useEffect(() => {
    let isMounted = true;

    const initializeBackend = async () => {
      try {
        const health = await checkBackendHealth();
        if (!isMounted) return;

        if (health && health.status === 'ok') {
          setBackendConnected(true);

          // Populate token to symbol mapping
          const backendStocks = await fetchBackendStocks();
          if (isMounted && backendStocks.length > 0) {
            const tokenMap = new Map<number | string, string>();
            backendStocks.forEach((stk) => {
              if (stk.instrument_token) tokenMap.set(stk.instrument_token, stk.symbol);
              if (stk.groww_exchange_token) tokenMap.set(stk.groww_exchange_token, stk.symbol);
            });
            tokenToSymbolMapRef.current = tokenMap;
          }

          // Check Groww Auth Status
          const auth = await fetchGrowwAuthStatus();
          if (isMounted) setGrowwAuth(auth);
          if (isMounted && auth?.authenticated) {

            // Fetch User Profile
            const profile = await fetchGrowwUserProfile();
            if (isMounted && profile) {
              setGrowwProfile(profile);
              setCurrentUser((prev) => {
                if (!prev || prev.provider === 'demo') {
                  return {
                    email: `groww.${profile.ucc}@sevenseascapital.in`,
                    name: `Groww User (${profile.ucc})`,
                    provider: 'groww',
                    role: 'Active Broker Account',
                  };
                }
                return prev;
              });
            }

            // Fetch actual holdings and account funds through the existing backend APIs.
            const [holdings, margins] = await Promise.all([
              fetchGrowwHoldings(),
              fetchGrowwMargins(),
            ]);
            if (isMounted) {
              setGrowwHoldings(holdings);
              setGrowwMargins(margins);
            }
            if (holdings.length > 0) {
              const holdingSymbols = holdings.map((h) => h.trading_symbol);
              const holdingLtps = await fetchGrowwBatchLTP(holdingSymbols);
              if (isMounted) setGrowwHoldingLtps(holdingLtps);
              if (isMounted && Object.keys(holdingLtps).length > 0) {
                setStocksRadar((prev) =>
                  prev.map((s) => {
                    const key = `NSE_${s.symbol}`;
                    if (holdingLtps[key]) {
                      const newLtp = holdingLtps[key];
                      const newChange = +(newLtp - s.open915).toFixed(2);
                      const newChangePct = +((newChange / s.open915) * 100).toFixed(2);
                      return {
                        ...s,
                        ltp: newLtp,
                        change: newChange,
                        changePercent: newChangePct,
                      };
                    }
                    return s;
                  })
                );
              }
            }

            // Load real quotes/OHLC after a restart when Groww is already authenticated.
            const [overview, liveIndices] = await Promise.all([
              fetchMarketOverview(),
              fetchGrowwMarketIndices(),
            ]);
            if (isMounted) {
              applyLiveOverview(overview);
              applyLiveIndices(liveIndices);
              if (overview || liveIndices) setIsSimulating(false);
            }

            // Trigger backend feed connection.
            connectGrowwMarketFeed().catch(() => {});
          }

          // Initialize WebSocket
          const ws = new MarketWebSocketClient();
          wsClientRef.current = ws;

          ws.onStatusChange((connected) => {
            if (isMounted) setWsConnected(connected);
          });

          ws.onTick((tick: LiveMarketTick) => {
            if (!isMounted) return;

            let symbol = tick.symbol;
            if (!symbol && tick.instrument_token !== undefined) {
              symbol = tokenToSymbolMapRef.current.get(tick.instrument_token);
            }
            if (!symbol && tick.exchange_token !== undefined) {
              symbol = tokenToSymbolMapRef.current.get(tick.exchange_token);
            }

            const tickPrice = tick.ltp ?? tick.last_price;
            if (!tickPrice) return;

            if (symbol) {
              const symbolKey = symbol.toUpperCase();
              setStocksRadar((prev) =>
                prev.map((stk) => {
                  if (stk.symbol.toUpperCase() !== symbolKey) return stk;
                  const base = previousCloseRef.current.get(symbolKey) ?? stk.open915;
                  const dayChange = tick.day_change ?? +(tickPrice - base).toFixed(2);
                  const dayChangePct = tick.day_change_perc ?? (base ? +((dayChange / base) * 100).toFixed(2) : stk.changePercent);
                  return {
                    ...stk,
                    ltp: tickPrice,
                    change: dayChange,
                    changePercent: dayChangePct,
                    volume: tick.volume_traded ?? tick.volume ?? stk.volume,
                  };
                })
              );
              setActiveStockDetail((prev) => {
                if (!prev || prev.symbol.toUpperCase() !== symbolKey) return prev;
                const base = previousCloseRef.current.get(symbolKey) ?? prev.open915;
                const dayChange = tick.day_change ?? +(tickPrice - base).toFixed(2);
                const dayChangePct = tick.day_change_perc ?? (base ? +((dayChange / base) * 100).toFixed(2) : prev.changePercent);
                return {
                  ...prev,
                  ltp: tickPrice,
                  change: dayChange,
                  changePercent: dayChangePct,
                  volume: tick.volume_traded ?? tick.volume ?? prev.volume,
                };
              });
              setMarketOverview((previous) => {
                if (!previous) return previous;
                const stocks = previous.stocks.map((row) => {
                  if (row.symbol.toUpperCase() !== symbolKey) return row;
                  const base = row.previous_close ?? previousCloseRef.current.get(symbolKey) ?? row.open ?? tickPrice;
                  const dayChange = tick.day_change ?? +(tickPrice - base).toFixed(2);
                  return {
                    ...row,
                    ltp: tickPrice,
                    change: dayChange,
                    change_percent: tick.day_change_perc ?? (base ? +((dayChange / base) * 100).toFixed(2) : row.change_percent),
                    open: tick.open ?? row.open,
                    high: tick.high ?? row.high,
                    low: tick.low ?? row.low,
                    volume: tick.volume_traded ?? tick.volume ?? row.volume,
                    data_source: 'groww',
                  };
                });
                const known = stocks.filter((row) => row.ltp != null && row.change_percent != null);
                const advances = known.filter((row) => (row.change_percent ?? 0) > 0).length;
                const declines = known.filter((row) => (row.change_percent ?? 0) < 0).length;
                const unchanged = known.filter((row) => row.change_percent === 0).length;
                const sectors = previous.sectors.map((sector) => {
                  const members = stocks.filter((row) => row.sector === sector.sector);
                  const evaluated = members.filter((row) => row.ltp != null && row.change_percent != null);
                  const positives = evaluated.filter((row) => (row.change_percent ?? 0) > 0).length;
                  const negatives = evaluated.filter((row) => (row.change_percent ?? 0) < 0).length;
                  return {
                    ...sector,
                    total: members.length,
                    advances: positives,
                    declines: negatives,
                    unchanged: evaluated.length - positives - negatives,
                    average_change_percent: evaluated.length
                      ? evaluated.reduce((sum, row) => sum + (row.change_percent ?? 0), 0) / evaluated.length
                      : null,
                  };
                });
                setBreadth({ advances, declines, unchanged, total: known.length });
                return {
                  ...previous,
                  updated_at: new Date().toISOString(),
                  stocks,
                  sectors,
                  advances,
                  declines,
                  unchanged,
                };
              });
              setWatchlistStocks((prev) => prev.map((stock) => {
                if (stock.symbol.toUpperCase() !== symbolKey) return stock;
                const base = previousCloseRef.current.get(symbolKey) ?? stock.open915 ?? tickPrice;
                const dayChange = tick.day_change ?? +(tickPrice - base).toFixed(2);
                return {
                  ...stock,
                  ltp: tickPrice,
                  change: dayChange,
                  changePercent: tick.day_change_perc ?? (base ? +((dayChange / base) * 100).toFixed(2) : stock.changePercent),
                  volume: tick.volume_traded ?? tick.volume ?? stock.volume,
                  sparkline: [...(stock.sparkline || []).slice(-5), tickPrice],
                };
              }));
            }
          });

          ws.connect();
        } else {
          setBackendConnected(false);
        }
      } catch {
        if (isMounted) setBackendConnected(false);
      }
    };

    initializeBackend();

    return () => {
      isMounted = false;
      wsClientRef.current?.disconnect();
    };
  }, [applyLiveOverview, applyLiveIndices]);

  // Audio tone notification helper for triggered price alert
  const playAlertChime = useCallback(() => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch {
      // Audio playback fails gracefully if unpermitted by browser policy
    }
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

  // Calculate live unrealized P&L
  const totalUnrealizedPnl = positions.reduce((acc, pos) => acc + pos.pnl, 0);

  const handleSetAlert = useCallback(
    (newAlert: PriceAlert) => {
      setPriceAlerts((prev) => [newAlert, ...prev.filter((a) => a.id !== newAlert.id)]);
      showToast(
        `🔔 Alert created: ${newAlert.symbol} at ${formatINR(newAlert.targetPrice)} (${
          newAlert.direction === 'ABOVE' ? 'Crossing Above' : 'Dropping Below'
        })`
      );
    },
    [showToast]
  );

  const handleRemoveAlert = useCallback(
    (alertId: string) => {
      setPriceAlerts((prev) => prev.filter((a) => a.id !== alertId));
      showToast('Price alert removed');
    },
    [showToast]
  );

  const handleResetPaperAccount = useCallback(() => {
    setVirtualBalance(1000000);
    try {
      localStorage.setItem('quantradar_virtual_balance', '1000000');
    } catch {}
    setPositions([]);
    setTradeHistory([]);
    showToast('Simulation paper trading balance reset to ₹10,00,000 baseline');
  }, [showToast]);

  // Handler to manually simulate a market state transition for live testing/demonstration
  const handleSimulateStateTransition = useCallback(() => {
    setStocksRadar((prevStocks) => {
      // Find a stock that can transition: e.g. DLF (Bearish to Bullish) or HDFCBANK (Neutral to Bullish)
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-IN', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      // Look for a Bearish or Neutral stock to upgrade to Bullish, or vice versa
      const targetIdx = prevStocks.findIndex(
        (s) => (s.marketClassification || getStockClassification(s)) !== 'BULLISH'
      );

      if (targetIdx !== -1) {
        const target = prevStocks[targetIdx];
        const prevCls = target.marketClassification || getStockClassification(target);
        const newLtp = +(target.open915 * 1.026).toFixed(2);
        const newChange = +(newLtp - target.open915).toFixed(2);
        const newChangePct = +((newChange / target.open915) * 100).toFixed(2);

        const updated: StockRadarItem = {
          ...target,
          ltp: newLtp,
          change: newChange,
          changePercent: newChangePct,
          status: 'BULL',
          action: 'BUY CALL (CE)',
          score: Math.max(88, target.score + 25),
          marketClassification: 'BULLISH',
          previousClassification: prevCls,
          lastStateChange: {
            from: prevCls,
            to: 'BULLISH',
            timestamp: timeStr,
          },
        };

        const next = [...prevStocks];
        next[targetIdx] = updated;

        if (activeStockDetail && activeStockDetail.id === updated.id) {
          setActiveStockDetail(updated);
        }

        showToast(`⚡ Live Re-Rank: ${target.symbol} transitioned from ${prevCls} to BULLISH (+${newChangePct}%)`);
        return next;
      } else {
        // Switch the first stock from Bullish to Bearish
        const target = prevStocks[0];
        const prevCls = target.marketClassification || 'BULLISH';
        const newLtp = +(target.open915 * 0.982).toFixed(2);
        const newChange = +(newLtp - target.open915).toFixed(2);
        const newChangePct = +((newChange / target.open915) * 100).toFixed(2);

        const updated: StockRadarItem = {
          ...target,
          ltp: newLtp,
          change: newChange,
          changePercent: newChangePct,
          status: 'BEAR',
          action: 'BUY PUT (PE)',
          score: Math.min(35, target.score - 40),
          marketClassification: 'BEARISH',
          previousClassification: prevCls,
          lastStateChange: {
            from: prevCls,
            to: 'BEARISH',
            timestamp: timeStr,
          },
        };

        const next = [...prevStocks];
        next[0] = updated;

        if (activeStockDetail && activeStockDetail.id === updated.id) {
          setActiveStockDetail(updated);
        }

        showToast(`⚡ Live Re-Rank: ${target.symbol} transitioned from ${prevCls} to BEARISH (${newChangePct}%)`);
        return next;
      }
    });
  }, [activeStockDetail, showToast]);

  // Synchronize ref to activeStockDetail so the interval timer does not reset on selection
  const activeStockDetailRef = useRef<StockRadarItem | null>(activeStockDetail);
  useEffect(() => {
    activeStockDetailRef.current = activeStockDetail;
  }, [activeStockDetail]);

  // Tick simulation effect for realistic market heartbeat
  useEffect(() => {
    // Never mutate quotes with synthetic ticks while real Groww data is active.
    if (!isSimulating || (backendConnected && growwAuth?.authenticated)) return;

    const interval = setInterval(() => {
      // 1. Slightly fluctuate indices
      setIndices((prev) => {
        const deltaNifty = (Math.random() - 0.48) * 1.8;
        const deltaBank = (Math.random() - 0.48) * 3.5;
        const deltaSensex = (Math.random() - 0.48) * 4.2;
        const newNiftyVal = +(prev.nifty50.value + deltaNifty).toFixed(2);
        const newBankVal = +(prev.bankNifty.value + deltaBank).toFixed(2);
        const newSensexVal = +(prev.sensex.value + deltaSensex).toFixed(2);

        return {
          ...prev,
          nifty50: {
            ...prev.nifty50,
            value: newNiftyVal,
            change: +(newNiftyVal - prev.nifty50.prevClose).toFixed(2),
            changePercent: +(((newNiftyVal - prev.nifty50.prevClose) / prev.nifty50.prevClose) * 100).toFixed(2),
          },
          bankNifty: {
            ...prev.bankNifty,
            value: newBankVal,
            change: +(newBankVal - prev.bankNifty.prevClose).toFixed(2),
            changePercent: +(((newBankVal - prev.bankNifty.prevClose) / prev.bankNifty.prevClose) * 100).toFixed(2),
          },
          sensex: {
            ...prev.sensex,
            value: newSensexVal,
            change: +(newSensexVal - prev.sensex.prevClose).toFixed(2),
            changePercent: +(((newSensexVal - prev.sensex.prevClose) / prev.sensex.prevClose) * 100).toFixed(2),
          },
        };
      });

      // Helper to evaluate price alerts against incoming tick price
      const checkAndTriggerAlerts = (symbol: string, stockId: string, tickPrice: number) => {
        const currentAlerts = priceAlertsRef.current;
        if (!currentAlerts || currentAlerts.length === 0) return;

        currentAlerts.forEach((alert) => {
          if (alert.triggered) return;
          if (alert.symbol === symbol || alert.stockId === stockId) {
            const target = alert.targetPrice;
            const isHit =
              alert.direction === 'ABOVE'
                ? tickPrice >= target
                : tickPrice <= target;

            if (isHit) {
              // Mark alert as triggered
              setPriceAlerts((prev) =>
                prev.map((a) =>
                  a.id === alert.id
                    ? {
                        ...a,
                        triggered: true,
                        triggeredAt: new Date().toLocaleTimeString('en-IN', {
                          hour12: false,
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        }),
                      }
                    : a
                )
              );
              playAlertChime();
              showToast(
                `🔔 PRICE ALERT HIT: ${alert.symbol} reached target of ${formatINR(target)}! (Current: ${formatINR(
                  tickPrice
                )})`
              );
            }
          }
        });
      };

      // 2. High-performance stock fluctuation logic:
      // When a stock is actively selected in StockDetailView, update ONLY that specific stock
      // rather than allocating and re-rendering the entire stocksRadar array.
      const currentSelectedStock = activeStockDetailRef.current;

      if (currentSelectedStock) {
        const tickPct = (Math.random() - 0.49) * 0.002;
        const newLtp = +(currentSelectedStock.ltp * (1 + tickPct)).toFixed(2);
        const newChange = +(newLtp - currentSelectedStock.open915).toFixed(2);
        const newChangePct = +((newChange / currentSelectedStock.open915) * 100).toFixed(2);

        // Check if any price alert was hit for this active stock
        checkAndTriggerAlerts(currentSelectedStock.symbol, currentSelectedStock.id, newLtp);

        // Update activeStockDetail directly
        setActiveStockDetail((prev) => {
          if (!prev || prev.id !== currentSelectedStock.id) return prev;
          const updated: StockRadarItem = {
            ...prev,
            ltp: newLtp,
            change: newChange,
            changePercent: newChangePct,
          };
          const prevClass = prev.marketClassification || getStockClassification(prev);
          const newClass = getStockClassification(updated);
          if (prevClass !== newClass) {
            const now = new Date();
            updated.previousClassification = prevClass;
            updated.lastStateChange = {
              from: prevClass,
              to: newClass,
              timestamp: now.toLocaleTimeString('en-IN', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              }),
            };
          } else if (prev.lastStateChange) {
            updated.previousClassification = prev.previousClassification;
            updated.lastStateChange = prev.lastStateChange;
          }
          updated.marketClassification = newClass;
          return updated;
        });

        // Deliberately do NOT update setStocksRadar while StockDetailView is active.
        // This ensures the entire stocksRadar array does not re-allocate or trigger re-renders
        // in background radar tables, achieving optimal 60fps performance for the detailed chart.
      } else {
        // No stock actively selected in StockDetailView: tick random radar stocks
        setStocksRadar((prevStocks) =>
          prevStocks.map((stk) => {
            if (Math.random() > 0.45) return stk;
            const tickPct = (Math.random() - 0.49) * 0.002;
            const newLtp = +(stk.ltp * (1 + tickPct)).toFixed(2);
            const newChange = +(newLtp - stk.open915).toFixed(2);
            const newChangePct = +((newChange / stk.open915) * 100).toFixed(2);

            // Check if any price alert was hit for this ticking stock
            checkAndTriggerAlerts(stk.symbol, stk.id, newLtp);

            const updated: StockRadarItem = {
              ...stk,
              ltp: newLtp,
              change: newChange,
              changePercent: newChangePct,
            };

            const prevClass = stk.marketClassification || getStockClassification(stk);
            const newClass = getStockClassification(updated);

            if (prevClass !== newClass) {
              const now = new Date();
              const timeStr = now.toLocaleTimeString('en-IN', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });
              updated.previousClassification = prevClass;
              updated.lastStateChange = {
                from: prevClass,
                to: newClass,
                timestamp: timeStr,
              };
            } else if (stk.lastStateChange) {
              updated.previousClassification = stk.previousClassification;
              updated.lastStateChange = stk.lastStateChange;
            }
            updated.marketClassification = newClass;

            return updated;
          })
        );
      }

      // 3. Fluctuate active positions
      setPositions((prevPositions) =>
        prevPositions.map((pos) => {
          if (pos.status !== 'OPEN') return pos;
          const tick = (Math.random() - 0.48) * 0.15;
          const newCurrentPrice = +(Math.max(1, pos.currentPrice + tick)).toFixed(2);
          const pointsDiff = newCurrentPrice - pos.entryPrice;
          const newPnl = +(pointsDiff * pos.quantity).toFixed(2);
          const newPnlPercent = +((pointsDiff / pos.entryPrice) * 100).toFixed(2);

          return {
            ...pos,
            currentPrice: newCurrentPrice,
            pnl: newPnl,
            pnlPercent: newPnlPercent,
          };
        })
      );

      // 4. Fluctuate Watchlist Stocks in sync with market ticks
      setWatchlistStocks((prevList) =>
        prevList.map((stk) => {
          if (Math.random() > 0.45) return stk;
          const tickPct = (Math.random() - 0.49) * 0.002;
          const newLtp = +(stk.ltp * (1 + tickPct)).toFixed(2);
          const baseOpen = stk.open915 || stk.ltp;
          const newChange = +(newLtp - baseOpen).toFixed(2);
          const newChangePct = +((newChange / baseOpen) * 100).toFixed(2);
          const prevSpark = stk.sparkline && stk.sparkline.length > 0 ? stk.sparkline : [stk.ltp];
          const updatedSpark = prevSpark.length >= 6 ? [...prevSpark.slice(1), newLtp] : [...prevSpark, newLtp];

          return {
            ...stk,
            ltp: newLtp,
            change: newChange,
            changePercent: newChangePct,
            sparkline: updatedSpark,
          };
        })
      );
    }, 1200);

    return () => clearInterval(interval);
  }, [isSimulating, backendConnected, growwAuth?.authenticated]);

  // Click Sector Handler: Opens Sector Detail View
  const handleSelectSector = (sectorName: string | null) => {
    setSelectedSectorName(sectorName);
    setActiveTab('sector-radar');
  };

  // Click Stock Handler: Opens Dedicated Stock Detail View
  const handleSelectStock = (stock: StockRadarItem) => {
    setActiveStockDetail(stock);
    setPreviousTab(activeTab);
    setActiveTab('stock-detail');

    // If connected to backend, pull fresh quote directly from Groww API
    if (backendConnected) {
      fetchGrowwQuote(stock.symbol)
        .then((quote) => {
          if (quote && quote.last_price) {
            setActiveStockDetail((prev) => {
              if (!prev || prev.symbol !== stock.symbol) return prev;
              return {
                ...prev,
                ltp: quote.last_price,
                change: quote.day_change ?? prev.change,
                changePercent: quote.day_change_perc ?? prev.changePercent,
                dayHigh: quote.ohlc?.high ?? prev.dayHigh,
                dayLow: quote.ohlc?.low ?? prev.dayLow,
                open915: quote.ohlc?.open ?? prev.open915,
                volume: quote.volume ?? prev.volume,
              };
            });

            setStocksRadar((prev) =>
              prev.map((s) => {
                if (s.symbol === stock.symbol) {
                  return {
                    ...s,
                    ltp: quote.last_price,
                    change: quote.day_change ?? s.change,
                    changePercent: quote.day_change_perc ?? s.changePercent,
                    dayHigh: quote.ohlc?.high ?? s.dayHigh,
                    dayLow: quote.ohlc?.low ?? s.dayLow,
                    volume: quote.volume ?? s.volume,
                  };
                }
                return s;
              })
            );
          }
        })
        .catch(() => {});
    }
  };

  // Back from Stock Detail View
  const handleBackFromStockDetail = () => {
    if (activeStockDetail) {
      setStocksRadar((prev) =>
        prev.map((s) => (s.id === activeStockDetail.id ? activeStockDetail : s))
      );
    }
    setActiveStockDetail(null);
    setActiveTab(previousTab === 'stock-detail' ? 'dashboard' : previousTab);
  };

  // Handle adding stock to watchlist (duplicate prevention included)
  const handleAddStockToWatchlist = (entry: MasterStockEntry): boolean => {
    const isDuplicate = watchlistStocks.some(
      (s) => s.symbol.toUpperCase() === entry.symbol.toUpperCase()
    );
    if (isDuplicate) {
      showToast(`${entry.symbol} is already in your Watchlist!`);
      return false;
    }

    const newItem: WatchlistStockItem = {
      id: `watchlist-${entry.symbol.toLowerCase()}-${Date.now()}`,
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
      addedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setWatchlistStocks((prev) => [newItem, ...prev]);
    showToast(`Added ${entry.symbol} to ${entry.sector} watchlist`);
    return true;
  };

  // Handle removing stock from watchlist
  const handleRemoveStockFromWatchlist = (symbol: string) => {
    setWatchlistStocks((prev) =>
      prev.filter((s) => s.symbol.toUpperCase() !== symbol.toUpperCase())
    );
    showToast(`Removed ${symbol} from Watchlist`);
  };

  // Reset default watchlist to initial 6 stocks
  const handleResetDefaultWatchlist = () => {
    const defaultList = getInitialWatchlist();
    setWatchlistStocks(defaultList);
    showToast('Reset Watchlist to default 6 sample stocks');
  };

  // Handle Paper Trade Execution
  const handleSimulateTrade = (stock: StockRadarItem) => {
    const isBull = stock.status === 'BULL' || stock.changePercent >= 0;
    const optionType = isBull ? 'CE' : 'PE';
    const roundedStrike = Math.round(stock.ltp / 50) * 50;
    const instrument = `${stock.symbol} ${roundedStrike} ${optionType}`;
    const lotSize = stock.ltp > 2000 ? 100 : stock.ltp > 1000 ? 250 : 500;
    const entryPrice = +(stock.ltp * 0.022).toFixed(2);

    const newPosition: PositionItem = {
      id: `pos-${Date.now()}`,
      symbol: stock.symbol,
      instrument,
      optionType,
      strike: roundedStrike,
      type: 'BUY',
      product: 'MIS (Intraday)',
      lots: 2,
      lotSize,
      quantity: lotSize * 2,
      entryPrice,
      currentPrice: entryPrice,
      pnl: 0,
      pnlPercent: 0,
      stopLoss: +(entryPrice * 0.8).toFixed(2),
      target: +(entryPrice * 1.35).toFixed(2),
      entryTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      status: 'OPEN',
    };

    setPositions((prev) => [newPosition, ...prev]);
    showToast(`Paper trade executed: Bought ${instrument} @ ₹${entryPrice}`);
  };

  // Handle Square Off Single Position
  const handleSquareOff = (positionId: string) => {
    const pos = positions.find((p) => p.id === positionId);
    if (!pos) return;

    const historyEntry: TradeHistoryItem = {
      id: `hist-${Date.now()}`,
      instrument: pos.instrument,
      signal: pos.optionType === 'CE' ? 'BULLISH' : 'BEARISH',
      type: 'BUY',
      quantity: pos.quantity,
      entryTime: pos.entryTime,
      exitTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
      entryPrice: pos.entryPrice,
      exitPrice: pos.currentPrice,
      netPnl: pos.pnl,
      pnlPercent: pos.pnlPercent,
      exitReason: 'MANUAL_EXIT',
    };

    setTradeHistory((prev) => [historyEntry, ...prev]);
    setPositions((prev) => prev.filter((p) => p.id !== positionId));
    showToast(`Position squared off: ${pos.instrument} (P&L: ${formatINR(pos.pnl)})`);
  };

  // Handle Square Off All Positions
  const handleSquareOffAll = () => {
    if (positions.length === 0) return;
    const count = positions.length;
    const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

    const newHistoryEntries: TradeHistoryItem[] = positions.map((pos) => ({
      id: `hist-${Date.now()}-${pos.id}`,
      instrument: pos.instrument,
      signal: pos.optionType === 'CE' ? 'BULLISH' : 'BEARISH',
      type: 'BUY',
      quantity: pos.quantity,
      entryTime: pos.entryTime,
      exitTime: nowTime,
      entryPrice: pos.entryPrice,
      exitPrice: pos.currentPrice,
      netPnl: pos.pnl,
      pnlPercent: pos.pnlPercent,
      exitReason: 'MANUAL_EXIT',
    }));

    setTradeHistory((prev) => [...newHistoryEntries, ...prev]);
    setPositions([]);
    showToast(`All ${count} open positions squared off at market price.`);
  };

  const handleConnectGroww = async () => {
    if (!backendConnected) {
      showToast('Backend is offline. Start the FastAPI backend first.');
      return;
    }
    setConnectPending(true);
    try {
      const result = await connectGroww();
      if (!result) {
        showToast('Groww connection failed. Check backend credentials and API logs.');
        return;
      }

      const auth = await fetchGrowwAuthStatus();
      setGrowwAuth(auth);
      if (!auth?.authenticated) {
        showToast('Groww authentication did not complete. Check Groww credentials.');
        return;
      }

      const [profile, holdings, margins, overview, liveIndices] = await Promise.all([
        fetchGrowwUserProfile(),
        fetchGrowwHoldings(),
        fetchGrowwMargins(),
        fetchMarketOverview(),
        fetchGrowwMarketIndices(),
      ]);
      if (profile) setGrowwProfile(profile);
      setGrowwHoldings(holdings);
      setGrowwMargins(margins);
      const holdingLtps = await fetchGrowwBatchLTP(holdings.map((holding) => holding.trading_symbol));
      setGrowwHoldingLtps(holdingLtps);
      applyLiveOverview(overview);
      applyLiveIndices(liveIndices);
      setCurrentUser((prev) => ({
        email: profile?.ucc ? `groww.${profile.ucc}@sevenseascapital.in` : (prev?.email || ''),
        name: profile?.ucc ? `Groww User (${profile.ucc})` : (prev?.name || 'Groww User'),
        provider: 'groww',
        role: 'Active Broker Account',
      }));
      setIsSimulating(false);
      const feed = await connectGrowwMarketFeed();
      if (!overview && (!liveIndices || Object.keys(liveIndices.indices).length === 0)) {
        showToast('Groww connected, but market data is unavailable. Check stock symbols/tokens.');
      } else if (!feed) {
        showToast('Groww connected and quotes loaded; live stream could not start.');
      } else {
        const stocksLoaded = overview?.stocks.filter((item) => item.ltp != null).length ?? 0;
        const indexesLoaded = liveIndices ? Object.keys(liveIndices.indices).length : 0;
        showToast(`Groww connected: ${stocksLoaded} stocks and ${indexesLoaded} indices loaded.`);
      }
    } catch {
      showToast('Could not connect Groww. Check backend logs and .env configuration.');
    } finally {
      setConnectPending(false);
    }
  };

  const handleRefreshData = async () => {
    if (backendConnected) {
      try {
        const [holdings, margins, overview, liveIndices] = await Promise.all([
          fetchGrowwHoldings(),
          fetchGrowwMargins(),
          fetchMarketOverview(),
          fetchGrowwMarketIndices(),
        ]);
        if (overview) applyLiveOverview(overview);
        if (liveIndices) applyLiveIndices(liveIndices);
        setGrowwHoldings(holdings);
        setGrowwMargins(margins);
        const holdingLtps = await fetchGrowwBatchLTP(holdings.map((holding) => holding.trading_symbol));
        setGrowwHoldingLtps(holdingLtps);
        if (holdings.length > 0) {
          if (Object.keys(holdingLtps).length > 0) {
            setStocksRadar((prev) =>
              prev.map((s) => {
                const key = `NSE_${s.symbol}`;
                if (holdingLtps[key]) {
                  const newLtp = holdingLtps[key];
                  const newChange = +(newLtp - s.open915).toFixed(2);
                  const newChangePct = +((newChange / s.open915) * 100).toFixed(2);
                  return {
                    ...s,
                    ltp: newLtp,
                    change: newChange,
                    changePercent: newChangePct,
                  };
                }
                return s;
              })
            );
          }
        }
        showToast('Holdings & Quotes refreshed from Groww API');
        return;
      } catch {}
    }
    showToast('Market scanner & quote cache refreshed from NSE feed');
  };

  const handleLogout = () => {
    localStorage.removeItem('quantradar_user');
    setCurrentUser(null);
    showToast('Signed out from trading session');
  };

  const liveDataConnected = Boolean(backendConnected && growwAuth?.authenticated);
  const dashboardStocks = liveDataConnected
    ? (marketOverview
        ? stocksRadar.filter((stock) => marketOverview.stocks.some(
            (item) => item.symbol.toUpperCase() === stock.symbol.toUpperCase() && item.ltp != null
          ))
        : [])
    : stocksRadar;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans transition-colors duration-150">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="toast-notification"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-lg border border-slate-800 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-2"
        >
          <BellRing className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab === 'stock-detail' ? previousTab : activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'sector-radar') setSelectedSectorName(null);
        }}
        openPositionsCount={positions.length}
        totalUnrealizedPnl={totalUnrealizedPnl}
        activeSignalsCount={signals.length}
        stocksCount={stocksRadar.length}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-60">
        {/* Top Header */}
        <Header
          timePeriod={timePeriod}
          setTimePeriod={setTimePeriod}
          isSimulating={isSimulating}
          setIsSimulating={setIsSimulating}
          onRefreshData={handleRefreshData}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          stocks={stocksRadar}
          currentUser={currentUser}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onLogout={handleLogout}
          theme={theme}
          onToggleTheme={toggleTheme}
          backendConnected={backendConnected}
          growwAuth={growwAuth}
          wsConnected={wsConnected}
        />

        {/* Page Body: Dynamic View Switching adhering to strict trader workflow */}
        <main className="flex-1 px-3 sm:px-5 lg:px-6 py-4 w-full max-w-[1600px] mx-auto space-y-4">
          {/* VIEW: STOCK DETAIL (When any stock is clicked) */}
          {activeTab === 'stock-detail' && activeStockDetail && (
            <StockDetailView
              stock={activeStockDetail}
              onBack={handleBackFromStockDetail}
              onSimulateTrade={handleSimulateTrade}
              alerts={priceAlerts}
              onSetAlert={handleSetAlert}
              onRemoveAlert={handleRemoveAlert}
              theme={theme}
              marketDataConnected={Boolean(backendConnected && growwAuth?.authenticated)}
            />
          )}

          {/* VIEW 1: REDESIGNED TRADER DASHBOARD */}
          {activeTab === 'dashboard' && (
            <DashboardView
              indices={indices}
              stocks={dashboardStocks}
              marketOverview={marketOverview}
              liveDataConnected={liveDataConnected}
              onSelectStock={handleSelectStock}
              onSelectStockBySymbol={(symbol) => {
                const found =
                  stocksRadar.find((s) => s.symbol === symbol) ||
                  MOCK_STOCK_UNIVERSE.find((s) => s.symbol === symbol);
                if (found) {
                  handleSelectStock(found);
                }
              }}
              onNavigateToPositions={() => setActiveTab('positions')}
              onNavigateToPaperTrading={() => setActiveTab('paper-trading')}
              onNavigateToSectorsView={() => {
                setSelectedSectorName(null);
                setActiveTab('sector-radar');
              }}
              theme={theme}
            />
          )}

          {/* VIEW 2: SECTORS (Sector Radar + Click Sector → Bullish vs Bearish Pie Chart + Sector Stock List) */}
          {activeTab === 'sector-radar' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <SectorRadarView
                timePeriod={timePeriod}
                setTimePeriod={setTimePeriod}
                stocks={stocksRadar}
                indices={indices}
                breadth={breadth}
                selectedSectorName={selectedSectorName}
                onSelectSector={setSelectedSectorName}
                onSelectStock={handleSelectStock}
                onSimulateStateTransition={handleSimulateStateTransition}
                theme={theme}
              />
            </div>
          )}

          {/* VIEW 3: STOCKS (Complete Stock Radar Matrix with Organized Filters) */}
          {activeTab === 'stock-radar' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <StockRadarTable
                stocks={stocksRadar}
                onSelectStock={handleSelectStock}
                onSimulateTrade={handleSimulateTrade}
                onSimulateStateTransition={handleSimulateStateTransition}
              />
            </div>
          )}

          {/* VIEW 4: WATCHLIST & POSITIONS */}
          {activeTab === 'positions' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Top Sub-Navigation Tabs */}
              <div className="flex items-center justify-between p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActivePositionsSubTab('watchlist')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activePositionsSubTab === 'watchlist'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>Sector Watchlist</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        activePositionsSubTab === 'watchlist'
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {watchlistStocks.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePositionsSubTab('positions')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activePositionsSubTab === 'positions'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>Open Positions</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        activePositionsSubTab === 'positions'
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {positions.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePositionsSubTab('signals')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activePositionsSubTab === 'signals'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>Active Signals</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        activePositionsSubTab === 'signals'
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {signals.length}
                    </span>
                  </button>
                </div>
              </div>

              {/* Sub-view 1: Sector-Organized Watchlist */}
              {activePositionsSubTab === 'watchlist' && (
                <SectorWatchlistView
                  watchlistStocks={watchlistStocks}
                  onSelectStock={handleSelectStock}
                  onAddStock={handleAddStockToWatchlist}
                  onRemoveStock={handleRemoveStockFromWatchlist}
                  onResetDefaultWatchlist={handleResetDefaultWatchlist}
                  existingRadarList={stocksRadar}
                />
              )}

              {/* Sub-view 2: Open Positions */}
              {activePositionsSubTab === 'positions' && (
                <PositionsTable
                  positions={positions}
                  onSquareOff={handleSquareOff}
                  onSquareOffAll={handleSquareOffAll}
                  growwHoldings={growwHoldings}
                  stocks={stocksRadar}
                />
              )}

              {/* Sub-view 3: Active Signals */}
              {activePositionsSubTab === 'signals' && (
                <ActiveSignals
                  signals={signals}
                  onTakePaperTrade={(sig) => {
                    const stock = stocksRadar.find((s) => s.symbol === sig.stock);
                    if (stock) handleSimulateTrade(stock);
                  }}
                />
              )}
            </div>
          )}

          {/* VIEW 5: PAPER TRADING SIMULATION */}
          {activeTab === 'paper-trading' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <PaperTradingView
                virtualBalance={virtualBalance}
                positions={positions}
                tradeHistory={tradeHistory}
                stocks={stocksRadar}
                onSquareOff={handleSquareOff}
                onSquareOffAll={handleSquareOffAll}
                onResetPaperAccount={handleResetPaperAccount}
                onSimulateTrade={handleSimulateTrade}
                theme={theme}
              />
            </div>
          )}

          {/* VIEW 6: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <SettingsView
                backendConnected={backendConnected}
                growwAuth={growwAuth}
                growwProfile={growwProfile}
                onConnectGroww={handleConnectGroww}
                connectPending={connectPending}
              />
            </div>
          )}

          {/* Regulatory & Risk Disclaimer */}
          <Disclaimer />
        </main>
      </div>

      {/* Login / Authentication Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Welcome, ${user.name}! Terminal active.`);
        }}
      />
    </div>
  );
}
