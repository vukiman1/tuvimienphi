import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { AiProviderView } from '../data/admin-ai.query';
import { AiProviderCard, type AiProviderChange } from './ai-provider-card';

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

const HEALTHY = {
  status: 'OK' as const,
  checkedAt: '2026-10-08T04:00:00.000Z',
  latencyMs: 840,
  model: 'claude-opus-5-5',
  error: null,
};

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
      modelOptions={['claude-haiku-4-5', 'claude-opus-5-5']}
      modelOptionsError={null}
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

async function saveOnceEnabled(): Promise<void> {
  const save = screen.getByRole('button', { name: 'Lưu' });
  await waitFor(() => expect(save).toHaveProperty('disabled', false));
  fireEvent.click(save);
}

describe('AiProviderCard', () => {
  it('never shows the stored key, only that one exists and how it ends', () => {
    renderCard(provider());

    const input = screen.getByLabelText('Khoá API Claude (Anthropic)') as HTMLInputElement;
    expect(input.value).toBe('');
    expect(input.placeholder).toContain('9Zx1');
    expect(input.type).toBe('password');
  });

  it('keeps Save idle until something changes', () => {
    renderCard(provider());

    expect(screen.getByRole('button', { name: 'Lưu' })).toHaveProperty('disabled', true);
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

  it('asks for a key when a provider without one has its field left empty', async () => {
    renderCard(provider({ hasApiKey: false, apiKeyHint: null, models: [] }));

    typeKey('sk-ant-rotated-key-0001');
    typeKey('');

    expect(await screen.findByText('Dán khoá API.')).toBeTruthy();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Lưu' })).toHaveProperty('disabled', true),
    );
  });

  it('lets a provider that passed its check be put to use in one click', () => {
    const { onCheck, onActivate } = renderCard(provider({ health: HEALTHY }));

    fireEvent.click(screen.getByRole('button', { name: 'Kiểm tra' }));
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

  it('will not put a provider to use before it has a key and a model', () => {
    renderCard(provider({ hasApiKey: false, apiKeyHint: null, models: [] }));

    expect(screen.getByRole('button', { name: 'Dùng cho trang web' })).toHaveProperty(
      'disabled',
      true,
    );
    expect(screen.queryByRole('button', { name: 'Xoá khoá' })).toBeNull();
    expect(screen.getByText('Chưa có khoá')).toBeTruthy();
  });

  it('marks the provider the site uses and offers to stop, after confirming', async () => {
    const { onDeactivate } = renderCard(provider({ isActive: true }));

    expect(screen.getByText('Đang dùng cho trang web')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Dùng cho trang web' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Ngừng dùng' }));
    expect(onDeactivate).not.toHaveBeenCalled();
    const confirm = await screen.findAllByRole('button', { name: 'Ngừng dùng' });
    fireEvent.click(confirm[confirm.length - 1]);

    expect(onDeactivate).toHaveBeenCalledTimes(1);
  });

  it('shows the last health check, good or bad', () => {
    renderCard(
      provider({
        health: {
          status: 'FAILED',
          checkedAt: '2026-10-08T04:00:00.000Z',
          latencyMs: 300,
          model: null,
          error: 'claude-opus-5-5: 401 invalid x-api-key',
        },
      }),
    );

    expect(screen.getByText(/Lỗi · claude-opus-5-5: 401 invalid x-api-key/)).toBeTruthy();
  });
});
