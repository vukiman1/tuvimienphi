import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { CryptoService } from '@org/backend-crypto';
import { clearCookie, CookieName, setCookie } from '@org/backend-helpers';
import { SessionPersistence } from '../enums/session-persistence.enum';
import { UserType } from '../interfaces/auth.interface';

export interface SessionCookiePayload {
  id: string;
  jti: string;
  persistence: SessionPersistence;
  audience: UserType;
}

interface AudienceCookies {
  accessToken: CookieName;
  session: CookieName;
}

interface IssuedTokens {
  accessToken: string;
  accessTokenTtlMs: number;
  refreshTokenTtlMs: number;
}

const COOKIES_BY_AUDIENCE: Record<UserType, AudienceCookies> = {
  user: { accessToken: CookieName.ACCESS_TOKEN, session: CookieName.SESSION },
  admin: { accessToken: CookieName.ADMIN_ACCESS_TOKEN, session: CookieName.ADMIN_SESSION },
};

@Injectable()
export class SessionCookieService {
  constructor(private readonly cryptoService: CryptoService) {}

  issue(response: Response, payload: SessionCookiePayload, tokens: IssuedTokens): void {
    const cookies = COOKIES_BY_AUDIENCE[payload.audience];
    setCookie(response, cookies.session, this.encode(payload), {
      maxAge: tokens.refreshTokenTtlMs,
    });
    setCookie(response, cookies.accessToken, tokens.accessToken, {
      maxAge: tokens.accessTokenTtlMs,
    });
  }

  clear(response: Response, audience: UserType): void {
    const cookies = COOKIES_BY_AUDIENCE[audience];
    clearCookie(response, cookies.accessToken);
    clearCookie(response, cookies.session);
  }

  read(request: Request, audience: UserType): SessionCookiePayload {
    const payload = this.decodeFrom(request, audience);
    if (!payload) {
      throw new UnauthorizedException();
    }
    return payload;
  }

  hasSession(request: Request, audience: UserType): boolean {
    return this.decodeFrom(request, audience) !== null;
  }

  private decodeFrom(request: Request, audience: UserType): SessionCookiePayload | null {
    const raw = request.cookies?.[COOKIES_BY_AUDIENCE[audience].session];
    const payload = raw ? this.decode(raw) : null;
    return payload?.audience === audience ? payload : null;
  }

  private encode(payload: SessionCookiePayload): string {
    return this.cryptoService.encryptData(JSON.stringify(payload));
  }

  private decode(raw: string): SessionCookiePayload | null {
    try {
      const parsed: unknown = JSON.parse(this.cryptoService.decryptData(raw));
      if (typeof parsed !== 'object' || parsed === null) {
        return null;
      }
      const record = parsed as Record<string, unknown>;
      if (typeof record.id !== 'string' || typeof record.jti !== 'string') {
        return null;
      }
      return {
        id: record.id,
        jti: record.jti,
        persistence: coercePersistence(record),
        audience: coerceAudience(record),
      };
    } catch {
      return null;
    }
  }
}

function coercePersistence(record: Record<string, unknown>): SessionPersistence {
  const value = record.persistence;
  if (
    value === SessionPersistence.STANDARD ||
    value === SessionPersistence.REMEMBER ||
    value === SessionPersistence.OAUTH
  ) {
    return value;
  }
  // Legacy cookies stored `remember: boolean`; map it onto the persistence policy.
  return record.remember === true ? SessionPersistence.REMEMBER : SessionPersistence.STANDARD;
}

function coerceAudience(record: Record<string, unknown>): UserType {
  return record.audience === 'admin' ? 'admin' : 'user';
}
