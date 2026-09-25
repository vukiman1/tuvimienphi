import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Flex, Table, Typography } from 'antd';
import { formatNumber } from '@org/frontend-shared';
import { errorMessage } from '@/lib/api-error';
import { UsersActiveFilters } from '../components/users-active-filters';
import { readTableChange } from '../components/users-table-adapter';
import { buildUsersColumns } from '../components/users-table-columns';
import { UsersToolbar } from '../components/users-toolbar';
import {
  DEFAULT_USERS_FILTERS,
  USERS_FIRST_PAGE,
  USERS_PAGE_SIZE,
  adminUsersQuery,
  type AdminUserRow,
  type AdminUsersFilters,
} from '../data/admin-users.query';

const LOAD_FAILED = 'Không tải được danh sách người dùng.';

export function UsersPage() {
  const [filters, setFilters] = useState<AdminUsersFilters>(DEFAULT_USERS_FILTERS);
  const { data, isFetching, isError, error } = useQuery(adminUsersQuery(filters));

  const applyFilters = (patch: Partial<AdminUsersFilters>) => {
    setFilters((current) => ({ ...current, ...patch, page: USERS_FIRST_PAGE }));
  };

  return (
    <Flex vertical gap={16}>
      <Flex align="center" justify="space-between" gap={16} wrap>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Người dùng
        </Typography.Title>
        <UsersToolbar
          filters={filters}
          onChange={applyFilters}
          onReset={() => setFilters(DEFAULT_USERS_FILTERS)}
        />
      </Flex>

      <UsersActiveFilters filters={filters} onChange={applyFilters} />

      {isError ? <Alert type="error" showIcon title={errorMessage(error, LOAD_FAILED)} /> : null}

      <Table<AdminUserRow>
        rowKey="id"
        columns={buildUsersColumns(filters)}
        dataSource={data?.users.users}
        loading={isFetching}
        scroll={{ x: 'max-content' }}
        onChange={(pagination, tableFilters, _sorter, extra) => {
          setFilters((current) => ({
            ...current,
            ...readTableChange(pagination, tableFilters, extra),
          }));
        }}
        pagination={{
          current: filters.page,
          pageSize: USERS_PAGE_SIZE,
          total: data?.users.total ?? 0,
          showSizeChanger: false,
          showTotal: (total) => `${formatNumber(total)} người dùng`,
        }}
      />
    </Flex>
  );
}
