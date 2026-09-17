import { type ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { StrategyKey } from '@org/backend-constants';

@Injectable()
export class GqlAuthGuard extends AuthGuard(StrategyKey.JWT.USER) {
  getRequest(context: ExecutionContext) {
    return GqlExecutionContext.create(context).getContext().req;
  }
}
