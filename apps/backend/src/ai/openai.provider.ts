import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import type { AiCredentials, AiProviderClient } from './ai-provider';
import type { AiMessage, AiRequest, AiResult } from './ai.types';
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
  async generate(request: AiRequest, { apiKey, models }: AiCredentials): Promise<AiResult> {
    const client = new OpenAI({ apiKey });

    const { result, model } = await tryModels(
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
        return { text, outputTokens: completion.usage?.completion_tokens ?? 0 };
      },
      () => request.signal?.aborted ?? false,
    );

    return { text: result.text, model, outputTokens: result.outputTokens };
  }

  async listModels(apiKey: string): Promise<string[]> {
    const client = new OpenAI({ apiKey });
    const ids: string[] = [];
    for await (const model of client.models.list()) {
      ids.push(model.id);
    }
    return ids.sort();
  }
}
