import { Logger } from '@nestjs/common';
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
  RoleLockedError,
  RoleNotAssignableError,
} from './user-role.errors';
import { UserRoleService } from './user-role.service';

const ACTOR = { id: '9b1f0c4e-2d7a-4c1e-8f3a-6e5d4c3b2a10', email: 'owner@tuvimienphi.vn' };
const TARGET_ID = '2f4c1a52-6a59-4d7e-9a0e-0d3c5b8f7a11';

interface StoredUser {
  readonly id: string;
  readonly role: Roles;
}

interface Harness {
  readonly service: UserRoleService;
  readonly manager: EntityManager;
  readonly findOne: jest.Mock;
  readonly update: jest.Mock;
  readonly recordWithin: jest.Mock;
  readonly revokeAll: jest.Mock;
}

function harness(
  stored: StoredUser | null,
  revokeAll: jest.Mock = jest.fn().mockResolvedValue(undefined),
): Harness {
  const findOne = jest.fn().mockResolvedValue(stored);
  const update = jest.fn().mockResolvedValue(undefined);
  const manager = { findOne, update } as unknown as EntityManager;
  const dataSource = {
    transaction: (work: (manager: EntityManager) => Promise<unknown>) => work(manager),
  } as unknown as DataSource;
  const recordWithin = jest.fn().mockResolvedValue(undefined);
  const service = new UserRoleService(
    dataSource,
    { revokeAll } as unknown as SessionRevocationService,
    { recordWithin } as unknown as ActivityLogService,
  );
  return { service, manager, findOne, update, recordWithin, revokeAll };
}

function target(role: Roles): StoredUser {
  return { id: TARGET_ID, role };
}

describe('UserRoleService.change', () => {
  it('promotes a user to admin, records who did it in the same transaction and signs the user out everywhere', async () => {
    const { service, manager, update, recordWithin, revokeAll } = harness(target(Roles.USER));

    await service.change({ actor: ACTOR, userId: TARGET_ID, role: Roles.ADMIN });

    expect(update).toHaveBeenCalledWith(UserEntity, { id: TARGET_ID }, { role: Roles.ADMIN });
    expect(recordWithin).toHaveBeenCalledWith(manager, UserRoleEvent.CHANGED, {
      userId: TARGET_ID,
      actorEmail: ACTOR.email,
      metadata: { previousRole: Roles.USER, role: Roles.ADMIN },
    });
    expect(revokeAll).toHaveBeenCalledWith(TARGET_ID, SessionRevokeReason.ROLE_CHANGED);
  });

  it('locks the user row while deciding the change', async () => {
    const { service, findOne } = harness(target(Roles.USER));

    await service.change({ actor: ACTOR, userId: TARGET_ID, role: Roles.ADMIN });

    expect(findOne).toHaveBeenCalledWith(
      UserEntity,
      expect.objectContaining({ lock: { mode: 'pessimistic_write' } }),
    );
  });

  it('demotes an admin back to a user', async () => {
    const { service, update, recordWithin, revokeAll } = harness(target(Roles.ADMIN));

    await service.change({ actor: ACTOR, userId: TARGET_ID, role: Roles.USER });

    expect(update).toHaveBeenCalledWith(UserEntity, { id: TARGET_ID }, { role: Roles.USER });
    expect(recordWithin).toHaveBeenCalledWith(
      expect.anything(),
      UserRoleEvent.CHANGED,
      expect.objectContaining({ metadata: { previousRole: Roles.ADMIN, role: Roles.USER } }),
    );
    expect(revokeAll).toHaveBeenCalledWith(TARGET_ID, SessionRevokeReason.ROLE_CHANGED);
  });

  it('leaves everything alone when the user already has the role', async () => {
    const { service, update, recordWithin, revokeAll } = harness(target(Roles.ADMIN));

    await service.change({ actor: ACTOR, userId: TARGET_ID, role: Roles.ADMIN });

    expect(update).not.toHaveBeenCalled();
    expect(recordWithin).not.toHaveBeenCalled();
    expect(revokeAll).not.toHaveBeenCalled();
  });

  it('keeps the change when signing the user out fails, and logs who was affected', async () => {
    const logged = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    const { service, update, recordWithin } = harness(
      target(Roles.USER),
      jest.fn().mockRejectedValue(new Error('redis is down')),
    );

    await expect(
      service.change({ actor: ACTOR, userId: TARGET_ID, role: Roles.ADMIN }),
    ).resolves.toBeUndefined();

    expect(update).toHaveBeenCalled();
    expect(recordWithin).toHaveBeenCalled();
    expect(logged).toHaveBeenCalledWith(expect.objectContaining({ userId: TARGET_ID }));
    logged.mockRestore();
  });

  it('refuses to let an admin change their own role', async () => {
    const { service, update, revokeAll } = harness({ id: ACTOR.id, role: Roles.ADMIN });

    await expect(
      service.change({ actor: ACTOR, userId: ACTOR.id, role: Roles.USER }),
    ).rejects.toBeInstanceOf(OwnRoleChangeError);
    expect(update).not.toHaveBeenCalled();
    expect(revokeAll).not.toHaveBeenCalled();
  });

  it('recognises the caller’s own account even when the id is sent in uppercase', async () => {
    const { service, update } = harness({ id: ACTOR.id, role: Roles.ADMIN });

    await expect(
      service.change({ actor: ACTOR, userId: ACTOR.id.toUpperCase(), role: Roles.USER }),
    ).rejects.toBeInstanceOf(OwnRoleChangeError);
    expect(update).not.toHaveBeenCalled();
  });

  it.each([Roles.SUPER_ADMIN, Roles.SELLER])(
    'refuses to change someone whose role is %s',
    async (storedRole) => {
      const { service, update, recordWithin, revokeAll } = harness(target(storedRole));

      await expect(
        service.change({ actor: ACTOR, userId: TARGET_ID, role: Roles.USER }),
      ).rejects.toBeInstanceOf(RoleLockedError);
      expect(update).not.toHaveBeenCalled();
      expect(recordWithin).not.toHaveBeenCalled();
      expect(revokeAll).not.toHaveBeenCalled();
    },
  );

  it('reports a user that does not exist', async () => {
    const { service, recordWithin } = harness(null);

    await expect(
      service.change({ actor: ACTOR, userId: TARGET_ID, role: Roles.ADMIN }),
    ).rejects.toBeInstanceOf(RoleChangeUserNotFoundError);
    expect(recordWithin).not.toHaveBeenCalled();
  });

  it.each([Roles.SUPER_ADMIN, Roles.SELLER])('refuses to hand out %s', async (role) => {
    const { service, update } = harness(target(Roles.USER));

    await expect(service.change({ actor: ACTOR, userId: TARGET_ID, role })).rejects.toBeInstanceOf(
      RoleNotAssignableError,
    );
    expect(update).not.toHaveBeenCalled();
  });
});
