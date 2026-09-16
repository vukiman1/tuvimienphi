import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '@org/backend-enum';
import { RolesGuard } from './roles.guard';
import { RequireRoles } from '../decorators/require-roles.decorator';

function contextFor(user: unknown): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => () => undefined,
    getClass: () => class {},
  } as unknown as ExecutionContext;
}

function guardRequiring(roles: Roles[] | undefined): RolesGuard {
  const reflector = {
    getAllAndOverride: jest.fn().mockReturnValue(roles),
  } as unknown as Reflector;
  return new RolesGuard(reflector);
}

describe('RolesGuard', () => {
  it('lets a user through when their role is one of the required ones', () => {
    const guard = guardRequiring([Roles.SUPER_ADMIN, Roles.ADMIN]);

    expect(guard.canActivate(contextFor({ role: Roles.ADMIN }))).toBe(true);
  });

  it('refuses a signed-in user whose role is not required', () => {
    const guard = guardRequiring([Roles.SUPER_ADMIN, Roles.ADMIN]);

    expect(() => guard.canActivate(contextFor({ role: Roles.USER }))).toThrow(ForbiddenException);
  });

  it('refuses when nobody is authenticated', () => {
    const guard = guardRequiring([Roles.ADMIN]);

    expect(() => guard.canActivate(contextFor(undefined))).toThrow(ForbiddenException);
  });

  it('refuses a route that forgot to declare its roles, so the mistake fails closed', () => {
    const guard = guardRequiring(undefined);

    expect(() => guard.canActivate(contextFor({ role: Roles.SUPER_ADMIN }))).toThrow(
      ForbiddenException,
    );
  });

  it('reads the roles that @RequireRoles put on the controller', () => {
    @RequireRoles(Roles.SUPER_ADMIN, Roles.ADMIN)
    class ConsoleController {}

    const guard = new RolesGuard(new Reflector());
    const context = {
      switchToHttp: () => ({ getRequest: () => ({ user: { role: Roles.ADMIN } }) }),
      getHandler: () => () => undefined,
      getClass: () => ConsoleController,
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });
});
