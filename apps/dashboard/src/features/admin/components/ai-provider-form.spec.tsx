import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { AiHealthView, AiProviderView } from '../data/admin-ai.query';
import { AiProviderForm } from './ai-provider-form';
import type { AiProviderChange } from './ai-provider-model';
import { HEALTH_INTERVAL_MS } from './health-monitor-model';

const KEY_LABEL = 'Khoá API Claude (Anthropic)';
const TYPED_KEY = 'sk-ant-api03-typed-secret-key-7Qw2';

function healthy(checkedAt = new Date().toISOString()): AiHealthView {
  return { status: 'OK', checkedAt, latencyMs: 840, model: 'claude-opus-5-5', error: null };
}

function failing(checkedAt = new Date().toISOString()): AiHealthView {
  return {
    status: 'FAILED',
    checkedAt,
    latencyMs: 300,
    model: null,
    error: 'no model accepted the request — claude-opus-5-5: 401 API key is invalid.',
  };
}

function provider(overrides: Partial<AiProviderView> = {}): AiProviderView {
  return {
    provider: 'ANTHROPIC',
    hasApiKey: true,
    apiKeyHint: 'sk-a…9Zx1',
    models: ['claude-opus-5-5'],
    isActive: false,
    updatedAt: '2026-10-08T03:00:00.000Z',
    health: healthy(),
    ...overrides,
  };
}

function unconfigured(): AiProviderView {
  return provider({
    hasApiKey: false,
    apiKeyHint: null,
    models: [],
    updatedAt: null,
    health: null,
  });
}

function renderForm(view: AiProviderView, results: { test?: AiHealthView } = {}) {
  const handlers = {
    onListModels: vi.fn<(apiKey: string | null) => Promise<readonly string[]>>(async () => [
      'claude-opus-5',
      'claude-opus-5-5',
    ]),
    onTest: vi.fn<(change: AiProviderChange) => Promise<AiHealthView>>(
      async () => results.test ?? healthy(),
    ),
    onCheck: vi.fn<() => Promise<AiHealthView>>(async () => healthy()),
    onSave: vi.fn<(change: AiProviderChange) => Promise<void>>(async () => undefined),
    onStopUsing: vi.fn(),
    onClearKey: vi.fn(),
  };
  render(<AiProviderForm provider={view} liveModels={[]} busy={null} {...handlers} />);
  return handlers;
}

function keyField(): HTMLInputElement {
  return screen.getByLabelText(KEY_LABEL) as HTMLInputElement;
}

function typeKey(value: string): void {
  fireEvent.focus(keyField());
  fireEvent.change(keyField(), { target: { value } });
  fireEvent.blur(keyField());
}

function saveButton(): HTMLElement {
  return screen.getByRole('button', { name: /^(loading )?Lưu$/ });
}

afterEach(() => {
  vi.useRealTimers();
});

