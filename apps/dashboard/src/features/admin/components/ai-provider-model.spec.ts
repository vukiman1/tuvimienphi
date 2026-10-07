import { describe, expect, it } from 'vitest';
import type { AiHealthView, AiProviderView, AiSettingsView } from '../data/admin-ai.query';
import {
  answeredBy,
  canBeSaved,
  canBeTried,
  canBeUsed,
  cleanApiKey,
  formatLatency,
  friendlyFailure,
  hasUnsavedChanges,
  hasUsableKey,
  healthSummary,
  isModelId,
  keyProblem,
  providerStatus,
  sampleLabel,
  sourceNotice,
  startingModels,
  startingProvider,
  toChange,
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
    apiKeyHint: 'sk-a…9Zx1',
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
    [
      'gemini-3.8-flash: This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.',
      'đang quá tải',
    ],
    ['gemini-3.8-flash: This operation was aborted', 'không trả lời trong thời gian chờ'],
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
      /^Claude Opus 5\.5 trả lời sau 840 ms\. Kiểm tra lúc /,
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

describe('formatLatency', () => {
  it('counts a quick answer in milliseconds and a slow one in seconds', () => {
    expect(formatLatency(840)).toBe('840 ms');
    expect(formatLatency(1240)).toBe('1,2 giây');
    expect(formatLatency(20_004)).toBe('20 giây');
  });
});

describe('answeredBy', () => {
  it('names the model that answered by the name people know', () => {
    expect(answeredBy('ANTHROPIC', OK)).toBe('Claude Opus 5.5 trả lời sau 840 ms');
  });

  it('still reads as a sentence when the model or the timing is missing', () => {
    expect(answeredBy('ANTHROPIC', { ...OK, model: null })).toBe('Model trả lời sau 840 ms');
    expect(answeredBy('ANTHROPIC', { ...OK, latencyMs: null })).toBe('Claude Opus 5.5 đã trả lời');
  });
});

describe('sampleLabel', () => {
  it('says when each call ran and how it went', () => {
    expect(sampleLabel('ANTHROPIC', OK)).toMatch(/ · Claude Opus 5\.5 trả lời sau 840 ms$/);
    expect(sampleLabel('ANTHROPIC', FAILED)).toMatch(/ · Khoá API không đúng/);
  });
});

describe('startingProvider', () => {
  const gemini = provider({ provider: 'GEMINI', updatedAt: '2026-10-01T00:00:00.000Z' });
  const openai = provider({ provider: 'OPENAI', updatedAt: '2026-10-05T00:00:00.000Z' });
  const claude = provider({ hasApiKey: false, apiKeyHint: null, models: [], updatedAt: null });

  it('opens on the AI the site is using', () => {
    expect(startingProvider({ providers: [gemini, { ...openai, isActive: true }, claude] })).toBe(
      'OPENAI',
    );
    expect(startingProvider({ providers: [{ ...gemini, isActive: true }, openai, claude] })).toBe(
      'GEMINI',
    );
  });

  it('falls back to the key saved most recently when the site uses none of them', () => {
    expect(startingProvider({ providers: [gemini, openai, claude] })).toBe('OPENAI');
  });

  it('opens on Gemini when nothing has been set up', () => {
    expect(startingProvider({ providers: [claude] })).toBe('GEMINI');
  });
});

describe('cleanApiKey', () => {
  it('drops the spaces and line breaks a paste drags along', () => {
    expect(cleanApiKey('  sk-ant-secret-9Zx1\n')).toBe('sk-ant-secret-9Zx1');
    expect(cleanApiKey('sk-ant secret')).toBe('sk-antsecret');
  });
});

describe('keyProblem', () => {
  it('holds back a key the server would refuse for its length', () => {
    expect(keyProblem('sk-1')).toBe('Khoá quá ngắn.');
    expect(keyProblem('k'.repeat(401))).toBe('Khoá quá dài.');
    expect(keyProblem('sk-ant-secret-9Zx1')).toBeNull();
  });
});

describe('hasUsableKey', () => {
  it('counts the stored key until another one is typed', () => {
    expect(hasUsableKey(provider(), { apiKey: '' })).toBe(true);
    expect(hasUsableKey(provider({ hasApiKey: false }), { apiKey: '' })).toBe(false);
    expect(hasUsableKey(provider({ hasApiKey: false }), { apiKey: 'sk-ant-secret-9Zx1' })).toBe(
      true,
    );
    expect(hasUsableKey(provider(), { apiKey: 'sk-1' })).toBe(false);
  });
});

describe('canBeTried', () => {
  it('needs a key and at least one model to call', () => {
    expect(canBeTried(provider(), { apiKey: '', models: ['claude-opus-5-5'] })).toBe(true);
    expect(canBeTried(provider(), { apiKey: '', models: [] })).toBe(false);
    expect(
      canBeTried(provider({ hasApiKey: false }), { apiKey: '', models: ['claude-opus-5-5'] }),
    ).toBe(false);
  });
});

describe('canBeSaved', () => {
  const saved = { apiKey: '', models: ['claude-opus-5-5'] };

  it('has nothing to save while the site already uses exactly this', () => {
    expect(canBeSaved(provider({ isActive: true }), saved)).toBe(false);
  });

  it('saves an untouched AI so the site moves over to it', () => {
    expect(canBeSaved(provider({ isActive: false }), saved)).toBe(true);
  });

  it('saves a change to the AI the site uses', () => {
    expect(
      canBeSaved(provider({ isActive: true }), { ...saved, models: ['claude-fable-5-1'] }),
    ).toBe(true);
  });

  it('will not save without a key or without a model', () => {
    expect(canBeSaved(provider({ hasApiKey: false }), saved)).toBe(false);
    expect(canBeSaved(provider(), { apiKey: '', models: [] })).toBe(false);
  });
});

describe('toChange', () => {
  it('leaves the stored key alone when none was typed', () => {
    expect(toChange({ apiKey: '', models: ['a'] })).toEqual({ apiKey: null, models: ['a'] });
    expect(toChange({ apiKey: 'sk-ant-secret-9Zx1', models: ['a'] })).toEqual({
      apiKey: 'sk-ant-secret-9Zx1',
      models: ['a'],
    });
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
