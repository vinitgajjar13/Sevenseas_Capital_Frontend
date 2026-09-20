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
    if (!isSimulating) return;

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
  }, [isSimulating]);

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

  const handleRefreshData = () => {
    showToast('Market scanner & quote cache refreshed from NSE simulated feed');
  };

  const handleLogout = () => {
    localStorage.removeItem('quantradar_user');
    setCurrentUser(null);
    showToast('Signed out from trading session');
  };

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
            />
          )}

          {/* VIEW 1: REDESIGNED TRADER DASHBOARD */}
          {activeTab === 'dashboard' && (
            <DashboardView
              indices={indices}
              stocks={stocksRadar}
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
              />
            </div>
          )}

          {/* VIEW 6: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <SettingsView />
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
