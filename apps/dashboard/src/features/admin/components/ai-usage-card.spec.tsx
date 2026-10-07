import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import type { AiProvider } from '../../../gql/graphql';
import type { AiProviderView, AiUsageDayView } from '../data/admin-ai.query';
import { AiUsageCard } from './ai-usage-card';
import type { DayRange, UsageRow } from './ai-usage-model';

const TODAY = '2026-10-07';

function provider(overrides: Partial<AiProviderView> = {}): AiProviderView {
  return {
    provider: 'OPENAI',
    hasApiKey: true,
    apiKeyHint: 'sk-p…0002',
    models: ['gpt-6.1-sol'],
    isActive: true,
    monthlyBudgetUsd: null,
    updatedAt: '2026-10-07T03:00:00.000Z',
    health: null,
    ...overrides,
  };
}

function day(overrides: Partial<AiUsageDayView> = {}): AiUsageDayView {
  return {
    day: TODAY,
    provider: 'OPENAI',
    model: 'gpt-6.1-sol',
    purpose: 'GENERATION',
    calls: 12,
    failedCalls: 1,
    quotaHits: 0,
    inputTokens: 90_000,
    outputTokens: 12_000,
    costUsd: 0.3,
    ...overrides,
  };
}

function renderCard(providers: AiProviderView[], days: AiUsageDayView[]) {
  const onSetBudget = vi.fn<(provider: AiProvider, monthlyBudgetUsd: number | null) => void>();
  const onOpenCalls = vi.fn<(row: UsageRow, range: DayRange, periodLabel: string) => void>();
  render(
    <AiUsageCard
      providers={providers}
      days={days}
      today={TODAY}
      pricesCheckedOn="07/10/2026"
      isLoading={false}
      loadError={null}
      savingBudgetFor={null}
      onSetBudget={onSetBudget}
      onOpenCalls={onOpenCalls}
    />,
  );
  return { onSetBudget, onOpenCalls };
}

describe('AiUsageCard', () => {
  it('shows today by model, with calls, tokens and what they cost', () => {
    renderCard([provider()], [day(), day({ day: '2026-10-06', calls: 500 })]);

    const row = screen.getByText('GPT-6.1 Sol').closest('tr') as HTMLElement;
    expect(within(row).getByText('Luận giải')).toBeTruthy();
    expect(within(row).getByText('12')).toBeTruthy();
    expect(within(row).getByText('90.000')).toBeTruthy();
    expect(within(row).getByText('12.000')).toBeTruthy();
    expect(within(row).getByText('$0.30')).toBeTruthy();
  });

  it('widens to the last seven days on request', () => {
    renderCard([provider()], [day(), day({ day: '2026-10-06', calls: 500 })]);

    fireEvent.click(screen.getByText('7 ngày'));

    const row = screen.getByText('GPT-6.1 Sol').closest('tr') as HTMLElement;
    expect(within(row).getByText('512')).toBeTruthy();
  });

  it('opens the single calls behind a row, for the period on screen', () => {
    const { onOpenCalls } = renderCard([provider()], [day(), day({ day: '2026-10-06' })]);

    fireEvent.click(screen.getByText('7 ngày'));
    fireEvent.click(screen.getByText('GPT-6.1 Sol'));

    expect(onOpenCalls).toHaveBeenCalledTimes(1);
    const [row, range, periodLabel] = onOpenCalls.mock.calls[0];
    expect(row).toMatchObject({ provider: 'OPENAI', model: 'gpt-6.1-sol', purpose: 'GENERATION' });
    expect(range).toEqual({ from: '2026-10-01', to: '2026-10-07' });
    expect(periodLabel).toBe('7 ngày');
  });

  it('keeps the calls that only checked the key apart from the ones that wrote readings', () => {
    renderCard(
      [provider()],
      [
        day(),
        day({ purpose: 'CHECK', calls: 60, inputTokens: 2400, outputTokens: 360, costUsd: 0.0084 }),
      ],
    );

    const check = screen.getByText('Kiểm tra').closest('tr') as HTMLElement;
    expect(within(check).getByText('60')).toBeTruthy();
    expect(within(check).getByText('$0.0084')).toBeTruthy();
  });

  it('says so when a model has no known price instead of calling it free', () => {
    renderCard([provider()], [day({ model: 'gpt-9-nebula', costUsd: null })]);

    expect(screen.getByText('Chưa có giá')).toBeTruthy();
    expect(screen.getByText(/Chưa tính tiền cho: gpt-9-nebula\./)).toBeTruthy();
  });

  it('says there is nothing yet rather than showing an empty table', () => {
    renderCard([provider()], []);

    expect(screen.getByText('Chưa có lượt gọi nào trong khoảng này.')).toBeTruthy();
  });

  it('adds up this month against the budget, whatever period the table shows', () => {
    renderCard(
      [provider({ monthlyBudgetUsd: 10 })],
      [day({ costUsd: 1.5 }), day({ day: '2026-10-02', costUsd: 2 })],
    );

    expect(screen.getByText('$3.50 / $10.00')).toBeTruthy();
    expect(screen.queryByText(/hạn mức tháng:/)).toBeNull();
  });

  it('warns close to the budget and says plainly once it is passed', () => {
    renderCard(
      [
        provider({ monthlyBudgetUsd: 10 }),
        provider({ provider: 'ANTHROPIC', isActive: false, monthlyBudgetUsd: 5 }),
      ],
      [day({ costUsd: 8.5 }), day({ provider: 'ANTHROPIC', model: 'claude-opus-5-5', costUsd: 6 })],
    );

    expect(
      screen.getByText('ChatGPT (OpenAI) sắp chạm hạn mức tháng: $8.50 / $10.00'),
    ).toBeTruthy();
    expect(
      screen.getByText('Claude (Anthropic) đã vượt hạn mức tháng: $6.00 / $5.00'),
    ).toBeTruthy();
  });

  it('saves a budget typed for an AI, and only once it differs from the stored one', () => {
    const { onSetBudget } = renderCard([provider()], [day()]);
    const save = screen.getByRole('button', { name: 'Lưu hạn mức' });
    expect(save).toHaveProperty('disabled', true);
    expect(screen.getByText('$0.30 / chưa đặt')).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Hạn mức tháng ChatGPT (OpenAI)'), {
      target: { value: '20' },
    });
    fireEvent.click(save);

    expect(onSetBudget).toHaveBeenCalledWith('OPENAI', 20);
  });

  it('leaves out an AI that has no key, no budget and no spend', () => {
    renderCard(
      [provider(), provider({ provider: 'GEMINI', hasApiKey: false, isActive: false })],
      [day()],
    );

    expect(screen.queryByLabelText('Hạn mức tháng Gemini')).toBeNull();
    expect(screen.getByLabelText('Hạn mức tháng ChatGPT (OpenAI)')).toBeTruthy();
  });
});
