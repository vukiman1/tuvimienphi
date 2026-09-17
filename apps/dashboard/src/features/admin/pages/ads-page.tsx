import { useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, ExternalLink, MousePointerClick, Eye, Link2 } from 'lucide-react';
import {
  App,
  Button,
  Card,
  Col,
  Row,
  Skeleton,
  Statistic,
  Switch,
  Table,
  Tabs,
  Tag,
  type TableColumnsType,
} from 'antd';
import { formatNumber } from '@/lib/utils';
import { PageHeader } from '../components/page-header';
import { adminQueries } from '../data/queries';
import { useToggleAdPopupActive, useToggleAdRedirectActive } from '../data/mutations';
import { AdEditorDialog } from './ad-editor-dialog';
import type { AdPopup, AdRedirect, PopupTrigger } from '../data/types';

const TRIGGER_LABEL: Record<PopupTrigger, string> = {
  'on-load': 'Khi tải trang',
  'exit-intent': 'Khi rời trang',
  'scroll-50': 'Cuộn 50%',
  'timed-15s': 'Sau 15 giây',
};

function ctr(clicks: number, impressions: number): string {
  if (!impressions) return '—';
  return `${((clicks / impressions) * 100).toFixed(1).replace('.', ',')}%`;
}

export function AdsPage() {
  const { data, isLoading } = useQuery(adminQueries.ads());
  const [editorOpen, setEditorOpen] = useState(false);

  return (
    <div>
      <PageHeader
        seal="告"
        hanReading="Cáo Bạch"
        title="Quản lý quảng cáo"
        subtitle="Liên kết chuyển hướng và popup hiển thị trên trang."
      />

      <Tabs
        defaultActiveKey="redirects"
        tabBarExtraContent={
          <Button
            type="primary"
            icon={<Plus className="size-4" />}
            onClick={() => setEditorOpen(true)}
          >
            Thêm mới
          </Button>
        }
        items={[
          {
            key: 'redirects',
            label: (
              <span className="inline-flex items-center gap-1.5">
                <Link2 className="size-4" /> Liên kết
              </span>
            ),
            children:
              isLoading || !data ? (
                <Skeleton.Node active style={{ width: '100%', height: 256 }} />
              ) : (
                <RedirectsTable redirects={data.redirects} />
              ),
          },
          {
            key: 'popups',
            label: (
              <span className="inline-flex items-center gap-1.5">
                <Eye className="size-4" /> Popup
              </span>
            ),
            children:
              isLoading || !data ? (
                <Skeleton.Node active style={{ width: '100%', height: 256 }} />
              ) : (
                <PopupsGrid popups={data.popups} ctr={ctr} triggerLabel={TRIGGER_LABEL} />
              ),
          },
        ]}
      />

      <AdEditorDialog open={editorOpen} onOpenChange={setEditorOpen} />
    </div>
  );
}

function RedirectsTable({ redirects }: { redirects: AdRedirect[] }) {
  const { message } = App.useApp();
  const toggle = useToggleAdRedirectActive();

  const onToggle = async (id: string) => {
    try {
      await toggle.mutateAsync(id);
    } catch {
      message.error('Không thể cập nhật trạng thái.');
    }
  };

  const columns: TableColumnsType<AdRedirect> = [
    {
      title: 'Chiến dịch',
      dataIndex: 'label',
      render: (label: string) => <span className="font-medium">{label}</span>,
    },
    {
      title: 'Đường dẫn',
      dataIndex: 'slug',
      render: (slug: string) => (
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-primary">{slug}</code>
      ),
    },
    {
      title: 'Đích đến',
      dataIndex: 'target',
      render: (target: string) => (
        <a
          href={target}
          target="_blank"
          rel="noreferrer"
          className="flex max-w-[220px] items-center gap-1 truncate text-sm text-muted-foreground hover:text-foreground"
        >
          <span className="truncate">{target}</span>
          <ExternalLink className="size-3 shrink-0" />
        </a>
      ),
    },
    {
      title: 'Lượt nhấp',
      dataIndex: 'clicks',
      align: 'right',
      render: (clicks: number) => <span className="tabular-nums">{formatNumber(clicks)}</span>,
    },
    {
      title: 'Kích hoạt',
      dataIndex: 'active',
      align: 'center',
      render: (active: boolean, row) => (
        <Switch checked={active} onChange={() => onToggle(row.id)} />
      ),
    },
  ];

  return (
    <Card variant="borderless" styles={{ body: { padding: 0 } }}>
      <Table<AdRedirect> rowKey="id" columns={columns} dataSource={redirects} pagination={false} />
    </Card>
  );
}

function PopupsGrid({
  popups,
  ctr: ctrFn,
  triggerLabel,
}: {
  popups: AdPopup[];
  ctr: (c: number, i: number) => string;
  triggerLabel: Record<PopupTrigger, string>;
}) {
  const { message } = App.useApp();
  const toggle = useToggleAdPopupActive();

  const onToggle = async (id: string) => {
    try {
      await toggle.mutateAsync(id);
    } catch {
      message.error('Không thể cập nhật trạng thái.');
    }
  };

  return (
    <Row gutter={[16, 16]}>
      {popups.map((p) => (
        <Col key={p.id} xs={24} md={12} xl={8}>
          <Card
            variant="borderless"
            title={
              <div>
                <p className="font-display text-base font-semibold">{p.name}</p>
                <p className="text-sm font-normal text-muted-foreground">
                  {triggerLabel[p.trigger]}
                </p>
              </div>
            }
            extra={
              <Tag color={p.active ? 'green' : 'default'}>
                {p.active ? 'Đang chạy' : 'Tạm dừng'}
              </Tag>
            }
          >
            <Row gutter={8} className="text-center">
              <Col span={8}>
                <Metric
                  icon={<Eye className="size-3.5" />}
                  label="Hiển thị"
                  value={formatNumber(p.impressions)}
                />
              </Col>
              <Col span={8}>
                <Metric
                  icon={<MousePointerClick className="size-3.5" />}
                  label="Nhấp"
                  value={formatNumber(p.clicks)}
                />
              </Col>
              <Col span={8}>
                <Metric label="CTR" value={ctrFn(p.clicks, p.impressions)} />
              </Col>
            </Row>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <span className="truncate text-xs text-muted-foreground">→ {p.target}</span>
              <Switch checked={p.active} onChange={() => onToggle(p.id)} />
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}

function Metric({ icon, label, value }: { icon?: ReactNode; label: string; value: string }) {
  return (
    <Statistic
      title={label}
      value={value}
      prefix={icon}
      valueStyle={{ fontSize: 14, fontWeight: 600 }}
    />
  );
}
