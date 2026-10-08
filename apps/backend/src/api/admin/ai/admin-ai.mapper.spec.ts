import { AiProvider } from '../../../ai/ai-provider';
import { AiCallStatus } from '../../../ai/ai-call-status.enum';
import { AiSource } from '../../../ai/ai-settings.service';
import { AiUsagePurpose } from '../../../ai/ai-usage-purpose.enum';
import { AiHealthStatus, AiProviderEntity } from '../../../ai/entities/ai-provider.entity';
import {
  toAdminAiCallPage,
  toAdminAiProbe,
  toAdminAiProvider,
  toAdminAiSettings,
} from './admin-ai.mapper';

function row(overrides: Partial<AiProviderEntity> = {}): AiProviderEntity {
  return Object.assign(new AiProviderEntity(), {
    provider: AiProvider.ANTHROPIC,
    apiKey: 'sealed:sk-ant-secret-9Zx1',
    apiKeyHint: 'sk-a…9Zx1',
    models: ['claude-opus-5-5'],
    isActive: true,
    healthStatus: null,
    healthCheckedAt: null,
    healthLatencyMs: null,
    healthModel: null,
    healthError: null,
    monthlyBudgetUsd: null,
    updatedAt: new Date('2026-10-08T03:00:00.000Z'),
    ...overrides,
  });
}

describe('toAdminAiProvider', () => {
  it('never carries the key, sealed or not, only whether one exists and its two ends', () => {
    const mapped = toAdminAiProvider(row());

    expect(JSON.stringify(mapped)).not.toContain('sk-ant-secret');
    expect(JSON.stringify(mapped)).not.toContain('sealed:');
    expect(mapped.hasApiKey).toBe(true);
    expect(mapped.apiKeyHint).toBe('sk-a…9Zx1');
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
      monthlyBudgetUsd: null,
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

describe('toAdminAiProvider budget', () => {
  it('carries the monthly budget when one is set', () => {
    expect(toAdminAiProvider(row({ monthlyBudgetUsd: 12.5 })).monthlyBudgetUsd).toBe(12.5);
  });
});

describe('toAdminAiProbe', () => {
  it('stamps the outcome of a one-off check with when it ran', () => {
    const probe = toAdminAiProbe(
      { status: AiHealthStatus.FAILED, latencyMs: 20_004, model: null, error: 'aborted' },
      new Date('2026-10-08T05:00:00.000Z'),
    );

    expect(probe).toEqual({
      status: AiHealthStatus.FAILED,
      checkedAt: '2026-10-08T05:00:00.000Z',
      latencyMs: 20_004,
      model: null,
      error: 'aborted',
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

describe('toAdminAiCallPage', () => {
  it('hands each call over with the moment it ran as text', () => {
    const page = toAdminAiCallPage({
      total: 41,
      items: [
        {
          id: 'call-1',
          at: new Date('2026-10-08T03:00:00.000Z'),
          provider: AiProvider.OPENAI,
          model: 'gpt-6.1-sol',
          purpose: AiUsagePurpose.GENERATION,
          status: AiCallStatus.OK,
          isQuotaHit: false,
          inputTokens: 55,
          outputTokens: 11,
          latencyMs: 4757,
          costUsd: 0.00022,
          error: null,
          label: 'luan-giai:2',
          userEmail: 'reader@example.com',
        },
      ],
    });

    expect(page.total).toBe(41);
    expect(page.items[0]).toMatchObject({
      at: '2026-10-08T03:00:00.000Z',
      costUsd: 0.00022,
      userEmail: 'reader@example.com',
    });
  });
});
