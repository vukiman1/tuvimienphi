import { queryOptions } from '@tanstack/react-query';
import type { AdminGiftCodesQuery, CreateGiftCodeInput } from '@/gql/graphql';
import { graphqlRequest } from '@/lib/graphql-request';
import {
  adminGiftCodesDocument,
  createGiftCodeDocument,
  setGiftCodeActiveDocument,
} from './admin-gift-codes.document';

export const GIFT_CODES_QUERY_KEY = ['admin', 'gift-codes'] as const;

export type AdminGiftCodeRow = AdminGiftCodesQuery['giftCodes'][number];

export function adminGiftCodesQuery() {
  return queryOptions({
    queryKey: GIFT_CODES_QUERY_KEY,
    queryFn: () => graphqlRequest(adminGiftCodesDocument),
  });
}

export function createGiftCode(input: CreateGiftCodeInput) {
  return graphqlRequest(createGiftCodeDocument, { input });
}

export function setGiftCodeActive(id: string, isActive: boolean) {
  return graphqlRequest(setGiftCodeActiveDocument, { id, isActive });
}
