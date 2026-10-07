import { describe, expect, it } from 'vitest';
import type { AiProviderView, AiSettingsView } from '../data/admin-ai.query';
import {
  canBeUsed,
  hasUnsavedChanges,
  healthSummary,
  isModelId,
  keyPlaceholder,
  sourceNotice,
} from './ai-provider-model';

function provider(overrides: Partial<AiProviderView> = {}): AiProviderView {
  return {
    provider: 'ANTHROPIC',
    hasApiKey: true,
    apiKeyHint: '9Zx1',
    models: ['claude-opus-5-5'],
    isActive: false,
    updatedAt: '2026-10-08T03:00:00.000Z',
    health: null,
    ...overrides,
  };
}

function settings(
  source: AiSettingsView['source'],
  ...providers: AiProviderView[]
): AiSettingsView {
  return { source, providers };
}

describe('sourceNotice', () => {
  it('names the provider and model the site is using', () => {
    const notice = sourceNotice(settings('CONSOLE', provider({ isActive: true })));

    expect(notice.type).toBe('success');
    expect(notice.title).toBe('Trang web đang dùng Claude (Anthropic)');
    expect(notice.description).toBe('Model claude-opus-5-5.');
  });

  it('tells the main model from the ones kept in reserve', () => {
    const active = provider({
      provider: 'GEMINI',
      isActive: true,
      models: ['gemini-flash-lite', 'gemini-flash'],
    });

    expect(sourceNotice(settings('CONSOLE', active)).description).toBe(
      'Model chính gemini-flash-lite, dự phòng gemini-flash.',
    );
  });

  it('warns when the provider the site uses failed its last check', () => {
    const failing = provider({
      isActive: true,
      health: {
        status: 'FAILED',
        checkedAt: '2026-10-08T04:00:00.000Z',
        latencyMs: 300,
        model: null,
        error: '401 API key is invalid.',
      },
    });

    const notice = sourceNotice(settings('CONSOLE', failing));

    expect(notice.type).toBe('warning');
    expect(notice.title).toContain('lần kiểm tra gần nhất thất bại');
  });

  it('warns that the site still runs on the environment key', () => {
    const notice = sourceNotice(settings('ENVIRONMENT', provider()));

    expect(notice.type).toBe('warning');
    expect(notice.title).toContain('biến môi trường');
  });

  it('says plainly when nothing can generate', () => {
    expect(sourceNotice(settings('NONE', provider({ hasApiKey: false }))).type).toBe('error');
  });
});

describe('healthSummary', () => {
  it('shows which model answered and how fast', () => {
    const summary = healthSummary({
      status: 'OK',
      checkedAt: '2026-10-08T04:00:00.000Z',
      latencyMs: 840,
      model: 'claude-opus-5-5',
      error: null,
    });

    expect(summary).toMatch(/^claude-opus-5-5 · 840 ms · kiểm tra lúc /);
  });

  it('shows why a check failed', () => {
    const summary = healthSummary({
      status: 'FAILED',
      checkedAt: '2026-10-08T04:00:00.000Z',
      latencyMs: 300,
      model: null,
      error: 'claude-opus-5-5: 401 invalid x-api-key',
    });

    expect(summary).toMatch(/^claude-opus-5-5: 401 invalid x-api-key · kiểm tra lúc /);
  });
});

describe('canBeUsed', () => {
  it('needs both a key and a model', () => {
    expect(canBeUsed(provider())).toBe(true);
    expect(canBeUsed(provider({ hasApiKey: false }))).toBe(false);
    expect(canBeUsed(provider({ models: [] }))).toBe(false);
  });
});

describe('hasUnsavedChanges', () => {
  it('is quiet until a key is typed or the models change', () => {
    expect(hasUnsavedChanges(provider(), { apiKey: '', models: ['claude-opus-5-5'] })).toBe(false);
    expect(hasUnsavedChanges(provider(), { apiKey: 'sk-new', models: ['claude-opus-5-5'] })).toBe(
      true,
    );
    expect(hasUnsavedChanges(provider(), { apiKey: '', models: [] })).toBe(true);
  });

  it('counts a change of order, since the first model is the main one', () => {
    const two = provider({ models: ['a', 'b'] });

    expect(hasUnsavedChanges(two, { apiKey: '', models: ['b', 'a'] })).toBe(true);
  });
});

describe('keyPlaceholder', () => {
  it('reminds the reader which key is stored without showing it', () => {
    expect(keyPlaceholder(provider())).toContain('9Zx1');
    expect(keyPlaceholder(provider({ hasApiKey: false, apiKeyHint: null }))).toBe('Dán khoá API');
  });
});

describe('isModelId', () => {
  it('accepts the ids the three providers use and rejects prose', () => {
    expect(isModelId('claude-opus-5-5')).toBe(true);
    expect(isModelId('gemini-3.5-flash-lite')).toBe(true);
    expect(isModelId('ft:gpt-x:org/custom')).toBe(true);
    expect(isModelId('claude opus')).toBe(false);
    expect(isModelId('m'.repeat(61))).toBe(false);
  });
});
