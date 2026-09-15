import {
  type ExecutionContext,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { OptionalAuthGuard } from './optional-auth.guard';

const STRATEGY = 'optional-auth-guard-spec';
const SECRET = 'optional-auth-guard-spec-secret-32ch';
const TOKEN_HEADER = 'x-test-token';

interface TestTokenPayload {
  sub: string;
  outage?: boolean;
}

class HeaderJwtStrategy extends PassportStrategy(Strategy, STRATEGY) {
  constructor() {
    super({
      jwtFromRequest: (request: Request) => request.header(TOKEN_HEADER) ?? null,
      secretOrKey: SECRET,
    });
  }

  validate(payload: TestTokenPayload): { id: string } {
    if (payload.outage) {
      throw new ServiceUnavailableException();
    }
    return { id: payload.sub };
  }
}

type RequestWithUser = Request & { user?: unknown };

function requestWithToken(token?: string): RequestWithUser {
  const headers: Record<string, string> = token ? { [TOKEN_HEADER]: token } : {};
  return { headers, header: (name: string) => headers[name.toLowerCase()] } as RequestWithUser;
}

function httpContext(request: RequestWithUser): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => request, getResponse: () => ({}) }),
  } as unknown as ExecutionContext;
}

describe('OptionalAuthGuard', () => {
  const jwt = new JwtService({ secret: SECRET });
  const guard = new (OptionalAuthGuard(STRATEGY))();

  beforeAll(() => {
    new HeaderJwtStrategy();
  });

  it('lets a visitor without a token through with no user attached', async () => {
    const request = requestWithToken();

    await expect(guard.canActivate(httpContext(request))).resolves.toBe(true);
    expect(request.user).toBeUndefined();
  });

  it('lets a visitor with an invalid token through as anonymous', async () => {
    const request = requestWithToken('not-a-jwt');

    await expect(guard.canActivate(httpContext(request))).resolves.toBe(true);
    expect(request.user).toBeUndefined();
  });

  it('attaches the user when the token is valid', async () => {
    const request = requestWithToken(jwt.sign({ sub: 'user-1' }));

    await expect(guard.canActivate(httpContext(request))).resolves.toBe(true);
    expect(request.user).toEqual({ id: 'user-1' });
  });

  it('still fails when the check breaks for a reason other than bad credentials', async () => {
    const request = requestWithToken(jwt.sign({ sub: 'user-1', outage: true }));

    await expect(guard.canActivate(httpContext(request))).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    await expect(guard.canActivate(httpContext(request))).rejects.not.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
