import { BadRequestException } from '@nestjs/common';
import { AiHealthService, MAX_HEALTH_ERROR_LENGTH } from './ai-health.service';
import { AiProvider, type AiProviderClient } from './ai-provider';
import { AiProviderClients } from './ai-provider-clients';
import { AiSettingsService, type AiHealthOutcome } from './ai-settings.service';
import { AiUsagePurpose } from './ai-usage-purpose.enum';
import { AiUsageService } from './ai-usage.service';
import { AiUnavailableError } from './ai.errors';
import type { AiResult } from './ai.types';
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
  const usage = {
    track: jest.fn(
      (_provider: AiProvider, _purpose: AiUsagePurpose, work: () => Promise<AiResult>) => work(),
    ),
  };
  const service = new AiHealthService(
    settings as unknown as AiSettingsService,
    providers as unknown as AiProviderClients,
    usage as unknown as AiUsageService,
  );
  return { service, settings, recorded, usage };
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

describe('AiHealthService.probe', () => {
  it('tries credentials nobody has saved yet and leaves the stored health alone', async () => {
    const generate = jest
      .fn()
      .mockResolvedValue({ text: '{"ok":true}', model: 'draft', outputTokens: 4 });
    const { service, settings } = setup(generate);
    const typed = { apiKey: 'sk-typed-not-saved', models: ['draft'] };

    const outcome = await service.probe(AiProvider.OPENAI, typed);

    expect(generate.mock.calls[0][1]).toEqual(typed);
    expect(outcome).toEqual({
      status: AiHealthStatus.OK,
      latencyMs: expect.any(Number),
      model: 'draft',
      error: null,
    });
    expect(settings.credentialsOf).not.toHaveBeenCalled();
    expect(settings.recordHealth).not.toHaveBeenCalled();
  });

  it('answers with the failure instead of throwing', async () => {
    const generate = jest
      .fn()
      .mockRejectedValue(new AiUnavailableError([{ model: 'draft', reason: '404 unknown model' }]));
    const { service } = setup(generate);

    const outcome = await service.probe(AiProvider.GEMINI, { apiKey: 'k', models: ['draft'] });

    expect(outcome.status).toBe(AiHealthStatus.FAILED);
    expect(outcome.error).toContain('draft: 404 unknown model');
  });

  it('counts the call as a check, so the health bar shows up in the usage report', async () => {
    const generate = jest
      .fn()
      .mockResolvedValue({ text: '{"ok":true}', model: 'draft', outputTokens: 4 });
    const { service, usage } = setup(generate);

    await service.probe(AiProvider.OPENAI, { apiKey: 'k', models: ['draft'] });

    expect(usage.track).toHaveBeenCalledWith(
      AiProvider.OPENAI,
      AiUsagePurpose.CHECK,
      expect.any(Function),
    );
  });
});
