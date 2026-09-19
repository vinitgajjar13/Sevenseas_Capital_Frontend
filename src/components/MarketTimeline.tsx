import React from 'react';
import { Clock, CheckCircle2, PlayCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { TimelineStep } from '../types';

interface MarketTimelineProps {
  steps: TimelineStep[];
}

export const MarketTimeline: React.FC<MarketTimelineProps> = ({ steps }) => {
  return (
    <section id="market-timeline-section" className="bg-white rounded-lg border border-slate-200 shadow-2xs p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">Market Session Timeline</h2>
        </div>
        <span className="text-[11px] font-medium text-slate-500">
          Trading Hours: 09:15 AM – 03:30 PM IST (NSE Equities & Derivatives)
        </span>
      </div>

      {/* Visual Timeline Stepper */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {steps.map((step, idx) => {
          const isCompleted = step.status === 'COMPLETED';
          const isActive = step.status === 'ACTIVE';
          const isPending = step.status === 'PENDING';

          return (
            <div
              key={idx}
              id={`timeline-step-${idx}`}
              className={`relative p-3 rounded-lg border transition-colors ${
                isActive
                  ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400/50'
                  : isCompleted
                  ? 'bg-slate-50 border-slate-200'
                  : 'bg-white border-slate-200 opacity-70'
              }`}
            >
              {/* Header with status pill & time */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-tight">
                  {step.time}
                </span>
                {isCompleted && (
                  <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    DONE
                  </span>
                )}
                {isActive && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-200/80 px-1.5 py-0.2 rounded animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    LIVE
                  </span>
                )}
                {isPending && (
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                    UPCOMING
                  </span>
                )}
              </div>

              {/* Title & Desc */}
              <h3 className={`text-xs font-bold ${isActive ? 'text-emerald-950' : 'text-slate-900'}`}>
                {step.title}
              </h3>
              <p className="text-[11px] text-slate-600 font-medium mt-0.5 leading-snug">
                {step.description}
              </p>

              {/* Subtle detail */}
              <p className="text-[10px] text-slate-400 mt-1.5 border-t border-slate-200/60 pt-1 leading-tight">
                {step.detail}
              </p>
            </div>
          );
        })}
      </div>

      {/* Quick Summary Pill at bottom */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800">Current Phase:</span>
          <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
            Live Monitoring & Trailing Execution
          </span>
        </div>
        <div className="text-[11px] text-slate-500 font-mono">
          Mandatory Auto Square-Off scheduled at <strong className="text-slate-800">03:15 PM IST</strong>
        </div>
      </div>
    </section>
  );
};
