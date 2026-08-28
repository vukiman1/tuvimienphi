import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatCompact, formatNumber } from '@/lib/utils';
import { PageHeader } from '../components/page-header';
import { TrafficChart, SourcesDonut, ELEMENT_VARS } from '../components/charts';
import { useCountUp } from '../components/use-count-up';
import { adminQueries } from '../data/queries';
import type { KpiStat } from '../data/types';

const ELEMENT_LABEL: Record<string, string> = {
  kim: 'Kim',
  moc: 'Mộc',
  thuy: 'Thủy',
  hoa: 'Hỏa',
  tho: 'Thổ',
};

function byKey(kpis: KpiStat[], key: string) {
  return kpis.find((k) => k.key === key);
}

export function OverviewPage() {
  const { data, isLoading } = useQuery(adminQueries.overview());

  if (isLoading || !data) return <OverviewSkeleton />;

  const views = byKey(data.kpis, 'views');
  const users = byKey(data.kpis, 'users');
  const gens = byKey(data.kpis, 'gens');
  const conversion = byKey(data.kpis, 'conversion');
  const maxGen = Math.max(...data.genByType.map((g) => g.count));

  return (
    <div>
      <PageHeader seal="觀" hanReading="Tổng Quan" title="Tổng quan" />

      {/* ── Hero: one dominant figure + inline secondary stats, chart to the side ── */}
      <section className="grid grid-cols-1 items-end gap-x-10 gap-y-8 border-b border-border pb-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="font-label text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
            Lượt xem · 30 ngày qua
          </p>
          <div className="mt-3 flex items-end gap-3">
            <BigNumber value={views?.value ?? 0} />
            {views && <Delta pct={views.deltaPct} up={views.trend === 'up'} />}
          </div>

          <div className="mt-8 flex divide-x divide-border">
            <InlineStat
              label="Người dùng"
              value={formatCompact(users?.value ?? 0)}
              deltaPct={users?.deltaPct}
              up={users?.trend === 'up'}
              className="pr-6"
            />
            <InlineStat
              label="Lá số đã lập"
              value={formatNumber(gens?.value ?? 0)}
              className="px-6"
            />
            <InlineStat
              label="Tỷ lệ lập"
              value={`${conversion?.value ?? 0}%`}
              deltaPct={conversion?.deltaPct}
              up={conversion?.trend === 'up'}
              className="pl-6"
            />
          </div>
        </div>

        <div className="lg:col-span-7">
          <TrafficChart data={data.traffic} />
        </div>
      </section>

      {/* ── Secondary: ranked list (left, wider) + sources (right, narrower) ── */}
      <section className="grid grid-cols-1 gap-x-12 gap-y-10 pt-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <SectionTitle>Loại luận giải phổ biến</SectionTitle>
          <ul className="mt-5 space-y-4">
            {data.genByType.map((g) => (
              <li key={g.type}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium">{g.type}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {formatNumber(g.count)}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(g.count / maxGen) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-5">
          <SectionTitle>Nguồn truy cập</SectionTitle>
          <div className="mt-3 grid grid-cols-[auto_1fr] items-center gap-6">
            <div className="w-40">
              <SourcesDonut data={data.sources} />
            </div>
            <ul className="space-y-2.5">
              {data.sources.map((s) => (
                <li key={s.source} className="flex items-center gap-2 text-sm">
                  <span
                    className="size-2 rounded-full"
                    style={{ background: ELEMENT_VARS[s.element] }}
                  />
                  <span className="text-muted-foreground">{s.source}</span>
                  <span className="font-label text-[10px] text-muted-foreground/70">
                    {ELEMENT_LABEL[s.element]}
                  </span>
                  <span className="tabular-nums ml-auto font-medium">{formatNumber(s.visits)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Luận ngày: a slim almanac line, not a boxed card ── */}
      <section className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-6">
        <span className="font-seal text-lg text-primary">Bính Ngọ</span>
        <span className="text-sm text-muted-foreground">
          Hôm nay khí Hỏa vượng — thuận khai trương, ký kết; kỵ động thổ hướng Bắc.
        </span>
        <div className="ml-auto flex gap-2">
          {['Cát: Khai trương', 'Cát: Xuất hành', 'Kỵ: Động thổ'].map((t) => (
            <span
              key={t}
              className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

function BigNumber({ value }: { value: number }) {
  const live = useCountUp(value);
  return (
    <span className="tabular-nums text-6xl leading-none font-semibold tracking-tight">
      {formatCompact(Math.round(live))}
    </span>
  );
}

function Delta({ pct, up }: { pct: number; up: boolean }) {
  return (
    <span
      className={cn(
        'mb-1.5 inline-flex items-center gap-0.5 text-sm font-medium',
        up ? 'text-emerald-500' : 'text-destructive',
      )}
    >
      {up ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
      {Math.abs(pct)}%
    </span>
  );
}

function InlineStat({
  label,
  value,
  deltaPct,
  up,
  className,
}: {
  label: string;
  value: string;
  deltaPct?: number;
  up?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="font-label text-[11px] tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="tabular-nums mt-1 text-2xl font-semibold">{value}</p>
      {deltaPct !== undefined && (
        <p className={cn('mt-0.5 text-xs', up ? 'text-emerald-500' : 'text-destructive')}>
          {up ? '↑' : '↓'} {Math.abs(deltaPct)}%
        </p>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="font-display text-xl font-semibold">{children}</h2>;
}

function OverviewSkeleton() {
  return (
    <div>
      <PageHeader seal="觀" hanReading="Tổng Quan" title="Tổng quan" />
      <div className="grid grid-cols-1 gap-10 border-b border-border pb-10 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-16 w-56" />
          <Skeleton className="h-14 w-full" />
        </div>
        <div className="lg:col-span-7">
          <Skeleton className="h-[280px] w-full" />
        </div>
      </div>
    </div>
  );
}
