import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Pencil } from 'lucide-react';
import { App, Button, Select, Switch, Table, Tag, type TableColumnsType } from 'antd';
import { formatDate, formatNumber } from '@/lib/utils';
import { PageHeader } from '../components/page-header';
import { adminQueries } from '../data/queries';
import { useToggleVanHanPublished } from '../data/mutations';
import { VanHanEditorDialog } from './van-han-editor-dialog';
import type { VanHanEntry, VanHanRating } from '../data/types';

const RATING_META: Record<VanHanRating, { label: string; color: string }> = {
  cat: { label: 'Cát', color: 'green' },
  binh: { label: 'Bình', color: 'default' },
  hung: { label: 'Hung', color: 'red' },
};

export function VanHanPage() {
  const { data: entries, isLoading } = useQuery(adminQueries.vanHan());
  const { message } = App.useApp();
  const togglePublished = useToggleVanHanPublished();
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

  const publishedCount = entries?.filter((e) => e.published).length ?? 0;

  const onTogglePublished = async (id: string) => {
    try {
      await togglePublished.mutateAsync(id);
    } catch {
      message.error('Không thể cập nhật trạng thái xuất bản.');
    }
  };

  const columns: TableColumnsType<VanHanEntry> = [
    {
      title: 'Tuổi',
      dataIndex: 'age',
      align: 'right',
      render: (age: number) => <span className="tabular-nums font-medium">{age}</span>,
    },
    { title: 'Sao chiếu mệnh', dataIndex: 'star' },
    {
      title: 'Mức',
      dataIndex: 'rating',
      render: (r: VanHanRating) => <Tag color={RATING_META[r].color}>{RATING_META[r].label}</Tag>,
    },
    {
      title: 'Luận giải',
      dataIndex: 'summary',
      render: (summary: string) => (
        <p className="max-w-sm truncate text-sm text-muted-foreground">{summary}</p>
      ),
    },
    {
      title: 'Cập nhật',
      dataIndex: 'updatedAt',
      render: (updatedAt: string) => (
        <span className="text-sm text-muted-foreground">{formatDate(updatedAt)}</span>
      ),
    },
    {
      title: 'Xuất bản',
      dataIndex: 'published',
      align: 'center',
      render: (published: boolean, row) => (
        <Switch checked={published} onChange={() => onTogglePublished(row.id)} />
      ),
    },
    {
      title: '',
      key: 'actions',
      align: 'right',
      render: (_, entry) => (
        <Button
          type="text"
          size="small"
          aria-label="Sửa"
          icon={<Pencil className="size-4" />}
          onClick={() => openEdit(entry)}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        seal="運"
        hanReading="Vận Hạn"
        title="Dữ liệu vận hạn"
        subtitle="Sao chiếu mệnh và luận giải theo tuổi cho năm Bính Ngọ 2026."
        actions={
          <Button type="primary" icon={<Plus className="size-4" />} onClick={openNew}>
            Thêm dòng
          </Button>
        }
      />

      <div className="mb-8 flex flex-wrap gap-x-10 gap-y-4 border-b border-border pb-6">
        <Stat label="Tổng số dòng" value={formatNumber(entries?.length ?? 0)} />
        <Stat label="Đã xuất bản" value={formatNumber(publishedCount)} />
        <Stat label="Năm" value="2026" />
        <Stat label="Can chi" value="Bính Ngọ" seal />
      </div>

      <div className="glass overflow-hidden rounded-xl">
        <div className="flex items-center justify-between gap-3 border-b border-border p-4">
          <Select
            value={rating}
            onChange={(v) => setRating(v)}
            style={{ width: 160 }}
            options={[
              { value: 'all', label: 'Mọi mức' },
              { value: 'cat', label: 'Cát' },
              { value: 'binh', label: 'Bình' },
              { value: 'hung', label: 'Hung' },
            ]}
          />
          <p className="hidden text-sm text-muted-foreground sm:block">
            {formatNumber(filtered.length)} dòng
          </p>
        </div>

        <Table<VanHanEntry>
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          loading={isLoading}
          pagination={{ pageSize: 8, hideOnSinglePage: true }}
        />
      </div>

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
