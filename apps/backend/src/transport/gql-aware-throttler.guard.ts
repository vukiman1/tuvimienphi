import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { isHttpContext } from '@org/backend-helpers';
import { ThrottlerGuard } from '@nestjs/throttler';

interface RequestResponse {
  req: Record<string, unknown>;
  res: Record<string, unknown>;
}

@Injectable()
export class GqlAwareThrottlerGuard extends ThrottlerGuard {
  protected override getRequestResponse(context: ExecutionContext): RequestResponse {
    if (isHttpContext(context)) {
      return super.getRequestResponse(context);
    }
    const { req, res } = GqlExecutionContext.create(context).getContext<RequestResponse>();
    return { req, res };
  }
}
