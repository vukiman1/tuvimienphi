import Anthropic, { type ClientOptions } from '@anthropic-ai/sdk';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AiGatewayConfig } from '@org/backend-config';
import type { AiCredentials, AiProviderClient } from '../port/ai-provider';
import { AiProvider } from '../port/ai-provider.enum';
import type { AiMessage, AiRequest, AiResult } from '../port/ai.types';
import { aiGatewayRoute, type AiGatewayRoute } from './ai-gateway-route';
import { closedSchema } from './closed-schema';
import { tryModels } from './try-models';

const MAX_TOKENS = 16_000;

function toMessage(message: AiMessage): Anthropic.MessageParam {
  return { role: message.role === 'model' ? 'assistant' : 'user', content: message.text };
}

function textOf(response: Anthropic.Message): string {
  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('');
}

@Injectable()
export class AnthropicProvider implements AiProviderClient {
  private readonly gatewayRoute: AiGatewayRoute | undefined;

  constructor(configService: ConfigService) {
    this.gatewayRoute = aiGatewayRoute(
      configService.get<AiGatewayConfig>('ai.gateway'),
      AiProvider.ANTHROPIC,
    );
  }

  async generate(request: AiRequest, { apiKey, models }: AiCredentials): Promise<AiResult> {
    const client = this.client(apiKey);

    const { result, model, failedAttempts, latencyMs } = await tryModels(
      models,
      async (candidate) => {
        const response = await client.messages.create(
          {
            model: candidate,
            max_tokens: MAX_TOKENS,
            system: request.system,
            messages: request.messages.map(toMessage),
            output_config: {
              format: { type: 'json_schema', schema: closedSchema(request.schema) },
            },
          },
          { signal: request.signal },
        );

        if (response.stop_reason === 'refusal') {
          throw new Error(`model refused: ${response.stop_details?.category ?? 'no category'}`);
        }
        if (response.stop_reason === 'max_tokens') {
          throw new Error('response was cut off before it finished');
        }
        const text = textOf(response);
        if (!text) {
          throw new Error('response carried no text');
        }
        return {
          text,
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        };
      },
      () => request.signal?.aborted ?? false,
    );

    return { ...result, model, failedAttempts, latencyMs };
  }

  async listModels(apiKey: string): Promise<string[]> {
    const client = this.client(apiKey);
    const ids: string[] = [];
    for await (const model of client.models.list()) {
      ids.push(model.id);
    }
    return ids.sort();
  }

  private client(apiKey: string): Anthropic {
    return new Anthropic(this.clientOptions(apiKey));
  }

  private clientOptions(apiKey: string): ClientOptions {
    if (!this.gatewayRoute) {
      return { apiKey };
    }
    return {
      apiKey,
      baseURL: this.gatewayRoute.baseUrl,
      defaultHeaders: this.gatewayRoute.headers,
    };
  }
}
