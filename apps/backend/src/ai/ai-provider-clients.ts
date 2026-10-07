import { Injectable } from '@nestjs/common';
import { AiProvider, type AiProviderClient } from './ai-provider';
import { AnthropicProvider } from './anthropic.provider';
import { GeminiProvider } from './gemini.provider';
import { OpenAiProvider } from './openai.provider';

@Injectable()
export class AiProviderClients {
  private readonly clients: Readonly<Record<AiProvider, AiProviderClient>>;

  constructor(gemini: GeminiProvider, openai: OpenAiProvider, anthropic: AnthropicProvider) {
    this.clients = {
      [AiProvider.GEMINI]: gemini,
      [AiProvider.OPENAI]: openai,
      [AiProvider.ANTHROPIC]: anthropic,
    };
  }

  of(provider: AiProvider): AiProviderClient {
    return this.clients[provider];
  }
}
