import { type ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { StrategyKey } from '@org/backend-constants';
import { DEV_ADMIN_USER, isAdminDevBypass } from './admin-dev-bypass';

@Injectable()
export class GqlAuthGuard extends AuthGuard(StrategyKey.JWT.USER) {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (isAdminDevBypass()) {
      const req = this.getRequest(context);
      if (!req.user) {
        req.user = DEV_ADMIN_USER;
      }
      return true;
    }
    return (await super.canActivate(context)) as boolean;
  }

  getRequest(context: ExecutionContext) {
    return GqlExecutionContext.create(context).getContext().req;
  }
}
