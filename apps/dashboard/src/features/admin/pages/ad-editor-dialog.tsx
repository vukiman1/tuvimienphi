import { Sparkles } from 'lucide-react';
import { App, Button, Form, Input, Modal, Switch } from 'antd';
import { useCreateAdRedirect } from '../data/mutations';

interface AdFormValues {
  label: string;
  slug: string;
  target: string;
  active: boolean;
}

export function AdEditorDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { message } = App.useApp();
  const [form] = Form.useForm<AdFormValues>();
  const createRedirect = useCreateAdRedirect();

  const onFinish = async (values: AdFormValues) => {
    try {
      await createRedirect.mutateAsync({
        label: values.label,
        slug: values.slug,
        target: values.target,
        active: values.active,
      });
      message.success('Đã tạo liên kết.');
      onOpenChange(false);
    } catch {
      message.error('Không thể tạo liên kết.');
    }
  };

  return (
    <Modal
      open={open}
      onCancel={() => onOpenChange(false)}
      title="Thêm liên kết chuyển hướng"
      footer={null}
      destroyOnHidden
      width={576}
      classNames={{ container: 'glass' }}
    >
      <p className="mb-4 text-sm text-muted-foreground">
        Tạo một đường dẫn rút gọn đo lường lượt nhấp, chuyển tới trang đích.
      </p>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        initialValues={{ active: true }}
      >
        <Form.Item
          name="label"
          label="Tên chiến dịch"
          rules={[{ required: true, message: 'Vui lòng nhập tên chiến dịch.' }]}
        >
          <Input placeholder="Ví dụ: Ưu đãi luận giải chuyên sâu" />
        </Form.Item>

        <div className="grid grid-cols-2 items-end gap-4">
          <Form.Item
            name="slug"
            label="Đường dẫn"
            rules={[{ required: true, message: 'Vui lòng nhập đường dẫn.' }]}
          >
            <Input placeholder="/go/uu-dai" />
          </Form.Item>
          <Form.Item
            name="active"
            label="Kích hoạt"
            valuePropName="checked"
            className="flex items-center"
          >
            <Switch />
          </Form.Item>
        </div>

        <Form.Item
          name="target"
          label="Đích đến (URL)"
          rules={[
            { required: true, message: 'Vui lòng nhập URL đích.' },
            { type: 'url', message: 'URL không hợp lệ.' },
          ]}
        >
          <Input type="url" placeholder="https://…" />
        </Form.Item>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="text" onClick={() => onOpenChange(false)}>
            Huỷ
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={createRedirect.isPending}
            icon={<Sparkles className="size-4" />}
          >
            Tạo liên kết
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
