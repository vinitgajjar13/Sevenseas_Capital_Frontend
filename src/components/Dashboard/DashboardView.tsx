import React from 'react';
import { MarketIndex, StockRadarItem } from '../../types';
import { MarketIndexGrid } from './MarketIndexGrid';
import { GlobalMarketSearch } from './GlobalMarketSearch';
import { MarketMovers } from './MarketMovers';
import { TopSectors } from './TopSectors';
import { MarketHeatmaps } from './MarketHeatmaps';
import { PortfolioSummary } from './PortfolioSummary';

interface DashboardViewProps {
  indices: {
    nifty50: MarketIndex;
    bankNifty: MarketIndex;
    sensex: MarketIndex;
  };
  stocks: StockRadarItem[];
  onSelectStock: (stock: StockRadarItem) => void;
  onSelectStockBySymbol: (symbol: string) => void;
  onNavigateToPositions?: () => void;
  onNavigateToPaperTrading?: () => void;
  onNavigateToSectorsView?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  indices,
  stocks,
  onSelectStock,
  onSelectStockBySymbol,
  onNavigateToPositions,
  onNavigateToPaperTrading,
  onNavigateToSectorsView,
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
      <MarketMovers onSelectStock={onSelectStockBySymbol} />

      {/* SECTION 4: Top Sectors (Bullish & Bearish Participation Matrix) */}
      <TopSectors
        onSelectStock={onSelectStockBySymbol}
        onNavigateToSectorsView={onNavigateToSectorsView}
      />

      {/* SECTION 5: Market Heatmaps (Overall Market + Sector Heatmaps) */}
      <MarketHeatmaps onSelectStock={onSelectStockBySymbol} />
    </div>
  );
};

