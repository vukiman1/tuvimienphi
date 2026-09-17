import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Pencil, Eye } from 'lucide-react';
import { Button, Card, Input, Select, Table, Tag, type TableColumnsType } from 'antd';
import { formatDate, formatNumber } from '@/lib/utils';
import { PageHeader } from '../components/page-header';
import { adminQueries } from '../data/queries';
import { PostEditorDialog } from './post-editor-dialog';
import { PostViewDialog } from './post-view-dialog';
import type { BlogPost, PostStatus } from '../data/types';

const STATUS_META: Record<PostStatus, { label: string; color: string }> = {
  published: { label: 'Đã đăng', color: 'green' },
  draft: { label: 'Nháp', color: 'default' },
  scheduled: { label: 'Hẹn giờ', color: 'gold' },
};

export function BlogPage() {
  const { data: posts, isLoading } = useQuery(adminQueries.blog());
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<PostStatus | 'all'>('all');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewingPost, setViewingPost] = useState<BlogPost | null>(null);

  const openNew = () => {
    setEditingPost(null);
    setEditorOpen(true);
  };
  const openEdit = (post: BlogPost) => {
    setEditingPost(post);
    setEditorOpen(true);
  };
  const openView = (post: BlogPost) => {
    setViewingPost(post);
    setViewOpen(true);
  };

  const filtered = useMemo(() => {
    if (!posts) return [];
    const q = query.trim().toLowerCase();
    return posts.filter(
      (p) =>
        (status === 'all' || p.status === status) &&
        (!q || p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)),
    );
  }, [posts, query, status]);

  const columns: TableColumnsType<BlogPost> = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      render: (_, post) => (
        <div className="max-w-sm">
          <p className="truncate font-medium">{post.title}</p>
          <p className="truncate text-xs text-muted-foreground">/{post.slug}</p>
        </div>
      ),
    },
    {
      title: 'Chuyên mục',
      dataIndex: 'category',
      render: (category: string) => <Tag bordered>{category}</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (s: PostStatus) => <Tag color={STATUS_META[s].color}>{STATUS_META[s].label}</Tag>,
    },
    {
      title: 'Lượt xem',
      dataIndex: 'views',
      align: 'right',
      render: (views: number) => <span className="tabular-nums">{formatNumber(views)}</span>,
    },
    {
      title: 'Cập nhật',
      dataIndex: 'updatedAt',
      render: (updatedAt: string) => (
        <span className="text-sm text-muted-foreground">{formatDate(updatedAt)}</span>
      ),
    },
    {
      title: '',
      key: 'actions',
      align: 'right',
      render: (_, post) => (
        <div className="flex justify-end gap-1">
          <Button
            type="text"
            size="small"
            aria-label="Xem"
            icon={<Eye className="size-4" />}
            onClick={() => openView(post)}
          />
          <Button
            type="text"
            size="small"
            aria-label="Sửa"
            icon={<Pencil className="size-4" />}
            onClick={() => openEdit(post)}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        seal="文"
        hanReading="Văn Chương"
        title="Quản lý bài viết"
        subtitle="Nội dung blog về tử vi, phong thủy và vận hạn."
        actions={
          <Button type="primary" icon={<Plus className="size-4" />} onClick={openNew}>
            Viết bài mới
          </Button>
        }
      />

      <Card
        variant="borderless"
        className="animate-rise"
        styles={{ body: { padding: 0 } }}
        title={
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm tiêu đề, chuyên mục…"
                className="pl-9"
                variant="borderless"
              />
            </div>
            <Select
              value={status}
              onChange={(v) => setStatus(v)}
              style={{ width: 160 }}
              options={[
                { value: 'all', label: 'Mọi trạng thái' },
                { value: 'published', label: 'Đã đăng' },
                { value: 'draft', label: 'Nháp' },
                { value: 'scheduled', label: 'Hẹn giờ' },
              ]}
            />
            <p className="ml-auto hidden text-sm font-normal text-muted-foreground sm:block">
              {formatNumber(filtered.length)} bài viết
            </p>
          </div>
        }
      >
        <Table<BlogPost>
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          loading={isLoading}
          pagination={{ pageSize: 8, hideOnSinglePage: true }}
        />
      </Card>

      <PostEditorDialog open={editorOpen} onOpenChange={setEditorOpen} post={editingPost} />
      <PostViewDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        post={viewingPost}
        onEdit={openEdit}
      />
    </div>
  );
}
