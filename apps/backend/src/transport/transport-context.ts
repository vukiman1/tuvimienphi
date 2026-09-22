import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { isHttpContext } from '@org/backend-helpers';
import type { Request, Response } from 'express';

interface GqlTransport {
  req?: Request;
  res?: Response;
}

function gqlTransportOf(context: ExecutionContext): GqlTransport {
  return GqlExecutionContext.create(context).getContext<GqlTransport>() ?? {};
}

export function requestFromContext(context: ExecutionContext): Request | undefined {
  return isHttpContext(context)
    ? context.switchToHttp().getRequest<Request>()
    : gqlTransportOf(context).req;
}

export function responseFromContext(context: ExecutionContext): Response | undefined {
  return isHttpContext(context)
    ? context.switchToHttp().getResponse<Response>()
    : gqlTransportOf(context).res;
}
