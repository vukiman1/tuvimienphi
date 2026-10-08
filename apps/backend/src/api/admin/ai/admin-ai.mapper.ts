import type { AiHealthOutcome, AiSource } from '../../../ai/ai-settings.service';
import type { AiCall, AiCallPage } from '../../../ai/ai-usage.service';
import type { AiProviderEntity } from '../../../ai/entities/ai-provider.entity';
import type {
  AdminAiCall,
  AdminAiCallPage,
  AdminAiHealth,
  AdminAiProvider,
  AdminAiSettings,
} from './admin-ai.type';

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
    monthlyBudgetUsd: row.monthlyBudgetUsd,
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

export function toAdminAiCallPage(page: AiCallPage): AdminAiCallPage {
  return { items: page.items.map(toAdminAiCall), total: page.total };
}

function toAdminAiCall({ at, ...call }: AiCall): AdminAiCall {
  return { ...call, at: at.toISOString() };
}
