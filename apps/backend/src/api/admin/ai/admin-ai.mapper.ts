import type { AiSource } from '../../../ai/ai-settings.service';
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
