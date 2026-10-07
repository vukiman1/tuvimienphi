import OpenAI from 'openai';
import { AiUnavailableError } from './ai.errors';
import type { AiRequest } from './ai.types';
import { OpenAiProvider } from './openai.provider';

const mockCreate = jest.fn();
const mockList = jest.fn();

jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    chat: { completions: { create: mockCreate } },
    models: { list: mockList },
  })),
}));

const REQUEST: AiRequest = {
  system: 'Viết hai câu.',
  messages: [
    { role: 'user', text: 'brief' },
    { role: 'model', text: '{"doan":"bản trước"}' },
    { role: 'user', text: 'lỗi: quá dài' },
  ],
  schema: { type: 'object', properties: { doan: { type: 'string' } }, required: ['doan'] },
};

function completion(message: Record<string, unknown>, finishReason = 'stop') {
  return {
    choices: [
      { finish_reason: finishReason, message: { refusal: null, content: null, ...message } },
    ],
    usage: { prompt_tokens: 280, completion_tokens: 17 },
  };
}

async function* modelsOf(...ids: string[]) {
  for (const id of ids) {
    yield { id };
  }
}

beforeEach(() => {
  mockCreate.mockReset();
  mockList.mockReset();
  (OpenAI as unknown as jest.Mock).mockClear();
});

describe('OpenAiProvider.generate', () => {
  it('asks for strict JSON in the given shape, with the stored key', async () => {
    mockCreate.mockResolvedValue(completion({ content: '{"doan":"Hai câu."}' }));
    const signal = AbortSignal.timeout(5_000);

    await new OpenAiProvider().generate(
      { ...REQUEST, signal },
      { apiKey: 'sk-openai-key', models: ['gpt-fast'] },
    );

    expect(OpenAI).toHaveBeenCalledWith({ apiKey: 'sk-openai-key' });
    expect(mockCreate).toHaveBeenCalledWith(
      {
        model: 'gpt-fast',
        messages: [
          { role: 'system', content: 'Viết hai câu.' },
          { role: 'user', content: 'brief' },
          { role: 'assistant', content: '{"doan":"bản trước"}' },
          { role: 'user', content: 'lỗi: quá dài' },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'reply',
            strict: true,
            schema: {
              type: 'object',
              properties: { doan: { type: 'string' } },
              required: ['doan'],
              additionalProperties: false,
            },
          },
        },
      },
      { signal },
    );
  });

  it('returns the reply with the model that wrote it', async () => {
    mockCreate.mockResolvedValue(completion({ content: '{"doan":"Hai câu."}' }));

    await expect(
      new OpenAiProvider().generate(REQUEST, { apiKey: 'k', models: ['gpt-fast'] }),
    ).resolves.toEqual({
      text: '{"doan":"Hai câu."}',
      model: 'gpt-fast',
      inputTokens: 280,
      outputTokens: 17,
      failedAttempts: [],
      latencyMs: expect.any(Number),
    });
  });

  it('moves to the next model when the first one refuses', async () => {
    mockCreate
      .mockResolvedValueOnce(completion({ refusal: 'I cannot help with that.' }))
      .mockResolvedValueOnce(completion({ content: '{"doan":"Hai câu."}' }));

    const result = await new OpenAiProvider().generate(REQUEST, {
      apiKey: 'k',
      models: ['gpt-fast', 'gpt-big'],
    });

    expect(result.model).toBe('gpt-big');
  });

  it('reports a reply cut off at the token limit as a failure, not as half a JSON object', async () => {
    mockCreate.mockResolvedValue(completion({ content: '{"doan":"Hai' }, 'length'));

    await expect(
      new OpenAiProvider().generate(REQUEST, { apiKey: 'k', models: ['gpt-fast'] }),
    ).rejects.toBeInstanceOf(AiUnavailableError);
  });

  it('says why when every model fails', async () => {
    mockCreate.mockRejectedValue(new Error('401 Incorrect API key provided'));

    await expect(
      new OpenAiProvider().generate(REQUEST, { apiKey: 'bad', models: ['gpt-fast'] }),
    ).rejects.toThrow('gpt-fast: 401 Incorrect API key provided');
  });
});

describe('OpenAiProvider.listModels', () => {
  it('lists the model ids the key can use, sorted', async () => {
    mockList.mockReturnValue(modelsOf('gpt-b', 'gpt-a'));

    await expect(new OpenAiProvider().listModels('sk-openai-key')).resolves.toEqual([
      'gpt-a',
      'gpt-b',
    ]);
  });
});
