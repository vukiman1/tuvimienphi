import { Alert, Drawer, Flex, Table, Tag, Tooltip, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { formatNumber } from '@org/frontend-shared';
import { formatDateTimeSeconds } from '@/lib/format-date-time';
import type { AiCallView } from '../data/admin-ai.query';
import { CALLS_PAGE_SIZE, callNote, callOutcome } from './ai-call-model';
import { formatLatency } from './ai-provider-model';
import { formatCallCost } from './ai-usage-model';

interface AiCallDrawerProps {
  readonly isOpen: boolean;
  readonly title: string;
  readonly subtitle: string;
  readonly calls: readonly AiCallView[];
  readonly total: number;
  readonly expectedTotal: number;
  readonly page: number;
  readonly isLoading: boolean;
  readonly loadError: string | null;
  readonly retentionDays: number;
  readonly onPageChange: (page: number) => void;
  readonly onClose: () => void;
}

const DRAWER_WIDTH = 1080;
const NONE = '—';
const EMPTY = 'Chưa có lượt gọi nào được ghi chi tiết trong khoảng này.';

const COLUMNS: ColumnsType<AiCallView> = [
  { title: 'Lúc', key: 'at', render: (_value, call) => formatDateTimeSeconds(call.at) },
  {
    title: 'Kết quả',
    key: 'status',
    render: (_value, call) => {
      const outcome = callOutcome(call);
      return <Tag color={outcome.color}>{outcome.text}</Tag>;
    },
  },
  {
    title: 'Token vào',
    key: 'inputTokens',
    align: 'right',
    render: (_value, call) => formatNumber(call.inputTokens),
  },
  {
    title: 'Token ra',
    key: 'outputTokens',
    align: 'right',
    render: (_value, call) => formatNumber(call.outputTokens),
  },
  {
    title: 'Trả lời sau',
    key: 'latencyMs',
    align: 'right',
    render: (_value, call) =>
      call.latencyMs === null || call.latencyMs === undefined
        ? NONE
        : formatLatency(call.latencyMs),
  },
  {
    title: 'Chi phí',
    key: 'costUsd',
    align: 'right',
    render: (_value, call) =>
      call.costUsd === null || call.costUsd === undefined ? NONE : formatCallCost(call.costUsd),
  },
  { title: 'Người dùng', key: 'userEmail', render: (_value, call) => call.userEmail ?? NONE },
  {
    title: 'Ghi chú',
    key: 'note',
    render: (_value, call) => {
      const note = callNote(call);
      if (!note) {
        return NONE;
      }
      return call.error ? <Tooltip title={call.error}>{note}</Tooltip> : note;
    },
  },
];

export function AiCallDrawer({
  isOpen,
  title,
  subtitle,
  calls,
  total,
  expectedTotal,
  page,
  isLoading,
  loadError,
  retentionDays,
  onPageChange,
  onClose,
}: AiCallDrawerProps) {
  const isMissingSome = !isLoading && !loadError && total < expectedTotal;

  return (
    <Drawer open={isOpen} onClose={onClose} title={title} size={DRAWER_WIDTH} destroyOnHidden>
      <Flex vertical gap={16}>
        <Typography.Text type="secondary">{subtitle}</Typography.Text>
        {loadError ? <Alert type="error" showIcon title={loadError} /> : null}
        {isMissingSome ? (
          <Alert
            type="info"
            showIcon
            title={`Có chi tiết của ${formatNumber(total)} trên ${formatNumber(expectedTotal)} lượt gọi`}
            description={`Chi tiết từng lượt chỉ được ghi từ khi có tính năng này và giữ ${retentionDays} ngày. Tổng ở bảng ngoài thì giữ lâu dài.`}
          />
        ) : null}
        <Table<AiCallView>
          size="small"
          rowKey="id"
          loading={isLoading}
          columns={COLUMNS}
          dataSource={[...calls]}
          scroll={{ x: 'max-content' }}
          locale={{ emptyText: EMPTY }}
          pagination={{
            current: page,
            pageSize: CALLS_PAGE_SIZE,
            total,
            showSizeChanger: false,
            hideOnSinglePage: true,
            onChange: onPageChange,
          }}
        />
      </Flex>
    </Drawer>
  );
}
