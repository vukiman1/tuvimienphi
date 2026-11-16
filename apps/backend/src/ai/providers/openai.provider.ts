import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AiGatewayConfig } from '@org/backend-config';
import OpenAI, { type ClientOptions } from 'openai';
import type { AiCredentials, AiProviderClient } from '../port/ai-provider';
import { AiProvider } from '../port/ai-provider.enum';
import type { AiMessage, AiRequest, AiResult } from '../port/ai.types';
import { aiGatewayRoute, type AiGatewayRoute } from './ai-gateway-route';
import { closedSchema } from './closed-schema';
import { tryModels } from './try-models';

const RESPONSE_NAME = 'reply';
const CUT_OFF = 'length';

function toMessage(message: AiMessage): OpenAI.Chat.Completions.ChatCompletionMessageParam {
  return message.role === 'model'
    ? { role: 'assistant', content: message.text }
    : { role: 'user', content: message.text };
}

@Injectable()
export class OpenAiProvider implements AiProviderClient {
  private readonly gatewayRoute: AiGatewayRoute | undefined;

  constructor(configService: ConfigService) {
    this.gatewayRoute = aiGatewayRoute(
      configService.get<AiGatewayConfig>('ai.gateway'),
      AiProvider.OPENAI,
    );
  }

  async generate(request: AiRequest, { apiKey, models }: AiCredentials): Promise<AiResult> {
    const client = this.client(apiKey);

    const { result, model, failedAttempts, latencyMs } = await tryModels(
      models,
      async (candidate) => {
        const completion = await client.chat.completions.create(
          {
            model: candidate,
            messages: [
              { role: 'system', content: request.system },
              ...request.messages.map(toMessage),
            ],
            response_format: {
              type: 'json_schema',
              json_schema: {
                name: RESPONSE_NAME,
                strict: true,
                schema: closedSchema(request.schema),
              },
            },
          },
          { signal: request.signal },
        );

        const [choice] = completion.choices;
        if (choice?.message.refusal) {
          throw new Error(`model refused: ${choice.message.refusal}`);
        }
        if (choice?.finish_reason === CUT_OFF) {
          throw new Error('response was cut off before it finished');
        }
        const text = choice?.message.content;
        if (!text) {
          throw new Error('response carried no text');
        }
        return {
          text,
          inputTokens: completion.usage?.prompt_tokens ?? 0,
          outputTokens: completion.usage?.completion_tokens ?? 0,
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

  private client(apiKey: string): OpenAI {
    return new OpenAI(this.clientOptions(apiKey));
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
