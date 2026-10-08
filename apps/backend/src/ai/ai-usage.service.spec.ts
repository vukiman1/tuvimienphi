import type { Repository } from 'typeorm';
import { AiProvider } from './ai-provider';
import { AiUsagePurpose } from './ai-usage-purpose.enum';
import { runWithAiCallContext } from './ai-call-context';
import { AiCallStatus } from './ai-call-status.enum';
import {
  AiUsageService,
  CALL_RETENTION_DAYS,
  isQuotaRefusal,
  reportingDay,
  toAiCall,
  type AiCallRow,
} from './ai-usage.service';
import { AiUnavailableError } from './ai.errors';
import type { AiResult } from './ai.types';
import { AiCallEntity } from './entities/ai-call.entity';
import { AiUsageDailyEntity } from './entities/ai-usage-daily.entity';

function setup(rows: Partial<AiUsageDailyEntity>[] = []) {
  const repo = {
    query: jest.fn().mockResolvedValue(undefined),
    find: jest.fn().mockResolvedValue(rows),
  };
  const callRepo = {
    insert: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
  };
  const service = new AiUsageService(
    repo as unknown as Repository<AiUsageDailyEntity>,
    callRepo as unknown as Repository<AiCallEntity>,
  );
  return { service, repo, callRepo };
}

function logged(callRepo: { insert: jest.Mock }): Partial<AiCallEntity>[] {
  return callRepo.insert.mock.calls.map(([row]) => row as Partial<AiCallEntity>);
}

function answer(overrides: Partial<AiResult> = {}): AiResult {
  return {
    text: '{}',
    model: 'gpt-6.1-sol',
    inputTokens: 900,
    outputTokens: 120,
    failedAttempts: [],
    latencyMs: 1800,
    ...overrides,
  };
}

function recorded(repo: { query: jest.Mock }): unknown[][] {
  return repo.query.mock.calls.map(([, parameters]) => (parameters as unknown[]).slice(1));
}

describe('reportingDay', () => {
  it('counts a call by the day it is in Việt Nam, not in UTC', () => {
    expect(reportingDay(new Date('2026-10-07T16:59:59.000Z'))).toBe('2026-10-07');
    expect(reportingDay(new Date('2026-10-07T17:00:00.000Z'))).toBe('2026-10-08');
  });
});

describe('isQuotaRefusal', () => {
  it.each([
    '429 You exceeded your current quota',
    'RESOURCE_EXHAUSTED',
    '429 rate_limit_error: This request would exceed your rate limit',
    'Too Many Requests',
  ])('reads "%s" as running into a limit', (reason) => {
    expect(isQuotaRefusal(reason)).toBe(true);
  });

  it.each(['401 invalid x-api-key', 'This operation was aborted', '503 UNAVAILABLE high demand'])(
    'does not blame a limit for "%s"',
    (reason) => {
      expect(isQuotaRefusal(reason)).toBe(false);
    },
  );
});

