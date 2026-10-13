import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import type { AiCallView } from '../data/admin-ai.query';
import { AiCallDrawer } from './ai-call-drawer';

function call(overrides: Partial<AiCallView> = {}): AiCallView {
  return {
    id: 'call-1',
    at: '2026-10-08T03:00:00.000Z',
    status: 'OK',
    isQuotaHit: false,
    inputTokens: 9100,
    outputTokens: 1250,
    latencyMs: 6400,
    costUsd: 0.0307,
    error: null,
    label: 'luan-giai:2',
    userEmail: 'reader@example.com',
    ...overrides,
  };
}

function renderDrawer(calls: AiCallView[], totals: { total?: number; expected?: number } = {}) {
  render(
    <AiCallDrawer
      isOpen
      title="GPT-6.1 Sol · Luận giải"
      subtitle="Hôm nay"
      calls={calls}
      total={totals.total ?? calls.length}
      expectedTotal={totals.expected ?? calls.length}
      page={1}
      isLoading={false}
      loadError={null}
      retentionDays={90}
      onPageChange={vi.fn()}
      onClose={vi.fn()}
    />,
  );
}

describe('AiCallDrawer', () => {
  it('lists each call with its tokens, how long it took, what it cost and who asked', () => {
    renderDrawer([call()]);

    const row = screen.getByText('reader@example.com').closest('tr') as HTMLElement;
    expect(within(row).getByText('Thành công')).toBeTruthy();
    expect(within(row).getByText('9.100')).toBeTruthy();
    expect(within(row).getByText('1.250')).toBeTruthy();
    expect(within(row).getByText('6,4 giây')).toBeTruthy();
    expect(within(row).getByText('$0.03070')).toBeTruthy();
    expect(within(row).getByText('Luận giải chương 2')).toBeTruthy();
  });

  it('shows a failed call with its reason and without a price', () => {
    renderDrawer([
      call({
        id: 'call-2',
        status: 'FAILED',
        isQuotaHit: true,
        inputTokens: 0,
        outputTokens: 0,
        costUsd: null,
        error: '429 RESOURCE_EXHAUSTED',
        userEmail: null,
      }),
    ]);

    const row = screen.getByText('Hết hạn mức').closest('tr') as HTMLElement;
    expect(
      within(row).getByText('Luận giải chương 2: Hết hạn mức hoặc đang bị giới hạn tốc độ.'),
    ).toBeTruthy();
    expect(within(row).getAllByText('—').length).toBeGreaterThanOrEqual(2);
  });

  it('explains when the table counted more calls than there are details for', () => {
    renderDrawer([call()], { total: 1, expected: 12 });

    expect(screen.getByText('Có chi tiết của 1 trên 12 lượt gọi')).toBeTruthy();
    expect(screen.getByText(/giữ 90 ngày/)).toBeTruthy();
  });

  it('says so when no call was logged in detail', () => {
    renderDrawer([]);

    expect(
      screen.getByText('Chưa có lượt gọi nào được ghi chi tiết trong khoảng này.'),
    ).toBeTruthy();
  });
});
