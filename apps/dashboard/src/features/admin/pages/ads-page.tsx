import { useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, ExternalLink, MousePointerClick, Eye, Link2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/lib/utils';
import { PageHeader } from '../components/page-header';
import { adminQueries } from '../data/queries';
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

      <Tabs defaultValue="redirects">
        <div className="mb-4 flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="redirects">
              <Link2 /> Liên kết
            </TabsTrigger>
            <TabsTrigger value="popups">
              <Eye /> Popup
            </TabsTrigger>
          </TabsList>
          <Button onClick={() => setEditorOpen(true)}>
            <Plus /> Thêm mới
          </Button>
        </div>

        <TabsContent value="redirects">
          {isLoading || !data ? (
            <Skeleton className="h-64 w-full rounded-xl" />
          ) : (
            <RedirectsTable redirects={data.redirects} />
          )}
        </TabsContent>

        <TabsContent value="popups">
          {isLoading || !data ? (
            <Skeleton className="h-64 w-full rounded-xl" />
          ) : (
            <PopupsGrid popups={data.popups} ctr={ctr} triggerLabel={TRIGGER_LABEL} />
          )}
        </TabsContent>
      </Tabs>

      <AdEditorDialog open={editorOpen} onOpenChange={setEditorOpen} />
    </div>
  );
}

function RedirectsTable({ redirects }: { redirects: AdRedirect[] }) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Chiến dịch</TableHead>
            <TableHead>Đường dẫn</TableHead>
            <TableHead>Đích đến</TableHead>
            <TableHead className="text-right">Lượt nhấp</TableHead>
            <TableHead className="text-center">Kích hoạt</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {redirects.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.label}</TableCell>
              <TableCell>
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-primary">
                  {r.slug}
                </code>
              </TableCell>
              <TableCell className="max-w-[220px]">
                <a
                  href={r.target}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 truncate text-sm text-muted-foreground hover:text-foreground"
                >
                  <span className="truncate">{r.target}</span>
                  <ExternalLink className="size-3 shrink-0" />
                </a>
              </TableCell>
              <TableCell className="tabular-nums text-right">{formatNumber(r.clicks)}</TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center">
                  <Switch defaultChecked={r.active} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {popups.map((p) => (
        <Card key={p.id} className="gap-4">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="font-display text-base">{p.name}</CardTitle>
                <CardDescription>{triggerLabel[p.trigger]}</CardDescription>
              </div>
              <Badge variant={p.active ? 'success' : 'neutral'}>
                {p.active ? 'Đang chạy' : 'Tạm dừng'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <Metric
                icon={<Eye className="size-3.5" />}
                label="Hiển thị"
                value={formatNumber(p.impressions)}
              />
              <Metric
                icon={<MousePointerClick className="size-3.5" />}
                label="Nhấp"
                value={formatNumber(p.clicks)}
              />
              <Metric label="CTR" value={ctrFn(p.clicks, p.impressions)} />
            </div>
            <div className="flex items-center justify-between border-t pt-3">
              <span className="truncate text-xs text-muted-foreground">→ {p.target}</span>
              <Switch defaultChecked={p.active} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Metric({ icon, label, value }: { icon?: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/60 p-2">
      <p className="tabular-nums flex items-center justify-center gap-1 text-sm font-semibold">
        {icon}
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
