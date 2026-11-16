import Anthropic from '@anthropic-ai/sdk';
import { ConfigService } from '@nestjs/config';
import type { AiGatewayConfig } from '@org/backend-config';
import { AiUnavailableError } from '../port/ai.errors';
import type { AiRequest } from '../port/ai.types';
import { AnthropicProvider } from './anthropic.provider';

const mockCreate = jest.fn();
const mockList = jest.fn();

jest.mock('@anthropic-ai/sdk', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    messages: { create: mockCreate },
    models: { list: mockList },
  })),
}));

const GATEWAY: AiGatewayConfig = {
  baseUrl: 'https://gateway.ai.cloudflare.com/v1/account/tuvimienphi',
  token: 'gateway-token',
};

const GATEWAY_CLIENT_OPTIONS = {
  baseURL: 'https://gateway.ai.cloudflare.com/v1/account/tuvimienphi/anthropic',
  defaultHeaders: { 'cf-aig-authorization': 'Bearer gateway-token' },
};

function provider(gateway?: AiGatewayConfig): AnthropicProvider {
  return new AnthropicProvider(new ConfigService({ ai: { gateway } }));
}

const REQUEST: AiRequest = {
  system: 'Viết hai câu.',
  messages: [
    { role: 'user', text: 'brief' },
    { role: 'model', text: '{"doan":"bản trước"}' },
    { role: 'user', text: 'lỗi: quá dài' },
  ],
  schema: { type: 'object', properties: { doan: { type: 'string' } }, required: ['doan'] },
};

function reply(overrides: Record<string, unknown> = {}) {
  return {
    stop_reason: 'end_turn',
    stop_details: null,
    content: [
      { type: 'thinking', thinking: '' },
      { type: 'text', text: '{"doan":"Hai câu."}' },
    ],
    usage: { input_tokens: 340, output_tokens: 21 },
    ...overrides,
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
  (Anthropic as unknown as jest.Mock).mockClear();
});

describe('AnthropicProvider.generate', () => {
  it('asks for JSON in the given shape, with the stored key and no sampling or thinking settings', async () => {
    mockCreate.mockResolvedValue(reply());
    const signal = AbortSignal.timeout(5_000);

    await provider().generate(
      { ...REQUEST, signal },
      { apiKey: 'sk-ant-key', models: ['claude-opus-5-5'] },
    );

    expect(Anthropic).toHaveBeenCalledWith({ apiKey: 'sk-ant-key' });
    expect(mockCreate).toHaveBeenCalledWith(
      {
        model: 'claude-opus-5-5',
        max_tokens: 16_000,
        system: 'Viết hai câu.',
        messages: [
          { role: 'user', content: 'brief' },
          { role: 'assistant', content: '{"doan":"bản trước"}' },
          { role: 'user', content: 'lỗi: quá dài' },
        ],
        output_config: {
          format: {
            type: 'json_schema',
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

  it('returns the text block and skips the thinking block that comes before it', async () => {
    mockCreate.mockResolvedValue(reply());

    await expect(
      provider().generate(REQUEST, { apiKey: 'k', models: ['claude-opus-5-5'] }),
    ).resolves.toEqual({
      text: '{"doan":"Hai câu."}',
      model: 'claude-opus-5-5',
      inputTokens: 340,
      outputTokens: 21,
      failedAttempts: [],
      latencyMs: expect.any(Number),
    });
  });

  it('moves to the next model when the first one declines', async () => {
    mockCreate
      .mockResolvedValueOnce(
        reply({ stop_reason: 'refusal', stop_details: { category: 'cyber' }, content: [] }),
      )
      .mockResolvedValueOnce(reply());

    const result = await provider().generate(REQUEST, {
      apiKey: 'k',
      models: ['claude-opus-5-5', 'claude-haiku-4-5'],
    });

    expect(result.model).toBe('claude-haiku-4-5');
  });

  it('reports a reply cut off at the token limit as a failure, not as half a JSON object', async () => {
    mockCreate.mockResolvedValue(reply({ stop_reason: 'max_tokens' }));

    await expect(
      provider().generate(REQUEST, { apiKey: 'k', models: ['claude-opus-5-5'] }),
    ).rejects.toBeInstanceOf(AiUnavailableError);
  });

  it('says why when every model fails', async () => {
    mockCreate.mockRejectedValue(new Error('401 invalid x-api-key'));

    await expect(
      provider().generate(REQUEST, { apiKey: 'bad', models: ['claude-opus-5-5'] }),
    ).rejects.toThrow('claude-opus-5-5: 401 invalid x-api-key');
  });

  it('goes through Cloudflare AI Gateway when the gateway is configured', async () => {
    mockCreate.mockResolvedValue(reply());

    await provider(GATEWAY).generate(REQUEST, {
      apiKey: 'sk-ant-key',
      models: ['claude-opus-5-5'],
    });

    expect(Anthropic).toHaveBeenCalledWith({ apiKey: 'sk-ant-key', ...GATEWAY_CLIENT_OPTIONS });
  });
});

describe('AnthropicProvider.listModels', () => {
  it('lists the model ids the key can use, sorted', async () => {
    mockList.mockReturnValue(modelsOf('claude-sonnet-5-5', 'claude-haiku-4-5', 'claude-opus-5-5'));

    await expect(provider().listModels('sk-ant-key')).resolves.toEqual([
      'claude-haiku-4-5',
      'claude-opus-5-5',
      'claude-sonnet-5-5',
    ]);
  });

  it('lists models through Cloudflare AI Gateway when the gateway is configured', async () => {
    mockList.mockReturnValue(modelsOf());

    await provider(GATEWAY).listModels('sk-ant-key');

    expect(Anthropic).toHaveBeenCalledWith({ apiKey: 'sk-ant-key', ...GATEWAY_CLIENT_OPTIONS });
  });
});
