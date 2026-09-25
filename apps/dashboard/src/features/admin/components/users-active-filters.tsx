import { Flex, Tag } from 'antd';
import dayjs from 'dayjs';
import type { AdminUsersFilters } from '../data/admin-users.query';
import { ROLE_LABEL } from './role-label';

const DISPLAY_DATE_FORMAT = 'DD/MM/YYYY';

export interface ActiveFilter {
  readonly key: string;
  readonly label: string;
  readonly clear: Partial<AdminUsersFilters>;
}

interface UsersActiveFiltersProps {
  readonly filters: AdminUsersFilters;
  readonly onChange: (patch: Partial<AdminUsersFilters>) => void;
}

export function UsersActiveFilters({ filters, onChange }: UsersActiveFiltersProps) {
  const active = describeActiveFilters(filters);

  if (active.length === 0) {
    return null;
  }

  return (
    <Flex gap={8} wrap>
      {active.map(({ key, label, clear }) => (
        <Tag key={key} closable onClose={() => onChange(clear)}>
          {label}
        </Tag>
      ))}
    </Flex>
  );
}

export function describeActiveFilters(filters: AdminUsersFilters): ActiveFilter[] {
  const active: ActiveFilter[] = [];

  if (filters.search !== '') {
    active.push({ key: 'search', label: `Tìm: "${filters.search}"`, clear: { search: '' } });
  }

  for (const role of filters.roles) {
    active.push({
      key: `role:${role}`,
      label: `Vai trò: ${ROLE_LABEL[role]}`,
      clear: { roles: filters.roles.filter((kept) => kept !== role) },
    });
  }

  if (filters.isEmailVerified !== null) {
    active.push({
      key: 'email',
      label: `Email: ${filters.isEmailVerified ? 'đã xác thực' : 'chưa xác thực'}`,
      clear: { isEmailVerified: null },
    });
  }

  const joined = rangeLabel(
    filters.joinedFrom && dayjs(filters.joinedFrom).format(DISPLAY_DATE_FORMAT),
    filters.joinedTo && dayjs(filters.joinedTo).format(DISPLAY_DATE_FORMAT),
  );
  if (joined) {
    active.push({
      key: 'joined',
      label: `Tham gia ${joined}`,
      clear: { joinedFrom: null, joinedTo: null },
    });
  }

  const balance = rangeLabel(
    filters.balanceMin?.toLocaleString('vi-VN'),
    filters.balanceMax?.toLocaleString('vi-VN'),
  );
  if (balance) {
    active.push({
      key: 'balance',
      label: `Số dư ${balance}`,
      clear: { balanceMin: null, balanceMax: null },
    });
  }

  return active;
}

function rangeLabel(from: string | null | undefined, to: string | null | undefined): string | null {
  if (from && to) {
    return `${from} – ${to}`;
  }
  if (from) {
    return `từ ${from}`;
  }
  if (to) {
    return `đến ${to}`;
  }
  return null;
}
