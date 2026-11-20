import { StrategyKey } from '@org/backend-constants';
import { Roles } from '@org/backend-enum';
import { BadRequestException, NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ActivityLogService } from '../../activity/activity-log.service';
import { CONSOLE_ROLES } from '../../auth/console-roles';
import { RequireRoles } from '../../auth/decorators/require-roles.decorator';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { ChapterCreditsService } from '../../credits/chapter-credits.service';
import { CreditsEvent } from '../../credits/credits-event';
import { DailyQuotaService } from '../../credits/daily-quota.service';
import {
  ChapterCreditsUserNotFoundError,
  ChapterCreditsWouldGoNegativeError,
} from '../../credits/credits.errors';
import { UserEntity } from '../../user/entities/user.entity';
import { CurrentAdmin } from '../current-admin.decorator';
import { AdminCreditBalance, AdminUser, AdminUserPage } from './admin-user.type';
import { AdminUsersService } from './admin-users.service';
import { AdminUserSummary } from './admin-user.mapper';
import { AdjustChapterCreditsInput } from './dto/adjust-chapter-credits.input';
import { ListUsersArgs } from './dto/list-users.args';
import { SetUserRoleArgs } from './dto/set-user-role.args';
import {
  OwnRoleChangeError,
  RoleChangeUserNotFoundError,
  RoleNotAssignableError,
  SuperAdminRoleLockedError,
} from './user-role.errors';
import { UserRoleService } from './user-role.service';

const CREDITS_WOULD_GO_NEGATIVE_MESSAGE = 'Không thể trừ quá số lượt người này đang có.';
const USER_NOT_FOUND_MESSAGE = 'Không tìm thấy người dùng.';
const ROLE_NOT_ASSIGNABLE_MESSAGE = 'Chỉ có thể đặt quyền Người dùng hoặc Quản trị viên.';
const OWN_ROLE_CHANGE_MESSAGE = 'Bạn không thể tự đổi quyền của chính mình.';
const SUPER_ADMIN_ROLE_LOCKED_MESSAGE = 'Không thể đổi quyền của quản trị viên cấp cao.';

@Resolver(() => AdminUser)
@UseGuards(GqlAuthGuard(StrategyKey.JWT.ADMIN), RolesGuard)
@RequireRoles(...CONSOLE_ROLES)
export class AdminUsersResolver {
  constructor(
    private readonly adminUsers: AdminUsersService,
    private readonly chapterCredits: ChapterCreditsService,
    private readonly dailyQuota: DailyQuotaService,
    private readonly activityLog: ActivityLogService,
    private readonly userRoles: UserRoleService,
  ) {}

  @Query(() => AdminUserPage, { name: 'users' })
  async users(@Args() args: ListUsersArgs): Promise<AdminUserPage> {
    const page = await this.adminUsers.list(args);
    return { total: page.total, users: await this.withDailyUsage(page.users) };
  }

  @Mutation(() => AdminUser, { name: 'setUserRole' })
  @RequireRoles(Roles.SUPER_ADMIN)
  async setUserRole(
    @Args() { userId, role }: SetUserRoleArgs,
    @CurrentAdmin() admin: UserEntity,
  ): Promise<AdminUser> {
    await this.changeRole(admin, userId, role);
    const user = await this.adminUsers.findSummary(userId);
    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND_MESSAGE);
    }
    const [row] = await this.withDailyUsage([user]);
    return row;
  }

  @Mutation(() => AdminCreditBalance, { name: 'adjustChapterCredits' })
  async adjustChapterCredits(
    @Args('input') { userId, delta }: AdjustChapterCreditsInput,
    @CurrentAdmin() admin: UserEntity,
  ): Promise<AdminCreditBalance> {
    const chapterCredits = await this.adjust(userId, delta);
    this.activityLog.record(CreditsEvent.ADJUSTED, {
      userId,
      actorEmail: admin.email,
      metadata: { delta, chapterCredits },
    });
    return { userId, chapterCredits };
  }

  private async withDailyUsage(users: readonly AdminUserSummary[]): Promise<AdminUser[]> {
    const dailyUsed = await this.dailyQuota.usedBy(users.map((user) => user.id));
    return users.map((user) => ({ ...user, dailyChapterUsed: dailyUsed.get(user.id) ?? 0 }));
  }

  private async changeRole(admin: UserEntity, userId: string, role: Roles): Promise<void> {
    try {
      await this.userRoles.change({ actor: { id: admin.id, email: admin.email }, userId, role });
    } catch (error) {
      if (error instanceof RoleNotAssignableError) {
        throw new BadRequestException(ROLE_NOT_ASSIGNABLE_MESSAGE);
      }
      if (error instanceof OwnRoleChangeError) {
        throw new BadRequestException(OWN_ROLE_CHANGE_MESSAGE);
      }
      if (error instanceof SuperAdminRoleLockedError) {
        throw new BadRequestException(SUPER_ADMIN_ROLE_LOCKED_MESSAGE);
      }
      if (error instanceof RoleChangeUserNotFoundError) {
        throw new NotFoundException(USER_NOT_FOUND_MESSAGE);
      }
      throw error;
    }
  }

  private async adjust(userId: string, delta: number): Promise<number> {
    try {
      return await this.chapterCredits.adjust(userId, delta);
    } catch (error) {
      if (error instanceof ChapterCreditsWouldGoNegativeError) {
        throw new BadRequestException(CREDITS_WOULD_GO_NEGATIVE_MESSAGE);
      }
      if (error instanceof ChapterCreditsUserNotFoundError) {
        throw new NotFoundException(USER_NOT_FOUND_MESSAGE);
      }
      throw error;
    }
  }
}
