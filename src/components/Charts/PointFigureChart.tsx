import { useMemo } from 'react';
import type { Candle } from './types';
import { UP, DOWN } from './types';
import { pointAndFigure } from './indicators';

interface Props {
  candles: Candle[];
  boxSize: number;
  reversal?: number;
  theme: 'light' | 'dark';
  height?: number;
}

const CELL = 18;
const GUTTER = 64;

export default function PointFigureChart({ candles, boxSize, reversal = 3, theme, height = 560 }: Props) {
  const cols = useMemo(() => pointAndFigure(candles, boxSize, reversal), [candles, boxSize, reversal]);
  const dark = theme === 'dark';

  if (!cols.length) {
    return (
      <div className="flex items-center justify-center text-sm text-slate-500" style={{ height }}>
        Not enough price movement for this box size. Try a smaller box.
      </div>
    );
  }

  const lo = Math.min(...cols.map((c) => c.lo));
  const hi = Math.max(...cols.map((c) => c.hi));
  const rows = hi - lo + 1;
  const w = GUTTER + cols.length * CELL + 8;
  const h = rows * CELL + 8;
  const y = (box: number) => (hi - box) * CELL + 4; // top of the cell for a box index
  const grid = dark ? '#1c232d' : '#eceff3';
  const label = dark ? '#9aa4b2' : '#475467';

  return (
    <div className="overflow-auto rounded-lg border border-slate-200 dark:border-slate-800" style={{ height }}>
      <svg width={w} height={h} role="img" aria-label="Point and figure chart">
        {Array.from({ length: rows }, (_, i) => {
          const box = hi - i;
          return (
            <g key={box}>
              <line x1={GUTTER} x2={w} y1={y(box)} y2={y(box)} stroke={grid} />
              {i % 2 === 0 && <text x={GUTTER - 8} y={y(box) + CELL * 0.7} fontSize={11} textAnchor="end" fill={label}>{(box * boxSize).toFixed(boxSize < 1 ? 2 : 0)}</text>}
            </g>
          );
        })}
        {cols.map((c, ci) => {
          const cx = GUTTER + ci * CELL + CELL / 2;
          return Array.from({ length: c.hi - c.lo + 1 }, (_, k) => {
            const box = c.lo + k;
            const cy = y(box) + CELL / 2;
            return c.type === 'X' ? (
              <g key={`${ci}-${box}`} stroke={UP} strokeWidth={1.6}>
                <line x1={cx - 5} y1={cy - 5} x2={cx + 5} y2={cy + 5} />
                <line x1={cx - 5} y1={cy + 5} x2={cx + 5} y2={cy - 5} />
              </g>
            ) : (
              <circle key={`${ci}-${box}`} cx={cx} cy={cy} r={5.5} fill="none" stroke={DOWN} strokeWidth={1.6} />
            );
          });
        })}
      </svg>
    </div>
  );
}
