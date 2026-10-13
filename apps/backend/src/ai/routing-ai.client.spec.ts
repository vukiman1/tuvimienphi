import { AiProvider } from './ai-provider';
import { AiProviderClients } from './ai-provider-clients';
import { AiSettingsService, AiSource, type ActiveAi } from './ai-settings.service';
import { AiUsagePurpose } from './ai-usage-purpose.enum';
import { AiUsageService } from './ai-usage.service';
import { AiNotConfiguredError } from './ai.errors';
import type { AiRequest, AiResult } from './ai.types';
import { RoutingAiClient } from './routing-ai.client';

const REQUEST: AiRequest = {
  system: 'Viết hai câu.',
  messages: [{ role: 'user', text: '{}' }],
  schema: { type: 'object', properties: { doan: { type: 'string' } }, required: ['doan'] },
};

function setup(active: ActiveAi | null) {
  const generate = jest
    .fn()
    .mockResolvedValue({ text: '{"doan":"…"}', model: 'm', outputTokens: 9 });
  const of = jest.fn().mockReturnValue({ generate });
  const track = jest.fn(
    (_provider: AiProvider, _purpose: AiUsagePurpose, work: () => Promise<AiResult>) => work(),
  );
  const client = new RoutingAiClient(
    { resolveActive: async () => active } as unknown as AiSettingsService,
    { of } as unknown as AiProviderClients,
    { track } as unknown as AiUsageService,
  );
  return { client, generate, of, track };
}

describe('RoutingAiClient', () => {
  it('sends the request to whichever provider the console chose, with its key and models', async () => {
    const credentials = { apiKey: 'sk-ant', models: ['claude-opus-5-5'] };
    const { client, generate, of } = setup({
      provider: AiProvider.ANTHROPIC,
      credentials,
      source: AiSource.CONSOLE,
    });

    await expect(client.generate(REQUEST)).resolves.toEqual({
      text: '{"doan":"…"}',
      model: 'm',
      outputTokens: 9,
    });
    expect(of).toHaveBeenCalledWith(AiProvider.ANTHROPIC);
    expect(generate).toHaveBeenCalledWith(REQUEST, credentials);
  });

  it('fails closed when nothing is configured anywhere', async () => {
    const { client, generate } = setup(null);

    await expect(client.generate(REQUEST)).rejects.toBeInstanceOf(AiNotConfiguredError);
    expect(generate).not.toHaveBeenCalled();
  });
});
