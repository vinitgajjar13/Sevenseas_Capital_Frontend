import React from 'react';
import { Briefcase, ArrowUpRight, ArrowDownRight, XCircle, Shield, AlertTriangle } from 'lucide-react';
import { PositionItem } from '../types';
import { formatINR } from '../data/mockData';

interface PositionsTableProps {
  positions: PositionItem[];
  onSquareOff: (positionId: string) => void;
  onSquareOffAll?: () => void;
}

export const PositionsTable: React.FC<PositionsTableProps> = ({
  positions,
  onSquareOff,
  onSquareOffAll,
}) => {
  const totalPnl = positions.reduce((acc, pos) => acc + pos.pnl, 0);
  const totalCapitalUsed = positions.reduce((acc, pos) => acc + (pos.entryPrice * pos.quantity), 0);
  const overallRoi = totalCapitalUsed > 0 ? (totalPnl / totalCapitalUsed) * 100 : 0;
  const isOverallProfitable = totalPnl >= 0;

  return (
    <section id="positions-section" className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Open Positions</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {positions.length} Active MIS
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Intraday automated positions with hard Stop Loss & Target bracket orders
            </p>
          </div>
        </div>

        {/* Total P&L Snapshot */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] font-semibold uppercase text-slate-400 block tracking-wider">
              Total Unrealized P&L
            </span>
            <div className="flex items-baseline gap-1.5 justify-end">
              <span
                id="positions-total-pnl"
                className={`text-lg font-bold font-mono tabular-nums ${
                  isOverallProfitable ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {formatINR(totalPnl)}
              </span>
              <span
                className={`text-xs font-semibold font-mono ${
                  isOverallProfitable ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                ({isOverallProfitable ? '+' : ''}
                {overallRoi.toFixed(2)}%)
              </span>
            </div>
          </div>

          {positions.length > 0 && onSquareOffAll && (
            <button
              id="btn-squareoff-all"
              onClick={onSquareOffAll}
              className="px-2.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors flex items-center gap-1 shrink-0"
              title="Close all open positions at market price"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Square Off All</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {positions.length === 0 ? (
        <div className="p-8 text-center bg-slate-50/50">
          <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No Open Positions</p>
          <p className="text-xs text-slate-500 mt-1">
            All positions are either squared off or waiting for 15-min range breakout triggers.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table id="table-positions" className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
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
            <tbody className="divide-y divide-slate-100 text-xs">
              {positions.map((pos) => {
                const isPosProfitable = pos.pnl >= 0;

                return (
                  <tr
                    key={pos.id}
                    id={`position-row-${pos.symbol}`}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Instrument */}
                    <td className="py-3 px-3.5 font-medium text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 tracking-tight">{pos.instrument}</span>
                        <span className="text-[10px] font-semibold px-1 py-0.2 rounded bg-slate-100 text-slate-600">
                          {pos.product}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        Entered @ {pos.entryTime}
                      </span>
                    </td>

                    {/* Type */}
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {pos.type}
                      </span>
                    </td>

                    {/* Quantity */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800">
                      <span className="font-semibold">{pos.quantity}</span>
                      <span className="text-[10px] text-slate-400 block">
                        ({pos.lots} Lots × {pos.lotSize})
                      </span>
                    </td>

                    {/* Entry Price */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                      ₹{pos.entryPrice.toFixed(2)}
                    </td>

                    {/* Current Price */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                      ₹{pos.currentPrice.toFixed(2)}
                    </td>

                    {/* Stop Loss */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-rose-600 font-medium">
                      ₹{pos.stopLoss.toFixed(2)}
                      {pos.trailingSL && (
                        <span className="text-[10px] text-amber-600 block font-semibold">
                          Trail: ₹{pos.trailingSL.toFixed(2)}
                        </span>
                      )}
                    </td>

                    {/* Target */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-600 font-bold">
                      ₹{pos.target.toFixed(2)}
                    </td>

                    {/* P&L */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums">
                      <div
                        className={`font-bold text-sm ${
                          isPosProfitable ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {formatINR(pos.pnl)}
                      </div>
                      <span
                        className={`text-[10px] font-semibold ${
                          isPosProfitable ? 'text-emerald-600' : 'text-rose-600'
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
                        className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-rose-700 bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded transition-colors"
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
      <div className="p-3 bg-slate-50/60 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
        <div className="flex items-center gap-4">
          <span>Capital Deployed: <strong className="text-slate-700 font-mono">{formatINR(totalCapitalUsed)}</strong></span>
          <span>Risk Exposure: <strong className="text-slate-700 font-mono">1.2%</strong> of Account</span>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>Stop Loss orders are server-side hard pegged</span>
        </div>
      </div>
    </section>
  );
};
