import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  CheckCircle2,
  AlertCircle,
  Minus,
} from 'lucide-react';
import { MarketIndex, MarketBreadth, StockRadarItem } from '../types';
import { formatNumber } from '../data/mockData';

interface MarketOverviewProps {
  indices: {
    nifty50: MarketIndex;
    bankNifty: MarketIndex;
    niftyIt?: MarketIndex;
    niftyAuto?: MarketIndex;
  };
  breadth: MarketBreadth;
  stocks?: StockRadarItem[];
  onSelectSectorTab?: () => void;
}

export const MarketOverview: React.FC<MarketOverviewProps> = ({
  indices,
  breadth,
  stocks = [],
}) => {
  const nifty = indices.nifty50;
  const bankNifty = indices.bankNifty;

  const isNiftyUp = nifty.change >= 0;
  const isBankUp = bankNifty.change >= 0;

  // Calculate Market Overall Status (Bullish, Bearish, Neutral)
  const niftyUpScore = isNiftyUp ? 1 : -1;
  const bankUpScore = isBankUp ? 1 : -1;
  const breadthScore = breadth.advances > breadth.declines ? 1 : breadth.advances < breadth.declines ? -1 : 0;
  const totalScore = niftyUpScore + bankUpScore + breadthScore;

  const overallStatus: 'BULLISH' | 'BEARISH' | 'NEUTRAL' =
    totalScore >= 1 ? 'BULLISH' : totalScore <= -1 ? 'BEARISH' : 'NEUTRAL';

  const statusBg =
    overallStatus === 'BULLISH'
      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
      : overallStatus === 'BEARISH'
      ? 'bg-rose-50 border-rose-300 text-rose-900'
      : 'bg-slate-50 border-slate-300 text-slate-900';

  const statusBadge =
    overallStatus === 'BULLISH'
      ? 'bg-emerald-600 text-white'
      : overallStatus === 'BEARISH'
      ? 'bg-rose-600 text-white'
      : 'bg-slate-600 text-white';

  const getNiftyStatus = (idx: MarketIndex) => {
    if (idx.changePercent >= 0.5) return 'Strong Bullish';
    if (idx.changePercent > 0) return 'Mild Bullish';
    if (idx.changePercent <= -0.5) return 'Strong Bearish';
    if (idx.changePercent < 0) return 'Mild Bearish';
    return 'Neutral Range';
  };

  return (
    <section id="market-overview-section" className="space-y-3">
      {/* Top Section: Nifty + Bank Nifty + Market Overall Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* 1. NIFTY CARD */}
        <div
          id="card-nifty-50"
          className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold text-slate-900 tracking-tight text-sm">NIFTY 50</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isNiftyUp ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {getNiftyStatus(nifty)}
            </span>
          </div>

          <div className="flex items-baseline justify-between mt-1.5">
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {formatNumber(nifty.value)}
            </div>
            <div
              className={`flex items-center gap-0.5 text-xs font-semibold font-mono ${
                isNiftyUp ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {isNiftyUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>
                {isNiftyUp ? '+' : ''}
                {nifty.change.toFixed(2)} ({isNiftyUp ? '+' : ''}
                {nifty.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>

          {/* Intraday Range Strip */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div>
              <span className="text-slate-400">Low: </span>
              <span className="font-mono tabular-nums font-semibold text-slate-700">{formatNumber(nifty.low)}</span>
            </div>
            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden mx-2 relative">
              <div
                className={`h-full rounded-full transition-all duration-300 ${isNiftyUp ? 'bg-emerald-500' : 'bg-rose-500'}`}
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(10, ((nifty.value - nifty.low) / (nifty.high - nifty.low || 1)) * 100)
                  )}%`,
                }}
              />
            </div>
            <div>
              <span className="text-slate-400">High: </span>
              <span className="font-mono tabular-nums font-semibold text-slate-700">{formatNumber(nifty.high)}</span>
            </div>
          </div>
        </div>

        {/* 2. BANK NIFTY CARD */}
        <div
          id="card-bank-nifty"
          className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold text-slate-900 tracking-tight text-sm">BANK NIFTY</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isBankUp ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {getNiftyStatus(bankNifty)}
            </span>
          </div>

          <div className="flex items-baseline justify-between mt-1.5">
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {formatNumber(bankNifty.value)}
            </div>
            <div
              className={`flex items-center gap-0.5 text-xs font-semibold font-mono ${
                isBankUp ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {isBankUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>
                {isBankUp ? '+' : ''}
                {bankNifty.change.toFixed(2)} ({isBankUp ? '+' : ''}
                {bankNifty.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>

          {/* Intraday Range Strip */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div>
              <span className="text-slate-400">Low: </span>
              <span className="font-mono tabular-nums font-semibold text-slate-700">{formatNumber(bankNifty.low)}</span>
            </div>
            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden mx-2 relative">
              <div
                className={`h-full rounded-full transition-all duration-300 ${isBankUp ? 'bg-emerald-500' : 'bg-rose-500'}`}
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(10, ((bankNifty.value - bankNifty.low) / (bankNifty.high - bankNifty.low || 1)) * 100)
                  )}%`,
                }}
              />
            </div>
            <div>
              <span className="text-slate-400">High: </span>
              <span className="font-mono tabular-nums font-semibold text-slate-700">{formatNumber(bankNifty.high)}</span>
            </div>
          </div>
        </div>

        {/* 3. MARKET OVERALL STATUS CARD */}
        <div
          id="card-market-overall-status"
          className={`p-4 rounded-xl border flex flex-col justify-between ${statusBg} shadow-2xs`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-slate-500" />
              Overall Market Status
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/80 border border-slate-200/80 text-slate-700">
              Live Session
            </span>
          </div>

          <div className="my-auto py-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-base font-black px-3 py-1 rounded-md tracking-wider uppercase ${statusBadge}`}
              >
                {overallStatus}
              </span>
              <span className="text-xs font-semibold text-slate-700">
                {overallStatus === 'BULLISH'
                  ? 'Buyers controlling index trend'
                  : overallStatus === 'BEARISH'
                  ? 'Sellers pressing below VWAP'
                  : 'Consolidating in key pivot band'}
              </span>
            </div>
          </div>

          {/* Market Breadth advances / declines */}
          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">NSE Breadth:</span>
            <div className="flex items-center gap-2 font-mono font-bold">
              <span className="text-emerald-700 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                {breadth.advances} Adv
              </span>
              <span className="text-slate-400">/</span>
              <span className="text-rose-700 flex items-center gap-0.5">
                <TrendingDown className="w-3 h-3" />
                {breadth.declines} Dec
              </span>
              <span className="text-[10px] text-slate-500 font-normal">
                ({Math.round((breadth.advances / (breadth.total || 50)) * 100)}% Bull)
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
