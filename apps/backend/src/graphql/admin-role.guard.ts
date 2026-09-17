import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Roles } from '@org/backend-enum';

const ADMIN_ROLES = new Set<Roles>([Roles.ADMIN, Roles.SUPER_ADMIN]);

@Injectable()
export class AdminRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = GqlExecutionContext.create(context).getContext().req;
    const role = req?.user?.role as Roles | undefined;
    if (!role || !ADMIN_ROLES.has(role)) {
      throw new ForbiddenException('Admin access required');
    }
    return true;
  }
}
