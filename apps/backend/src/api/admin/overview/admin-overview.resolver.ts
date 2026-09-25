import { StrategyKey } from '@org/backend-constants';
import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { CONSOLE_ROLES } from '../../auth/console-roles';
import { RequireRoles } from '../../auth/decorators/require-roles.decorator';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { AdminOverviewService } from './admin-overview.service';
import { AdminOverview, DailyCount } from './admin-overview.type';
import { OverviewArgs } from './dto/overview.args';

@Resolver(() => AdminOverview)
@UseGuards(GqlAuthGuard(StrategyKey.JWT.ADMIN), RolesGuard)
@RequireRoles(...CONSOLE_ROLES)
export class AdminOverviewResolver {
  constructor(private readonly adminOverview: AdminOverviewService) {}

  @Query(() => AdminOverview, { name: 'overview' })
  async overview(@Args() args: OverviewArgs): Promise<AdminOverview> {
    return this.adminOverview.summarise(args);
  }

  @Query(() => [DailyCount], { name: 'activeUsersSeries' })
  async activeUsersSeries(@Args() args: OverviewArgs): Promise<DailyCount[]> {
    return this.adminOverview.activeUsersSeries(args);
  }
}
