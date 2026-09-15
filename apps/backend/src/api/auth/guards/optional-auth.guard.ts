import {
  type CanActivate,
  type ExecutionContext,
  type Type,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export function OptionalAuthGuard(strategy: string): Type<CanActivate> {
  class OptionalGuard extends AuthGuard(strategy) {
    async canActivate(context: ExecutionContext): Promise<boolean> {
      try {
        await super.canActivate(context);
      } catch (error) {
        if (!(error instanceof UnauthorizedException)) {
          throw error;
        }
      }
      return true;
    }
  }
  return OptionalGuard;
}
