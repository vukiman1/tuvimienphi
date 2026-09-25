import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Avatar, Flex, Input, Table, Tag, Typography, type TableProps } from 'antd';
import { formatDate, formatNumber, initials } from '@org/frontend-shared';
import type { Role } from '@/gql/graphql';
import { errorMessage } from '@/lib/api-error';
import {
  USERS_PAGE_SIZE,
  USERS_SEARCH_MAX_LENGTH,
  adminUsersQuery,
  type AdminUserRow,
} from '../data/admin-users.query';

const FIRST_PAGE = 1;
const LOAD_FAILED = 'Không tải được danh sách người dùng.';
const NO_ACTIVITY = '—';

const ROLE_COLOR = {
  SUPER_ADMIN: 'red',
  ADMIN: 'blue',
  SELLER: 'gold',
  USER: 'default',
} as const satisfies Record<Role, string>;

const dateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const COLUMNS: TableProps<AdminUserRow>['columns'] = [
  {
    title: 'Người dùng',
    dataIndex: 'email',
    render: (_, user) => (
      <Flex align="center" gap={12}>
        <Avatar src={user.avatar ?? undefined}>{initials(user.displayName)}</Avatar>
        <Flex vertical>
          <Typography.Text strong>{user.displayName ?? user.email}</Typography.Text>
          <Typography.Text type="secondary">{user.email}</Typography.Text>
        </Flex>
      </Flex>
    ),
  },
  {
    title: 'Vai trò',
    dataIndex: 'role',
    width: 140,
    render: (role: Role) => <Tag color={ROLE_COLOR[role]}>{role}</Tag>,
  },
  {
    title: 'Email',
    dataIndex: 'isEmailVerified',
    width: 130,
    render: (isVerified: boolean) => (
      <Tag color={isVerified ? 'green' : 'orange'}>
        {isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
      </Tag>
    ),
  },
  {
    title: 'Số dư',
    dataIndex: 'balance',
    width: 110,
    align: 'right',
    render: (balance: number) => formatNumber(balance),
  },
  {
    title: 'Lá số',
    dataIndex: 'genCount',
    width: 90,
    align: 'right',
    render: (genCount: number) => formatNumber(genCount),
  },
  {
    title: 'Tham gia',
    dataIndex: 'createdAt',
    width: 120,
    render: (createdAt: string) => formatDate(createdAt),
  },
  {
    title: 'Hoạt động gần nhất',
    dataIndex: 'lastActiveAt',
    width: 180,
    render: (lastActiveAt: string | null) =>
      lastActiveAt ? dateTimeFormatter.format(new Date(lastActiveAt)) : NO_ACTIVITY,
  },
];

export function UsersPage() {
  const [page, setPage] = useState(FIRST_PAGE);
  const [search, setSearch] = useState('');
  const { data, isFetching, isError, error } = useQuery(adminUsersQuery({ page, search }));

  const applySearch = (term: string) => {
    setSearch(term.trim());
    setPage(FIRST_PAGE);
  };

  return (
    <Flex vertical gap={16}>
      <Flex align="center" justify="space-between" gap={16} wrap>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Người dùng
        </Typography.Title>
        <Input.Search
          allowClear
          placeholder="Tìm theo email hoặc tên"
          maxLength={USERS_SEARCH_MAX_LENGTH}
          onSearch={applySearch}
          style={{ maxWidth: 320 }}
        />
      </Flex>

      {isError ? <Alert type="error" showIcon title={errorMessage(error, LOAD_FAILED)} /> : null}

      <Table<AdminUserRow>
        rowKey="id"
        columns={COLUMNS}
        dataSource={data?.users.users}
        loading={isFetching}
        scroll={{ x: 'max-content' }}
        pagination={{
          current: page,
          pageSize: USERS_PAGE_SIZE,
          total: data?.users.total ?? 0,
          showSizeChanger: false,
          showTotal: (total) => `${formatNumber(total)} người dùng`,
          onChange: setPage,
        }}
      />
    </Flex>
  );
}
