import { Injectable, Logger } from '@nestjs/common';
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
  RoleLockedError,
  RoleNotAssignableError,
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
  private readonly logger = new Logger(UserRoleService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly sessionRevocation: SessionRevocationService,
    private readonly activityLog: ActivityLogService,
  ) {}

  async change(command: RoleChangeCommand): Promise<void> {
    if (!ASSIGNABLE_ROLES.includes(command.role)) {
      throw new RoleNotAssignableError(command.role);
    }

    const transition = await this.dataSource.transaction((manager) =>
      this.writeRole(manager, command),
    );
    if (transition.previousRole === transition.role) {
      return;
    }

    await this.signOutEverywhere(command);
  }

  private async writeRole(
    manager: EntityManager,
    { actor, userId, role }: RoleChangeCommand,
  ): Promise<RoleTransition> {
    const user = await manager.findOne(UserEntity, {
      where: { id: userId },
      select: { id: true, role: true },
      lock: { mode: 'pessimistic_write' },
    });
    if (!user) {
      throw new RoleChangeUserNotFoundError(userId);
    }
    if (user.id === actor.id) {
      throw new OwnRoleChangeError(user.id);
    }
    if (!ASSIGNABLE_ROLES.includes(user.role)) {
      throw new RoleLockedError(user.id, user.role);
    }
    if (user.role === role) {
      return { previousRole: user.role, role };
    }

    await manager.update(UserEntity, { id: user.id }, { role });
    await this.activityLog.recordWithin(manager, UserRoleEvent.CHANGED, {
      userId: user.id,
      actorEmail: actor.email,
      metadata: { previousRole: user.role, role },
    });
    return { previousRole: user.role, role };
  }

  private async signOutEverywhere({ actor, userId, role }: RoleChangeCommand): Promise<void> {
    try {
      await this.sessionRevocation.revokeAll(userId, SessionRevokeReason.ROLE_CHANGED);
    } catch (error) {
      this.logger.error({
        message: `Role of user ${userId} changed to ${role} but their sessions could not be revoked`,
        userId,
        actorEmail: actor.email,
        error,
      });
    }
  }
}
