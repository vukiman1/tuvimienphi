import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Roles } from '@org/backend-enum';
import type { Request } from 'express';
import { UserService } from '../../../user/user.service';
import { SessionService } from '../../services/session.service';
import { JwtAdminStrategy } from './admin.jwt.strategy';

describe('JwtAdminStrategy', () => {
  let userService: jest.Mocked<UserService>;
  let sessionService: jest.Mocked<SessionService>;
  let strategy: JwtAdminStrategy;

  beforeEach(() => {
    userService = {
      getOneOrFail: jest.fn().mockResolvedValue({ id: 'user-1', role: Roles.ADMIN }),
    } as unknown as jest.Mocked<UserService>;
    sessionService = {
      isAccessTokenActive: jest.fn().mockResolvedValue(true),
    } as unknown as jest.Mocked<SessionService>;
    const config = { get: jest.fn().mockReturnValue('test-secret') } as unknown as ConfigService;
    strategy = new JwtAdminStrategy(userService, sessionService, config);
  });

  function requestWith(cookies: Record<string, string>): Request & { sessionJti?: string } {
    return { cookies } as unknown as Request & { sessionJti?: string };
  }

  it('checks the console access token against the allowlist', async () => {
    const request = requestWith({ admin_access_token: 'console-token' });

    const user = await strategy.validate(request, { id: 'user-1', jti: 'jti-1' });

    expect(sessionService.isAccessTokenActive).toHaveBeenCalledWith(
      'user-1',
      'jti-1',
      'console-token',
    );
    expect(request.sessionJti).toBe('jti-1');
    expect(user).toEqual({ id: 'user-1', role: Roles.ADMIN });
  });

  it('never falls back to the public site cookie', async () => {
    const request = requestWith({ access_token: 'public-token' });

    await strategy.validate(request, { id: 'user-1', jti: 'jti-1' }).catch(() => undefined);

    expect(sessionService.isAccessTokenActive).toHaveBeenCalledWith('user-1', 'jti-1', '');
  });

  it('refuses a console session whose account is no longer an admin', async () => {
    userService.getOneOrFail.mockResolvedValue({ id: 'user-1', role: Roles.USER } as never);

    await expect(
      strategy.validate(requestWith({ admin_access_token: 'console-token' }), {
        id: 'user-1',
        jti: 'jti-1',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('lets a super admin through', async () => {
    userService.getOneOrFail.mockResolvedValue({ id: 'user-1', role: Roles.SUPER_ADMIN } as never);

    const user = await strategy.validate(requestWith({ admin_access_token: 'console-token' }), {
      id: 'user-1',
      jti: 'jti-1',
    });

    expect(user).toEqual({ id: 'user-1', role: Roles.SUPER_ADMIN });
  });
});
