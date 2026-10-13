import { StrategyKey } from '@org/backend-constants';
import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { CONSOLE_ROLES } from '../../auth/console-roles';
import { RequireRoles } from '../../auth/decorators/require-roles.decorator';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { AdminActivityService } from './admin-activity.service';
import { ActivityEntry, ActivityPage } from './admin-activity.type';
import { RecentActivityArgs } from './dto/recent-activity.args';

@Resolver(() => ActivityEntry)
@UseGuards(GqlAuthGuard(StrategyKey.JWT.ADMIN), RolesGuard)
@RequireRoles(...CONSOLE_ROLES)
export class AdminActivityResolver {
  constructor(private readonly adminActivity: AdminActivityService) {}

  @Query(() => ActivityPage, { name: 'recentActivity' })
  async recentActivity(@Args() args: RecentActivityArgs): Promise<ActivityPage> {
    return this.adminActivity.recent(args);
  }
}
