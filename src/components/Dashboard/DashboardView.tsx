import React from 'react';
import { MarketIndex, StockRadarItem } from '../../types';
import { MarketIndexGrid } from './MarketIndexGrid';
import { GlobalMarketSearch } from './GlobalMarketSearch';
import { MarketMovers } from './MarketMovers';
import { TopSectors } from './TopSectors';
import { MarketHeatmaps } from './MarketHeatmaps';
import { PortfolioSummary } from './PortfolioSummary';
import type { MarketOverview } from '../../services/backendApi';

interface DashboardViewProps {
  indices: {
    nifty50: MarketIndex;
    bankNifty: MarketIndex;
    sensex: MarketIndex;
  };
  stocks: StockRadarItem[];
  marketOverview?: MarketOverview | null;
  liveDataConnected?: boolean;
  onSelectStock: (stock: StockRadarItem) => void;
  onSelectStockBySymbol: (symbol: string) => void;
  onNavigateToPositions?: () => void;
  onNavigateToPaperTrading?: () => void;
  onNavigateToSectorsView?: () => void;
  theme?: 'light' | 'dark';
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  indices,
  stocks,
  marketOverview,
  liveDataConnected = false,
  onSelectStock,
  onSelectStockBySymbol,
  onNavigateToPositions,
  onNavigateToPaperTrading,
  onNavigateToSectorsView,
  theme,
}) => {
  return (
    <div id="trader-dashboard-root" className="space-y-4 sm:space-y-5 animate-in fade-in duration-150">
      {/* Search Header Bar: Global vs Market Search */}
      <div className="w-full">
        <GlobalMarketSearch stocks={stocks} onSelectStock={onSelectStock} />
      </div>

      {/* SECTION 1: Portfolio / Trading Area Summary */}
      <PortfolioSummary
        onNavigateToPositions={onNavigateToPositions}
        onNavigateToPaperTrading={onNavigateToPaperTrading}
      />

      {/* SECTION 2: Market Index Cards (NIFTY 50, BANK NIFTY, SENSEX) */}
      <MarketIndexGrid
        indices={indices}
        onSelectStock={onSelectStockBySymbol}
      />

      {/* SECTION 3: Market Movers (Gainers, Losers, Most Active, Volume Buzzers) */}
      <MarketMovers
        onSelectStock={onSelectStockBySymbol}
        marketOverview={marketOverview}
        liveDataConnected={liveDataConnected}
      />

      {/* SECTION 4: Top Sectors (Bullish & Bearish Participation Matrix) */}
      <TopSectors
        onSelectStock={onSelectStockBySymbol}
        onNavigateToSectorsView={onNavigateToSectorsView}
        marketOverview={marketOverview}
        liveDataConnected={liveDataConnected}
        stocks={stocks}
      />

      {/* SECTION 5: Market Heatmaps (Overall Market + Sector Heatmaps) */}
      <MarketHeatmaps stocks={stocks} onSelectStock={onSelectStockBySymbol} theme={theme} />
    </div>
  );
};

