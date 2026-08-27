import { Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { BlogPost } from '../data/types';

const CATEGORIES = ['Tử vi', 'Phong thủy', 'Vận hạn', 'Xem ngày', 'Kiến thức'];

export function PostEditorDialog({
  open,
  onOpenChange,
  post,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: BlogPost | null;
}) {
  const editing = !!post;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Radix unmounts content on close, so fields reset from these defaults on each open. */}
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? 'Sửa bài viết' : 'Viết bài mới'}</DialogTitle>
          <DialogDescription>
            {editing
              ? 'Cập nhật nội dung và trạng thái bài viết.'
              : 'Tạo một bài viết mới cho blog.'}
          </DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            onOpenChange(false);
          }}
        >
          <div className="grid gap-1.5">
            <Label htmlFor="post-title">Tiêu đề</Label>
            <Input
              id="post-title"
              defaultValue={post?.title ?? ''}
              placeholder="Ví dụ: Luận giải cung Mệnh…"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label>Chuyên mục</Label>
              <Select defaultValue={post?.category ?? CATEGORIES[0]}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Trạng thái</Label>
              <Select defaultValue={post?.status ?? 'draft'}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Nháp</SelectItem>
                  <SelectItem value="scheduled">Hẹn giờ</SelectItem>
                  <SelectItem value="published">Đã đăng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="post-excerpt">Tóm tắt</Label>
            <Textarea id="post-excerpt" placeholder="Đoạn mô tả ngắn hiển thị ở danh sách…" />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Huỷ
              </Button>
            </DialogClose>
            <Button type="submit">
              <Sparkles /> {editing ? 'Lưu thay đổi' : 'Tạo bài viết'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
