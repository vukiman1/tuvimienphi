import { describe, expect, it } from 'vitest';
import type { AiUsageDayView } from '../data/admin-ai.query';
import {
  budgetStatus,
  fetchRange,
  formatCallCost,
  formatUsd,
  monthSpend,
  monthStart,
  periodRange,
  reportingDay,
  shiftDay,
  usageRows,
  usageTotals,
} from './ai-usage-model';

function day(overrides: Partial<AiUsageDayView> = {}): AiUsageDayView {
  return {
    day: '2026-10-07',
    provider: 'OPENAI',
    model: 'gpt-6.1-sol',
    purpose: 'GENERATION',
    calls: 10,
    failedCalls: 1,
    quotaHits: 0,
    inputTokens: 9000,
    outputTokens: 1200,
    costUsd: 0.03,
    ...overrides,
  };
}

describe('reportingDay', () => {
  it('reads the day in Việt Nam, the same way the server files a call', () => {
    expect(reportingDay(new Date('2026-10-07T16:59:59.000Z'))).toBe('2026-10-07');
    expect(reportingDay(new Date('2026-10-07T17:00:00.000Z'))).toBe('2026-10-08');
  });
});

describe('shiftDay and monthStart', () => {
  it('steps across the end of a month and a year', () => {
    expect(shiftDay('2026-10-01', -1)).toBe('2026-09-30');
    expect(shiftDay('2026-12-31', 1)).toBe('2027-01-01');
    expect(monthStart('2026-10-07')).toBe('2026-10-01');
  });
});

describe('periodRange', () => {
  it('counts today as one of the seven and the thirty days', () => {
    expect(periodRange('TODAY', '2026-10-07')).toEqual({ from: '2026-10-07', to: '2026-10-07' });
    expect(periodRange('WEEK', '2026-10-07')).toEqual({ from: '2026-10-01', to: '2026-10-07' });
    expect(periodRange('THIRTY_DAYS', '2026-10-07')).toEqual({
      from: '2026-09-08',
      to: '2026-10-07',
    });
    expect(periodRange('MONTH', '2026-10-07')).toEqual({ from: '2026-10-01', to: '2026-10-07' });
  });
});

describe('fetchRange', () => {
  it('asks for enough days to cover both the month and the last thirty days', () => {
    expect(fetchRange('2026-10-07')).toEqual({ from: '2026-09-08', to: '2026-10-07' });
    expect(fetchRange('2026-10-31')).toEqual({ from: '2026-10-01', to: '2026-10-31' });
  });
});

describe('usageRows', () => {
  const range = { from: '2026-10-06', to: '2026-10-07' };

  it('adds the days of one model together and leaves out days outside the range', () => {
    const rows = usageRows(
      [day(), day({ day: '2026-10-06', calls: 5, costUsd: 0.01 }), day({ day: '2026-10-01' })],
      range,
    );

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ calls: 15, failedCalls: 2, inputTokens: 18_000 });
    expect(rows[0].costUsd).toBeCloseTo(0.04);
  });

  it('keeps writing readings apart from checking the key', () => {
    const rows = usageRows([day(), day({ purpose: 'CHECK', calls: 60, costUsd: 0.002 })], range);

    expect(rows.map((row) => row.purpose)).toEqual(['GENERATION', 'CHECK']);
  });

  it('puts what cost the most first', () => {
    const rows = usageRows(
      [day({ model: 'gpt-6-luna', costUsd: 0.001 }), day({ model: 'gpt-6-astra', costUsd: 0.9 })],
      range,
    );

    expect(rows.map((row) => row.model)).toEqual(['gpt-6-astra', 'gpt-6-luna']);
  });

  it('leaves the cost of a model unknown once any of its days has no price', () => {
    const rows = usageRows(
      [day({ model: 'gpt-9', costUsd: null }), day({ model: 'gpt-9', day: '2026-10-06' })],
      range,
    );

    expect(rows[0].costUsd).toBeNull();
  });
});

describe('usageTotals', () => {
  it('adds everything up and names the models it could not price', () => {
    const rows = usageRows(
      [
        day(),
        day({ provider: 'GEMINI', model: 'gemini-x', costUsd: null, quotaHits: 3 }),
        day({
          provider: 'GEMINI',
          model: 'gemini-y',
          costUsd: null,
          inputTokens: 0,
          outputTokens: 0,
        }),
      ],
      { from: '2026-10-07', to: '2026-10-07' },
    );

    const totals = usageTotals(rows);

    expect(totals).toMatchObject({ calls: 30, failedCalls: 3, quotaHits: 3, inputTokens: 18_000 });
    expect(totals.costUsd).toBeCloseTo(0.03);
    expect(totals.unpricedModels).toEqual(['gemini-x']);
  });
});

describe('monthSpend', () => {
  it('adds this month per AI, whatever period the table shows', () => {
    const spend = monthSpend(
      [
        day({ costUsd: 1.5 }),
        day({ day: '2026-10-01', costUsd: 2 }),
        day({ day: '2026-09-30', costUsd: 40 }),
        day({ provider: 'GEMINI', costUsd: 0.2 }),
      ],
      '2026-10-07',
    );

    expect(spend).toEqual({ OPENAI: 3.5, GEMINI: 0.2 });
  });
});

describe('budgetStatus', () => {
  it('has nothing to say without a budget', () => {
    expect(budgetStatus(3, null)).toBeNull();
  });

  it('warns from four fifths of the budget and says so once it is spent', () => {
    expect(budgetStatus(3, 10)).toEqual({ percent: 30, level: 'OK' });
    expect(budgetStatus(8, 10)).toEqual({ percent: 80, level: 'NEAR' });
    expect(budgetStatus(10, 10)).toEqual({ percent: 100, level: 'OVER' });
    expect(budgetStatus(12.5, 10)).toEqual({ percent: 125, level: 'OVER' });
  });
});

describe('formatUsd', () => {
  it('shows cents for real money and more digits for fractions of a cent', () => {
    expect(formatUsd(12.5)).toBe('$12.50');
    expect(formatUsd(0)).toBe('$0.00');
    expect(formatUsd(0.0042)).toBe('$0.0042');
    expect(formatUsd(0.25)).toBe('$0.25');
  });
});

describe('formatCallCost', () => {
  it('keeps the same number of digits down a column of single calls', () => {
    expect(formatCallCost(0.0274)).toBe('$0.02740');
    expect(formatCallCost(0.00022)).toBe('$0.00022');
  });
});
