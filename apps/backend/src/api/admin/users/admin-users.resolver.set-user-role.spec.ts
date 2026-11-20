import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '@org/backend-enum';
import type { ActivityLogService } from '../../activity/activity-log.service';
import { RolesGuard } from '../../auth/guards/roles.guard';
import type { ChapterCreditsService } from '../../credits/chapter-credits.service';
import type { DailyQuotaService } from '../../credits/daily-quota.service';
import type { UserEntity } from '../../user/entities/user.entity';
import type { AdminUserSummary } from './admin-user.mapper';
import { AdminUsersResolver } from './admin-users.resolver';
import type { AdminUsersService } from './admin-users.service';
import {
  OwnRoleChangeError,
  RoleChangeUserNotFoundError,
  RoleNotAssignableError,
  SuperAdminRoleLockedError,
} from './user-role.errors';
import type { UserRoleService } from './user-role.service';

const TARGET_ID = '2f4c1a52-6a59-4d7e-9a0e-0d3c5b8f7a11';
const SUPER_ADMIN = {
  id: '9b1f0c4e-2d7a-4c1e-8f3a-6e5d4c3b2a10',
  email: 'owner@tuvimienphi.vn',
  role: Roles.SUPER_ADMIN,
} as UserEntity;
const PROMOTED_ROW = {
  id: TARGET_ID,
  email: 'an@example.com',
  role: Roles.ADMIN,
} as AdminUserSummary;

interface Harness {
  readonly resolver: AdminUsersResolver;
  readonly change: jest.Mock;
}

function harness(change: jest.Mock, summary: AdminUserSummary | null = PROMOTED_ROW): Harness {
  const resolver = new AdminUsersResolver(
    { findSummary: jest.fn().mockResolvedValue(summary) } as unknown as AdminUsersService,
    {} as ChapterCreditsService,
    {
      usedBy: jest.fn().mockResolvedValue(new Map([[TARGET_ID, 1]])),
    } as unknown as DailyQuotaService,
    {} as ActivityLogService,
    { change } as unknown as UserRoleService,
  );
  return { resolver, change };
}

function resolverCallBy(role: Roles): ExecutionContext {
  const args = [undefined, {}, { req: { user: { role } } }, {}];
  return {
    getType: () => 'graphql',
    getArgs: () => args,
    getArgByIndex: (index: number) => args[index],
    getClass: () => AdminUsersResolver,
    getHandler: () => AdminUsersResolver.prototype.setUserRole,
  } as unknown as ExecutionContext;
}

describe('AdminUsersResolver.setUserRole', () => {
  it('changes the role as the signed-in super admin and returns the refreshed row', async () => {
    const { resolver, change } = harness(jest.fn().mockResolvedValue(undefined));

    const row = await resolver.setUserRole({ userId: TARGET_ID, role: Roles.ADMIN }, SUPER_ADMIN);

    expect(change).toHaveBeenCalledWith({
      actor: { id: SUPER_ADMIN.id, email: SUPER_ADMIN.email },
      userId: TARGET_ID,
      role: Roles.ADMIN,
    });
    expect(row).toEqual({ ...PROMOTED_ROW, dailyChapterUsed: 1 });
  });

  it.each([
    [new OwnRoleChangeError(SUPER_ADMIN.id), 'Bạn không thể tự đổi quyền của chính mình.'],
    [new SuperAdminRoleLockedError(TARGET_ID), 'Không thể đổi quyền của quản trị viên cấp cao.'],
    [
      new RoleNotAssignableError(Roles.SELLER),
      'Chỉ có thể đặt quyền Người dùng hoặc Quản trị viên.',
    ],
  ])('explains a refused change (%s)', async (refusal, message) => {
    const { resolver } = harness(jest.fn().mockRejectedValue(refusal));

    await expect(
      resolver.setUserRole({ userId: TARGET_ID, role: Roles.ADMIN }, SUPER_ADMIN),
    ).rejects.toThrow(new BadRequestException(message));
  });

  it('turns an unknown user into a not-found error', async () => {
    const { resolver } = harness(
      jest.fn().mockRejectedValue(new RoleChangeUserNotFoundError(TARGET_ID)),
    );

    await expect(
      resolver.setUserRole({ userId: TARGET_ID, role: Roles.ADMIN }, SUPER_ADMIN),
    ).rejects.toThrow(new NotFoundException('Không tìm thấy người dùng.'));
  });

  it('reports a user that vanished before the refreshed row could be read', async () => {
    const { resolver } = harness(jest.fn().mockResolvedValue(undefined), null);

    await expect(
      resolver.setUserRole({ userId: TARGET_ID, role: Roles.ADMIN }, SUPER_ADMIN),
    ).rejects.toThrow(new NotFoundException('Không tìm thấy người dùng.'));
  });

  it('lets unexpected failures through untouched', async () => {
    const failure = new Error('db down');
    const { resolver } = harness(jest.fn().mockRejectedValue(failure));

    await expect(
      resolver.setUserRole({ userId: TARGET_ID, role: Roles.ADMIN }, SUPER_ADMIN),
    ).rejects.toBe(failure);
  });

  it('is closed to an admin who is not a super admin', () => {
    const guard = new RolesGuard(new Reflector());

    expect(() => guard.canActivate(resolverCallBy(Roles.ADMIN))).toThrow(ForbiddenException);
  });

  it('is open to a super admin', () => {
    const guard = new RolesGuard(new Reflector());

    expect(guard.canActivate(resolverCallBy(Roles.SUPER_ADMIN))).toBe(true);
  });
});
