import type { AiRequest, AiResult } from './ai.types';

export enum AiProvider {
  GEMINI = 'GEMINI',
  OPENAI = 'OPENAI',
  ANTHROPIC = 'ANTHROPIC',
}

export const AI_PROVIDERS = Object.values(AiProvider);

export interface AiCredentials {
  readonly apiKey: string;
  readonly models: readonly string[];
}

export interface AiProviderClient {
  generate(request: AiRequest, credentials: AiCredentials): Promise<AiResult>;
  listModels(apiKey: string): Promise<string[]>;
}
