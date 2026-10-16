import { queryOptions } from '@tanstack/react-query';
import type { CreditCheckout, CreditSummary } from '@org/shared-contracts';
import { ApiError } from '@/lib/api-error';
import { httpRequest } from '@/lib/http-request';

export const HTTP_PAYMENT_REQUIRED = 402;

export const creditsQueries = {
  summary: () =>
    queryOptions({
      queryKey: ['credits', 'summary'] as const,
      queryFn: () => httpRequest.get<CreditSummary>('/credits'),
    }),

  checkout: () =>
    queryOptions({
      queryKey: ['credits', 'checkout'] as const,
      queryFn: () => httpRequest.get<CreditCheckout>('/credits/checkout'),
      staleTime: Infinity,
    }),
};

export function isOutOfLuot(error: unknown): boolean {
  return error instanceof ApiError && error.statusCode === HTTP_PAYMENT_REQUIRED;
}
