import { Injectable } from '@nestjs/common';
import { AuthProvider } from '@org/backend-enum';
import { RedisService } from '@org/backend-redis';
import { randomBytes } from 'crypto';
import { SessionPersistence } from '../enums/session-persistence.enum';

const CHALLENGE_KEY_PREFIX = '2FA_CHALLENGE';
const TOKEN_BYTES = 32;
const TTL_SECONDS = 300;

// Six digits is a million guesses — brute-forceable inside the five minute window if unbounded.
const MAX_ATTEMPTS = 5;

export interface ChallengeSession {
  readonly rememberMe: boolean;
  readonly persistence: SessionPersistence;
  readonly authProvider: AuthProvider;
}

export interface ChallengeClaim extends ChallengeSession {
  readonly userId: string;
}

interface ChallengePayload extends ChallengeClaim {
  readonly attempts: number;
}

function isChallengePayload(value: unknown): value is ChallengePayload {
  if (typeof value !== 'object' || value === null) return false;
  const payload = value as Record<string, unknown>;
  return (
    typeof payload.userId === 'string' &&
    typeof payload.rememberMe === 'boolean' &&
    typeof payload.attempts === 'number' &&
    Object.values<unknown>(SessionPersistence).includes(payload.persistence) &&
    Object.values<unknown>(AuthProvider).includes(payload.authProvider)
  );
}

@Injectable()
export class TwoFactorChallengeService {
  constructor(private readonly redisService: RedisService) {}

  /** Grants exactly one right: to try a second-factor code. It is not a session. */
  async issue(userId: string, session: ChallengeSession): Promise<string> {
    const token = randomBytes(TOKEN_BYTES).toString('hex');
    await this.write(token, { userId, ...session, attempts: 0 });
    return token;
  }

  async peek(token: string): Promise<ChallengeClaim | null> {
    const payload = await this.read(token);
    if (!payload) return null;
    const { userId, rememberMe, persistence, authProvider } = payload;
    return { userId, rememberMe, persistence, authProvider };
  }

  /** Returns false once the challenge has been spent and destroyed. */
  async recordFailure(token: string): Promise<boolean> {
    const payload = await this.read(token);
    if (!payload) {
      return false;
    }

    const attempts = payload.attempts + 1;
    if (attempts >= MAX_ATTEMPTS) {
      await this.consume(token);
      return false;
    }

    await this.write(token, { ...payload, attempts });
    return true;
  }

  async consume(token: string): Promise<void> {
    await this.redisService.del(this.key(token));
  }

  private async read(token: string): Promise<ChallengePayload | null> {
    const raw = await this.redisService.get(this.key(token));
    if (!raw) {
      return null;
    }
    try {
      const parsed: unknown = JSON.parse(raw);
      return isChallengePayload(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  private async write(token: string, payload: ChallengePayload): Promise<void> {
    await this.redisService.set({
      key: this.key(token),
      value: JSON.stringify(payload),
      expired: TTL_SECONDS,
    });
  }

  private key(token: string): string {
    return `${CHALLENGE_KEY_PREFIX}:${token}`;
  }
}
