import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { formatCompact, formatNumber } from '@/lib/utils';
import type { SourceSlice, TrafficPoint } from '../data/types';

const ELEMENT_VARS: Record<SourceSlice['element'], string> = {
  kim: 'var(--kim)',
  moc: 'var(--moc)',
  thuy: 'var(--thuy)',
  hoa: 'var(--hoa)',
  tho: 'var(--tho)',
};

const axisProps = {
  stroke: 'var(--muted-foreground)',
  fontSize: 11,
  tickLine: false,
  axisLine: false,
} as const;

const ANIM = {
  isAnimationActive: true,
  animationDuration: 900,
  animationEasing: 'ease-out',
} as const;

function shortDay(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
}

/* ------------------------------------------------ Tooltip ------------------------------------- */

interface TooltipEntry {
  name?: string;
  value?: number | string;
  color?: string;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs">
      {label && <p className="font-label mb-1 font-medium text-foreground">{label}</p>}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-muted-foreground">
          <span
            className="size-2 rounded-full"
            style={{ background: entry.color, boxShadow: `0 0 6px ${entry.color}` }}
          />
          <span>{entry.name}</span>
          <span className="tabular-nums ml-auto font-medium text-foreground">
            {typeof entry.value === 'number' ? formatNumber(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------ Traffic ------------------------------------- */

export function TrafficChart({ data }: { data: TrafficPoint[] }) {
  const rows = data.map((p) => ({ ...p, label: shortDay(p.date) }));
  return (
    <div className="chart-glow">
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
          <defs>
            <linearGradient id="fill-views" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.45} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="fill-users" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--thuy)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--thuy)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="stroke-views" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.7} />
              <stop offset="50%" stopColor="var(--primary)" stopOpacity={1} />
              <stop offset="100%" stopColor="var(--kim)" stopOpacity={0.9} />
            </linearGradient>
          </defs>
          {/* Dotted horizontal rules only — reads like a faint celestial grid. */}
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="1 5" />
          <XAxis dataKey="label" {...axisProps} minTickGap={24} />
          <YAxis {...axisProps} width={44} tickFormatter={(v: number) => formatCompact(v)} />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ stroke: 'var(--primary)', strokeOpacity: 0.3 }}
          />
          <Area
            type="monotone"
            dataKey="users"
            name="Người dùng"
            stroke="var(--thuy)"
            strokeWidth={1.5}
            fill="url(#fill-users)"
            activeDot={{ r: 4, fill: 'var(--thuy)', stroke: 'var(--background)', strokeWidth: 2 }}
            {...ANIM}
          />
          <Area
            type="monotone"
            dataKey="views"
            name="Lượt xem"
            stroke="url(#stroke-views)"
            strokeWidth={2.5}
            fill="url(#fill-views)"
            activeDot={{
              r: 5,
              fill: 'var(--primary)',
              stroke: 'var(--background)',
              strokeWidth: 2,
            }}
            {...ANIM}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ------------------------------------------------ Sources ------------------------------------- */

export function SourcesDonut({ data }: { data: SourceSlice[] }) {
  const total = data.reduce((acc, s) => acc + s.visits, 0);
  return (
    <div className="chart-glow relative">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            dataKey="visits"
            nameKey="source"
            innerRadius={62}
            outerRadius={92}
            paddingAngle={3}
            cornerRadius={6}
            strokeWidth={0}
            {...ANIM}
          >
            {data.map((slice) => (
              <Cell key={slice.source} fill={ELEMENT_VARS[slice.element]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      {/* Center total. */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="tabular-nums text-2xl font-semibold text-glow">
          {formatCompact(total)}
        </span>
        <span className="font-label text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
          Lượt truy cập
        </span>
      </div>
    </div>
  );
}

export { ELEMENT_VARS };
