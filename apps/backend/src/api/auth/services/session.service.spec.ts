import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@org/backend-jwt';
import { RedisService } from '@org/backend-redis';
import { createHash } from 'crypto';
import { SessionService } from './session.service';
import { SessionPersistence } from '../enums/session-persistence.enum';

const ACCESS_TTL_MS = 900_000;
const DAY_MS = 86_400_000;
const REMEMBER_TTL_MS = 60 * DAY_MS;
const OAUTH_TTL_MS = 30 * DAY_MS;
const MAX_LIFETIME = '12h';
const MAX_LIFETIME_SECONDS = 12 * 3_600;
const START_KEY = 'SESSION_START:{user-1}:jti-1';
const ADMIN_TTL_MS = 4 * 3_600_000;
const USER_SET_KEY = 'SESSIONS:{user-1}';
const ADMIN_SET_KEY = 'SESSIONS:admin:{user-1}';

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

describe('SessionService', () => {
  let jwt: jest.Mocked<JwtService>;
  let redis: jest.Mocked<RedisService>;
  let config: jest.Mocked<ConfigService>;
  let configValues: Record<string, unknown>;
  let service: SessionService;

  beforeEach(() => {
    jwt = {
      signJwt: jest.fn((_payload, expiresInMs) =>
        Promise.resolve(expiresInMs != null ? 'refresh-jwt' : 'access-jwt'),
      ),
      verifyJwt: jest.fn().mockResolvedValue({ id: 'user-1', jti: 'jti-1' }),
      getAccessTokenExpiryMs: jest.fn().mockReturnValue(ACCESS_TTL_MS),
    } as unknown as jest.Mocked<JwtService>;

    redis = {
      set: jest.fn().mockResolvedValue('OK'),
      get: jest.fn().mockResolvedValue(null),
      del: jest.fn().mockResolvedValue(1),
      zRem: jest.fn().mockResolvedValue(1),
      zRange: jest.fn().mockResolvedValue([]),
      eval: jest.fn().mockResolvedValue(0),
    } as unknown as jest.Mocked<RedisService>;

    configValues = {
      'session.maxSessionsPerUser': 5,
      'session.refreshTtl': '1d',
      'session.refreshTtlRemember': '60d',
      'session.refreshTtlOauth': '30d',
      'session.refreshTtlAdmin': '4h',
      'session.maxLifetimeAdmin': MAX_LIFETIME,
    };

    config = {
      get: jest.fn((key: string) => configValues[key]),
    } as unknown as jest.Mocked<ConfigService>;

    service = new SessionService(jwt, redis, config);
  });

  describe('createSession', () => {
    it('stores the access token hashed and the refresh token whole', async () => {
      const session = await service.createSession('user-1', 'user', SessionPersistence.STANDARD);

      expect(session.accessToken).toBe('access-jwt');
      expect(session.refreshToken).toBe('refresh-jwt');
      expect(redis.set).toHaveBeenCalledWith(
        expect.objectContaining({ value: sha256('access-jwt'), expired: ACCESS_TTL_MS / 1000 }),
      );
      expect(redis.set).toHaveBeenCalledWith(
        expect.objectContaining({ value: 'refresh-jwt', expired: DAY_MS / 1000 }),
      );
    });

    it('uses the longer "remember me" lifetime when requested', async () => {
      const session = await service.createSession('user-1', 'user', SessionPersistence.REMEMBER);

      expect(session.refreshTokenTtlMs).toBe(REMEMBER_TTL_MS);
      expect(redis.set).toHaveBeenCalledWith(
        expect.objectContaining({ value: 'refresh-jwt', expired: REMEMBER_TTL_MS / 1000 }),
      );
    });

    it('uses the 30-day OAuth lifetime for social logins', async () => {
      const session = await service.createSession('user-1', 'user', SessionPersistence.OAUTH);

      expect(session.refreshTokenTtlMs).toBe(OAUTH_TTL_MS);
      expect(redis.set).toHaveBeenCalledWith(
        expect.objectContaining({ value: 'refresh-jwt', expired: OAUTH_TTL_MS / 1000 }),
      );
    });

    it('enforces the per-user session limit from config', async () => {
      await service.createSession('user-1', 'user', SessionPersistence.STANDARD);
      expect(config.get).toHaveBeenCalledWith('session.maxSessionsPerUser');
      expect(redis.eval).toHaveBeenCalled();
    });
  });

  describe('isAccessTokenActive', () => {
    it('is true when the stored hash matches the presented token', async () => {
      redis.get.mockResolvedValue(sha256('the-token'));
      expect(await service.isAccessTokenActive('user-1', 'jti-1', 'the-token')).toBe(true);
    });

    it('is false when nothing is stored', async () => {
      redis.get.mockResolvedValue(null);
      expect(await service.isAccessTokenActive('user-1', 'jti-1', 'the-token')).toBe(false);
    });
  });

  describe('rotateSession', () => {
    it('rejects when the refresh token is no longer stored', async () => {
      redis.get.mockResolvedValue(null);
      await expect(
        service.rotateSession('user-1', 'jti-1', 'user', SessionPersistence.STANDARD),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('verifies the stored refresh token then issues a fresh pair', async () => {
      redis.get.mockResolvedValue('stored-refresh');
      const tokens = await service.rotateSession(
        'user-1',
        'jti-1',
        'user',
        SessionPersistence.STANDARD,
      );

      expect(jwt.verifyJwt).toHaveBeenCalledWith('stored-refresh');
      expect(tokens.accessToken).toBe('access-jwt');
      expect(tokens.refreshToken).toBe('refresh-jwt');
    });
  });

  describe('max lifetime', () => {
    it('records when the session started, expiring on its own at the max lifetime', async () => {
      configValues['session.maxLifetime'] = MAX_LIFETIME;

      await service.createSession('user-1', 'user', SessionPersistence.STANDARD);

      expect(redis.set).toHaveBeenCalledWith(
        expect.objectContaining({
          key: expect.stringContaining('SESSION_START:{user-1}:'),
          expired: MAX_LIFETIME_SECONDS,
        }),
      );
    });

    it('refuses to refresh once the session has outlived its max lifetime', async () => {
      configValues['session.maxLifetime'] = MAX_LIFETIME;
      redis.get.mockImplementation((key: string) =>
        Promise.resolve(key === START_KEY ? null : 'stored-refresh'),
      );

      await expect(
        service.rotateSession('user-1', 'jti-1', 'user', SessionPersistence.STANDARD),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('never pushes the max lifetime back when refreshing', async () => {
      configValues['session.maxLifetime'] = MAX_LIFETIME;
      redis.get.mockResolvedValue('stored-refresh');

      await service.rotateSession('user-1', 'jti-1', 'user', SessionPersistence.STANDARD);

      expect(redis.set).not.toHaveBeenCalledWith(expect.objectContaining({ key: START_KEY }));
    });

    it('leaves the session alone when no max lifetime is configured', async () => {
      redis.get.mockResolvedValue('stored-refresh');

      const tokens = await service.rotateSession(
        'user-1',
        'jti-1',
        'user',
        SessionPersistence.STANDARD,
      );

      expect(tokens.refreshToken).toBe('refresh-jwt');
      expect(redis.get).not.toHaveBeenCalledWith(START_KEY);
    });
  });

  describe('admin audience', () => {
    it('tracks console sessions in their own set, so the device limit is counted apart', async () => {
      await service.createSession('user-1', 'admin', SessionPersistence.STANDARD);

      const setKeys = redis.eval.mock.calls.map((call) => call[2] as string);
      expect(setKeys).toContain(ADMIN_SET_KEY);
      expect(setKeys).not.toContain(USER_SET_KEY);
    });

    it('gives the console a shorter lifetime than the public site', async () => {
      const session = await service.createSession('user-1', 'admin', SessionPersistence.STANDARD);

      expect(session.refreshTokenTtlMs).toBe(ADMIN_TTL_MS);
    });

    it('caps the console session even though the public site has no cap', async () => {
      await service.createSession('user-1', 'admin', SessionPersistence.STANDARD);

      expect(redis.set).toHaveBeenCalledWith(
        expect.objectContaining({
          key: expect.stringContaining('SESSION_START:{user-1}:'),
          expired: MAX_LIFETIME_SECONDS,
        }),
      );
    });

    it('ends console sessions too when the user signs out of every device', async () => {
      redis.zRange.mockImplementation((key: string) =>
        Promise.resolve(key === ADMIN_SET_KEY ? ['admin-jti'] : ['user-jti']),
      );

      await service.revokeAllSessions('user-1');

      expect(redis.del).toHaveBeenCalledWith('AC_TOKEN:{user-1}:user-jti');
      expect(redis.del).toHaveBeenCalledWith('AC_TOKEN:{user-1}:admin-jti');
      expect(redis.del).toHaveBeenCalledWith(USER_SET_KEY);
      expect(redis.del).toHaveBeenCalledWith(ADMIN_SET_KEY);
    });

    it('drops a revoked session from both sets, since the caller does not say which it was', async () => {
      await service.revokeSession('user-1', 'jti-1');

      expect(redis.zRem).toHaveBeenCalledWith(USER_SET_KEY, 'jti-1');
      expect(redis.zRem).toHaveBeenCalledWith(ADMIN_SET_KEY, 'jti-1');
    });
  });

  describe('revoke', () => {
    it('revokeSession removes the access key, refresh key and set member', async () => {
      await service.revokeSession('user-1', 'jti-1');
      expect(redis.del).toHaveBeenCalledWith('AC_TOKEN:{user-1}:jti-1');
      expect(redis.del).toHaveBeenCalledWith('RF_TOKEN:{user-1}:jti-1');
      expect(redis.zRem).toHaveBeenCalledWith('SESSIONS:{user-1}', 'jti-1');
    });

    it('revokeAllSessions clears every session and the set key', async () => {
      redis.zRange.mockResolvedValue(['jti-1', 'jti-2']);
      await service.revokeAllSessions('user-1');
      expect(redis.del).toHaveBeenCalledWith('AC_TOKEN:{user-1}:jti-1');
      expect(redis.del).toHaveBeenCalledWith('AC_TOKEN:{user-1}:jti-2');
      expect(redis.del).toHaveBeenCalledWith('SESSIONS:{user-1}');
    });

    it('revokeOtherSessions keeps the current session and drops the rest', async () => {
      redis.zRange.mockResolvedValue(['keep', 'other']);
      await service.revokeOtherSessions('user-1', 'keep');
      expect(redis.del).toHaveBeenCalledWith('AC_TOKEN:{user-1}:other');
      expect(redis.del).not.toHaveBeenCalledWith('AC_TOKEN:{user-1}:keep');
    });
  });
});
