import { JwtService, parseDurationToMs } from '@org/backend-jwt';
import { RedisService } from '@org/backend-redis';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomUUID } from 'crypto';
import { SessionPersistence } from '../enums/session-persistence.enum';
import { UserType } from '../interfaces/auth.interface';

const ACCESS_TOKEN_KEY_PREFIX = 'AC_TOKEN';
const REFRESH_TOKEN_KEY_PREFIX = 'RF_TOKEN';
const SESSION_SET_KEY_PREFIX = 'SESSIONS';
const SESSION_START_KEY_PREFIX = 'SESSION_START';
const MAX_SESSIONS_CONFIG_KEY = 'session.maxSessionsPerUser';
const AUDIENCES: readonly UserType[] = ['user', 'admin'];

interface TtlConfigKeys {
  refreshTtl: string;
  maxLifetime: string;
}

const USER_TTL_CONFIG_KEYS: Record<SessionPersistence, TtlConfigKeys> = {
  [SessionPersistence.STANDARD]: {
    refreshTtl: 'session.refreshTtl',
    maxLifetime: 'session.maxLifetime',
  },
  [SessionPersistence.REMEMBER]: {
    refreshTtl: 'session.refreshTtlRemember',
    maxLifetime: 'session.maxLifetimeRemember',
  },
  [SessionPersistence.OAUTH]: {
    refreshTtl: 'session.refreshTtlOauth',
    maxLifetime: 'session.maxLifetimeOauth',
  },
};

const ADMIN_TTL_CONFIG_KEYS: TtlConfigKeys = {
  refreshTtl: 'session.refreshTtlAdmin',
  maxLifetime: 'session.maxLifetimeAdmin',
};

const MS_PER_SECOND = 1000;

const TRACK_SESSION_SCRIPT = `
redis.call('ZADD', KEYS[1], ARGV[1], ARGV[2])
redis.call('EXPIRE', KEYS[1], ARGV[3])
return 1
`;

const ENFORCE_LIMIT_SCRIPT = `
local excess = redis.call('ZCARD', KEYS[1]) - tonumber(ARGV[1])
if excess <= 0 then return 0 end
local oldest = redis.call('ZRANGE', KEYS[1], 0, excess - 1)
for _, jti in ipairs(oldest) do
  redis.call('DEL', ARGV[2] .. jti)
  redis.call('DEL', ARGV[3] .. jti)
  redis.call('ZREM', KEYS[1], jti)
end
return excess
`;

export interface SessionTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly accessTokenTtlMs: number;
  readonly refreshTokenTtlMs: number;
}

export interface IssuedSession extends SessionTokens {
  readonly jti: string;
}

