import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { graphqlRequest } from '@/lib/graphql-request';
import { activeUsersSeriesDocument } from './active-users-series.document';
import type { OverviewRange } from './admin-overview.query';

export function activeUsersSeriesQuery({ from, to }: OverviewRange) {
  return queryOptions({
    queryKey: ['admin', 'active-users-series', from, to],
    queryFn: () => graphqlRequest(activeUsersSeriesDocument, { from, to }),
    placeholderData: keepPreviousData,
  });
}
