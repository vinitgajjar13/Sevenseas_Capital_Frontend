import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { SectorAnalysisItem } from '../../types';
import { formatNumber } from '../../data/mockData';

interface SectorBreadthChartsProps {
  sectors: SectorAnalysisItem[];
  theme?: 'light' | 'dark';
}

export const SectorBreadthCharts: React.FC<SectorBreadthChartsProps> = ({
  sectors,
  theme = 'light',
}) => {
  // Aggregate overall metrics
  const {
    totalBullishStocks,
    totalBearishStocks,
    bullishStockPercent,
    bearishStockPercent,
    totalBullishVol,
    totalBearishVol,
    bullishVolPercent,
    bearishVolPercent,
  } = useMemo(() => {
    let bullStks = 0;
    let bearStks = 0;
    let bullVol = 0;
    let bearVol = 0;

    sectors.forEach((s) => {
      bullStks += s.positiveStocks;
      bearStks += s.negativeStocks;
      bullVol += s.bullishVolume;
      bearVol += s.bearishVolume;
    });

    const totStks = bullStks + bearStks || 1;
    const totVol = bullVol + bearVol || 1;

    return {
      totalBullishStocks: bullStks,
      totalBearishStocks: bearStks,
      bullishStockPercent: Math.round((bullStks / totStks) * 100),
      bearishStockPercent: Math.round((bearStks / totStks) * 100),
      totalBullishVol: bullVol,
      totalBearishVol: bearVol,
      bullishVolPercent: Math.round((bullVol / totVol) * 100),
      bearishVolPercent: Math.round((bearVol / totVol) * 100),
    };
  }, [sectors]);

  // Sector-by-sector data for Graph 1 (Bullish vs Bearish stock counts)
  const stockCountChartData = useMemo(() => {
    return sectors.map((s) => ({
      name: s.name.replace('Nifty ', ''),
      bullish: s.positiveStocks,
      bearish: s.negativeStocks,
      bullishPercent: s.bullishPercent,
      bearishPercent: s.bearishPercent,
    }));
  }, [sectors]);

  // Sector-by-sector data for Graph 2 (Bullish vs Bearish volume in millions)
  const volumeChartData = useMemo(() => {
    return sectors.map((s) => ({
      name: s.name.replace('Nifty ', ''),
      bullishVol: +(s.bullishVolume / 1000000).toFixed(1),
      bearishVol: +(s.bearishVolume / 1000000).toFixed(1),
      bullishVolPercent: s.bullishVolumePercent,
      bearishVolPercent: s.bearishVolumePercent,
    }));
  }, [sectors]);

  const gridStroke = theme === 'dark' ? '#334155' : '#f1f5f9';
  const axisColor = theme === 'dark' ? '#94a3b8' : '#64748b';

  return (
    <section id="sector-breadth-graphs" className="space-y-3">
      {/* Top 4 KPI Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Metric 1: Bullish Stock % */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Bullish Stock Participation
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {bullishStockPercent}%
            </span>
            <span className="text-xs font-mono text-slate-400">
              {totalBullishStocks} stocks
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${bullishStockPercent}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Bearish Stock % */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Bearish Stock Participation
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black font-mono text-rose-600 dark:text-rose-400">
              {bearishStockPercent}%
            </span>
            <span className="text-xs font-mono text-slate-400">
              {totalBearishStocks} stocks
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-rose-500 rounded-full"
              style={{ width: `${bearishStockPercent}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Bullish Volume % */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Bullish Volume Conviction
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {bullishVolPercent}%
            </span>
            <span className="text-xs font-mono text-slate-400">
              {formatNumber(totalBullishVol)}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${bullishVolPercent}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Bearish Volume % */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Bearish Volume Pressure
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black font-mono text-rose-600 dark:text-rose-400">
              {bearishVolPercent}%
            </span>
            <span className="text-xs font-mono text-slate-400">
              {formatNumber(totalBearishVol)}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-rose-500 rounded-full"
              style={{ width: `${bearishVolPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Dual Graphs: Side by Side on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {/* GRAPH 1: Bullish vs Bearish Stock Count per Sector */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Graph 1: Bullish vs. Bearish Stock Count
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Number of advancing vs. declining stocks across sectors
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Bullish
              </span>
              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
                <span className="w-2.5 h-2.5 rounded bg-rose-500"></span> Bearish
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stockCountChartData}
                margin={{ top: 10, right: 10, left: -15, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis
                  dataKey="name"
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                  tick={{ fontSize: 10, fill: axisColor, fontFamily: 'monospace' }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: axisColor, fontFamily: 'monospace' }}
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="p-2.5 rounded-lg bg-slate-900 dark:bg-slate-950 text-white text-xs font-mono shadow-xl border border-slate-800 space-y-1">
                        <div className="font-bold text-slate-300 border-b border-slate-800 pb-1">
                          Nifty {label}
                        </div>
                        <div className="flex justify-between gap-3 text-emerald-400">
                          <span>Bullish:</span>
                          <span className="font-bold">{d.bullish} ({d.bullishPercent}%)</span>
                        </div>
                        <div className="flex justify-between gap-3 text-rose-400">
                          <span>Bearish:</span>
                          <span className="font-bold">{d.bearish} ({d.bearishPercent}%)</span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="bullish" fill="#10b981" radius={[3, 3, 0, 0]} name="Bullish Stocks" />
                <Bar dataKey="bearish" fill="#f43f5e" radius={[3, 3, 0, 0]} name="Bearish Stocks" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRAPH 2: Bullish vs Bearish Volume per Sector */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Graph 2: Bullish vs. Bearish Volume (in M)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Capital trading volume backing positive vs. negative momentum
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Bull Vol
              </span>
              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
                <span className="w-2.5 h-2.5 rounded bg-rose-500"></span> Bear Vol
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={volumeChartData}
                margin={{ top: 10, right: 10, left: -10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis
                  dataKey="name"
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                  tick={{ fontSize: 10, fill: axisColor, fontFamily: 'monospace' }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: axisColor, fontFamily: 'monospace' }}
                  tickFormatter={(val) => `${val}M`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="p-2.5 rounded-lg bg-slate-900 dark:bg-slate-950 text-white text-xs font-mono shadow-xl border border-slate-800 space-y-1">
                        <div className="font-bold text-slate-300 border-b border-slate-800 pb-1">
                          Nifty {label}
                        </div>
                        <div className="flex justify-between gap-3 text-emerald-400">
                          <span>Bullish Vol:</span>
                          <span className="font-bold">{d.bullishVol}M ({d.bullishVolPercent}%)</span>
                        </div>
                        <div className="flex justify-between gap-3 text-rose-400">
                          <span>Bearish Vol:</span>
                          <span className="font-bold">{d.bearishVol}M ({d.bearishVolPercent}%)</span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="bullishVol" fill="#10b981" radius={[3, 3, 0, 0]} name="Bullish Vol" />
                <Bar dataKey="bearishVol" fill="#f43f5e" radius={[3, 3, 0, 0]} name="Bearish Vol" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
};

