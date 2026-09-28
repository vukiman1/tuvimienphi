import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import type { RecentActivityQuery } from '@/gql/graphql';
import { graphqlRequest } from '@/lib/graphql-request';
import { recentActivityDocument } from './recent-activity.document';

export const RECENT_ACTIVITY_LIMIT = 15;
export const RECENT_ACTIVITY_FIRST_PAGE = 1;

export type ActivityRow = RecentActivityQuery['recentActivity']['entries'][number];

export function recentActivityQuery(page: number) {
  return queryOptions({
    queryKey: ['admin', 'activity', page, RECENT_ACTIVITY_LIMIT],
    queryFn: () => graphqlRequest(recentActivityDocument, { page, limit: RECENT_ACTIVITY_LIMIT }),
    placeholderData: keepPreviousData,
  });
}
