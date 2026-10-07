import { graphql } from '@/gql';

export const aiProviderFieldsFragment = graphql(`
  fragment AiProviderFields on AdminAiProvider {
    provider
    hasApiKey
    apiKeyHint
    models
    isActive
    updatedAt
    health {
      status
      checkedAt
      latencyMs
      model
      error
    }
  }
`);

export const aiSettingsDocument = graphql(`
  query AiSettings {
    aiSettings {
      source
      providers {
        ...AiProviderFields
      }
    }
  }
`);

export const aiProviderModelsDocument = graphql(`
  query AiProviderModels($provider: AiProvider!, $apiKey: String) {
    aiProviderModels(provider: $provider, apiKey: $apiKey)
  }
`);

export const saveAiProviderDocument = graphql(`
  mutation SaveAiProvider($input: SaveAiProviderInput!) {
    saveAiProvider(input: $input) {
      ...AiProviderFields
    }
  }
`);

export const clearAiProviderKeyDocument = graphql(`
  mutation ClearAiProviderKey($provider: AiProvider!) {
    clearAiProviderKey(provider: $provider) {
      source
    }
  }
`);

export const setActiveAiProviderDocument = graphql(`
  mutation SetActiveAiProvider($provider: AiProvider) {
    setActiveAiProvider(provider: $provider) {
      source
    }
  }
`);

export const checkAiProviderDocument = graphql(`
  mutation CheckAiProvider($provider: AiProvider!) {
    checkAiProvider(provider: $provider) {
      ...AiProviderFields
    }
  }
`);

export const testAiProviderDocument = graphql(`
  mutation TestAiProvider($input: TestAiProviderInput!) {
    testAiProvider(input: $input) {
      status
      checkedAt
      latencyMs
      model
      error
    }
  }
`);
