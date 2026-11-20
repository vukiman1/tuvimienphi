import { Injectable } from '@nestjs/common';
import { Roles } from '@org/backend-enum';
import { DataSource, type EntityManager } from 'typeorm';
import { ActivityLogService } from '../../activity/activity-log.service';
import { SessionRevokeReason } from '../../auth/enums/session-revoke-reason.enum';
import { SessionRevocationService } from '../../auth/services/session-revocation.service';
import { UserEntity } from '../../user/entities/user.entity';
import { UserRoleEvent } from './user-role-event';
import {
  OwnRoleChangeError,
  RoleChangeUserNotFoundError,
  RoleNotAssignableError,
  SuperAdminRoleLockedError,
} from './user-role.errors';

export const ASSIGNABLE_ROLES: readonly Roles[] = [Roles.USER, Roles.ADMIN];

export interface RoleChangeActor {
  readonly id: string;
  readonly email: string;
}

export interface RoleChangeCommand {
  readonly actor: RoleChangeActor;
  readonly userId: string;
  readonly role: Roles;
}

interface RoleTransition {
  readonly previousRole: Roles;
  readonly role: Roles;
}

@Injectable()
export class UserRoleService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly sessionRevocation: SessionRevocationService,
    private readonly activityLog: ActivityLogService,
  ) {}

  async change({ actor, userId, role }: RoleChangeCommand): Promise<void> {
    if (!ASSIGNABLE_ROLES.includes(role)) {
      throw new RoleNotAssignableError(role);
    }
    if (actor.id === userId) {
      throw new OwnRoleChangeError(userId);
    }

    const transition = await this.dataSource.transaction((manager) =>
      this.writeRole(manager, userId, role),
    );
    if (transition.previousRole === transition.role) {
      return;
    }

    this.activityLog.record(UserRoleEvent.CHANGED, {
      userId,
      actorEmail: actor.email,
      metadata: { previousRole: transition.previousRole, role: transition.role },
    });
    await this.sessionRevocation.revokeAll(userId, SessionRevokeReason.ROLE_CHANGED);
  }

  private async writeRole(
    manager: EntityManager,
    userId: string,
    role: Roles,
  ): Promise<RoleTransition> {
    const user = await manager.findOne(UserEntity, {
      where: { id: userId },
      select: { id: true, role: true },
      lock: { mode: 'pessimistic_write' },
    });
    if (!user) {
      throw new RoleChangeUserNotFoundError(userId);
    }
    if (user.role === Roles.SUPER_ADMIN) {
      throw new SuperAdminRoleLockedError(userId);
    }
    if (user.role !== role) {
      await manager.update(UserEntity, { id: userId }, { role });
    }
    return { previousRole: user.role, role };
  }
}
