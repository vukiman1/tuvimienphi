import { Switch, type TableProps } from 'antd';
import { formatNumber } from '@org/frontend-shared';
import { formatDateTime } from '@/lib/format-date-time';
import type { AdminGiftCodeRow } from '../data/admin-gift-codes.query';

const NO_VALUE = '—';

export function buildGiftCodesColumns(
  onToggleActive: (giftCode: AdminGiftCodeRow, isActive: boolean) => void,
  pendingId: string | null,
): TableProps<AdminGiftCodeRow>['columns'] {
  return [
    { key: 'code', title: 'Mã', dataIndex: 'code' },
    {
      key: 'credits',
      title: 'Số lượt',
      dataIndex: 'credits',
      align: 'right',
      render: (credits: number) => formatNumber(credits),
    },
    {
      key: 'usage',
      title: 'Đã dùng',
      align: 'right',
      render: (_: unknown, giftCode) =>
        `${formatNumber(giftCode.redeemedCount)} / ${formatNumber(giftCode.maxRedemptions)}`,
    },
    {
      key: 'expiresAt',
      title: 'Hạn dùng',
      dataIndex: 'expiresAt',
      render: (expiresAt: string | null) => (expiresAt ? formatDateTime(expiresAt) : NO_VALUE),
    },
    {
      key: 'isActive',
      title: 'Trạng thái',
      dataIndex: 'isActive',
      render: (isActive: boolean, giftCode) => (
        <Switch
          checked={isActive}
          checkedChildren="Đang bật"
          unCheckedChildren="Đã tắt"
          loading={pendingId === giftCode.id}
          onChange={(checked) => onToggleActive(giftCode, checked)}
        />
      ),
    },
    { key: 'createdByEmail', title: 'Người tạo', dataIndex: 'createdByEmail' },
    {
      key: 'createdAt',
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      render: (createdAt: string) => formatDateTime(createdAt),
    },
  ];
}
