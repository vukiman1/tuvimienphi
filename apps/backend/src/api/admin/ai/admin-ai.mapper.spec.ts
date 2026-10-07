import { AiProvider } from '../../../ai/ai-provider';
import { AiSource } from '../../../ai/ai-settings.service';
import { AiHealthStatus, AiProviderEntity } from '../../../ai/entities/ai-provider.entity';
import { toAdminAiProvider, toAdminAiSettings } from './admin-ai.mapper';

function row(overrides: Partial<AiProviderEntity> = {}): AiProviderEntity {
  return Object.assign(new AiProviderEntity(), {
    provider: AiProvider.ANTHROPIC,
    apiKey: 'sealed:sk-ant-secret-9Zx1',
    apiKeyHint: '9Zx1',
    models: ['claude-opus-5-5'],
    isActive: true,
    healthStatus: null,
    healthCheckedAt: null,
    healthLatencyMs: null,
    healthModel: null,
    healthError: null,
    updatedAt: new Date('2026-10-08T03:00:00.000Z'),
    ...overrides,
  });
}

describe('toAdminAiProvider', () => {
  it('never carries the key, sealed or not, only whether one exists and its last characters', () => {
    const mapped = toAdminAiProvider(row());

    expect(JSON.stringify(mapped)).not.toContain('sk-ant-secret');
    expect(JSON.stringify(mapped)).not.toContain('sealed:');
    expect(mapped.hasApiKey).toBe(true);
    expect(mapped.apiKeyHint).toBe('9Zx1');
  });

  it('shows a provider nobody has set up as having no key and no health', () => {
    const mapped = toAdminAiProvider(
      row({ apiKey: null, apiKeyHint: null, models: [], isActive: false, updatedAt: null }),
    );

    expect(mapped).toEqual({
      provider: AiProvider.ANTHROPIC,
      hasApiKey: false,
      apiKeyHint: null,
      models: [],
      isActive: false,
      health: null,
      updatedAt: null,
    });
  });

  it('carries the last health check with the model that answered', () => {
    const mapped = toAdminAiProvider(
      row({
        healthStatus: AiHealthStatus.OK,
        healthCheckedAt: new Date('2026-10-08T04:00:00.000Z'),
        healthLatencyMs: 840,
        healthModel: 'claude-opus-5-5',
      }),
    );

    expect(mapped.health).toEqual({
      status: AiHealthStatus.OK,
      checkedAt: '2026-10-08T04:00:00.000Z',
      latencyMs: 840,
      model: 'claude-opus-5-5',
      error: null,
    });
  });
});

describe('toAdminAiSettings', () => {
  it('says where the site takes its key from alongside the providers', () => {
    const settings = toAdminAiSettings(AiSource.ENVIRONMENT, [row({ isActive: false })]);

    expect(settings.source).toBe(AiSource.ENVIRONMENT);
    expect(settings.providers).toHaveLength(1);
  });
});
