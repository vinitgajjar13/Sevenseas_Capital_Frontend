import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { OrderBook } from './types';
import { UP, DOWN } from './types';
import { cumulativeDepth } from './indicators';

interface Props {
  book: OrderBook;
  height?: number;
  theme?: 'light' | 'dark';
}

/** Market-depth chart: cumulative bid (green) and ask (red) quantity by price. */
export default function DepthChart({ book, height = 560, theme }: Props) {
  const { data, mid } = useMemo(() => {
    const bidsList = book?.bids || [];
    const asksList = book?.asks || [];
    const bids = cumulativeDepth(bidsList).map((l) => ({ price: l.price, bid: l.total, ask: null as number | null }));
    const asks = cumulativeDepth(asksList).map((l) => ({ price: l.price, ask: l.total, bid: null as number | null }));
    const rows = [...bids.reverse(), ...asks];
    const midPrice = bidsList.length && asksList.length ? (bidsList[0].price + asksList[0].price) / 2 : 1500;
    return { data: rows, mid: midPrice };
  }, [book]);

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,.15)" />
          <XAxis
            dataKey="price"
            type="number"
            domain={['dataMin', 'dataMax']}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            stroke="#94a3b8"
            tickFormatter={(v) => Number(v).toFixed(1)}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            stroke="#94a3b8"
            width={56}
            tickFormatter={(v) => (Number(v) >= 1000 ? `${(Number(v) / 1000).toFixed(1)}k` : String(v))}
          />
          <Tooltip
            formatter={(v: any) => [v == null ? '' : Number(v).toLocaleString('en-IN'), 'Cumulative Qty']}
            labelFormatter={(l) => `Price: ₹${Number(l).toFixed(2)}`}
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              color: '#f8fafc',
              borderRadius: '8px',
              fontSize: '12px',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
            }}
            itemStyle={{ color: '#f8fafc' }}
          />
          <ReferenceLine
            x={mid}
            stroke="#94a3b8"
            strokeDasharray="4 4"
            label={{ value: `Mid ₹${mid.toFixed(2)}`, fontSize: 11, fill: '#94a3b8', position: 'top' }}
          />
          <Area type="stepAfter" dataKey="bid" stroke={UP} fill={UP} fillOpacity={0.25} connectNulls={false} isAnimationActive={false} />
          <Area type="stepBefore" dataKey="ask" stroke={DOWN} fill={DOWN} fillOpacity={0.25} connectNulls={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