describe('AiUsageService.track', () => {
  it('hands back the answer and counts its tokens under the model that wrote it', async () => {
    const { service, repo } = setup();
    const result = answer();

    await expect(
      service.track(AiProvider.OPENAI, AiUsagePurpose.GENERATION, async () => result),
    ).resolves.toBe(result);

    expect(recorded(repo)).toEqual([['OPENAI', 'gpt-6.1-sol', 'GENERATION', 0, 0, 900, 120]]);
  });

  it('also counts the models that failed before one answered', async () => {
    const { service, repo } = setup();
    const result = answer({
      model: 'gemini-3.8-flash',
      failedAttempts: [{ model: 'gemini-3.5-flash-lite', reason: '429 RESOURCE_EXHAUSTED' }],
    });

    await service.track(AiProvider.GEMINI, AiUsagePurpose.GENERATION, async () => result);

    expect(recorded(repo)).toEqual([
      ['GEMINI', 'gemini-3.5-flash-lite', 'GENERATION', 1, 1, 0, 0],
      ['GEMINI', 'gemini-3.8-flash', 'GENERATION', 0, 0, 900, 120],
    ]);
  });

  it('counts every model that refused when none answered, and still fails', async () => {
    const { service, repo } = setup();
    const failure = new AiUnavailableError([
      { model: 'claude-opus-5-5', reason: '401 invalid x-api-key' },
      { model: 'claude-sonnet-5-5', reason: '429 rate_limit_error' },
    ]);

    await expect(
      service.track(AiProvider.ANTHROPIC, AiUsagePurpose.CHECK, async () => {
        throw failure;
      }),
    ).rejects.toBe(failure);

    expect(recorded(repo)).toEqual([
      ['ANTHROPIC', 'claude-opus-5-5', 'CHECK', 1, 0, 0, 0],
      ['ANTHROPIC', 'claude-sonnet-5-5', 'CHECK', 1, 1, 0, 0],
    ]);
  });

  it('never lets a failed write take a good answer away', async () => {
    const { service, repo } = setup();
    repo.query.mockRejectedValue(new Error('relation "ai_usage_daily" does not exist'));
    const result = answer();

    await expect(
      service.track(AiProvider.OPENAI, AiUsagePurpose.GENERATION, async () => result),
    ).resolves.toBe(result);
  });

  it('leaves an error that is not about the models alone', async () => {
    const { service, repo } = setup();

    await expect(
      service.track(AiProvider.OPENAI, AiUsagePurpose.GENERATION, async () => {
        throw new TypeError('boom');
      }),
    ).rejects.toBeInstanceOf(TypeError);

    expect(repo.query).not.toHaveBeenCalled();
  });
});

describe('AiUsageService call log', () => {
  it('keeps one line per call, with what it was for and who asked', async () => {
    const { service, callRepo } = setup();

    await runWithAiCallContext({ userId: 'user-1', label: 'luan-giai:2' }, () =>
      service.track(AiProvider.OPENAI, AiUsagePurpose.GENERATION, async () => answer()),
    );

    expect(logged(callRepo)).toEqual([
      expect.objectContaining({
        provider: AiProvider.OPENAI,
        model: 'gpt-6.1-sol',
        purpose: AiUsagePurpose.GENERATION,
        status: AiCallStatus.OK,
        inputTokens: 900,
        outputTokens: 120,
        latencyMs: 1800,
        error: null,
        label: 'luan-giai:2',
        userId: 'user-1',
      }),
    ]);
  });

  it('logs a model that failed with why, even when the next one answered', async () => {
    const { service, callRepo } = setup();
    const result = answer({
      model: 'gemini-3.8-flash',
      failedAttempts: [
        { model: 'gemini-3.5-flash-lite', reason: '429 RESOURCE_EXHAUSTED', latencyMs: 240 },
      ],
    });

    await service.track(AiProvider.GEMINI, AiUsagePurpose.GENERATION, async () => result);

    expect(logged(callRepo)).toEqual([
      expect.objectContaining({
        model: 'gemini-3.5-flash-lite',
        status: AiCallStatus.FAILED,
        isQuotaHit: true,
        latencyMs: 240,
        error: '429 RESOURCE_EXHAUSTED',
        userId: null,
        label: null,
      }),
      expect.objectContaining({ model: 'gemini-3.8-flash', status: AiCallStatus.OK }),
    ]);
  });

  it('cuts a long provider message down to what the column holds', async () => {
    const { service, callRepo } = setup();
    const failure = new AiUnavailableError([{ model: 'm', reason: 'x'.repeat(900) }]);

    await service
      .track(AiProvider.OPENAI, AiUsagePurpose.CHECK, async () => {
        throw failure;
      })
      .catch(() => undefined);

    expect(logged(callRepo)[0].error).toHaveLength(300);
  });

  it('drops lines older than the retention window, but not on every call', async () => {
    const { service, callRepo } = setup();
    const entry = {
      provider: AiProvider.OPENAI,
      model: 'gpt-6.1-sol',
      purpose: AiUsagePurpose.CHECK,
      isFailure: false,
      isQuotaHit: false,
      inputTokens: 1,
      outputTokens: 1,
      latencyMs: 1,
      error: null,
    };
    const first = new Date('2026-10-08T00:00:00.000Z');

    await service.record([entry], {}, first);
    await service.record([entry], {}, new Date(first.getTime() + 60_000));

    expect(callRepo.delete).toHaveBeenCalledTimes(1);
    const cutoff = callRepo.delete.mock.calls[0][0].createdAt.value as Date;
    expect(first.getTime() - cutoff.getTime()).toBe(CALL_RETENTION_DAYS * 86_400_000);

    await service.record([entry], {}, new Date(first.getTime() + 7 * 60 * 60 * 1000));
    expect(callRepo.delete).toHaveBeenCalledTimes(2);
  });
});

