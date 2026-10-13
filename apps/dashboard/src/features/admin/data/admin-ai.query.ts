import { queryOptions } from '@tanstack/react-query';
import type {
  AiCallsQuery,
  AiCallsQueryVariables,
  AiProvider,
  AiProviderFieldsFragment,
  AiSettingsQuery,
  AiUsageQuery,
  SaveAiProviderInput,
  TestAiProviderInput,
} from '@/gql/graphql';
import { graphqlRequest } from '@/lib/graphql-request';
import {
  aiCallsDocument,
  aiProviderModelsDocument,
  aiSettingsDocument,
  aiUsageDocument,
  checkAiProviderDocument,
  clearAiProviderKeyDocument,
  saveAiProviderDocument,
  setActiveAiProviderDocument,
  setAiProviderBudgetDocument,
  testAiProviderDocument,
} from './admin-ai.document';

export type AiSettingsView = AiSettingsQuery['aiSettings'];
export type AiProviderView = AiProviderFieldsFragment;
export type AiHealthView = NonNullable<AiProviderView['health']>;
export type AiUsageDayView = AiUsageQuery['aiUsage'][number];
export type AiCallView = AiCallsQuery['aiCalls']['items'][number];

export const AI_QUERY_KEY = ['admin', 'ai'] as const;

const MODEL_LIST_STALE_MS = 5 * 60_000;
const USAGE_REFRESH_MS = 60_000;

export const AI_USAGE_QUERY_KEY = [...AI_QUERY_KEY, 'usage'] as const;

export function aiSettingsQuery() {
  return queryOptions({
    queryKey: [...AI_QUERY_KEY, 'settings'],
    queryFn: () => graphqlRequest(aiSettingsDocument),
  });
}

export function aiProviderModelsQuery(provider: AiProvider, apiKeyHint: string | null) {
  return queryOptions({
    queryKey: [...AI_QUERY_KEY, 'models', provider, apiKeyHint],
    queryFn: () => graphqlRequest(aiProviderModelsDocument, { provider }),
    staleTime: MODEL_LIST_STALE_MS,
    retry: false,
  });
}

export function aiUsageQuery(from: string, to: string) {
  return queryOptions({
    queryKey: [...AI_USAGE_QUERY_KEY, from, to],
    queryFn: () => graphqlRequest(aiUsageDocument, { from, to }),
    refetchInterval: USAGE_REFRESH_MS,
  });
}

export function aiCallsQuery(variables: AiCallsQueryVariables) {
  return queryOptions({
    queryKey: [...AI_USAGE_QUERY_KEY, 'calls', variables],
    queryFn: () => graphqlRequest(aiCallsDocument, variables),
  });
}

export function setAiProviderBudget(provider: AiProvider, monthlyBudgetUsd: number | null) {
  return graphqlRequest(setAiProviderBudgetDocument, { provider, monthlyBudgetUsd });
}

export function listAiProviderModels(provider: AiProvider, apiKey: string | null) {
  return graphqlRequest(aiProviderModelsDocument, { provider, apiKey });
}

export function testAiProvider(input: TestAiProviderInput) {
  return graphqlRequest(testAiProviderDocument, { input });
}

export function saveAiProvider(input: SaveAiProviderInput) {
  return graphqlRequest(saveAiProviderDocument, { input });
}

export function clearAiProviderKey(provider: AiProvider) {
  return graphqlRequest(clearAiProviderKeyDocument, { provider });
}

export function setActiveAiProvider(provider: AiProvider | null) {
  return graphqlRequest(setActiveAiProviderDocument, { provider });
}

export function checkAiProvider(provider: AiProvider) {
  return graphqlRequest(checkAiProviderDocument, { provider });
}
