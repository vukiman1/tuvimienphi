import { createHash, timingSafeEqual } from 'node:crypto';
import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

const AUTHORIZATION_SCHEME = 'Apikey';

const digest = (value: string): Buffer => createHash('sha256').update(value).digest();

@Injectable()
export class SepayApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const configuredKey = this.configService.getOrThrow<string>('payment.sepayWebhookApiKey');
    const authorization = context.switchToHttp().getRequest<Request>().headers.authorization;
    if (!configuredKey || !authorization) throw new UnauthorizedException();

    const isMatch = timingSafeEqual(
      digest(authorization),
      digest(`${AUTHORIZATION_SCHEME} ${configuredKey}`),
    );
    if (!isMatch) throw new UnauthorizedException();
    return true;
  }
}
