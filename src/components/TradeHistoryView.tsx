import React from 'react';
import { History, ArrowUpRight, ArrowDownRight, CheckCircle2, XCircle, TrendingUp, Award } from 'lucide-react';
import { TradeHistoryItem } from '../types';
import { formatINR } from '../data/mockData';

interface TradeHistoryViewProps {
  tradeHistory: TradeHistoryItem[];
}

export const TradeHistoryView: React.FC<TradeHistoryViewProps> = ({ tradeHistory }) => {
  const totalNetPnl = tradeHistory.reduce((acc, t) => acc + t.netPnl, 0);
  const winningTrades = tradeHistory.filter((t) => t.netPnl > 0).length;
  const totalClosedTrades = tradeHistory.length;
  const winRate = totalClosedTrades > 0 ? (winningTrades / totalClosedTrades) * 100 : 0;
  const isOverallProfitable = totalNetPnl >= 0;

  return (
    <div id="trade-history-page" className="space-y-4">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Today's Realized P&L
          </div>
          <div
            className={`text-xl font-bold font-mono mt-1 ${
              isOverallProfitable ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {formatINR(totalNetPnl)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Booked from {totalClosedTrades} closed trades</p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Win Rate
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            {winRate.toFixed(1)}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {winningTrades} Winners / {totalClosedTrades - winningTrades} Losses
          </p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Risk Discipline
          </div>
          <div className="text-xl font-bold font-mono text-emerald-600 mt-1">
            100% Adherence
          </div>
          <p className="text-[11px] text-slate-400 mt-1">0 Manual override deviations</p>
        </div>
      </div>

      {/* Trade History Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Today's Executed Trades</h2>
          </div>
          <span className="text-xs font-medium text-slate-500">
            Auto-logged on order fills
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-3.5">Instrument</th>
                <th className="py-2.5 px-3 text-center">Signal</th>
                <th className="py-2.5 px-3 text-right">Quantity</th>
                <th className="py-2.5 px-3 text-right">Entry (₹)</th>
                <th className="py-2.5 px-3 text-right">Exit (₹)</th>
                <th className="py-2.5 px-3 text-right">Net P&L (₹)</th>
                <th className="py-2.5 px-3 text-center">Exit Reason</th>
                <th className="py-2.5 px-3 text-right">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {tradeHistory.map((trade) => {
                const isProfitable = trade.netPnl >= 0;
                return (
                  <tr key={trade.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3.5 font-bold text-slate-900">
                      {trade.instrument}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                          trade.signal === 'BULLISH'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {trade.signal === 'BULLISH' ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {trade.signal}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                      {trade.quantity}
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600">
                      ₹{trade.entryPrice.toFixed(2)}
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                      ₹{trade.exitPrice.toFixed(2)}
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums">
                      <div
                        className={`font-bold ${
                          isProfitable ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {formatINR(trade.netPnl)}
                      </div>
                      <span
                        className={`text-[10px] ${
                          isProfitable ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isProfitable ? '+' : ''}
                        {trade.pnlPercent.toFixed(2)}%
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      {trade.exitReason === 'TARGET_HIT' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          TARGET HIT
                        </span>
                      )}
                      {trade.exitReason === 'SL_HIT' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded">
                          <XCircle className="w-2.5 h-2.5" />
                          STOP LOSS HIT
                        </span>
                      )}
                      {trade.exitReason === 'AUTO_SQUARE_OFF' && (
                        <span className="text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">
                          AUTO SQUARE-OFF
                        </span>
                      )}
                      {trade.exitReason === 'MANUAL_EXIT' && (
                        <span className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          MANUAL EXIT
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-[11px] text-slate-500">
                      {trade.entryTime} – {trade.exitTime}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
