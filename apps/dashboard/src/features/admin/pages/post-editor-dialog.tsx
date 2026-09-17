import { useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { App, Button, Form, Input, Modal, Select } from 'antd';
import { useCreatePost, useUpdatePost } from '../data/mutations';
import type { BlogPost } from '../data/types';

const CATEGORIES = ['Tử vi', 'Phong thủy', 'Vận hạn', 'Xem ngày', 'Kiến thức'];

interface PostFormValues {
  title: string;
  category: string;
  status: string;
  excerpt?: string;
}

function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

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
  const { message } = App.useApp();
  const [form] = Form.useForm<PostFormValues>();
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        title: post?.title ?? '',
        category: post?.category ?? CATEGORIES[0],
        status: post?.status ?? 'draft',
        excerpt: '',
      });
    }
  }, [open, post, form]);

  const submitting = createPost.isPending || updatePost.isPending;

  const onFinish = async (values: PostFormValues) => {
    try {
      if (editing && post) {
        await updatePost.mutateAsync({
          id: post.id,
          input: {
            title: values.title,
            category: values.category,
            status: values.status,
          },
        });
        message.success('Đã lưu thay đổi.');
      } else {
        await createPost.mutateAsync({
          title: values.title,
          slug: slugify(values.title),
          category: values.category,
          status: values.status,
          author: 'Quản trị viên',
        });
        message.success('Đã tạo bài viết.');
      }
      onOpenChange(false);
    } catch {
      message.error('Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  return (
    <Modal
      open={open}
      onCancel={() => onOpenChange(false)}
      title={editing ? 'Sửa bài viết' : 'Viết bài mới'}
      footer={null}
      destroyOnHidden
      width={576}
      classNames={{ container: 'glass' }}
    >
      <p className="mb-4 text-sm text-muted-foreground">
        {editing ? 'Cập nhật nội dung và trạng thái bài viết.' : 'Tạo một bài viết mới cho blog.'}
      </p>
      <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
        <Form.Item
          name="title"
          label="Tiêu đề"
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề.' }]}
        >
          <Input placeholder="Ví dụ: Luận giải cung Mệnh…" />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item name="category" label="Chuyên mục">
            <Select options={CATEGORIES.map((c) => ({ value: c, label: c }))} />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái">
            <Select
              options={[
                { value: 'draft', label: 'Nháp' },
                { value: 'scheduled', label: 'Hẹn giờ' },
                { value: 'published', label: 'Đã đăng' },
              ]}
            />
          </Form.Item>
        </div>

        <Form.Item name="excerpt" label="Tóm tắt">
          <Input.TextArea placeholder="Đoạn mô tả ngắn hiển thị ở danh sách…" rows={3} />
        </Form.Item>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="text" onClick={() => onOpenChange(false)}>
            Huỷ
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            icon={<Sparkles className="size-4" />}
          >
            {editing ? 'Lưu thay đổi' : 'Tạo bài viết'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
