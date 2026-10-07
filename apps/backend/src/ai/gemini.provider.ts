import { GoogleGenAI } from '@google/genai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AiCredentials, AiProviderClient } from './ai-provider';
import type { AiRequest, AiResult } from './ai.types';
import { tryModels } from './try-models';

const DEFAULT_TEMPERATURE = 0.7;
const JSON_MIME_TYPE = 'application/json';
const MODEL_NAME_PREFIX = /^models\//;
const GENERATE_ACTION = 'generateContent';

@Injectable()
export class GeminiProvider implements AiProviderClient {
  private readonly temperature: number;

  constructor(configService: ConfigService) {
    this.temperature = configService.get<number>('ai.temperature') ?? DEFAULT_TEMPERATURE;
  }

  async generate(request: AiRequest, { apiKey, models }: AiCredentials): Promise<AiResult> {
    const genai = new GoogleGenAI({ apiKey });

    const { result, model, failedAttempts, latencyMs } = await tryModels(
      models,
      async (candidate) => {
        const response = await genai.models.generateContent({
          model: candidate,
          contents: request.messages.map((message) => ({
            role: message.role,
            parts: [{ text: message.text }],
          })),
          config: {
            systemInstruction: request.system,
            responseMimeType: JSON_MIME_TYPE,
            responseSchema: request.schema,
            temperature: this.temperature,
            abortSignal: request.signal,
          },
        });

        const text = response.text;
        if (!text) {
          throw new Error('response carried no text');
        }
        const usage = response.usageMetadata;
        return {
          text,
          inputTokens: usage?.promptTokenCount ?? 0,
          outputTokens: (usage?.candidatesTokenCount ?? 0) + (usage?.thoughtsTokenCount ?? 0),
        };
      },
      () => request.signal?.aborted ?? false,
    );

    return { ...result, model, failedAttempts, latencyMs };
  }

  async listModels(apiKey: string): Promise<string[]> {
    const genai = new GoogleGenAI({ apiKey });
    const ids: string[] = [];
    for await (const model of await genai.models.list()) {
      if (model.name && model.supportedActions?.includes(GENERATE_ACTION)) {
        ids.push(model.name.replace(MODEL_NAME_PREFIX, ''));
      }
    }
    return ids.sort();
  }
}
