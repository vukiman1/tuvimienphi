import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Pencil, Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { PostEditorDialog } from './post-editor-dialog';
import { PostViewDialog } from './post-view-dialog';
import type { BlogPost, PostStatus } from '../data/types';

const STATUS_META: Record<
  PostStatus,
  { label: string; variant: 'success' | 'neutral' | 'warning' }
> = {
  published: { label: 'Đã đăng', variant: 'success' },
  draft: { label: 'Nháp', variant: 'neutral' },
  scheduled: { label: 'Hẹn giờ', variant: 'warning' },
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

  const pager = usePagination(filtered, 8);

  return (
    <div>
      <PageHeader
        seal="文"
        hanReading="Văn Chương"
        title="Quản lý bài viết"
        subtitle="Nội dung blog về tử vi, phong thủy và vận hạn."
        actions={
          <Button onClick={openNew}>
            <Plus /> Viết bài mới
          </Button>
        }
      />

      <Card className="animate-rise gap-0 overflow-hidden py-0">
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm tiêu đề, chuyên mục…"
              className="pl-9"
            />
          </div>
          <Select value={status} onValueChange={(v) => setStatus(v as PostStatus | 'all')}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Mọi trạng thái</SelectItem>
              <SelectItem value="published">Đã đăng</SelectItem>
              <SelectItem value="draft">Nháp</SelectItem>
              <SelectItem value="scheduled">Hẹn giờ</SelectItem>
            </SelectContent>
          </Select>
          <p className="ml-auto hidden text-sm text-muted-foreground sm:block">
            {formatNumber(filtered.length)} bài viết
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Chuyên mục</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Lượt xem</TableHead>
              <TableHead>Cập nhật</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : pager.pageItems.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="max-w-sm">
                      <p className="truncate font-medium">{post.title}</p>
                      <p className="truncate text-xs text-muted-foreground">/{post.slug}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{post.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_META[post.status].variant}>
                        {STATUS_META[post.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="tabular-nums text-right">
                      {formatNumber(post.views)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(post.updatedAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Xem"
                          onClick={() => openView(post)}
                        >
                          <Eye />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Sửa"
                          onClick={() => openEdit(post)}
                        >
                          <Pencil />
                        </Button>
                      </div>
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
            unit="bài viết"
          />
        )}
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
