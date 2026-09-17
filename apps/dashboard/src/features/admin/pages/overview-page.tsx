import { useQuery } from '@tanstack/react-query';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card, Col, Row, Skeleton, Statistic } from 'antd';
import { formatCompact, formatNumber } from '@/lib/utils';
import { PageHeader } from '../components/page-header';
import { TrafficChart, SourcesDonut, ELEMENT_VARS } from '../components/charts';
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

      <Row gutter={[16, 16]}>
        <Col xs={12} lg={6}>
          <KpiCard label="Lượt xem · 30 ngày" value={views?.value ?? 0} kpi={views} compact />
        </Col>
        <Col xs={12} lg={6}>
          <KpiCard label="Người dùng" value={users?.value ?? 0} kpi={users} compact />
        </Col>
        <Col xs={12} lg={6}>
          <KpiCard label="Lá số đã lập" value={gens?.value ?? 0} kpi={gens} />
        </Col>
        <Col xs={12} lg={6}>
          <KpiCard label="Tỷ lệ lập" value={conversion?.value ?? 0} kpi={conversion} suffix="%" />
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} lg={14}>
          <Card variant="borderless" title="Lưu lượng truy cập">
            <TrafficChart data={data.traffic} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card variant="borderless" title="Nguồn truy cập">
            <div className="grid grid-cols-[auto_1fr] items-center gap-6">
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
                    <span className="tabular-nums ml-auto font-medium">
                      {formatNumber(s.visits)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24}>
          <Card variant="borderless" title="Loại luận giải phổ biến">
            <ul className="space-y-4">
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
          </Card>
        </Col>
      </Row>

      <section className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-6">
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

function KpiCard({
  label,
  value,
  kpi,
  compact,
  suffix,
}: {
  label: string;
  value: number;
  kpi?: KpiStat;
  compact?: boolean;
  suffix?: string;
}) {
  const up = kpi?.trend === 'up';
  return (
    <Card variant="borderless">
      <Statistic
        title={label}
        value={compact ? formatCompact(value) : value}
        suffix={suffix}
        valueStyle={{ fontWeight: 600 }}
      />
      {kpi && (
        <div
          className="mt-2 inline-flex items-center gap-0.5 text-sm font-medium"
          style={{ color: up ? 'var(--kim)' : 'var(--hoa)' }}
        >
          {up ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
          {Math.abs(kpi.deltaPct)}%
        </div>
      )}
    </Card>
  );
}

function OverviewSkeleton() {
  return (
    <div>
      <PageHeader seal="觀" hanReading="Tổng Quan" title="Tổng quan" />
      <div className="grid grid-cols-1 gap-10 border-b border-border pb-10 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-5">
          <Skeleton.Input active size="small" style={{ width: 128 }} />
          <Skeleton.Input active size="large" block />
          <Skeleton active paragraph={{ rows: 2 }} title={false} />
        </div>
        <div className="lg:col-span-7">
          <Skeleton.Node active style={{ width: '100%', height: 280 }} />
        </div>
      </div>
    </div>
  );
}
