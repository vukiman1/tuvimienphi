import { Button, Tag, Typography, type TableProps } from 'antd';
import { formatNumber } from '@org/frontend-shared';
import { formatDateTime } from '@/lib/format-date-time';
import type { PaymentStatus, UnmatchedReason } from '@/gql/graphql';
import type { AdminPaymentRow } from '../data/admin-payments.query';

const NO_VALUE = '—';

const UNMATCHED_REASON_LABEL = {
  NoCode: 'Không có mã',
  UnknownCode: 'Mã không tồn tại',
  AmountTooLow: 'Chuyển thiếu tiền',
} as const satisfies Record<UnmatchedReason, string>;

const STATUS_LABEL = {
  Credited: 'Đã cộng',
  Unmatched: 'Chưa khớp',
} as const satisfies Record<PaymentStatus, string>;

const STATUS_COLOR = {
  Credited: 'green',
  Unmatched: 'orange',
} as const satisfies Record<PaymentStatus, string>;

export function buildPaymentsColumns(
  onAssign: (payment: AdminPaymentRow) => void,
): TableProps<AdminPaymentRow>['columns'] {
  return [
    {
      key: 'transactionAt',
      title: 'Thời gian',
      dataIndex: 'transactionAt',
      width: 160,
      render: formatDateTime,
    },
    {
      key: 'amountVnd',
      title: 'Số tiền',
      dataIndex: 'amountVnd',
      width: 120,
      align: 'right',
      render: (amountVnd: number) => `${formatNumber(amountVnd)}đ`,
    },
    {
      key: 'content',
      title: 'Nội dung',
      dataIndex: 'content',
      render: (content: string, payment) => (
        <>
          <Typography.Text>{content}</Typography.Text>
          <br />
          <Typography.Text type="secondary">{payment.referenceCode}</Typography.Text>
        </>
      ),
    },
    {
      key: 'status',
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 200,
      render: (status: PaymentStatus, payment) => (
        <>
          <Tag color={STATUS_COLOR[status]}>{STATUS_LABEL[status]}</Tag>
          {payment.unmatchedReason ? (
            <Typography.Text type="secondary">
              {UNMATCHED_REASON_LABEL[payment.unmatchedReason]}
            </Typography.Text>
          ) : null}
        </>
      ),
    },
    {
      key: 'userEmail',
      title: 'Người dùng',
      dataIndex: 'userEmail',
      render: (userEmail: string | null) => userEmail ?? NO_VALUE,
    },
    {
      key: 'creditsGranted',
      title: 'Lượt đã cộng',
      dataIndex: 'creditsGranted',
      width: 120,
      align: 'right',
      render: (creditsGranted: number) => formatNumber(creditsGranted),
    },
    {
      key: 'actions',
      title: '',
      width: 160,
      render: (_, payment) =>
        payment.status === 'Unmatched' ? (
          <Button type="link" onClick={() => onAssign(payment)}>
            Cộng cho người dùng
          </Button>
        ) : null,
    },
  ];
}