@Injectable()
export class SessionService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async createSession(
    userId: string,
    audience: UserType,
    persistence: SessionPersistence,
  ): Promise<IssuedSession> {
    const jti = randomUUID();
    const tokens = await this.issueTokens(
      userId,
      jti,
      audience,
      this.resolveRefreshTtlMs(audience, persistence),
    );
    await this.markSessionStart(userId, jti, audience, persistence);
    await this.enforceSessionLimit(userId, audience);
    return { jti, ...tokens };
  }

  async rotateSession(
    userId: string,
    jti: string,
    audience: UserType,
    persistence: SessionPersistence,
  ): Promise<SessionTokens> {
    await this.assertWithinMaxLifetime(userId, jti, audience, persistence);
    const storedRefreshToken = await this.redisService.get(this.refreshTokenKey(userId, jti));
    if (!storedRefreshToken) {
      throw new UnauthorizedException();
    }
    await this.jwtService.verifyJwt(storedRefreshToken);
    return this.issueTokens(userId, jti, audience, this.resolveRefreshTtlMs(audience, persistence));
  }

  async isAccessTokenActive(userId: string, jti: string, accessToken: string): Promise<boolean> {
    const storedHash = await this.redisService.get(this.accessTokenKey(userId, jti));
    return Boolean(storedHash) && storedHash === hashToken(accessToken);
  }

  async revokeSession(userId: string, jti: string): Promise<void> {
    await Promise.all([
      this.redisService.del(this.accessTokenKey(userId, jti)),
      this.redisService.del(this.refreshTokenKey(userId, jti)),
      ...this.sessionSetKeys(userId).map((key) => this.redisService.zRem(key, jti)),
    ]);
  }

  async revokeAllSessions(userId: string): Promise<void> {
    const setKeys = this.sessionSetKeys(userId);
    const jtis = await this.listTrackedJtis(setKeys);
    await Promise.all(
      jtis.flatMap((jti) => [
        this.redisService.del(this.accessTokenKey(userId, jti)),
        this.redisService.del(this.refreshTokenKey(userId, jti)),
      ]),
    );
    await Promise.all(setKeys.map((key) => this.redisService.del(key)));
  }

  async revokeOtherSessions(userId: string, keepJti: string): Promise<void> {
    const setKeys = this.sessionSetKeys(userId);
    const others = (await this.listTrackedJtis(setKeys)).filter((jti) => jti !== keepJti);
    if (others.length === 0) {
      return;
    }
    await Promise.all(
      others.flatMap((jti) => [
        this.redisService.del(this.accessTokenKey(userId, jti)),
        this.redisService.del(this.refreshTokenKey(userId, jti)),
        ...setKeys.map((key) => this.redisService.zRem(key, jti)),
      ]),
    );
  }

  private async listTrackedJtis(setKeys: readonly string[]): Promise<string[]> {
    const perSet = await Promise.all(setKeys.map((key) => this.redisService.zRange(key, 0, -1)));
    return perSet.flat();
  }

  private async issueTokens(
    userId: string,
    jti: string,
    audience: UserType,
    refreshTokenTtlMs: number,
  ): Promise<SessionTokens> {
    const payload = { id: userId, jti, aud: audience };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signJwt(payload),
      this.jwtService.signJwt(payload, refreshTokenTtlMs),
    ]);
    const accessTokenTtlMs = this.jwtService.getAccessTokenExpiryMs();

    await Promise.all([
      // Access token is stored hashed: it's only ever compared (allowlist), never read back.
      this.redisService.set({
        key: this.accessTokenKey(userId, jti),
        value: hashToken(accessToken),
        expired: toSeconds(accessTokenTtlMs),
      }),
      // Refresh token is stored whole: rotateSession reads it back to verify the signature.
      this.redisService.set({
        key: this.refreshTokenKey(userId, jti),
        value: refreshToken,
        expired: toSeconds(refreshTokenTtlMs),
      }),
    ]);
    await this.trackSession(userId, jti, audience, refreshTokenTtlMs);

    return { accessToken, refreshToken, accessTokenTtlMs, refreshTokenTtlMs };
  }

  private resolveRefreshTtlMs(audience: UserType, persistence: SessionPersistence): number {
    const key = ttlConfigKeys(audience, persistence).refreshTtl;
    return parseDurationToMs(this.configService.get<string>(key) ?? '');
  }

  private resolveMaxLifetimeMs(audience: UserType, persistence: SessionPersistence): number | null {
    const value = this.configService.get<string>(ttlConfigKeys(audience, persistence).maxLifetime);
    return value ? parseDurationToMs(value) : null;
  }

  private async markSessionStart(
    userId: string,
    jti: string,
    audience: UserType,
    persistence: SessionPersistence,
  ): Promise<void> {
    const maxLifetimeMs = this.resolveMaxLifetimeMs(audience, persistence);
    if (maxLifetimeMs === null) {
      return;
    }
    await this.redisService.set({
      key: this.sessionStartKey(userId, jti),
      value: String(Date.now()),
      expired: toSeconds(maxLifetimeMs),
    });
  }

  private async assertWithinMaxLifetime(
    userId: string,
    jti: string,
    audience: UserType,
    persistence: SessionPersistence,
  ): Promise<void> {
    if (this.resolveMaxLifetimeMs(audience, persistence) === null) {
      return;
    }
    const startedAt = await this.redisService.get(this.sessionStartKey(userId, jti));
    if (!startedAt) {
      throw new UnauthorizedException();
    }
  }

  private trackSession(
    userId: string,
    jti: string,
    audience: UserType,
    refreshTokenTtlMs: number,
  ): Promise<number> {
    return this.redisService.eval(
      TRACK_SESSION_SCRIPT,
      1,
      this.sessionSetKey(userId, audience),
      Date.now(),
      jti,
      toSeconds(refreshTokenTtlMs),
    );
  }

  private async enforceSessionLimit(userId: string, audience: UserType): Promise<void> {
    const maxSessions = this.configService.get<number>(MAX_SESSIONS_CONFIG_KEY) ?? 0;
    if (maxSessions <= 0) {
      return;
    }
    await this.redisService.eval(
      ENFORCE_LIMIT_SCRIPT,
      1,
      this.sessionSetKey(userId, audience),
      maxSessions,
      this.accessTokenKeyPrefix(userId),
      this.refreshTokenKeyPrefix(userId),
    );
  }

  private accessTokenKey(userId: string, jti: string): string {
    return this.accessTokenKeyPrefix(userId) + jti;
  }

  private refreshTokenKey(userId: string, jti: string): string {
    return this.refreshTokenKeyPrefix(userId) + jti;
  }

  // `{userId}` hash-tag keeps every key of a user in the same Redis Cluster slot,
  // so the multi-key Lua scripts don't fail with CROSSSLOT.
  private accessTokenKeyPrefix(userId: string): string {
    return `${ACCESS_TOKEN_KEY_PREFIX}:{${userId}}:`;
  }

  private refreshTokenKeyPrefix(userId: string): string {
    return `${REFRESH_TOKEN_KEY_PREFIX}:{${userId}}:`;
  }

  private sessionSetKeys(userId: string): string[] {
    return AUDIENCES.map((audience) => this.sessionSetKey(userId, audience));
  }

  private sessionSetKey(userId: string, audience: UserType): string {
    return audience === 'admin'
      ? `${SESSION_SET_KEY_PREFIX}:admin:{${userId}}`
      : `${SESSION_SET_KEY_PREFIX}:{${userId}}`;
  }

  private sessionStartKey(userId: string, jti: string): string {
    return `${SESSION_START_KEY_PREFIX}:{${userId}}:${jti}`;
  }
}

function ttlConfigKeys(audience: UserType, persistence: SessionPersistence): TtlConfigKeys {
  return audience === 'admin' ? ADMIN_TTL_CONFIG_KEYS : USER_TTL_CONFIG_KEYS[persistence];
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function toSeconds(milliseconds: number): number {
  return Math.floor(milliseconds / MS_PER_SECOND);
}
