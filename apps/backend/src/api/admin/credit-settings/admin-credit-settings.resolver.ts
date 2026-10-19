import { StrategyKey } from '@org/backend-constants';
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ActivityLogService } from '../../activity/activity-log.service';
import { CONSOLE_ROLES } from '../../auth/console-roles';
import { RequireRoles } from '../../auth/decorators/require-roles.decorator';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CreditSettingsService } from '../../credits/credit-settings.service';
import { CreditsEvent } from '../../credits/credits-event';
import { UserEntity } from '../../user/entities/user.entity';
import { CurrentAdmin } from '../current-admin.decorator';
import { AdminCreditSettings } from './admin-credit-settings.type';
import { UpdateCreditSettingsInput } from './dto/update-credit-settings.input';

@Resolver(() => AdminCreditSettings)
@UseGuards(GqlAuthGuard(StrategyKey.JWT.ADMIN), RolesGuard)
@RequireRoles(...CONSOLE_ROLES)
export class AdminCreditSettingsResolver {
  constructor(
    private readonly settings: CreditSettingsService,
    private readonly activityLog: ActivityLogService,
  ) {}

  @Query(() => AdminCreditSettings, { name: 'creditSettings' })
  async creditSettings(): Promise<AdminCreditSettings> {
    return { dailyChapterQuota: await this.settings.dailyChapterQuota() };
  }

  @Mutation(() => AdminCreditSettings, { name: 'updateCreditSettings' })
  async updateCreditSettings(
    @Args('input') { dailyChapterQuota }: UpdateCreditSettingsInput,
    @CurrentAdmin() admin: UserEntity,
  ): Promise<AdminCreditSettings> {
    const previousDailyChapterQuota = await this.settings.dailyChapterQuota();
    await this.settings.setDailyChapterQuota(dailyChapterQuota);
    this.activityLog.record(CreditsEvent.SETTINGS_UPDATED, {
      actorEmail: admin.email,
      metadata: { previousDailyChapterQuota, dailyChapterQuota },
    });
    return { dailyChapterQuota };
  }
}
