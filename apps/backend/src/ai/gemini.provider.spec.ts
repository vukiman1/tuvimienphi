import { GoogleGenAI } from '@google/genai';
import { ConfigService } from '@nestjs/config';
import type { AiRequest } from './ai.types';
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

function provider(temperature?: number): GeminiProvider {
  return new GeminiProvider({ get: () => temperature } as unknown as ConfigService);
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
      usageMetadata: { candidatesTokenCount: 12 },
    });
    const signal = AbortSignal.timeout(5_000);

    const result = await provider(0.4).generate(
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
    expect(result).toEqual({ text: '{"doan":"Hai câu."}', model: 'flash-lite', outputTokens: 12 });
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
});
