import { ExecutionContext, Type } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { requestFromContext, responseFromContext } from '../../../transport/transport-context';

export function GqlAuthGuard(
  strategy: string,
): Type<{ canActivate(context: ExecutionContext): unknown }> {
  class GqlStrategyGuard extends AuthGuard(strategy) {
    override getRequest(context: ExecutionContext): Request | undefined {
      return requestFromContext(context);
    }

    getResponse(context: ExecutionContext): Response | undefined {
      return responseFromContext(context);
    }
  }
  return GqlStrategyGuard;
}
