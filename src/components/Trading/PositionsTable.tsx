import React, { useState } from 'react';
import { Briefcase, ArrowUpRight, ArrowDownRight, XCircle, Shield, Building2, CheckCircle2 } from 'lucide-react';
import { PositionItem, StockRadarItem } from '../../types';
import { GrowwHolding } from '../../services/backendApi';
import { formatINR } from '../../utils/formatters';

interface PositionsTableProps {
  positions: PositionItem[];
  onSquareOff: (positionId: string) => void;
  onSquareOffAll?: () => void;
  growwHoldings?: GrowwHolding[];
  stocks?: StockRadarItem[];
}

export const PositionsTable: React.FC<PositionsTableProps> = ({
  positions,
  onSquareOff,
  onSquareOffAll,
  growwHoldings = [],
  stocks = [],
}) => {
  const [activeTab, setActiveTab] = useState<'holdings' | 'positions'>(() => {
    return growwHoldings.length > 0 ? 'holdings' : 'positions';
  });

  // Groww Holdings Calculations
  const calculatedHoldings = growwHoldings.map((h) => {
    const matchedStock = stocks.find((s) => s.symbol.toUpperCase() === h.trading_symbol.toUpperCase());
    const ltp = matchedStock ? matchedStock.ltp : h.average_price;
    const invested = h.quantity * h.average_price;
    const currentValue = h.quantity * ltp;
    const pnl = currentValue - invested;
    const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;

    return {
      ...h,
      ltp,
      invested,
      currentValue,
      pnl,
      pnlPercent,
      stockName: matchedStock ? matchedStock.name : h.trading_symbol,
      dayChangePerc: matchedStock?.changePercent,
    };
  });

  const totalHoldingsInvested = calculatedHoldings.reduce((sum, h) => sum + h.invested, 0);
  const totalHoldingsCurrent = calculatedHoldings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalHoldingsPnl = totalHoldingsCurrent - totalHoldingsInvested;
  const totalHoldingsRoi = totalHoldingsInvested > 0 ? (totalHoldingsPnl / totalHoldingsInvested) * 100 : 0;
  const isHoldingsProfitable = totalHoldingsPnl >= 0;

  // MIS Positions Calculations
  const totalPnl = positions.reduce((acc, pos) => acc + pos.pnl, 0);
  const totalCapitalUsed = positions.reduce((acc, pos) => acc + (pos.entryPrice * pos.quantity), 0);
  const overallRoi = totalCapitalUsed > 0 ? (totalPnl / totalCapitalUsed) * 100 : 0;
  const isOverallProfitable = totalPnl >= 0;

  return (
    <section id="positions-section" className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Portfolio & Execution
              </h2>
              {/* Segment Toggle */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('holdings')}
                  className={`px-2.5 py-0.5 rounded cursor-pointer transition-colors ${
                    activeTab === 'holdings'
                      ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Groww Demat ({growwHoldings.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('positions')}
                  className={`px-2.5 py-0.5 rounded cursor-pointer transition-colors ${
                    activeTab === 'positions'
                      ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  MIS Bracket ({positions.length})
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {activeTab === 'holdings'
                ? 'Real brokerage equity holdings fetched live from Groww Demat Account'
                : 'Intraday automated MIS positions with hard Stop Loss & Target bracket orders'}
            </p>
          </div>
        </div>

        {/* Total P&L Snapshot */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] font-semibold uppercase text-slate-400 block tracking-wider">
              {activeTab === 'holdings' ? 'Unrealized P&L' : 'Intraday P&L'}
            </span>
            <div className="flex items-baseline gap-1.5 justify-end">
              <span
                id="positions-total-pnl"
                className={`text-lg font-bold font-mono tabular-nums ${
                  (activeTab === 'holdings' ? isHoldingsProfitable : isOverallProfitable)
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {formatINR(activeTab === 'holdings' ? totalHoldingsPnl : totalPnl)}
              </span>
              <span
                className={`text-xs font-semibold font-mono ${
                  (activeTab === 'holdings' ? isHoldingsProfitable : isOverallProfitable)
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                ({(activeTab === 'holdings' ? isHoldingsProfitable : isOverallProfitable) ? '+' : ''}
                {(activeTab === 'holdings' ? totalHoldingsRoi : overallRoi).toFixed(2)}%)
              </span>
            </div>
          </div>

          {activeTab === 'positions' && positions.length > 0 && onSquareOffAll && (
            <button
              id="btn-squareoff-all"
              onClick={onSquareOffAll}
              className="px-2.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
              title="Close all open positions at market price"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Square Off All</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW A: REAL GROWW HOLDINGS */}
      {activeTab === 'holdings' && (
        <>
          {calculatedHoldings.length === 0 ? (
            <div className="p-8 text-center bg-slate-50/50 dark:bg-slate-800/20">
              <Building2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Demat Holdings Found</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Connected to Groww backend. When equity holdings are bought in CNC delivery, they will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table id="table-groww-holdings" className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3.5">Instrument</th>
                    <th className="py-2.5 px-3 text-center">Type</th>
                    <th className="py-2.5 px-3 text-right">Qty (Demat Free)</th>
                    <th className="py-2.5 px-3 text-right">Avg Buy Price (₹)</th>
                    <th className="py-2.5 px-3 text-right">Live LTP (₹)</th>
                    <th className="py-2.5 px-3 text-right">Invested Value (₹)</th>
                    <th className="py-2.5 px-3 text-right">Current Value (₹)</th>
                    <th className="py-2.5 px-3 text-right">Unrealized P&L</th>
                    <th className="py-2.5 px-3 text-center">Exchanges</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                  {calculatedHoldings.map((h) => {
                    const isProfit = h.pnl >= 0;

                    return (
                      <tr
                        key={h.isin}
                        id={`holding-row-${h.trading_symbol}`}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Instrument */}
                        <td className="py-3 px-3.5 font-medium text-slate-900 dark:text-slate-100">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                              {h.trading_symbol}
                            </span>
                            <span className="text-[10px] font-semibold px-1 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              CNC
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block truncate max-w-[180px]">
                            {h.stockName} • {h.isin}
                          </span>
                        </td>

                        {/* Type */}
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            Delivery
                          </span>
                        </td>

                        {/* Quantity */}
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800 dark:text-slate-200">
                          <span className="font-semibold">{h.quantity}</span>
                          <span className="text-[10px] text-slate-400 block">
                            Free: {h.demat_free_quantity}
                          </span>
                        </td>

                        {/* Average Price */}
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                          ₹{h.average_price.toFixed(2)}
                        </td>

                        {/* Live LTP */}
                        <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-slate-900 dark:text-slate-100">
                          ₹{h.ltp.toFixed(2)}
                          {h.dayChangePerc !== undefined && (
                            <span
                              className={`text-[10px] block font-semibold ${
                                h.dayChangePerc >= 0 ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {h.dayChangePerc >= 0 ? '+' : ''}{h.dayChangePerc.toFixed(2)}%
                            </span>
                          )}
                        </td>

                        {/* Invested Value */}
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600 dark:text-slate-400">
                          {formatINR(h.invested)}
                        </td>

                        {/* Current Value */}
                        <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                          {formatINR(h.currentValue)}
                        </td>

                        {/* P&L */}
                        <td className="py-3 px-3 text-right font-mono tabular-nums">
                          <div
                            className={`font-bold text-sm ${
                              isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {formatINR(h.pnl)}
                          </div>
                          <span
                            className={`text-[10px] font-semibold ${
                              isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {isProfit ? '+' : ''}{h.pnlPercent.toFixed(2)}%
                          </span>
                        </td>

                        {/* Exchanges */}
                        <td className="py-3 px-3 text-center">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {h.tradable_exchanges.join(', ')}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Holdings Footer Details */}
          <div className="p-3 bg-slate-50/60 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-2">
            <div className="flex items-center gap-4">
              <span>Total Invested: <strong className="text-slate-700 dark:text-slate-200 font-mono">{formatINR(totalHoldingsInvested)}</strong></span>
              <span>Current Value: <strong className="text-slate-700 dark:text-slate-200 font-mono">{formatINR(totalHoldingsCurrent)}</strong></span>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified Demat Portfolio from Groww API</span>
            </div>
          </div>
        </>
      )}

      {/* VIEW B: MIS POSITIONS TABLE */}
      {activeTab === 'positions' && (
        <>
          {positions.length === 0 ? (
            <div className="p-8 text-center bg-slate-50/50 dark:bg-slate-800/20">
              <Briefcase className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Open Positions</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                All positions are either squared off or waiting for 15-min range breakout triggers.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table id="table-positions" className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3.5">Instrument</th>
                    <th className="py-2.5 px-3 text-center">Type</th>
                    <th className="py-2.5 px-3 text-right">Quantity (Qty)</th>
                    <th className="py-2.5 px-3 text-right">Entry Price (₹)</th>
                    <th className="py-2.5 px-3 text-right">LTP (₹)</th>
                    <th className="py-2.5 px-3 text-right">Stop Loss (₹)</th>
                    <th className="py-2.5 px-3 text-right">Target (₹)</th>
                    <th className="py-2.5 px-3 text-right">P&L (₹ / %)</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                  {positions.map((pos) => {
                    const isPosProfitable = pos.pnl >= 0;

                    return (
                      <tr
                        key={pos.id}
                        id={`position-row-${pos.symbol}`}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Instrument */}
                        <td className="py-3 px-3.5 font-medium text-slate-900 dark:text-slate-100">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 dark:text-slate-100 tracking-tight">{pos.instrument}</span>
                            <span className="text-[10px] font-semibold px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {pos.product}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            Entered @ {pos.entryTime}
                          </span>
                        </td>

                        {/* Type */}
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            {pos.type}
                          </span>
                        </td>

                        {/* Quantity */}
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800 dark:text-slate-200">
                          <span className="font-semibold">{pos.quantity}</span>
                          <span className="text-[10px] text-slate-400 block">
                            ({pos.lots} Lots × {pos.lotSize})
                          </span>
                        </td>

                        {/* Entry Price */}
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                          ₹{pos.entryPrice.toFixed(2)}
                        </td>

                        {/* Current Price */}
                        <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-slate-900 dark:text-slate-100">
                          ₹{pos.currentPrice.toFixed(2)}
                        </td>

                        {/* Stop Loss */}
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-rose-600 dark:text-rose-400 font-medium">
                          ₹{pos.stopLoss.toFixed(2)}
                          {pos.trailingSL && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-semibold">
                              Trail: ₹{pos.trailingSL.toFixed(2)}
                            </span>
                          )}
                        </td>

                        {/* Target */}
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-bold">
                          ₹{pos.target.toFixed(2)}
                        </td>

                        {/* P&L */}
                        <td className="py-3 px-3 text-right font-mono tabular-nums">
                          <div
                            className={`font-bold text-sm ${
                              isPosProfitable ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {formatINR(pos.pnl)}
                          </div>
                          <span
                            className={`text-[10px] font-semibold ${
                              isPosProfitable ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {isPosProfitable ? '+' : ''}
                            {pos.pnlPercent.toFixed(2)}%
                          </span>
                        </td>

                        {/* Action */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <button
                            id={`btn-squareoff-${pos.id}`}
                            onClick={() => onSquareOff(pos.id)}
                            className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-rose-700 bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded transition-colors cursor-pointer"
                            title="Simulate square off for this position"
                          >
                            Square Off
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer Details */}
          <div className="p-3 bg-slate-50/60 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-2">
            <div className="flex items-center gap-4">
              <span>Capital Deployed: <strong className="text-slate-700 dark:text-slate-200 font-mono">{formatINR(totalCapitalUsed)}</strong></span>
              <span>Risk Exposure: <strong className="text-slate-700 dark:text-slate-200 font-mono">1.2%</strong> of Account</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Stop Loss orders are server-side hard pegged</span>
            </div>
          </div>
        </>
      )}
    </section>
  );
};
