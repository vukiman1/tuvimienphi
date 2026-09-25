import { Avatar, Flex, Tag, Typography, type TableProps } from 'antd';
import { formatDate, formatNumber, initials } from '@org/frontend-shared';
import type { Role } from '@/gql/graphql';
import type { AdminUserRow, AdminUsersFilters } from '../data/admin-users.query';
import { ROLE_LABEL } from './role-label';
import {
  EMAIL_STATUS_FILTER_KEY,
  EMAIL_STATUS_VALUE,
  ROLE_FILTER_KEY,
  SELECTABLE_ROLES,
  emailStatusFilterValue,
  roleFilterValue,
} from './users-table-adapter';

const NO_ACTIVITY = '—';

const ROLE_COLOR = {
  SUPER_ADMIN: 'red',
  ADMIN: 'blue',
  SELLER: 'gold',
  USER: 'default',
} as const satisfies Record<Role, string>;

const EMAIL_STATUS_FILTERS = [
  { text: 'Đã xác thực', value: EMAIL_STATUS_VALUE.VERIFIED },
  { text: 'Chưa xác thực', value: EMAIL_STATUS_VALUE.UNVERIFIED },
];

const ROLE_FILTERS = SELECTABLE_ROLES.map((role) => ({ text: ROLE_LABEL[role], value: role }));

const dateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function buildUsersColumns(filters: AdminUsersFilters): TableProps<AdminUserRow>['columns'] {
  return [
    {
      key: 'user',
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
      key: ROLE_FILTER_KEY,
      title: 'Vai trò',
      dataIndex: 'role',
      width: 140,
      filters: ROLE_FILTERS,
      filteredValue: roleFilterValue(filters),
      render: (role: Role) => <Tag color={ROLE_COLOR[role]}>{ROLE_LABEL[role]}</Tag>,
    },
    {
      key: EMAIL_STATUS_FILTER_KEY,
      title: 'Email',
      dataIndex: 'isEmailVerified',
      width: 130,
      filters: EMAIL_STATUS_FILTERS,
      filterMultiple: false,
      filteredValue: emailStatusFilterValue(filters),
      render: (isVerified: boolean) => (
        <Tag color={isVerified ? 'green' : 'orange'}>
          {isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
        </Tag>
      ),
    },
    {
      key: 'balance',
      title: 'Số dư',
      dataIndex: 'balance',
      width: 110,
      align: 'right',
      render: (balance: number) => formatNumber(balance),
    },
    {
      key: 'genCount',
      title: 'Lá số',
      dataIndex: 'genCount',
      width: 90,
      align: 'right',
      render: (genCount: number) => formatNumber(genCount),
    },
    {
      key: 'createdAt',
      title: 'Tham gia',
      dataIndex: 'createdAt',
      width: 120,
      render: (createdAt: string) => formatDate(createdAt),
    },
    {
      key: 'lastActiveAt',
      title: 'Hoạt động gần nhất',
      dataIndex: 'lastActiveAt',
      width: 180,
      render: (lastActiveAt: string | null) =>
        lastActiveAt ? dateTimeFormatter.format(new Date(lastActiveAt)) : NO_ACTIVITY,
    },
  ];
}
