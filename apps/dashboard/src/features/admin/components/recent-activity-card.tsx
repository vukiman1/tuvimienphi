import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Card, Empty, List, Skeleton, Typography } from 'antd';
import { errorMessage } from '@/lib/api-error';
import { timeAgo } from '@/lib/relative-time';
import {
  RECENT_ACTIVITY_FIRST_PAGE,
  RECENT_ACTIVITY_LIMIT,
  recentActivityQuery,
  type ActivityRow,
} from '../data/recent-activity.query';
import { activityLabel } from './activity-label';

const LOAD_FAILED = 'Không tải được hoạt động gần đây.';
const EMPTY = 'Chưa có hoạt động nào được ghi lại.';
const UNKNOWN_ACTOR = 'Không rõ';

interface ActivityListProps {
  readonly rows: readonly ActivityRow[];
  readonly isPending: boolean;
  readonly isError?: boolean;
  readonly page?: number;
  readonly total?: number;
  readonly onPageChange?: (page: number) => void;
}

export function RecentActivityCard() {
  const [page, setPage] = useState(RECENT_ACTIVITY_FIRST_PAGE);
  const { data, isPending, isError, error } = useQuery(recentActivityQuery(page));

  return (
    <Card title="Hoạt động gần đây">
      {isError ? <Alert type="error" showIcon title={errorMessage(error, LOAD_FAILED)} /> : null}
      <ActivityList
        rows={data?.recentActivity.entries ?? []}
        isPending={isPending}
        isError={isError}
        page={page}
        total={data?.recentActivity.total ?? 0}
        onPageChange={setPage}
      />
    </Card>
  );
}

export function ActivityList({
  rows,
  isPending,
  isError = false,
  page = RECENT_ACTIVITY_FIRST_PAGE,
  total = 0,
  onPageChange,
}: ActivityListProps) {
  if (isPending) {
    return <Skeleton active />;
  }
  if (isError) {
    return null;
  }
  if (rows.length === 0) {
    return <Empty description={EMPTY} />;
  }

  return (
    <List
      size="small"
      rowKey="id"
      dataSource={[...rows]}
      pagination={{
        current: page,
        pageSize: RECENT_ACTIVITY_LIMIT,
        total,
        showSizeChanger: false,
        hideOnSinglePage: true,
        onChange: onPageChange,
      }}
      renderItem={(row) => (
        <List.Item>
          <Typography.Text>
            <Typography.Text strong>{actorOf(row)}</Typography.Text> {activityLabel(row.event)}
          </Typography.Text>
          <Typography.Text type="secondary">{timeAgo(row.occurredAt)}</Typography.Text>
        </List.Item>
      )}
    />
  );
}

function actorOf(row: ActivityRow): string {
  return row.actorName ?? row.actorEmail ?? UNKNOWN_ACTOR;
}
