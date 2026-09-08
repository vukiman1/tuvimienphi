import { GoogleGenAI } from '@google/genai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiClient } from './ai.client';
import { AiNotConfiguredError } from './ai.errors';
import type { AiRequest, AiResult } from './ai.types';
import { tryModels } from './try-models';

const DEFAULT_TEMPERATURE = 0.7;
const JSON_MIME_TYPE = 'application/json';

@Injectable()
export class GeminiClient extends AiClient {
  private readonly logger = new Logger(GeminiClient.name);
  private readonly genai: GoogleGenAI | null;
  private readonly models: readonly string[];
  private readonly temperature: number;

  constructor(configService: ConfigService) {
    super();
    const apiKey = configService.get<string>('ai.geminiApiKey');
    this.models = configService.get<string[]>('ai.models') ?? [];
    this.temperature = configService.get<number>('ai.temperature') ?? DEFAULT_TEMPERATURE;
    this.genai = apiKey ? new GoogleGenAI({ apiKey }) : null;

    if (!this.genai) {
      this.logger.warn('GEMINI_API_KEY is empty — chapter generation will fail closed');
    }
  }

  async generate(request: AiRequest): Promise<AiResult> {
    const genai = this.genai;
    if (!genai) {
      throw new AiNotConfiguredError();
    }

    const { result, model } = await tryModels(this.models, async (candidate) => {
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
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error('response carried no text');
      }
      return { text, outputTokens: response.usageMetadata?.candidatesTokenCount ?? 0 };
    });

    return { text: result.text, model, outputTokens: result.outputTokens };
  }
}
