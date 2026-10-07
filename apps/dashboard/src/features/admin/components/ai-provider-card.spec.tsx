import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { AiProviderView } from '../data/admin-ai.query';
import { AiProviderCard, type AiProviderChange } from './ai-provider-card';

const HEALTHY = {
  status: 'OK' as const,
  checkedAt: '2026-10-08T04:00:00.000Z',
  latencyMs: 840,
  model: 'claude-opus-5-5',
  error: null,
};

const FAILING = {
  status: 'FAILED' as const,
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

function unconfigured(): AiProviderView {
  return provider({ hasApiKey: false, apiKeyHint: null, models: [], updatedAt: null });
}

function renderCard(view: AiProviderView) {
  const handlers = {
    onSave: vi.fn<(change: AiProviderChange) => void>(),
    onCheck: vi.fn(),
    onActivate: vi.fn(),
    onDeactivate: vi.fn(),
    onClearKey: vi.fn(),
  };
  render(
    <AiProviderCard
      provider={view}
      liveModels={['claude-opus-5', 'claude-opus-5-5']}
      liveModelsError={null}
      isLoadingModels={false}
      busy={null}
      {...handlers}
    />,
  );
  return handlers;
}

function typeKey(value: string): void {
  fireEvent.change(screen.getByLabelText('Khoá API Claude (Anthropic)'), { target: { value } });
}

function saveButton(): HTMLElement {
  return screen.getByRole('button', { name: 'Lưu và kiểm tra' });
}

async function saveOnceEnabled(): Promise<void> {
  await waitFor(() => expect(saveButton()).toHaveProperty('disabled', false));
  fireEvent.click(saveButton());
}

describe('AiProviderCard', () => {
  it('never shows the stored key, only that one exists and how it ends', () => {
    renderCard(provider());

    const input = screen.getByLabelText('Khoá API Claude (Anthropic)') as HTMLInputElement;
    expect(input.value).toBe('');
    expect(input.placeholder).toContain('9Zx1');
    expect(input.type).toBe('password');
  });

  it('opens a provider nobody has set up with the suggested model already chosen', () => {
    renderCard(unconfigured());

    expect(screen.getByText('Claude Opus 5.5')).toBeTruthy();
    expect(screen.getAllByText('Chưa có khoá').length).toBeGreaterThan(0);
  });

  it('needs nothing but a key to set a provider up', async () => {
    const { onSave } = renderCard(unconfigured());

    typeKey('sk-ant-first-key-000001');
    await saveOnceEnabled();

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave).toHaveBeenCalledWith({
      apiKey: 'sk-ant-first-key-000001',
      models: ['claude-opus-5-5'],
    });
  });

  it('asks for the key when a new provider is saved without one', async () => {
    const { onSave } = renderCard(unconfigured());

    await saveOnceEnabled();

    expect(await screen.findByText('Dán khoá API.')).toBeTruthy();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('says where to get a key', () => {
    renderCard(unconfigured());

    const link = screen.getByRole('link', { name: 'Lấy khoá Claude (Anthropic) ở đâu?' });
    expect(link.getAttribute('href')).toBe('https://platform.claude.com/settings/keys');
    expect(link.getAttribute('target')).toBe('_blank');
  });

  it('keeps Save idle until something changes', () => {
    renderCard(provider());

    expect(saveButton()).toHaveProperty('disabled', true);
  });

  it('sends a newly typed key with the models', async () => {
    const { onSave } = renderCard(provider());

    typeKey('sk-ant-rotated-key-0001');
    await saveOnceEnabled();

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave).toHaveBeenCalledWith({
      apiKey: 'sk-ant-rotated-key-0001',
      models: ['claude-opus-5-5'],
    });
  });

  it('holds back a key pasted with a space in it', async () => {
    const { onSave } = renderCard(provider());

    typeKey('sk-ant rotated');
    await saveOnceEnabled();

    expect(await screen.findByText('Khoá không được có khoảng trắng.')).toBeTruthy();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('lets a provider that passed its check be put to use in one click', () => {
    const { onCheck, onActivate } = renderCard(provider({ health: HEALTHY }));

    expect(screen.getByText('Hoạt động tốt')).toBeTruthy();
    expect(screen.getByText('Sẵn sàng')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Kiểm tra lại' }));
    fireEvent.click(screen.getByRole('button', { name: 'Dùng cho trang web' }));

    expect(onCheck).toHaveBeenCalledTimes(1);
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it('asks first before the site moves to a provider that has not passed a check', async () => {
    const { onActivate } = renderCard(provider({ health: null }));

    fireEvent.click(screen.getByRole('button', { name: 'Dùng cho trang web' }));
    expect(onActivate).not.toHaveBeenCalled();

    fireEvent.click(await screen.findByRole('button', { name: 'Vẫn dùng' }));

    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it('will not check or use a provider while its form holds unsaved changes', async () => {
    renderCard(provider());

    typeKey('sk-ant-rotated-key-0001');

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Kiểm tra' })).toHaveProperty('disabled', true),
    );
    expect(screen.getByRole('button', { name: 'Dùng cho trang web' })).toHaveProperty(
      'disabled',
      true,
    );
  });

  it('will not put a provider to use before it has a key', () => {
    renderCard(unconfigured());

    expect(screen.getByRole('button', { name: 'Dùng cho trang web' })).toHaveProperty(
      'disabled',
      true,
    );
    expect(screen.queryByRole('button', { name: 'Xoá khoá' })).toBeNull();
  });

  it('marks the provider the site uses and offers to stop, after confirming', async () => {
    const { onDeactivate } = renderCard(provider({ isActive: true, health: HEALTHY }));

    expect(screen.getByText('Đang dùng cho trang web')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Dùng cho trang web' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Ngừng dùng' }));
    expect(onDeactivate).not.toHaveBeenCalled();
    const confirm = await screen.findAllByRole('button', { name: 'Ngừng dùng' });
    fireEvent.click(confirm[confirm.length - 1]);

    expect(onDeactivate).toHaveBeenCalledTimes(1);
  });

  it('explains a failed check in plain words and keeps the provider’s own message at hand', () => {
    renderCard(provider({ health: FAILING }));

    expect(screen.getByText('Khoá API không đúng hoặc đã bị thu hồi.')).toBeTruthy();
    expect(screen.getByText('Đang lỗi')).toBeTruthy();
    expect(screen.getByText(/401 API key is invalid/)).toBeTruthy();
  });

  it('removes a key only after confirming', async () => {
    const { onClearKey } = renderCard(provider());

    fireEvent.click(screen.getByRole('button', { name: 'Xoá khoá' }));
    expect(onClearKey).not.toHaveBeenCalled();

    const confirm = await screen.findAllByRole('button', { name: 'Xoá khoá' });
    fireEvent.click(confirm[confirm.length - 1]);

    expect(onClearKey).toHaveBeenCalledTimes(1);
  });
});
