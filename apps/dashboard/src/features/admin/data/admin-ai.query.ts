import { queryOptions } from '@tanstack/react-query';
import type {
  AiProvider,
  AiProviderFieldsFragment,
  AiSettingsQuery,
  SaveAiProviderInput,
  TestAiProviderInput,
} from '@/gql/graphql';
import { graphqlRequest } from '@/lib/graphql-request';
import {
  aiProviderModelsDocument,
  aiSettingsDocument,
  checkAiProviderDocument,
  clearAiProviderKeyDocument,
  saveAiProviderDocument,
  setActiveAiProviderDocument,
  testAiProviderDocument,
} from './admin-ai.document';

export type AiSettingsView = AiSettingsQuery['aiSettings'];
export type AiProviderView = AiProviderFieldsFragment;
export type AiHealthView = NonNullable<AiProviderView['health']>;

export const AI_QUERY_KEY = ['admin', 'ai'] as const;

const MODEL_LIST_STALE_MS = 5 * 60_000;

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
