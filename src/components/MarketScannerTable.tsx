import React from 'react';
import { StockRadarTable } from './StockRadarTable';
import { StockRadarItem } from '../types';

interface MarketScannerTableProps {
  stocks: StockRadarItem[];
  onSelectStock?: (stock: StockRadarItem) => void;
  onSelectForecast?: (stock: StockRadarItem) => void;
  onSimulateTrade?: (stock: StockRadarItem) => void;
}

export const MarketScannerTable: React.FC<MarketScannerTableProps> = ({
  stocks,
  onSelectStock = () => {},
  onSelectForecast = () => {},
  onSimulateTrade,
}) => {
  return (
    <StockRadarTable
      stocks={stocks}
      onSelectStock={onSelectStock}
      onSelectForecast={onSelectForecast}
      onSimulateTrade={onSimulateTrade}
    />
  );
};
