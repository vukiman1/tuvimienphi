import type { Key } from 'react';
import type { TableProps } from 'antd';
import type { Role } from '@/gql/graphql';
import {
  USERS_FIRST_PAGE,
  type AdminUserRow,
  type AdminUsersFilters,
} from '../data/admin-users.query';

type TableChangeHandler = NonNullable<TableProps<AdminUserRow>['onChange']>;
type TablePagination = Parameters<TableChangeHandler>[0];
type TableFilters = Parameters<TableChangeHandler>[1];
type TableExtra = Parameters<TableChangeHandler>[3];
type FilterSelection = readonly (boolean | Key)[] | null | undefined;

export type TableDrivenFilters = Pick<AdminUsersFilters, 'page' | 'roles' | 'isEmailVerified'>;

export const ROLE_FILTER_KEY = 'role';
export const EMAIL_STATUS_FILTER_KEY = 'isEmailVerified';

export const EMAIL_STATUS_VALUE = {
  VERIFIED: 'true',
  UNVERIFIED: 'false',
} as const;

export const SELECTABLE_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'SELLER',
  'USER',
] as const satisfies readonly Role[];

export function readTableChange(
  pagination: TablePagination,
  filters: TableFilters,
  extra: TableExtra,
): TableDrivenFilters {
  return {
    page: extra.action === 'paginate' ? (pagination.current ?? USERS_FIRST_PAGE) : USERS_FIRST_PAGE,
    roles: readRoles(filters[ROLE_FILTER_KEY]),
    isEmailVerified: readEmailStatus(filters[EMAIL_STATUS_FILTER_KEY]),
  };
}

export function roleFilterValue(filters: AdminUsersFilters): Key[] | null {
  return filters.roles.length > 0 ? [...filters.roles] : null;
}

export function emailStatusFilterValue(filters: AdminUsersFilters): Key[] | null {
  if (filters.isEmailVerified === null) {
    return null;
  }
  return [filters.isEmailVerified ? EMAIL_STATUS_VALUE.VERIFIED : EMAIL_STATUS_VALUE.UNVERIFIED];
}

function readRoles(selected: FilterSelection): Role[] {
  if (!selected) {
    return [];
  }
  return SELECTABLE_ROLES.filter((role) => selected.includes(role));
}

function readEmailStatus(selected: FilterSelection): boolean | null {
  if (selected?.length !== 1) {
    return null;
  }
  return selected[0] === EMAIL_STATUS_VALUE.VERIFIED;
}
