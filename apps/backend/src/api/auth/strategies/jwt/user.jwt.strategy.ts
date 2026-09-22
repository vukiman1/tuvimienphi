import { StrategyKey } from '@org/backend-constants';
import { CookieName } from '@org/backend-helpers';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../../user/user.service';
import { SessionService } from '../../services/session.service';
import { createJwtCookieStrategy } from './create-jwt-cookie-strategy';

@Injectable()
export class JwtUserStrategy extends createJwtCookieStrategy(
  StrategyKey.JWT.USER,
  CookieName.ACCESS_TOKEN,
  'user',
) {
  constructor(
    userService: UserService,
    sessionService: SessionService,
    configService: ConfigService,
  ) {
    super(userService, sessionService, configService);
  }
}
