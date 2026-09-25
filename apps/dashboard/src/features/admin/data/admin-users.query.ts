import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import type { AdminUsersQuery, AdminUserSortField, Role, SortDirection } from '@/gql/graphql';
import { graphqlRequest } from '@/lib/graphql-request';
import { adminUsersDocument } from './admin-users.document';

export const USERS_PAGE_SIZE = 20;
export const USERS_SEARCH_MAX_LENGTH = 120;
export const USERS_FIRST_PAGE = 1;

export type AdminUserRow = AdminUsersQuery['users']['users'][number];

export interface AdminUsersFilters {
  readonly page: number;
  readonly search: string;
  readonly roles: readonly Role[];
  readonly isEmailVerified: boolean | null;
  readonly joinedFrom: string | null;
  readonly joinedTo: string | null;
  readonly balanceMin: number | null;
  readonly balanceMax: number | null;
  readonly sortBy: AdminUserSortField;
  readonly sortDirection: SortDirection;
}

export const DEFAULT_USERS_FILTERS: AdminUsersFilters = {
  page: USERS_FIRST_PAGE,
  search: '',
  roles: [],
  isEmailVerified: null,
  joinedFrom: null,
  joinedTo: null,
  balanceMin: null,
  balanceMax: null,
  sortBy: 'CREATED_AT',
  sortDirection: 'DESC',
};

export function adminUsersQuery(filters: AdminUsersFilters) {
  return queryOptions({
    queryKey: ['admin', 'users', filters],
    queryFn: () =>
      graphqlRequest(adminUsersDocument, {
        page: filters.page,
        limit: USERS_PAGE_SIZE,
        search: filters.search || null,
        roles: filters.roles.length > 0 ? [...filters.roles] : null,
        isEmailVerified: filters.isEmailVerified,
        joinedFrom: filters.joinedFrom,
        joinedTo: filters.joinedTo,
        balanceMin: filters.balanceMin,
        balanceMax: filters.balanceMax,
        sortBy: filters.sortBy,
        sortDirection: filters.sortDirection,
      }),
    placeholderData: keepPreviousData,
  });
}
