import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import type { AdminUsersQuery } from '@/gql/graphql';
import { graphqlRequest } from '@/lib/graphql-request';
import { adminUsersDocument } from './admin-users.document';

export const USERS_PAGE_SIZE = 20;
export const USERS_SEARCH_MAX_LENGTH = 120;

export type AdminUserRow = AdminUsersQuery['users']['users'][number];

interface AdminUsersParams {
  readonly page: number;
  readonly search: string;
}

export function adminUsersQuery({ page, search }: AdminUsersParams) {
  return queryOptions({
    queryKey: ['admin', 'users', page, search],
    queryFn: () =>
      graphqlRequest(adminUsersDocument, {
        page,
        limit: USERS_PAGE_SIZE,
        search: search || null,
      }),
    placeholderData: keepPreviousData,
  });
}
