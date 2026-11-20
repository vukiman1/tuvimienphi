import { Roles } from '@org/backend-enum';
import type { DataSource, EntityManager } from 'typeorm';
import type { ActivityLogService } from '../../activity/activity-log.service';
import { SessionRevokeReason } from '../../auth/enums/session-revoke-reason.enum';
import type { SessionRevocationService } from '../../auth/services/session-revocation.service';
import { UserEntity } from '../../user/entities/user.entity';
import { UserRoleEvent } from './user-role-event';
import {
  OwnRoleChangeError,
  RoleChangeUserNotFoundError,
  RoleNotAssignableError,
  SuperAdminRoleLockedError,
} from './user-role.errors';
import { UserRoleService } from './user-role.service';

const ACTOR = { id: '9b1f0c4e-2d7a-4c1e-8f3a-6e5d4c3b2a10', email: 'owner@tuvimienphi.vn' };
const TARGET_ID = '2f4c1a52-6a59-4d7e-9a0e-0d3c5b8f7a11';

interface Harness {
  readonly service: UserRoleService;
  readonly update: jest.Mock;
  readonly record: jest.Mock;
  readonly revokeAll: jest.Mock;
}

function harness(storedRole: Roles | null): Harness {
  const update = jest.fn().mockResolvedValue(undefined);
  const manager = {
    findOne: jest
      .fn()
      .mockResolvedValue(storedRole === null ? null : { id: TARGET_ID, role: storedRole }),
    update,
  } as unknown as EntityManager;
  const dataSource = {
    transaction: (work: (manager: EntityManager) => Promise<unknown>) => work(manager),
  } as unknown as DataSource;
  const record = jest.fn();
  const revokeAll = jest.fn().mockResolvedValue(undefined);
  const service = new UserRoleService(
    dataSource,
    { revokeAll } as unknown as SessionRevocationService,
    { record } as unknown as ActivityLogService,
  );
  return { service, update, record, revokeAll };
}

describe('UserRoleService.change', () => {
  it('promotes a user to admin, records who did it and signs the user out everywhere', async () => {
    const { service, update, record, revokeAll } = harness(Roles.USER);

    await service.change({ actor: ACTOR, userId: TARGET_ID, role: Roles.ADMIN });

    expect(update).toHaveBeenCalledWith(UserEntity, { id: TARGET_ID }, { role: Roles.ADMIN });
    expect(record).toHaveBeenCalledWith(UserRoleEvent.CHANGED, {
      userId: TARGET_ID,
      actorEmail: ACTOR.email,
      metadata: { previousRole: Roles.USER, role: Roles.ADMIN },
    });
    expect(revokeAll).toHaveBeenCalledWith(TARGET_ID, SessionRevokeReason.ROLE_CHANGED);
  });

  it('demotes an admin back to a user', async () => {
    const { service, update, record, revokeAll } = harness(Roles.ADMIN);

    await service.change({ actor: ACTOR, userId: TARGET_ID, role: Roles.USER });

    expect(update).toHaveBeenCalledWith(UserEntity, { id: TARGET_ID }, { role: Roles.USER });
    expect(record).toHaveBeenCalledWith(
      UserRoleEvent.CHANGED,
      expect.objectContaining({ metadata: { previousRole: Roles.ADMIN, role: Roles.USER } }),
    );
    expect(revokeAll).toHaveBeenCalledWith(TARGET_ID, SessionRevokeReason.ROLE_CHANGED);
  });

  it('leaves everything alone when the user already has the role', async () => {
    const { service, update, record, revokeAll } = harness(Roles.ADMIN);

    await service.change({ actor: ACTOR, userId: TARGET_ID, role: Roles.ADMIN });

    expect(update).not.toHaveBeenCalled();
    expect(record).not.toHaveBeenCalled();
    expect(revokeAll).not.toHaveBeenCalled();
  });

  it('refuses to let an admin change their own role', async () => {
    const { service, update, revokeAll } = harness(Roles.USER);

    await expect(
      service.change({ actor: ACTOR, userId: ACTOR.id, role: Roles.USER }),
    ).rejects.toBeInstanceOf(OwnRoleChangeError);
    expect(update).not.toHaveBeenCalled();
    expect(revokeAll).not.toHaveBeenCalled();
  });

  it('refuses to change a super admin', async () => {
    const { service, update, record, revokeAll } = harness(Roles.SUPER_ADMIN);

    await expect(
      service.change({ actor: ACTOR, userId: TARGET_ID, role: Roles.USER }),
    ).rejects.toBeInstanceOf(SuperAdminRoleLockedError);
    expect(update).not.toHaveBeenCalled();
    expect(record).not.toHaveBeenCalled();
    expect(revokeAll).not.toHaveBeenCalled();
  });

  it('reports a user that does not exist', async () => {
    const { service, record } = harness(null);

    await expect(
      service.change({ actor: ACTOR, userId: TARGET_ID, role: Roles.ADMIN }),
    ).rejects.toBeInstanceOf(RoleChangeUserNotFoundError);
    expect(record).not.toHaveBeenCalled();
  });

  it.each([Roles.SUPER_ADMIN, Roles.SELLER])('refuses to hand out %s', async (role) => {
    const { service, update } = harness(Roles.USER);

    await expect(service.change({ actor: ACTOR, userId: TARGET_ID, role })).rejects.toBeInstanceOf(
      RoleNotAssignableError,
    );
    expect(update).not.toHaveBeenCalled();
  });
});
