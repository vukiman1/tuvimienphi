import type { AiHealthOutcome, AiSource } from '../../../ai/ai-settings.service';
import type { AiProviderEntity } from '../../../ai/entities/ai-provider.entity';
import type { AdminAiHealth, AdminAiProvider, AdminAiSettings } from './admin-ai.type';

export function toAdminAiSettings(
  source: AiSource,
  rows: readonly AiProviderEntity[],
): AdminAiSettings {
  return { source, providers: rows.map(toAdminAiProvider) };
}

export function toAdminAiProvider(row: AiProviderEntity): AdminAiProvider {
  return {
    provider: row.provider,
    hasApiKey: row.apiKey !== null,
    apiKeyHint: row.apiKeyHint,
    models: [...row.models],
    isActive: row.isActive,
    health: toAdminAiHealth(row),
    updatedAt: row.updatedAt ? row.updatedAt.toISOString() : null,
  };
}

export function toAdminAiProbe(outcome: AiHealthOutcome, checkedAt: Date): AdminAiHealth {
  return {
    status: outcome.status,
    checkedAt: checkedAt.toISOString(),
    latencyMs: outcome.latencyMs,
    model: outcome.model,
    error: outcome.error,
  };
}

function toAdminAiHealth(row: AiProviderEntity): AdminAiHealth | null {
  if (!row.healthStatus || !row.healthCheckedAt) {
    return null;
  }
  return {
    status: row.healthStatus,
    checkedAt: row.healthCheckedAt.toISOString(),
    latencyMs: row.healthLatencyMs,
    model: row.healthModel,
    error: row.healthError,
  };
}
