import { StrategyKey } from '@org/backend-constants';
import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { CONSOLE_ROLES } from '../../auth/console-roles';
import { RequireRoles } from '../../auth/decorators/require-roles.decorator';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { AdminUser, AdminUserPage } from './admin-user.type';
import { AdminUsersService } from './admin-users.service';
import { ListUsersArgs } from './dto/list-users.args';

@Resolver(() => AdminUser)
@UseGuards(GqlAuthGuard(StrategyKey.JWT.ADMIN), RolesGuard)
@RequireRoles(...CONSOLE_ROLES)
export class AdminUsersResolver {
  constructor(private readonly adminUsers: AdminUsersService) {}

  @Query(() => AdminUserPage, { name: 'users' })
  async users(@Args() args: ListUsersArgs): Promise<AdminUserPage> {
    return this.adminUsers.list(args);
  }
}
