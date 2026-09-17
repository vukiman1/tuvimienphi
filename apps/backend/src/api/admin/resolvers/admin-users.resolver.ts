import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AdminRoleGuard } from '../../../graphql/admin-role.guard';
import { GqlAuthGuard } from '../../../graphql/gql-auth.guard';
import { AdminUser } from '../models/admin-user.model';
import { AdminUsersService } from '../services/admin-users.service';

@Resolver(() => AdminUser)
export class AdminUsersResolver {
  constructor(private readonly service: AdminUsersService) {}

  @Query(() => [AdminUser])
  @UseGuards(GqlAuthGuard, AdminRoleGuard)
  adminUsers(): Promise<AdminUser[]> {
    return this.service.findAll();
  }

  @Mutation(() => AdminUser)
  @UseGuards(GqlAuthGuard, AdminRoleGuard)
  banUser(@Args('id') id: string): Promise<AdminUser> {
    return this.service.ban(id);
  }
}
