import { CalendarDays, Eye, User, Pencil } from 'lucide-react';
import { Button, Modal, Tag } from 'antd';
import { formatDate, formatNumber } from '@/lib/utils';
import type { BlogPost, PostStatus } from '../data/types';

const STATUS_META: Record<PostStatus, { label: string; color: string }> = {
  published: { label: 'Đã đăng', color: 'green' },
  draft: { label: 'Nháp', color: 'default' },
  scheduled: { label: 'Hẹn giờ', color: 'gold' },
};

const BODY = [
  'Trong tử vi, mỗi lá số là một bản đồ sao phản chiếu vận mệnh con người. Việc luận giải đòi hỏi sự tỉ mỉ, kết hợp giữa vị trí các chính tinh và phụ tinh toạ thủ tại mười hai cung.',
  'Cung Mệnh là gốc rễ, cho biết bản chất và khí chất của đương số. Khi cát tinh hội tụ, đường công danh tài lộc thường hanh thông; ngược lại, hung tinh xâm phạm đòi hỏi sự cẩn trọng và biết cách hoá giải.',
  'Bài viết này đi sâu phân tích ý nghĩa từng sao, cách chúng tương tác theo ngũ hành tương sinh tương khắc, và ứng dụng thực tiễn để mỗi người chủ động đón lành, tránh dữ trong năm mới.',
];

export function PostViewDialog({
  open,
  onOpenChange,
  post,
  onEdit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: BlogPost | null;
  onEdit: (post: BlogPost) => void;
}) {
  return (
    <Modal
      open={open}
      onCancel={() => onOpenChange(false)}
      footer={null}
      width={672}
      destroyOnHidden
      styles={{ body: { padding: 0 } }}
      classNames={{ container: 'glass overflow-hidden' }}
    >
      {post && (
        <>
          <div className="relative h-28 overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(120% 140% at 90% 0%, color-mix(in oklch, var(--primary) 30%, transparent), transparent 60%), radial-gradient(120% 140% at 0% 100%, color-mix(in oklch, var(--nebula) 30%, transparent), transparent 60%)',
              }}
            />
            <div className="absolute top-4 left-6">
              <Tag bordered>{post.category}</Tag>
            </div>
          </div>

          <div className="max-h-[70vh] overflow-y-auto px-6 pb-6">
            <div className="-mt-6">
              <div className="mb-3 flex items-center gap-2">
                <Tag color={STATUS_META[post.status].color}>{STATUS_META[post.status].label}</Tag>
                <span className="font-label text-[11px] tracking-wide text-muted-foreground">
                  /{post.slug}
                </span>
              </div>
              <h2 className="font-display text-2xl font-semibold text-glow">{post.title}</h2>

              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <User className="size-4" /> {post.author}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="size-4" />
                  {post.publishedAt
                    ? formatDate(post.publishedAt)
                    : `Cập nhật ${formatDate(post.updatedAt)}`}
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="size-4" /> {formatNumber(post.views)} lượt xem
                </span>
              </div>

              <div className="mt-5 space-y-3 leading-relaxed text-foreground/85">
                {BODY.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
            <Button type="text" onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
            <Button
              type="primary"
              icon={<Pencil className="size-4" />}
              onClick={() => {
                onOpenChange(false);
                onEdit(post);
              }}
            >
              Sửa bài viết
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
