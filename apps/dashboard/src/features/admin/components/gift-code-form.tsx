import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, DatePicker, Form, Input, InputNumber, Modal } from 'antd';
import type { Dayjs } from 'dayjs';
import {
  GIFT_CODE_MAX_LENGTH,
  MAX_GIFT_CODE_CREDITS,
  MAX_GIFT_CODE_REDEMPTIONS,
} from '@org/shared-contracts';
import { errorMessage } from '@/lib/api-error';
import { rejectionReason } from '@/lib/graphql-request';
import { GIFT_CODES_QUERY_KEY, createGiftCode } from '../data/admin-gift-codes.query';

interface GiftCodeFormProps {
  readonly open: boolean;
  readonly onClose: () => void;
}

interface GiftCodeFormValues {
  readonly code?: string;
  readonly credits: number;
  readonly maxRedemptions: number;
  readonly expiresAt?: Dayjs | null;
}

const MIN_COUNT = 1;
const EXPIRY_FORMAT = 'YYYY-MM-DD HH:mm';
const CREATE_FAILED = 'Không tạo được giftcode.';
const REQUIRED_MESSAGE = 'Bắt buộc.';

export function GiftCodeForm({ open, onClose }: GiftCodeFormProps) {
  const queryClient = useQueryClient();
  const [form] = Form.useForm<GiftCodeFormValues>();

  const creation = useMutation({
    mutationFn: (values: GiftCodeFormValues) =>
      createGiftCode({
        code: values.code?.trim() || undefined,
        credits: values.credits,
        maxRedemptions: values.maxRedemptions,
        expiresAt: values.expiresAt?.toISOString(),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: GIFT_CODES_QUERY_KEY });
      onClose();
    },
  });

  return (
    <Modal
      open={open}
      title="Tạo giftcode"
      okText="Tạo"
      cancelText="Huỷ"
      confirmLoading={creation.isPending}
      onOk={() => form.submit()}
      onCancel={onClose}
      afterClose={() => {
        form.resetFields();
        creation.reset();
      }}
      destroyOnHidden
    >
      <Form<GiftCodeFormValues>
        form={form}
        layout="vertical"
        onFinish={(values) => creation.mutate(values)}
      >
        <Form.Item label="Mã (để trống để tự tạo)" name="code">
          <Input maxLength={GIFT_CODE_MAX_LENGTH} />
        </Form.Item>
        <Form.Item
          label="Số lượt"
          name="credits"
          rules={[{ required: true, message: REQUIRED_MESSAGE }]}
        >
          <InputNumber<number>
            min={MIN_COUNT}
            max={MAX_GIFT_CODE_CREDITS}
            precision={0}
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item
          label="Số lần dùng tối đa"
          name="maxRedemptions"
          rules={[{ required: true, message: REQUIRED_MESSAGE }]}
        >
          <InputNumber<number>
            min={MIN_COUNT}
            max={MAX_GIFT_CODE_REDEMPTIONS}
            precision={0}
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item label="Hạn dùng" name="expiresAt">
          <DatePicker
            showTime={{ format: 'HH:mm' }}
            format={EXPIRY_FORMAT}
            style={{ width: '100%' }}
          />
        </Form.Item>
        {creation.isError ? (
          <Alert
            type="error"
            showIcon
            title={rejectionReason(creation.error) ?? errorMessage(creation.error, CREATE_FAILED)}
          />
        ) : null}
      </Form>
    </Modal>
  );
}
