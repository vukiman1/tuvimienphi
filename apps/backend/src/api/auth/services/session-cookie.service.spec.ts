import { UnauthorizedException } from '@nestjs/common';
import { CryptoService } from '@org/backend-crypto';
import type { Request, Response } from 'express';
import { SessionCookieService } from './session-cookie.service';
import { SessionPersistence } from '../enums/session-persistence.enum';

const TOKENS = {
  accessToken: 'access-jwt',
  accessTokenTtlMs: 900_000,
  refreshTokenTtlMs: 86_400_000,
};

interface ResponseSpy extends Response {
  cookie: jest.Mock;
  clearCookie: jest.Mock;
}

function fakeCrypto(): CryptoService {
  return {
    encryptData: (data: string) => `enc(${data})`,
    decryptData: (token: string) => token.slice(4, -1),
  } as unknown as CryptoService;
}

function responseSpy(): ResponseSpy {
  return { cookie: jest.fn(), clearCookie: jest.fn() } as unknown as ResponseSpy;
}

function requestWith(cookies: Record<string, string>): Request {
  return { cookies } as unknown as Request;
}

describe('SessionCookieService', () => {
  let service: SessionCookieService;

  beforeEach(() => {
    service = new SessionCookieService(fakeCrypto());
  });

  function issueFor(audience: 'user' | 'admin'): string {
    const response = responseSpy();
    service.issue(
      response,
      { id: 'user-1', jti: 'jti-1', persistence: SessionPersistence.STANDARD, audience },
      TOKENS,
    );
    const [, encoded] = response.cookie.mock.calls[0] as [string, string];
    return encoded;
  }

  it('issues the admin pair without touching the public site cookies', () => {
    const response = responseSpy();

    service.issue(
      response,
      {
        id: 'user-1',
        jti: 'jti-1',
        persistence: SessionPersistence.STANDARD,
        audience: 'admin',
      },
      TOKENS,
    );

    const names = response.cookie.mock.calls.map(([name]) => name as string);
    expect(names).toEqual(['admin_sub', 'admin_access_token']);
  });

  it('reads back the session it issued for that audience', () => {
    const encoded = issueFor('user');

    expect(service.read(requestWith({ sub: encoded }), 'user')).toEqual(
      expect.objectContaining({ id: 'user-1', jti: 'jti-1', audience: 'user' }),
    );
  });

  it('refuses a session cookie moved into the other audience slot', () => {
    const encoded = issueFor('user');

    expect(() => service.read(requestWith({ admin_sub: encoded }), 'admin')).toThrow(
      UnauthorizedException,
    );
  });

  it('treats a cookie issued before audiences existed as a public site session', () => {
    const legacy = `enc(${JSON.stringify({
      id: 'user-1',
      jti: 'jti-1',
      persistence: SessionPersistence.STANDARD,
    })})`;

    expect(service.read(requestWith({ sub: legacy }), 'user').audience).toBe('user');
  });

  it('never lets a cookie from before audiences existed pass as an admin session', () => {
    const legacy = `enc(${JSON.stringify({
      id: 'user-1',
      jti: 'jti-1',
      persistence: SessionPersistence.STANDARD,
    })})`;

    expect(() => service.read(requestWith({ admin_sub: legacy }), 'admin')).toThrow(
      UnauthorizedException,
    );
  });
});
