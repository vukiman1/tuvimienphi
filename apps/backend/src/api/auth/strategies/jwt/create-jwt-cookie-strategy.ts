import { JwtPayload } from '@org/backend-jwt';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { CookieName } from '@org/backend-helpers';
import type { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { UserEntity } from '../../../user/entities/user.entity';
import { UserService } from '../../../user/user.service';
import { SessionService } from '../../services/session.service';

function getJwtSecret(configService: ConfigService): string {
  const secret = configService.get<string>('jwt.secret');
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return secret;
}

export function createJwtCookieStrategy(strategyKey: string, cookieName: CookieName) {
  class JwtCookieStrategy extends PassportStrategy(Strategy, strategyKey) {
    constructor(
      public readonly userService: UserService,
      public readonly sessionService: SessionService,
      configService: ConfigService,
    ) {
      super({
        jwtFromRequest: (req: Request) => req?.cookies?.[cookieName] ?? null,
        ignoreExpiration: false,
        secretOrKey: getJwtSecret(configService),
        passReqToCallback: true,
      });
    }

    async validate(req: Request, payload: JwtPayload): Promise<UserEntity> {
      const { id, jti } = payload;
      const accessToken = req?.cookies?.[cookieName] ?? '';
      const isActive = await this.sessionService.isAccessTokenActive(id, jti, accessToken);
      if (!isActive) {
        throw new UnauthorizedException();
      }
      req.sessionJti = jti;
      return this.userService.getOneOrFail({ id });
    }
  }

  return JwtCookieStrategy;
}
