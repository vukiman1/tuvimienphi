import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MetadataKey } from '@org/backend-constants';
import { Roles } from '@org/backend-enum';

interface RequestWithUser {
  user?: { role?: Roles };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedRoles = this.reflector.getAllAndOverride<Roles[] | undefined>(MetadataKey.ROLE, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!allowedRoles?.length) {
      throw new ForbiddenException();
    }

    const { user } = context.switchToHttp().getRequest<RequestWithUser>();
    if (!user?.role || !allowedRoles.includes(user.role)) {
      throw new ForbiddenException();
    }
    return true;
  }
}
