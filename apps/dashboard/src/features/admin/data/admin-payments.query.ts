import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import type { AdminPaymentsQuery, AssignPaymentInput, PaymentStatus } from '@/gql/graphql';
import { graphqlRequest } from '@/lib/graphql-request';
import { adminPaymentsDocument, assignPaymentDocument } from './admin-payments.document';

export const PAYMENTS_QUERY_KEY = ['admin', 'payments'] as const;
export const PAYMENTS_PAGE_SIZE = 20;
export const PAYMENTS_FIRST_PAGE = 1;

export type AdminPaymentRow = AdminPaymentsQuery['payments']['payments'][number];

export interface AdminPaymentsFilters {
  readonly page: number;
  readonly status: PaymentStatus | null;
}

export const DEFAULT_PAYMENTS_FILTERS: AdminPaymentsFilters = {
  page: PAYMENTS_FIRST_PAGE,
  status: null,
};

export function adminPaymentsQuery(filters: AdminPaymentsFilters) {
  return queryOptions({
    queryKey: [...PAYMENTS_QUERY_KEY, filters],
    queryFn: () =>
      graphqlRequest(adminPaymentsDocument, {
        page: filters.page,
        limit: PAYMENTS_PAGE_SIZE,
        status: filters.status,
      }),
    placeholderData: keepPreviousData,
  });
}

export function assignPayment(input: AssignPaymentInput) {
  return graphqlRequest(assignPaymentDocument, { input });
}
