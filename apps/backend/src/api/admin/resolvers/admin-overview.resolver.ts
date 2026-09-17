import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { AdminRoleGuard } from '../../../graphql/admin-role.guard';
import { GqlAuthGuard } from '../../../graphql/gql-auth.guard';
import { AdminOverview } from '../models/overview.model';
import { AdminOverviewService } from '../services/admin-overview.service';

@Resolver(() => AdminOverview)
export class AdminOverviewResolver {
  constructor(private readonly service: AdminOverviewService) {}

  @Query(() => AdminOverview)
  @UseGuards(GqlAuthGuard, AdminRoleGuard)
  adminOverview(): Promise<AdminOverview> {
    return this.service.getOverview();
  }
}