describe('AiProviderForm', () => {
  it('opens a saved AI just as it was left, with the key shown by its two ends', () => {
    renderForm(provider({ isActive: true }));

    expect(keyField().value).toBe('sk-a••••••••9Zx1');
    expect(screen.getByText('Claude Opus 5.5')).toBeTruthy();
    expect(saveButton()).toHaveProperty('disabled', true);
    expect(
      screen.getByText('Trang web đang dùng Claude (Anthropic) với cấu hình này.'),
    ).toBeTruthy();
  });

  it('opens an AI nobody has set up with the suggested model chosen and nothing to save yet', () => {
    renderForm(unconfigured());

    expect(keyField().type).toBe('password');
    expect(screen.getByText('Claude Opus 5.5')).toBeTruthy();
    expect(saveButton()).toHaveProperty('disabled', true);
    expect(screen.getByRole('button', { name: 'Kiểm tra model' })).toHaveProperty('disabled', true);
    expect(screen.getByText('Chưa theo dõi')).toBeTruthy();
  });

  it('says where to get a key', () => {
    renderForm(unconfigured());

    const link = screen.getByRole('link', { name: 'Lấy khoá Claude (Anthropic) ở đâu?' });
    expect(link.getAttribute('href')).toBe('https://platform.claude.com/settings/keys');
  });

  it('checks a typed key before it is saved and says how many models it opens', async () => {
    const { onListModels } = renderForm(unconfigured());

    typeKey(TYPED_KEY);
    fireEvent.click(screen.getByRole('button', { name: 'Kiểm tra' }));

    expect(await screen.findByText(/Khoá dùng được, 2 model sẵn sàng\./)).toBeTruthy();
    expect(onListModels).toHaveBeenCalledWith(TYPED_KEY);
  });

  it('checks the stored key without it ever leaving the server', async () => {
    const { onListModels } = renderForm(provider());

    fireEvent.click(screen.getByRole('button', { name: 'Kiểm tra' }));

    await waitFor(() => expect(onListModels).toHaveBeenCalledWith(null));
  });

  it('tries the typed key and chosen models without saving them', async () => {
    const { onTest, onSave } = renderForm(unconfigured());

    typeKey(TYPED_KEY);
    fireEvent.click(screen.getByRole('button', { name: 'Kiểm tra model' }));

    expect(await screen.findByText('Model hoạt động')).toBeTruthy();
    expect(screen.getByText('Claude Opus 5.5 trả lời sau 840 ms.')).toBeTruthy();
    expect(onTest).toHaveBeenCalledWith({ apiKey: TYPED_KEY, models: ['claude-opus-5-5'] });
    expect(onSave).not.toHaveBeenCalled();
  });

  it('runs the recorded check when nothing was changed, and adds the call to the bar', async () => {
    const { onTest, onCheck } = renderForm(provider());
    expect(screen.getAllByRole('listitem')).toHaveLength(1);

    fireEvent.click(screen.getByRole('button', { name: 'Kiểm tra model' }));

    expect(await screen.findByText('Model hoạt động')).toBeTruthy();
    expect(onCheck).toHaveBeenCalledTimes(1);
    expect(onTest).not.toHaveBeenCalled();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('tries a new setup first and saves it once the model answers', async () => {
    const { onTest, onSave } = renderForm(unconfigured());

    typeKey(TYPED_KEY);
    fireEvent.click(saveButton());

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onTest).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith({ apiKey: TYPED_KEY, models: ['claude-opus-5-5'] });
  });

  it('holds a setup that does not answer, and saves it only when told to anyway', async () => {
    const { onSave } = renderForm(unconfigured(), { test: failing() });

    typeKey(TYPED_KEY);
    fireEvent.click(saveButton());

    expect(await screen.findByText('Khoá API không đúng hoặc đã bị thu hồi.')).toBeTruthy();
    expect(screen.getByText(/Chưa lưu, vì trang web sẽ không luận giải được/)).toBeTruthy();
    expect(onSave).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Vẫn lưu' }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
  });

  it('offers the suggested models when the ones chosen do not answer', async () => {
    const overloaded: AiHealthView = {
      ...failing(),
      error:
        'no model accepted the request — claude-sonnet-5-5: This model is currently experiencing high demand. Please try again later.',
    };
    const { onTest, onSave } = renderForm(
      { ...unconfigured(), models: ['claude-sonnet-5-5'] },
      { test: overloaded },
    );

    typeKey(TYPED_KEY);
    fireEvent.click(saveButton());
    expect(await screen.findByText(/đang quá tải ở phía nhà cung cấp/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Đổi sang model gợi ý' }));
    expect(screen.getByText('Claude Opus 5.5')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Vẫn lưu' })).toBeNull();

    onTest.mockResolvedValue(healthy());
    fireEvent.click(saveButton());

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave).toHaveBeenCalledWith({ apiKey: TYPED_KEY, models: ['claude-opus-5-5'] });
  });

  it('moves the site to a saved AI that just passed its check without calling it again', async () => {
    const { onTest, onCheck, onSave } = renderForm(provider({ isActive: false }));

    fireEvent.click(saveButton());

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave).toHaveBeenCalledWith({ apiKey: null, models: ['claude-opus-5-5'] });
    expect(onTest).not.toHaveBeenCalled();
    expect(onCheck).not.toHaveBeenCalled();
  });

  it('counts going back to the suggested models as a change to save', () => {
    renderForm(provider({ isActive: true, models: ['claude-sonnet-5-5'] }));
    expect(saveButton()).toHaveProperty('disabled', true);

    fireEvent.click(screen.getByText('Chọn lại model gợi ý'));

    expect(saveButton()).toHaveProperty('disabled', false);
    expect(
      screen.getByText('Thanh này theo dõi cấu hình đã lưu, chưa tính phần bạn đang sửa.'),
    ).toBeTruthy();
  });

  it('offers to stop using the AI the site is on, after confirming', async () => {
    const { onStopUsing } = renderForm(provider({ isActive: true }));

    fireEvent.click(screen.getByRole('button', { name: 'Ngừng dùng' }));
    expect(onStopUsing).not.toHaveBeenCalled();
    const confirm = await screen.findAllByRole('button', { name: 'Ngừng dùng' });
    fireEvent.click(confirm[confirm.length - 1]);

    expect(onStopUsing).toHaveBeenCalledTimes(1);
  });

  it('removes a key only after confirming', async () => {
    const { onClearKey } = renderForm(provider());

    fireEvent.click(screen.getByRole('button', { name: 'Xoá khoá' }));
    expect(onClearKey).not.toHaveBeenCalled();
    const confirm = await screen.findAllByRole('button', { name: 'Xoá khoá' });
    fireEvent.click(confirm[confirm.length - 1]);

    expect(onClearKey).toHaveBeenCalledTimes(1);
  });
});

describe('AiProviderForm health bar', () => {
  async function advance(milliseconds: number): Promise<void> {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(milliseconds);
    });
  }

  it('calls the saved AI as soon as the page opens, then again every minute', async () => {
    vi.useFakeTimers();
    const { onCheck } = renderForm(provider({ health: null }));
    expect(screen.getByText('Đang gọi thử…')).toBeTruthy();

    await advance(0);
    expect(onCheck).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Hoạt động tốt')).toBeTruthy();
    expect(screen.getAllByRole('listitem')).toHaveLength(1);

    await advance(HEALTH_INTERVAL_MS);
    expect(onCheck).toHaveBeenCalledTimes(2);

    await advance(HEALTH_INTERVAL_MS);
    expect(onCheck).toHaveBeenCalledTimes(3);
  });

  it('waits out the minute when the last check has only just run', async () => {
    vi.useFakeTimers();
    const { onCheck } = renderForm(provider({ health: healthy() }));

    await advance(HEALTH_INTERVAL_MS - 1000);
    expect(onCheck).not.toHaveBeenCalled();

    await advance(1000);
    expect(onCheck).toHaveBeenCalledTimes(1);
  });

  it('stops calling while the watch is switched off', async () => {
    vi.useFakeTimers();
    const { onCheck } = renderForm(provider({ health: null }));
    await advance(0);

    fireEvent.click(screen.getByRole('switch', { name: 'Tự gọi thử mỗi phút' }));
    await advance(HEALTH_INTERVAL_MS * 3);

    expect(onCheck).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Đã tạm dừng')).toBeTruthy();
  });

  it('puts a failing call in plain words and keeps the provider’s own message at hand', async () => {
    vi.useFakeTimers();
    const view = provider({ health: null });
    const handlers = renderForm(view);
    handlers.onCheck.mockResolvedValue(failing());

    await advance(0);

    expect(screen.getByText('Không trả lời được')).toBeTruthy();
    expect(screen.getByText(/^Khoá API không đúng hoặc đã bị thu hồi\. Gọi thử lúc /)).toBeTruthy();
    expect(screen.getByText(/401 API key is invalid/)).toBeTruthy();
  });

  it('never calls an AI that has no key saved', async () => {
    vi.useFakeTimers();
    const { onCheck } = renderForm(unconfigured());

    await advance(HEALTH_INTERVAL_MS * 2);

    expect(onCheck).not.toHaveBeenCalled();
  });
});
