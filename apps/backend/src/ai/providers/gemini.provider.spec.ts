import { GoogleGenAI } from '@google/genai';
import { ConfigService } from '@nestjs/config';
import type { AiGatewayConfig } from '@org/backend-config';
import type { AiRequest } from '../port/ai.types';
import { GeminiProvider } from './gemini.provider';

const mockGenerateContent = jest.fn();
const mockList = jest.fn();

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: { generateContent: mockGenerateContent, list: mockList },
  })),
}));

const REQUEST: AiRequest = {
  system: 'Viết hai câu.',
  messages: [
    { role: 'user', text: 'brief' },
    { role: 'model', text: '{"doan":"bản trước"}' },
  ],
  schema: { type: 'object', properties: { doan: { type: 'string' } }, required: ['doan'] },
};

const GATEWAY: AiGatewayConfig = {
  baseUrl: 'https://gateway.ai.cloudflare.com/v1/account/tuvimienphi',
  token: 'gateway-token',
};

interface ProviderSettings {
  readonly temperature?: number;
  readonly gateway?: AiGatewayConfig;
}

function provider({ temperature, gateway }: ProviderSettings = {}): GeminiProvider {
  const settings: Readonly<Record<string, unknown>> = {
    'ai.temperature': temperature,
    'ai.gateway': gateway,
  };
  return new GeminiProvider({ get: (key: string) => settings[key] } as unknown as ConfigService);
}

async function* modelsOf(...models: { name?: string; supportedActions?: string[] }[]) {
  for (const model of models) {
    yield model;
  }
}

beforeEach(() => {
  mockGenerateContent.mockReset();
  mockList.mockReset();
  (GoogleGenAI as unknown as jest.Mock).mockClear();
});

describe('GeminiProvider.generate', () => {
  it('calls Gemini with the key it was handed, not one read at start-up', async () => {
    mockGenerateContent.mockResolvedValue({
      text: '{"doan":"Hai câu."}',
      usageMetadata: { promptTokenCount: 310, candidatesTokenCount: 12, thoughtsTokenCount: 30 },
    });
    const signal = AbortSignal.timeout(5_000);

    const result = await provider({ temperature: 0.4 }).generate(
      { ...REQUEST, signal },
      { apiKey: 'console-key', models: ['flash-lite'] },
    );

    expect(GoogleGenAI).toHaveBeenCalledWith({ apiKey: 'console-key' });
    expect(mockGenerateContent).toHaveBeenCalledWith({
      model: 'flash-lite',
      contents: [
        { role: 'user', parts: [{ text: 'brief' }] },
        { role: 'model', parts: [{ text: '{"doan":"bản trước"}' }] },
      ],
      config: {
        systemInstruction: 'Viết hai câu.',
        responseMimeType: 'application/json',
        responseSchema: REQUEST.schema,
        temperature: 0.4,
        abortSignal: signal,
      },
    });
    expect(result).toEqual({
      text: '{"doan":"Hai câu."}',
      model: 'flash-lite',
      inputTokens: 310,
      outputTokens: 42,
      failedAttempts: [],
      latencyMs: expect.any(Number),
    });
  });

  it('tries the models in the order the console lists them', async () => {
    mockGenerateContent
      .mockRejectedValueOnce(new Error('UNAVAILABLE'))
      .mockResolvedValueOnce({ text: '{"doan":"Hai câu."}' });

    const result = await provider().generate(REQUEST, {
      apiKey: 'k',
      models: ['flash-lite', 'flash'],
    });

    expect(result.model).toBe('flash');
    expect(result.outputTokens).toBe(0);
  });

  it('goes through Cloudflare AI Gateway when the gateway is configured', async () => {
    mockGenerateContent.mockResolvedValue({ text: '{"doan":"Hai câu."}' });

    await provider({ gateway: GATEWAY }).generate(REQUEST, {
      apiKey: 'console-key',
      models: ['flash-lite'],
    });

    expect(GoogleGenAI).toHaveBeenCalledWith({
      apiKey: 'console-key',
      httpOptions: {
        baseUrl: `${GATEWAY.baseUrl}/google-ai-studio`,
        headers: { 'cf-aig-authorization': 'Bearer gateway-token' },
      },
    });
  });
});

describe('GeminiProvider.listModels', () => {
  it('offers only models that can generate text, without the "models/" prefix', async () => {
    mockList.mockResolvedValue(
      modelsOf(
        { name: 'models/gemini-flash', supportedActions: ['generateContent', 'countTokens'] },
        { name: 'models/text-embedding', supportedActions: ['embedContent'] },
        { name: 'models/gemini-flash-lite', supportedActions: ['generateContent'] },
        { supportedActions: ['generateContent'] },
      ),
    );

    await expect(provider().listModels('console-key')).resolves.toEqual([
      'gemini-flash',
      'gemini-flash-lite',
    ]);
  });

  it('lists models through Cloudflare AI Gateway when the gateway is configured', async () => {
    mockList.mockResolvedValue(modelsOf());

    await provider({ gateway: GATEWAY }).listModels('console-key');

    expect(GoogleGenAI).toHaveBeenCalledWith({
      apiKey: 'console-key',
      httpOptions: {
        baseUrl: `${GATEWAY.baseUrl}/google-ai-studio`,
        headers: { 'cf-aig-authorization': 'Bearer gateway-token' },
      },
    });
  });
});
