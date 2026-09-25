import { queryOptions } from '@tanstack/react-query';
import { graphqlRequest } from '@/lib/graphql-request';
import { adminOverviewDocument } from './admin-overview.document';

export const OVERVIEW_DEFAULT_DAYS = 30;

export interface OverviewRange {
  readonly from: string;
  readonly to: string;
}

export function adminOverviewQuery({ from, to }: OverviewRange) {
  return queryOptions({
    queryKey: ['admin', 'overview', from, to],
    queryFn: () => graphqlRequest(adminOverviewDocument, { from, to }),
  });
}
