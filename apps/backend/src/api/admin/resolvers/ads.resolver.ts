import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AdminRoleGuard } from '../../../graphql/admin-role.guard';
import { GqlAuthGuard } from '../../../graphql/gql-auth.guard';
import {
  CreateAdPopupInput,
  CreateAdRedirectInput,
  UpdateAdPopupInput,
  UpdateAdRedirectInput,
} from '../inputs/ads.input';
import { AdPopup, AdRedirect, AdsData } from '../models/ads.model';
import { AdsService } from '../services/ads.service';

@Resolver(() => AdsData)
export class AdsResolver {
  constructor(private readonly service: AdsService) {}

  @Query(() => AdsData)
  @UseGuards(GqlAuthGuard, AdminRoleGuard)
  ads(): Promise<AdsData> {
    return this.service.getAds();
  }

  @Mutation(() => AdRedirect)
  @UseGuards(GqlAuthGuard, AdminRoleGuard)
  createAdRedirect(@Args('input') input: CreateAdRedirectInput): Promise<AdRedirect> {
    return this.service.createRedirect(input);
  }

  @Mutation(() => AdRedirect)
  @UseGuards(GqlAuthGuard, AdminRoleGuard)
  updateAdRedirect(
    @Args('id') id: string,
    @Args('input') input: UpdateAdRedirectInput,
  ): Promise<AdRedirect> {
    return this.service.updateRedirect(id, input);
  }

  @Mutation(() => AdRedirect)
  @UseGuards(GqlAuthGuard, AdminRoleGuard)
  toggleAdRedirectActive(@Args('id') id: string): Promise<AdRedirect> {
    return this.service.toggleRedirectActive(id);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, AdminRoleGuard)
  deleteAdRedirect(@Args('id') id: string): Promise<boolean> {
    return this.service.removeRedirect(id);
  }

  @Mutation(() => AdPopup)
  @UseGuards(GqlAuthGuard, AdminRoleGuard)
  createAdPopup(@Args('input') input: CreateAdPopupInput): Promise<AdPopup> {
    return this.service.createPopup(input);
  }

  @Mutation(() => AdPopup)
  @UseGuards(GqlAuthGuard, AdminRoleGuard)
  updateAdPopup(
    @Args('id') id: string,
    @Args('input') input: UpdateAdPopupInput,
  ): Promise<AdPopup> {
    return this.service.updatePopup(id, input);
  }

  @Mutation(() => AdPopup)
  @UseGuards(GqlAuthGuard, AdminRoleGuard)
  toggleAdPopupActive(@Args('id') id: string): Promise<AdPopup> {
    return this.service.togglePopupActive(id);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, AdminRoleGuard)
  deleteAdPopup(@Args('id') id: string): Promise<boolean> {
    return this.service.removePopup(id);
  }
}
