import { describe, expect, it } from 'vitest';
import type { AiHealthView, AiProviderView, AiSettingsView } from '../data/admin-ai.query';
import {
  canBeUsed,
  friendlyFailure,
  hasUnsavedChanges,
  healthSummary,
  isModelId,
  keyPlaceholder,
  providerStatus,
  sourceNotice,
  startingModels,
} from './ai-provider-model';

const OK: AiHealthView = {
  status: 'OK',
  checkedAt: '2026-10-08T04:00:00.000Z',
  latencyMs: 840,
  model: 'claude-opus-5-5',
  error: null,
};

const FAILED: AiHealthView = {
  status: 'FAILED',
  checkedAt: '2026-10-08T04:00:00.000Z',
  latencyMs: 300,
  model: null,
  error: 'no model accepted the request — claude-opus-5-5: 401 API key is invalid.',
};

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
  it('names the provider and model the site is using, by the name people know', () => {
    const notice = sourceNotice(settings('CONSOLE', provider({ isActive: true })));

    expect(notice.type).toBe('success');
    expect(notice.title).toBe('Trang web đang dùng Claude (Anthropic)');
    expect(notice.description).toBe('Model Claude Opus 5.5.');
  });

  it('tells the main model from the ones kept in reserve', () => {
    const active = provider({
      provider: 'GEMINI',
      isActive: true,
      models: ['gemini-3.5-flash-lite', 'gemini-3.8-flash'],
    });

    expect(sourceNotice(settings('CONSOLE', active)).description).toBe(
      'Model chính Gemini 3.5 Flash-Lite, dự phòng Gemini 3.8 Flash.',
    );
  });

  it('shows a model the catalog does not know by its id', () => {
    const active = provider({ isActive: true, models: ['claude-next'] });

    expect(sourceNotice(settings('CONSOLE', active)).description).toBe('Model claude-next.');
  });

  it('warns when the provider the site uses failed its last check', () => {
    const notice = sourceNotice(settings('CONSOLE', provider({ isActive: true, health: FAILED })));

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

describe('providerStatus', () => {
  it('walks a provider from no key to in use', () => {
    expect(providerStatus(provider({ hasApiKey: false })).text).toBe('Chưa có khoá');
    expect(providerStatus(provider()).text).toBe('Chưa kiểm tra');
    expect(providerStatus(provider({ health: FAILED })).text).toBe('Đang lỗi');
    expect(providerStatus(provider({ health: OK })).text).toBe('Sẵn sàng');
    expect(providerStatus(provider({ health: OK, isActive: true })).text).toBe(
      'Đang dùng cho trang web',
    );
  });
});

describe('friendlyFailure', () => {
  it.each([
    ['gpt-6.1-sol: 401 Incorrect API key provided: sk-proj-****0002.', 'Khoá API không đúng'],
    ['gemini-3.8-flash: API key not valid. Please pass a valid API key.', 'Khoá API không đúng'],
    ['claude-opus-5-5: 401 API key is invalid.', 'Khoá API không đúng'],
    ['gemini-3.1-pro-preview: 429 RESOURCE_EXHAUSTED quota exceeded', 'Hết hạn mức'],
    ['claude-opus-5-5: 400 Your credit balance is too low', 'hết tiền'],
    ['gpt-9: 404 The model `gpt-9` does not exist', 'Model không tồn tại'],
    ['gemini-3.8-flash: UNAVAILABLE The model is overloaded', 'đang quá tải'],
    ['gemini-3.8-flash: This operation was aborted', 'trả lời quá chậm'],
    ['claude-opus-5-5: model refused: cyber', 'từ chối'],
  ])('reads "%s" as a sentence an admin can act on', (error, expected) => {
    expect(friendlyFailure(error)).toContain(expected);
  });

  it('admits when it cannot tell what went wrong', () => {
    expect(friendlyFailure('socket hang up')).toBe('Gọi thử không thành công.');
    expect(friendlyFailure(null)).toBe('Gọi thử không thành công.');
  });
});

describe('healthSummary', () => {
  it('says which model answered and how fast', () => {
    expect(healthSummary('ANTHROPIC', OK)).toMatch(
      /^Trả lời sau 840 ms bằng Claude Opus 5\.5\. Kiểm tra lúc /,
    );
  });

  it('only says when, for a check that failed', () => {
    expect(healthSummary('ANTHROPIC', FAILED)).toMatch(/^Kiểm tra lúc /);
  });
});

describe('canBeUsed', () => {
  it('needs both a key and a model', () => {
    expect(canBeUsed(provider())).toBe(true);
    expect(canBeUsed(provider({ hasApiKey: false }))).toBe(false);
    expect(canBeUsed(provider({ models: [] }))).toBe(false);
  });
});

describe('startingModels', () => {
  it('opens a provider nobody has set up with the suggested models already chosen', () => {
    expect(startingModels(provider({ models: [] }))).toEqual(['claude-opus-5-5']);
    expect(startingModels(provider({ provider: 'GEMINI', models: [] }))).toEqual([
      'gemini-3.5-flash-lite',
      'gemini-3.8-flash',
    ]);
  });

  it('keeps what was saved once something was', () => {
    expect(startingModels(provider({ models: ['claude-sonnet-5-5'] }))).toEqual([
      'claude-sonnet-5-5',
    ]);
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

  it('treats the suggested models as unsaved until they are stored', () => {
    const fresh = provider({ hasApiKey: false, models: [] });

    expect(hasUnsavedChanges(fresh, { apiKey: '', models: startingModels(fresh) })).toBe(true);
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
