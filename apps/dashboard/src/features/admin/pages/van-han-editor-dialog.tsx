import { useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { App, Button, Form, Input, InputNumber, Modal, Select, Switch } from 'antd';
import { useCreateVanHanEntry, useUpdateVanHanEntry } from '../data/mutations';
import type { VanHanEntry, VanHanRating } from '../data/types';

interface VanHanFormValues {
  age: number;
  star: string;
  rating: VanHanRating;
  published: boolean;
  summary: string;
}

export function VanHanEditorDialog({
  open,
  onOpenChange,
  entry,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: VanHanEntry | null;
}) {
  const editing = !!entry;
  const { message } = App.useApp();
  const [form] = Form.useForm<VanHanFormValues>();
  const createEntry = useCreateVanHanEntry();
  const updateEntry = useUpdateVanHanEntry();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        age: entry?.age ?? 18,
        star: entry?.star ?? '',
        rating: entry?.rating ?? 'binh',
        published: entry?.published ?? true,
        summary: entry?.summary ?? '',
      });
    }
  }, [open, entry, form]);

  const submitting = createEntry.isPending || updateEntry.isPending;

  const onFinish = async (values: VanHanFormValues) => {
    try {
      if (editing && entry) {
        await updateEntry.mutateAsync({
          id: entry.id,
          input: {
            age: values.age,
            star: values.star,
            rating: values.rating,
            published: values.published,
            summary: values.summary,
          },
        });
        message.success('Đã lưu thay đổi.');
      } else {
        await createEntry.mutateAsync({
          age: values.age,
          star: values.star,
          rating: values.rating,
          published: values.published,
          summary: values.summary,
          year: 2026,
        });
        message.success('Đã thêm dòng vận hạn.');
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
      title={editing ? 'Sửa dòng vận hạn' : 'Thêm dòng vận hạn'}
      footer={null}
      destroyOnHidden
      width={576}
      classNames={{ container: 'glass' }}
    >
      <p className="mb-4 text-sm text-muted-foreground">
        Luận giải sao chiếu mệnh theo tuổi cho năm Bính Ngọ 2026.
      </p>
      <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
        <div className="grid grid-cols-3 gap-4">
          <Form.Item name="age" label="Tuổi" rules={[{ required: true, message: 'Nhập tuổi.' }]}>
            <InputNumber min={1} inputMode="numeric" className="w-full" />
          </Form.Item>
          <Form.Item
            name="star"
            label="Sao chiếu mệnh"
            className="col-span-2"
            rules={[{ required: true, message: 'Nhập sao chiếu mệnh.' }]}
          >
            <Input placeholder="Ví dụ: Thái Dương" />
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 items-end gap-4">
          <Form.Item name="rating" label="Mức">
            <Select
              options={[
                { value: 'cat', label: 'Cát' },
                { value: 'binh', label: 'Bình' },
                { value: 'hung', label: 'Hung' },
              ]}
            />
          </Form.Item>
          <Form.Item name="published" label="Xuất bản" valuePropName="checked">
            <Switch />
          </Form.Item>
        </div>

        <Form.Item name="summary" label="Luận giải">
          <Input.TextArea placeholder="Nội dung luận giải cho tuổi này…" rows={3} />
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
            {editing ? 'Lưu thay đổi' : 'Thêm dòng'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