describe('toAiCall', () => {
  const row: AiCallRow = {
    id: 'call-1',
    created_at: new Date('2026-10-08T03:00:00.000Z'),
    day: '2026-10-08',
    provider: AiProvider.OPENAI,
    model: 'gpt-6.1-sol',
    purpose: AiUsagePurpose.GENERATION,
    status: AiCallStatus.OK,
    is_quota_hit: false,
    input_tokens: 55,
    output_tokens: 11,
    latency_ms: 4757,
    error: null,
    label: 'luan-giai:2',
    user_email: 'reader@example.com',
  };

  it('prices one call from its own tokens', () => {
    expect(toAiCall(row)).toMatchObject({
      id: 'call-1',
      costUsd: 0.00022,
      label: 'luan-giai:2',
      userEmail: 'reader@example.com',
    });
  });

  it('puts no price on a call that failed', () => {
    expect(
      toAiCall({ ...row, status: AiCallStatus.FAILED, input_tokens: 0, output_tokens: 0 }).costUsd,
    ).toBeNull();
  });
});

describe('AiUsageService.record', () => {
  it('files a call under the day it happened in Việt Nam', async () => {
    const { service, repo } = setup();

    await service.record(
      [
        {
          provider: AiProvider.OPENAI,
          model: 'gpt-6.1-sol',
          purpose: AiUsagePurpose.GENERATION,
          isFailure: false,
          isQuotaHit: false,
          inputTokens: 1,
          outputTokens: 1,
          latencyMs: 900,
          error: null,
        },
      ],
      {},
      new Date('2026-10-07T17:30:00.000Z'),
    );

    expect(repo.query.mock.calls[0][1][0]).toBe('2026-10-08');
  });
});

describe('AiUsageService.daily', () => {
  it('turns stored counts into numbers and prices them', async () => {
    const { service, repo } = setup([
      {
        day: '2026-10-07',
        provider: AiProvider.ANTHROPIC,
        model: 'claude-opus-5-5',
        purpose: AiUsagePurpose.GENERATION,
        calls: 12,
        failedCalls: 1,
        quotaHits: 0,
        inputTokens: '1000000',
        outputTokens: '100000',
      },
    ]);

    await expect(service.daily('2026-10-01', '2026-10-07')).resolves.toEqual([
      {
        day: '2026-10-07',
        provider: AiProvider.ANTHROPIC,
        model: 'claude-opus-5-5',
        purpose: AiUsagePurpose.GENERATION,
        calls: 12,
        failedCalls: 1,
        quotaHits: 0,
        inputTokens: 1_000_000,
        outputTokens: 100_000,
        costUsd: 6,
      },
    ]);
    expect(repo.find).toHaveBeenCalledTimes(1);
  });

  it('leaves the cost empty for a model with no known price', async () => {
    const { service } = setup([
      {
        day: '2026-10-07',
        provider: AiProvider.OPENAI,
        model: 'gpt-9-nebula',
        purpose: AiUsagePurpose.CHECK,
        calls: 1,
        failedCalls: 0,
        quotaHits: 0,
        inputTokens: '40',
        outputTokens: '6',
      },
    ]);

    const [row] = await service.daily('2026-10-07', '2026-10-07');

    expect(row.costUsd).toBeNull();
  });
});
