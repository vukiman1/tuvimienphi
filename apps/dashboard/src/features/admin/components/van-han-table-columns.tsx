import { Link } from '@tanstack/react-router';
import { Tag, Typography, type TableProps } from 'antd';
import { formatDateTime } from '@/lib/format-date-time';
import type { VanHanSlotRow } from '../data/admin-van-han.query';
import { missingLabel, slotStatus } from './van-han-year-model';

const NOT_SAVED = '—';

export function SlotStatusTag({
  slot,
}: {
  readonly slot: Pick<VanHanSlotRow, 'entry' | 'missing'>;
}) {
  const status = slotStatus(slot);
  if (status === 'EMPTY') {
    return <Tag>Chưa soạn</Tag>;
  }
  if (status === 'INCOMPLETE') {
    return <Tag color="orange">Thiếu {missingLabel(slot.missing)}</Tag>;
  }
  return <Tag color="green">Đủ nội dung</Tag>;
}

export function buildVanHanColumns(year: number): TableProps<VanHanSlotRow>['columns'] {
  return [
    {
      key: 'zodiacOrder',
      title: '#',
      dataIndex: 'zodiacOrder',
      width: 56,
    },
    {
      key: 'zodiac',
      title: 'Con giáp',
      dataIndex: 'zodiac',
      render: (zodiac: string) => <Typography.Text strong>Tuổi {zodiac}</Typography.Text>,
    },
    {
      key: 'status',
      title: 'Nội dung',
      render: (_, slot) => <SlotStatusTag slot={slot} />,
    },
    {
      key: 'updatedAt',
      title: 'Cập nhật',
      width: 180,
      render: (_, slot) => (slot.entry ? formatDateTime(slot.entry.updatedAt) : NOT_SAVED),
    },
    {
      key: 'action',
      width: 96,
      align: 'right',
      render: (_, slot) => (
        <Link
          to="/van-han/$year/$zodiacOrder"
          params={{ year, zodiacOrder: slot.zodiacOrder }}
          aria-label={`${slot.entry ? 'Sửa' : 'Soạn'} tuổi ${slot.zodiac}`}
        >
          {slot.entry ? 'Sửa' : 'Soạn'}
        </Link>
      ),
    },
  ];
}
