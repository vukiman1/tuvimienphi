import { BadRequestException } from '@nestjs/common';
import { AiHealthService, MAX_HEALTH_ERROR_LENGTH } from './ai-health.service';
import { AiProvider, type AiProviderClient } from './ai-provider';
import { AiProviderClients } from './ai-provider-clients';
import { AiSettingsService, type AiHealthOutcome } from './ai-settings.service';
import { AiUnavailableError } from './ai.errors';
import { AiHealthStatus, AiProviderEntity } from './entities/ai-provider.entity';

const CREDENTIALS = { apiKey: 'sk-key', models: ['fast', 'slow'] };

function setup(generate: AiProviderClient['generate']) {
  const recorded: AiHealthOutcome[] = [];
  const settings = {
    credentialsOf: jest.fn().mockResolvedValue(CREDENTIALS),
    recordHealth: jest.fn(async (_provider: AiProvider, outcome: AiHealthOutcome) => {
      recorded.push(outcome);
      return new AiProviderEntity();
    }),
  };
  const providers = { of: () => ({ generate, listModels: jest.fn() }) };
  const service = new AiHealthService(
    settings as unknown as AiSettingsService,
    providers as unknown as AiProviderClients,
  );
  return { service, settings, recorded };
}

describe('AiHealthService.check', () => {
  it('asks for the same kind of JSON reply the site asks for, with the stored credentials', async () => {
    const generate = jest
      .fn()
      .mockResolvedValue({ text: '{"ok":true}', model: 'fast', outputTokens: 4 });
    const { service } = setup(generate);

    await service.check(AiProvider.OPENAI);

    const [request, credentials] = generate.mock.calls[0];
    expect(credentials).toEqual(CREDENTIALS);
    expect(request.schema).toEqual({
      type: 'object',
      properties: { ok: { type: 'boolean' } },
      required: ['ok'],
    });
    expect(request.signal).toBeInstanceOf(AbortSignal);
  });

  it('records which model answered and how long it took', async () => {
    const generate = jest
      .fn()
      .mockResolvedValue({ text: '{"ok":true}', model: 'slow', outputTokens: 4 });
    const { service, recorded } = setup(generate);

    await service.check(AiProvider.OPENAI);

    expect(recorded).toEqual([
      { status: AiHealthStatus.OK, latencyMs: expect.any(Number), model: 'slow', error: null },
    ]);
  });

  it('records why every model failed instead of throwing at the console', async () => {
    const generate = jest.fn().mockRejectedValue(
      new AiUnavailableError([
        { model: 'fast', reason: '401 invalid x-api-key' },
        { model: 'slow', reason: '401 invalid x-api-key' },
      ]),
    );
    const { service, recorded } = setup(generate);

    await expect(service.check(AiProvider.ANTHROPIC)).resolves.toBeInstanceOf(AiProviderEntity);

    expect(recorded[0].status).toBe(AiHealthStatus.FAILED);
    expect(recorded[0].model).toBeNull();
    expect(recorded[0].error).toContain('fast: 401 invalid x-api-key');
  });

  it('fails a provider that answers with something that is not JSON', async () => {
    const generate = jest.fn().mockResolvedValue({ text: 'OK!', model: 'fast', outputTokens: 2 });
    const { service, recorded } = setup(generate);

    await service.check(AiProvider.GEMINI);

    expect(recorded[0].status).toBe(AiHealthStatus.FAILED);
  });

  it('keeps a long provider error short enough to show', async () => {
    const generate = jest.fn().mockRejectedValue(
      new AiUnavailableError([
        { model: 'fast', reason: 'x'.repeat(400) },
        { model: 'slow', reason: 'y'.repeat(400) },
      ]),
    );
    const { service, recorded } = setup(generate);

    await service.check(AiProvider.GEMINI);

    expect(recorded[0].error).toHaveLength(MAX_HEALTH_ERROR_LENGTH);
  });

  it('says a key is missing rather than recording a failed check that never ran', async () => {
    const generate = jest.fn();
    const { service, settings } = setup(generate);
    settings.credentialsOf.mockRejectedValue(new BadRequestException('OPENAI has no API key yet'));

    await expect(service.check(AiProvider.OPENAI)).rejects.toBeInstanceOf(BadRequestException);

    expect(generate).not.toHaveBeenCalled();
    expect(settings.recordHealth).not.toHaveBeenCalled();
  });
});
