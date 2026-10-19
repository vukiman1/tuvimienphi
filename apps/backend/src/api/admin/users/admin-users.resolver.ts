import { StrategyKey } from '@org/backend-constants';
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
import { AdjustChapterCreditsInput } from './dto/adjust-chapter-credits.input';
import { ListUsersArgs } from './dto/list-users.args';

const CREDITS_WOULD_GO_NEGATIVE_MESSAGE = 'Không thể trừ quá số lượt người này đang có.';
const USER_NOT_FOUND_MESSAGE = 'Không tìm thấy người dùng.';

@Resolver(() => AdminUser)
@UseGuards(GqlAuthGuard(StrategyKey.JWT.ADMIN), RolesGuard)
@RequireRoles(...CONSOLE_ROLES)
export class AdminUsersResolver {
  constructor(
    private readonly adminUsers: AdminUsersService,
    private readonly chapterCredits: ChapterCreditsService,
    private readonly dailyQuota: DailyQuotaService,
    private readonly activityLog: ActivityLogService,
  ) {}

  @Query(() => AdminUserPage, { name: 'users' })
  async users(@Args() args: ListUsersArgs): Promise<AdminUserPage> {
    const page = await this.adminUsers.list(args);
    const dailyUsed = await this.dailyQuota.usedBy(page.users.map((user) => user.id));
    return {
      total: page.total,
      users: page.users.map((user) => ({ ...user, dailyChapterUsed: dailyUsed.get(user.id) ?? 0 })),
    };
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
