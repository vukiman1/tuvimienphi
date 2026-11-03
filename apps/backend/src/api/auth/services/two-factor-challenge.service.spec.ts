import { RedisService } from '@org/backend-redis';
import { AuthProvider } from '@org/backend-enum';
import { SessionPersistence } from '../enums/session-persistence.enum';
import { TwoFactorChallengeService, type ChallengeSession } from './two-factor-challenge.service';

const PASSWORD_SESSION: ChallengeSession = {
  rememberMe: false,
  persistence: SessionPersistence.STANDARD,
  authProvider: AuthProvider.LOCAL,
};

/** A Map stands in for Redis so the attempt counter is exercised for real, not asserted on calls. */
function buildRedis() {
  const store = new Map<string, string>();
  return {
    store,
    service: {
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

describe('TwoFactorChallengeService', () => {
  let redis: ReturnType<typeof buildRedis>;
  let service: TwoFactorChallengeService;

  beforeEach(() => {
    redis = buildRedis();
    service = new TwoFactorChallengeService(redis.service);
  });

  it('hands out unguessable tokens', async () => {
    const first = await service.issue('user-1', PASSWORD_SESSION);
    const second = await service.issue('user-1', PASSWORD_SESSION);

    expect(first).toHaveLength(64);
    expect(first).not.toBe(second);
  });

  it('remembers who the challenge belongs to and the session it should become', async () => {
    const googleSession: ChallengeSession = {
      rememberMe: false,
      persistence: SessionPersistence.OAUTH,
      authProvider: AuthProvider.GOOGLE,
    };
    const token = await service.issue('user-1', googleSession);

    await expect(service.peek(token)).resolves.toEqual({ userId: 'user-1', ...googleSession });
  });

  it('treats a challenge stored without its session as spent', async () => {
    redis.store.set(
      '2FA_CHALLENGE:old',
      JSON.stringify({ userId: 'user-1', rememberMe: false, attempts: 0 }),
    );

    await expect(service.peek('old')).resolves.toBeNull();
  });

  it('never leaks the attempt counter to callers', async () => {
    const token = await service.issue('user-1', PASSWORD_SESSION);

    const claim = await service.peek(token);

    expect(claim).not.toHaveProperty('attempts');
  });

  it('destroys the challenge on the fifth wrong code', async () => {
    const token = await service.issue('user-1', PASSWORD_SESSION);

    for (let attempt = 1; attempt <= 4; attempt += 1) {
      await expect(service.recordFailure(token)).resolves.toBe(true);
    }

    await expect(service.recordFailure(token)).resolves.toBe(false);
    await expect(service.peek(token)).resolves.toBeNull();
  });

  it('treats an unknown token as already spent', async () => {
    await expect(service.recordFailure('never-issued')).resolves.toBe(false);
    await expect(service.peek('never-issued')).resolves.toBeNull();
  });

  it('cannot be reused once consumed', async () => {
    const token = await service.issue('user-1', PASSWORD_SESSION);

    await service.consume(token);

    await expect(service.peek(token)).resolves.toBeNull();
  });

  it('expires on its own so an abandoned attempt does not linger', async () => {
    await service.issue('user-1', PASSWORD_SESSION);

    const [{ expired }] = (redis.service.set as jest.Mock).mock.calls[0];
    expect(expired).toBe(300);
  });
});
