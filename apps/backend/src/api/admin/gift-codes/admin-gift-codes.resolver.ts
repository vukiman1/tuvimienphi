import { StrategyKey } from '@org/backend-constants';
import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CONSOLE_ROLES } from '../../auth/console-roles';
import { RequireRoles } from '../../auth/decorators/require-roles.decorator';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { GiftCodeEntity } from '../../gift-code/entities/gift-code.entity';
import { GiftCodeService } from '../../gift-code/gift-code.service';
import { UserEntity } from '../../user/entities/user.entity';
import { CurrentAdmin } from '../current-admin.decorator';
import { AdminGiftCode } from './admin-gift-code.type';
import { CreateGiftCodeInput } from './dto/create-gift-code.input';

const toAdminGiftCode = (giftCode: GiftCodeEntity): AdminGiftCode => ({
  id: giftCode.id,
  code: giftCode.code,
  credits: giftCode.credits,
  maxRedemptions: giftCode.maxRedemptions,
  redeemedCount: giftCode.redeemedCount,
  expiresAt: giftCode.expiresAt?.toISOString() ?? null,
  isActive: giftCode.isActive,
  createdByEmail: giftCode.createdByEmail,
  createdAt: giftCode.createdAt.toISOString(),
});

@Resolver(() => AdminGiftCode)
@UseGuards(GqlAuthGuard(StrategyKey.JWT.ADMIN), RolesGuard)
@RequireRoles(...CONSOLE_ROLES)
export class AdminGiftCodesResolver {
  constructor(private readonly giftCodes: GiftCodeService) {}

  @Query(() => [AdminGiftCode], { name: 'giftCodes' })
  async list(): Promise<AdminGiftCode[]> {
    const giftCodes = await this.giftCodes.list();
    return giftCodes.map(toAdminGiftCode);
  }

  @Mutation(() => AdminGiftCode, { name: 'createGiftCode' })
  async create(
    @Args('input') input: CreateGiftCodeInput,
    @CurrentAdmin() admin: UserEntity,
  ): Promise<AdminGiftCode> {
    return toAdminGiftCode(await this.giftCodes.create(input, admin.email));
  }

  @Mutation(() => AdminGiftCode, { name: 'setGiftCodeActive' })
  async setActive(
    @Args('id', { type: () => ID }) id: string,
    @Args('isActive') isActive: boolean,
  ): Promise<AdminGiftCode> {
    return toAdminGiftCode(await this.giftCodes.setActive(id, isActive));
  }
}
