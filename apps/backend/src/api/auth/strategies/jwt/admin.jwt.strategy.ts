import { StrategyKey } from '@org/backend-constants';
import { JwtPayload } from '@org/backend-jwt';
import { CookieName } from '@org/backend-helpers';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { UserEntity } from '../../../user/entities/user.entity';
import { UserService } from '../../../user/user.service';
import { SessionService } from '../../services/session.service';
import { isConsoleRole } from '../../console-roles';
import { createJwtCookieStrategy } from './create-jwt-cookie-strategy';

@Injectable()
export class JwtAdminStrategy extends createJwtCookieStrategy(
  StrategyKey.JWT.ADMIN,
  CookieName.ADMIN_ACCESS_TOKEN,
) {
  constructor(
    userService: UserService,
    sessionService: SessionService,
    configService: ConfigService,
  ) {
    super(userService, sessionService, configService);
  }

  override async validate(req: Request, payload: JwtPayload): Promise<UserEntity> {
    const user = await super.validate(req, payload);
    if (!isConsoleRole(user.role)) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
