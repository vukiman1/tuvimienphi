import type { AiRequest, AiResult } from './ai.types';

export { AI_PROVIDERS, AiProvider } from './ai-provider.enum';

export interface AiCredentials {
  readonly apiKey: string;
  readonly models: readonly string[];
}

export interface AiProviderClient {
  generate(request: AiRequest, credentials: AiCredentials): Promise<AiResult>;
  listModels(apiKey: string): Promise<string[]>;
}
