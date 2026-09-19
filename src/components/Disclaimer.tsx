import React from 'react';
import { Info } from 'lucide-react';

export const Disclaimer: React.FC = () => {
  return (
    <footer id="dashboard-disclaimer" className="mt-10 pt-5 pb-8 border-t border-slate-200 dark:border-slate-800 text-center space-y-2.5">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 font-medium max-w-3xl mx-auto text-left sm:text-center">
        <Info className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
        <span>
          <strong className="text-slate-800 dark:text-slate-200 font-semibold">Regulatory & Strategy Notice:</strong> Forecasts and signals are generated from quantitative algorithmic models and simulated market data. They are not guaranteed predictions or investment advice.
        </span>
      </div>
      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
        Sevenseas Capital — Pro Trader Terminal • Version 3.0 • Simulated Real-Time Feeds
      </p>
    </footer>
  );
};
