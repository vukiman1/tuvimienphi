import { Injectable } from '@nestjs/common';
import { AiProvider, type AiCredentials } from './ai-provider';
import { AiProviderClients } from './ai-provider-clients';
import { AiSettingsService, type AiHealthOutcome } from './ai-settings.service';
import { readableReason } from './ai-error-reason';
import { AiUnavailableError } from './ai.errors';
import type { AiRequest } from './ai.types';
import { AiHealthStatus, AiProviderEntity } from './entities/ai-provider.entity';

export const HEALTH_TIMEOUT_MS = 20_000;
export const MAX_HEALTH_ERROR_LENGTH = 500;

const PROBE: Omit<AiRequest, 'signal'> = {
  system: 'You are a health probe. Answer with the JSON object {"ok": true} and nothing else.',
  messages: [{ role: 'user', text: 'ping' }],
  schema: {
    type: 'object',
    properties: { ok: { type: 'boolean' } },
    required: ['ok'],
  },
};

@Injectable()
export class AiHealthService {
  constructor(
    private readonly settings: AiSettingsService,
    private readonly providers: AiProviderClients,
  ) {}

  async check(provider: AiProvider): Promise<AiProviderEntity> {
    const credentials = await this.settings.credentialsOf(provider);
    return this.settings.recordHealth(provider, await this.probe(provider, credentials));
  }

  async probe(provider: AiProvider, credentials: AiCredentials): Promise<AiHealthOutcome> {
    const startedAt = Date.now();

    try {
      const result = await this.providers
        .of(provider)
        .generate({ ...PROBE, signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS) }, credentials);
      JSON.parse(result.text);

      return {
        status: AiHealthStatus.OK,
        latencyMs: Date.now() - startedAt,
        model: result.model,
        error: null,
      };
    } catch (error) {
      return {
        status: AiHealthStatus.FAILED,
        latencyMs: Date.now() - startedAt,
        model: null,
        error: failureOf(error),
      };
    }
  }
}

function failureOf(error: unknown): string {
  const message = error instanceof AiUnavailableError ? error.message : readableReason(error);
  return message.slice(0, MAX_HEALTH_ERROR_LENGTH);
}
