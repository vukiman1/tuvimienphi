import { StrategyKey } from '@org/backend-constants';
import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthBaseController } from './auth.base.controller';
import { UserEntity } from '../../user/entities/user.entity';
import { GoogleOneTapDto } from '../dto/google-one-tap.dto';
import { VerifyTwoFactorDto } from '../dto/two-factor.dto';

const STRICT_THROTTLE = { default: { limit: 5, ttl: 60_000 } };

@ApiTags('Auth API For Admin')
@Controller('/admin/auth')
export class AuthAdminController extends AuthBaseController<UserEntity>(
  'admin',
  StrategyKey.LOCAL.USER,
) {
  constructor(public readonly authService: AuthService) {
    super(authService);
  }

  @Post('google/one-tap')
  @HttpCode(200)
  @Throttle(STRICT_THROTTLE)
  async googleOneTap(
    @Body() body: GoogleOneTapDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.loginWithGoogle(body.credential, response, request, 'admin');
  }

  @Post('2fa/verify')
  @HttpCode(200)
  @Throttle(STRICT_THROTTLE)
  async verifyTwoFactor(
    @Body() body: VerifyTwoFactorDto,
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    return this.authService.verifyTwoFactor(
      body.challengeToken,
      body.code,
      response,
      request,
      'admin',
    );
  }
}
