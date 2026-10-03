import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';
import type { HeatmapItem } from './types';

interface Props {
  items: HeatmapItem[];
  onSelect?: (symbol: string) => void;
  height?: number;
  theme?: 'light' | 'dark';
}

/** Diverging colour: red <-> neutral <-> green, saturating at ±3%. */
function colour(change: number) {
  const k = Math.min(Math.abs(change) / 3, 1);
  const a = 0.35 + k * 0.55;
  return change >= 0 ? `rgba(31,169,113,${a})` : `rgba(229,72,77,${a})`;
}

export default function MarketHeatmap({ items, onSelect, height = 560, theme }: Props) {
  const data: any[] = Object.values(
    items.reduce<Record<string, { name: string; children: HeatmapItem[] }>>((acc, it) => {
      (acc[it.sector] ??= { name: it.sector, children: [] }).children.push(it);
      return acc;
    }, {}),
  );

  return (
    <div style={{ height }} className="w-full text-slate-800 dark:text-slate-200">
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={data}
          dataKey="size"
          stroke="#0000"
          isAnimationActive={false}
          content={(p: any) => {
            const { x, y, width, height: hh, name, change, depth } = p;
            if (depth < 2) {
              return width > 70 && hh > 20 && depth === 1 ? (
                <text
                  x={x + 6}
                  y={y + 14}
                  fontSize={11}
                  fill="currentColor"
                  className="fill-slate-600 dark:fill-slate-300 font-bold"
                  opacity={0.75}
                >
                  {name}
                </text>
              ) : <g />;
            }
            return (
              <g
                onClick={() => onSelect?.(name)}
                style={{ cursor: onSelect ? 'pointer' : 'default' }}
                className="transition-opacity hover:opacity-90"
              >
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={hh}
                  fill={colour(change)}
                  stroke="rgba(128,128,128,.35)"
                  rx={3}
                />
                {width > 48 && hh > 30 && (
                  <>
                    <text
                      x={x + width / 2}
                      y={y + hh / 2 - 2}
                      textAnchor="middle"
                      fontSize={width < 64 ? 10 : 12}
                      fontWeight={700}
                      fill="#ffffff"
                      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}
                    >
                      {name}
                    </text>
                    <text
                      x={x + width / 2}
                      y={y + hh / 2 + (width < 64 ? 10 : 13)}
                      textAnchor="middle"
                      fontSize={width < 64 ? 9 : 11}
                      fontWeight={600}
                      fill="#ffffff"
                      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}
                    >
                      {change > 0 ? '+' : ''}{change.toFixed(2)}%
                    </text>
                  </>
                )}
              </g>
            );
          }}
        >
          <Tooltip
            formatter={(_: any, __: any, e: any) => [
              `${(e?.payload?.change ?? 0) > 0 ? '+' : ''}${e?.payload?.change ?? 0}%`,
              'Change',
            ]}
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
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}
