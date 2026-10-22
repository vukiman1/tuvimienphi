import { queryOptions } from '@tanstack/react-query';
import type { UpdateCreditSettingsInput } from '@/gql/graphql';
import { graphqlRequest } from '@/lib/graphql-request';
import {
  adminCreditSettingsDocument,
  updateCreditSettingsDocument,
} from './admin-credit-settings.document';

export const CREDIT_SETTINGS_QUERY_KEY = ['admin', 'credit-settings'] as const;

export function adminCreditSettingsQuery() {
  return queryOptions({
    queryKey: CREDIT_SETTINGS_QUERY_KEY,
    queryFn: () => graphqlRequest(adminCreditSettingsDocument),
  });
}

export function updateCreditSettings(input: UpdateCreditSettingsInput) {
  return graphqlRequest(updateCreditSettingsDocument, { input });
}
