import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Pencil } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatNumber } from '@/lib/utils';
import { PageHeader } from '../components/page-header';
import { PaginationBar } from '../components/pagination-bar';
import { usePagination } from '../components/use-pagination';
import { adminQueries } from '../data/queries';
import { VanHanEditorDialog } from './van-han-editor-dialog';
import type { VanHanEntry, VanHanRating } from '../data/types';

const RATING_META: Record<
  VanHanRating,
  { label: string; variant: 'success' | 'neutral' | 'destructive' }
> = {
  cat: { label: 'Cát', variant: 'success' },
  binh: { label: 'Bình', variant: 'neutral' },
  hung: { label: 'Hung', variant: 'destructive' },
};

export function VanHanPage() {
  const { data: entries, isLoading } = useQuery(adminQueries.vanHan());
  const [rating, setRating] = useState<VanHanRating | 'all'>('all');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<VanHanEntry | null>(null);

  const openNew = () => {
    setEditingEntry(null);
    setEditorOpen(true);
  };
  const openEdit = (entry: VanHanEntry) => {
    setEditingEntry(entry);
    setEditorOpen(true);
  };

  const filtered = useMemo(() => {
    if (!entries) return [];
    return rating === 'all' ? entries : entries.filter((e) => e.rating === rating);
  }, [entries, rating]);

  const pager = usePagination(filtered, 8);
  const publishedCount = entries?.filter((e) => e.published).length ?? 0;

  return (
    <div>
      <PageHeader
        seal="運"
        hanReading="Vận Hạn"
        title="Dữ liệu vận hạn"
        subtitle="Sao chiếu mệnh và luận giải theo tuổi cho năm Bính Ngọ 2026."
        actions={
          <Button onClick={openNew}>
            <Plus /> Thêm dòng
          </Button>
        }
      />

      <div className="mb-8 flex flex-wrap gap-x-10 gap-y-4 border-b border-border pb-6">
        <Stat label="Tổng số dòng" value={formatNumber(entries?.length ?? 0)} />
        <Stat label="Đã xuất bản" value={formatNumber(publishedCount)} />
        <Stat label="Năm" value="2026" />
        <Stat label="Can chi" value="Bính Ngọ" seal />
      </div>

      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex items-center justify-between gap-3 border-b p-4">
          <Select value={rating} onValueChange={(v) => setRating(v as VanHanRating | 'all')}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Mọi mức</SelectItem>
              <SelectItem value="cat">Cát</SelectItem>
              <SelectItem value="binh">Bình</SelectItem>
              <SelectItem value="hung">Hung</SelectItem>
            </SelectContent>
          </Select>
          <p className="hidden text-sm text-muted-foreground sm:block">
            {formatNumber(filtered.length)} dòng
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">Tuổi</TableHead>
              <TableHead>Sao chiếu mệnh</TableHead>
              <TableHead>Mức</TableHead>
              <TableHead>Luận giải</TableHead>
              <TableHead>Cập nhật</TableHead>
              <TableHead className="text-center">Xuất bản</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : pager.pageItems.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="tabular-nums text-right font-medium">
                      {entry.age}
                    </TableCell>
                    <TableCell>{entry.star}</TableCell>
                    <TableCell>
                      <Badge variant={RATING_META[entry.rating].variant}>
                        {RATING_META[entry.rating].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-sm">
                      <p className="truncate text-sm text-muted-foreground">{entry.summary}</p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(entry.updatedAt)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <Switch defaultChecked={entry.published} />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Sửa"
                        onClick={() => openEdit(entry)}
                      >
                        <Pencil />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
        {!isLoading && (
          <PaginationBar
            page={pager.page}
            totalPages={pager.totalPages}
            rangeStart={pager.rangeStart}
            rangeEnd={pager.rangeEnd}
            totalItems={pager.totalItems}
            onPage={pager.setPage}
            unit="dòng"
          />
        )}
      </Card>

      <VanHanEditorDialog open={editorOpen} onOpenChange={setEditorOpen} entry={editingEntry} />
    </div>
  );
}

function Stat({ label, value, seal }: { label: string; value: string; seal?: boolean }) {
  return (
    <div>
      <p className="font-label text-[11px] tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p
        className={
          seal ? 'font-seal mt-1 text-2xl text-primary' : 'tabular-nums mt-1 text-2xl font-semibold'
        }
      >
        {value}
      </p>
    </div>
  );
}
