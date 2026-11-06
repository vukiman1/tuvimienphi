import { RedisService } from '@org/backend-redis';
import { EMAIL_CODE_RESEND_COOLDOWN_SECONDS } from '@org/shared-contracts';
import { EmailCodeKind, EmailCodeService } from './email-code.service';

const MS_PER_SECOND = 1000;

/** A Map stands in for Redis so the attempt counter runs for real rather than being asserted on. */
function buildRedis() {
  const store = new Map<string, string>();
  const expiresAt = new Map<string, number>();
  const isLive = (key: string): boolean => (expiresAt.get(key) ?? Infinity) > Date.now();
  return {
    store,
    service: {
      setIfAbsent: jest.fn(async (key: string, value: string, ttlSeconds: number) => {
        if (store.has(key) && isLive(key)) return false;
        store.set(key, value);
        expiresAt.set(key, Date.now() + ttlSeconds * MS_PER_SECOND);
        return true;
      }),
      set: jest.fn(async ({ key, value }: { key: string; value: string }) => {
        store.set(key, value);
      }),
      get: jest.fn(async (key: string) => store.get(key) ?? null),
      del: jest.fn(async (key: string) => {
        store.delete(key);
      }),
    } as unknown as RedisService,
  };
}

const KIND = EmailCodeKind.EMAIL_VERIFY;
const TTL = 600_000;

class NoCodeIssuedError extends Error {}

const deliverNothing = async (): Promise<void> => undefined;

async function issueCode(
  service: EmailCodeService,
  kind: EmailCodeKind,
  userId: string,
): Promise<string> {
  let delivered: string | null = null;
  await service.issue(kind, userId, TTL, async (code) => {
    delivered = code;
  });
  if (delivered === null) throw new NoCodeIssuedError(`no ${kind} code issued for ${userId}`);
  return delivered;
}

describe('EmailCodeService', () => {
  let redis: ReturnType<typeof buildRedis>;
  let service: EmailCodeService;

  beforeEach(() => {
    redis = buildRedis();
    service = new EmailCodeService(redis.service);
  });

  it('issues six digits, which is what a person can retype from an email', async () => {
    const code = await issueCode(service, KIND, 'u1');

    expect(code).toMatch(/^\d{6}$/);
  });

  it('accepts the code it issued', async () => {
    const code = await issueCode(service, KIND, 'u1');

    await expect(service.consume(KIND, 'u1', code)).resolves.toBe('u1');
  });

  it('never stores the code itself', async () => {
    const code = await issueCode(service, KIND, 'u1');

    expect([...redis.store.values()].join()).not.toContain(code);
  });

  it('spends the code, so it cannot be replayed', async () => {
    const code = await issueCode(service, KIND, 'u1');

    await service.consume(KIND, 'u1', code);

    await expect(service.consume(KIND, 'u1', code)).resolves.toBeNull();
  });

  it('destroys the code after five wrong guesses', async () => {
    const code = await issueCode(service, KIND, 'u1');

    for (let attempt = 1; attempt <= 4; attempt += 1) {
      await expect(service.consume(KIND, 'u1', '000000')).resolves.toBeNull();
    }
    await service.consume(KIND, 'u1', '000000');

    // Even the right code is gone now — a million guesses are no longer reachable.
    await expect(service.consume(KIND, 'u1', code)).resolves.toBeNull();
  });

  it('keeps kinds apart, so a verification code cannot reset a password', async () => {
    const code = await issueCode(service, KIND, 'u1');

    await expect(service.consume(EmailCodeKind.PASSWORD_RESET, 'u1', code)).resolves.toBeNull();
  });

  it('keeps users apart', async () => {
    const code = await issueCode(service, KIND, 'u1');

    await expect(service.consume(KIND, 'u2', code)).resolves.toBeNull();
  });

  describe('asking again', () => {
    beforeEach(() => jest.useFakeTimers({ now: new Date('2026-11-06T08:00:00Z') }));
    afterEach(() => jest.useRealTimers());

    const waitOutCooldown = (): void =>
      jest.advanceTimersByTime(EMAIL_CODE_RESEND_COOLDOWN_SECONDS * MS_PER_SECOND);

    it('sends nothing within the cooldown and keeps the first code working', async () => {
      const first = await issueCode(service, KIND, 'u1');
      const deliver = jest.fn(deliverNothing);

      await expect(service.issue(KIND, 'u1', TTL, deliver)).resolves.toBe(false);
      expect(deliver).not.toHaveBeenCalled();
      await expect(service.consume(KIND, 'u1', first)).resolves.toBe('u1');
    });

    it('lets the person ask again at once when the email could not be sent', async () => {
      const queueDown = new Error('queue is down');
      await expect(service.issue(KIND, 'u1', TTL, () => Promise.reject(queueDown))).rejects.toBe(
        queueDown,
      );

      const deliver = jest.fn(deliverNothing);
      await expect(service.issue(KIND, 'u1', TTL, deliver)).resolves.toBe(true);
      expect(deliver).toHaveBeenCalledWith(expect.stringMatching(/^\d{6}$/));
    });

    it('cools down each person on their own', async () => {
      await issueCode(service, KIND, 'u1');

      await expect(issueCode(service, KIND, 'u2')).resolves.toMatch(/^\d{6}$/);
    });

    it('replaces the previous code once the cooldown has passed', async () => {
      const first = await issueCode(service, KIND, 'u1');
      waitOutCooldown();
      const second = await issueCode(service, KIND, 'u1');

      await expect(service.consume(KIND, 'u1', first)).resolves.toBeNull();
      await expect(service.consume(KIND, 'u1', second)).resolves.toBe('u1');
    });

    it('cools down each kind on its own', async () => {
      await issueCode(service, KIND, 'u1');

      await expect(issueCode(service, EmailCodeKind.PASSWORD_RESET, 'u1')).resolves.toMatch(
        /^\d{6}$/,
      );
    });
  });
});
