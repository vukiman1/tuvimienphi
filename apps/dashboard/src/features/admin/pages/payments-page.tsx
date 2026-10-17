import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Flex, Table, Tabs, Typography } from 'antd';
import { formatNumber } from '@org/frontend-shared';
import { errorMessage } from '@/lib/api-error';
import type { PaymentStatus } from '@/gql/graphql';
import { AssignPaymentDialog } from '../components/assign-payment-dialog';
import { buildPaymentsColumns } from '../components/payments-table-columns';
import {
  DEFAULT_PAYMENTS_FILTERS,
  PAYMENTS_FIRST_PAGE,
  PAYMENTS_PAGE_SIZE,
  adminPaymentsQuery,
  type AdminPaymentRow,
  type AdminPaymentsFilters,
} from '../data/admin-payments.query';

const LOAD_FAILED = 'Không tải được danh sách thanh toán.';
const ALL_STATUSES_KEY = 'all';

const STATUS_TABS = [
  { key: ALL_STATUSES_KEY, label: 'Tất cả' },
  { key: 'Unmatched', label: 'Chưa khớp' },
  { key: 'Credited', label: 'Đã cộng' },
] as const satisfies readonly { key: PaymentStatus | typeof ALL_STATUSES_KEY; label: string }[];

function statusFromTabKey(key: string): PaymentStatus | null {
  const tab = STATUS_TABS.find((candidate) => candidate.key === key);
  return tab && tab.key !== ALL_STATUSES_KEY ? tab.key : null;
}

export function PaymentsPage() {
  const [filters, setFilters] = useState<AdminPaymentsFilters>(DEFAULT_PAYMENTS_FILTERS);
  const [assigning, setAssigning] = useState<AdminPaymentRow | null>(null);
  const { data, isFetching, isError, error } = useQuery(adminPaymentsQuery(filters));

  return (
    <Flex vertical gap={16}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        Thanh toán
      </Typography.Title>

      <Tabs
        activeKey={filters.status ?? ALL_STATUSES_KEY}
        items={STATUS_TABS.map(({ key, label }) => ({ key, label }))}
        onChange={(key) => setFilters({ page: PAYMENTS_FIRST_PAGE, status: statusFromTabKey(key) })}
      />

      {isError ? <Alert type="error" showIcon title={errorMessage(error, LOAD_FAILED)} /> : null}

      <Table<AdminPaymentRow>
        rowKey="id"
        columns={buildPaymentsColumns(setAssigning)}
        dataSource={data?.payments.payments}
        loading={isFetching}
        scroll={{ x: 'max-content' }}
        pagination={{
          current: filters.page,
          pageSize: PAYMENTS_PAGE_SIZE,
          total: data?.payments.total ?? 0,
          showSizeChanger: false,
          showTotal: (total) => `${formatNumber(total)} giao dịch`,
          onChange: (page) => setFilters((current) => ({ ...current, page })),
        }}
      />

      <AssignPaymentDialog payment={assigning} onClose={() => setAssigning(null)} />
    </Flex>
  );
}
