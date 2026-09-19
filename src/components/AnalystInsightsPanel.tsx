import React from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Volume2,
  ShieldAlert,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { AnalystInsight, StockRadarItem } from '../types';
import { ANALYST_INSIGHTS } from '../data/mockData';

interface AnalystInsightsPanelProps {
  insights?: AnalystInsight[];
  onSelectSymbol?: (symbol: string) => void;
}

export const AnalystInsightsPanel: React.FC<AnalystInsightsPanelProps> = ({
  insights = ANALYST_INSIGHTS,
  onSelectSymbol,
}) => {
  const getCategoryIcon = (cat: AnalystInsight['category']) => {
    switch (cat) {
      case 'SECTOR_ROTATION':
        return <TrendingUp className="w-4 h-4 text-purple-600" />;
      case 'VOLUME_SURGE':
        return <Volume2 className="w-4 h-4 text-emerald-600" />;
      case 'RE_ENTRY_ALERT':
        return <Sparkles className="w-4 h-4 text-teal-600" />;
      case 'RISK_NOTE':
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
    }
  };

  const getSentimentBadge = (sentiment: AnalystInsight['sentiment']) => {
    switch (sentiment) {
      case 'BULLISH':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
            BULLISH BIAS
          </span>
        );
      case 'BEARISH':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
            HEDGE / SHORT
          </span>
        );
      case 'NEUTRAL':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
            RANGE BOUND
          </span>
        );
    }
  };

  return (
    <section id="analyst-insights-panel" className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Automated Quantitative Insights</h3>
            <p className="text-[11px] text-slate-500">Real-time narrative derived from sheet algorithms & sector rotation</p>
          </div>
        </div>
        <span className="text-[10px] font-semibold text-slate-400">Live AI & Quant Synthesis</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {insights.map((ins) => (
          <div
            key={ins.id}
            id={`insight-card-${ins.id}`}
            className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                {getCategoryIcon(ins.category)}
                <span className="font-mono text-[11px]">{ins.timestamp}</span>
              </div>
              {getSentimentBadge(ins.sentiment)}
            </div>

            <h4 className="font-bold text-slate-900 text-xs leading-snug">
              {ins.headline}
            </h4>

            <p className="text-xs text-slate-600 leading-relaxed">
              {ins.body}
            </p>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium">Stocks:</span>
                <div className="flex items-center gap-1">
                  {ins.impactedSymbols.map((sym) => (
                    <button
                      key={sym}
                      onClick={() => onSelectSymbol && onSelectSymbol(sym)}
                      className="font-mono font-bold text-slate-800 hover:text-indigo-600 px-1.5 py-0.5 rounded bg-white border border-slate-200 hover:border-indigo-300 transition-colors"
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </div>

              {onSelectSymbol && (
                <button
                  onClick={() => onSelectSymbol(ins.impactedSymbols[0])}
                  className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-0.5"
                >
                  <span>Inspect</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
