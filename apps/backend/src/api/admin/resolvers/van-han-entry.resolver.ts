import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AdminRoleGuard } from '../../../graphql/admin-role.guard';
import { GqlAuthGuard } from '../../../graphql/gql-auth.guard';
import { CreateVanHanEntryInput, UpdateVanHanEntryInput } from '../inputs/van-han-entry.input';
import { VanHanEntry } from '../models/van-han-entry.model';
import { VanHanEntryService } from '../services/van-han-entry.service';

@Resolver(() => VanHanEntry)
export class VanHanEntryResolver {
  constructor(private readonly service: VanHanEntryService) {}

  @Query(() => [VanHanEntry])
  @UseGuards(GqlAuthGuard, AdminRoleGuard)
  adminVanHan(): Promise<VanHanEntry[]> {
    return this.service.findAll();
  }

  @Mutation(() => VanHanEntry)
  @UseGuards(GqlAuthGuard, AdminRoleGuard)
  createVanHanEntry(@Args('input') input: CreateVanHanEntryInput): Promise<VanHanEntry> {
    return this.service.create(input);
  }

  @Mutation(() => VanHanEntry)
  @UseGuards(GqlAuthGuard, AdminRoleGuard)
  updateVanHanEntry(
    @Args('id') id: string,
    @Args('input') input: UpdateVanHanEntryInput,
  ): Promise<VanHanEntry> {
    return this.service.update(id, input);
  }

  @Mutation(() => VanHanEntry)
  @UseGuards(GqlAuthGuard, AdminRoleGuard)
  toggleVanHanPublished(@Args('id') id: string): Promise<VanHanEntry> {
    return this.service.togglePublished(id);
  }
}
