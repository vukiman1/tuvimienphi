import { StrategyKey } from '@org/backend-constants';
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CONSOLE_ROLES } from '../../auth/console-roles';
import { RequireRoles } from '../../auth/decorators/require-roles.decorator';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { VanHanService } from '../../van-han/van-han.service';
import {
  toAdminEditor,
  toAdminSlot,
  toAdminYear,
  toAdminYearSummary,
} from './admin-van-han.mapper';
import {
  AdminVanHanEditor,
  AdminVanHanSlot,
  AdminVanHanYear,
  AdminVanHanYearSummary,
} from './admin-van-han.type';
import { SaveVanHanEntryInput } from './dto/save-van-han-entry.input';
import { VanHanSlotArgs, VanHanYearArgs } from './dto/van-han-year.args';

@Resolver(() => AdminVanHanYear)
@UseGuards(GqlAuthGuard(StrategyKey.JWT.ADMIN), RolesGuard)
@RequireRoles(...CONSOLE_ROLES)
export class AdminVanHanResolver {
  constructor(private readonly vanHan: VanHanService) {}

  @Query(() => [AdminVanHanYearSummary], { name: 'vanHanYears' })
  async vanHanYears(): Promise<AdminVanHanYearSummary[]> {
    const years = await this.vanHan.listYears();
    return years.map(toAdminYearSummary);
  }

  @Query(() => AdminVanHanYear, { name: 'vanHanYear' })
  async vanHanYear(@Args() { year }: VanHanYearArgs): Promise<AdminVanHanYear> {
    return toAdminYear(await this.vanHan.findYear(year));
  }

  @Query(() => AdminVanHanEditor, { name: 'vanHanEditor' })
  async vanHanEditor(@Args() { year, zodiacOrder }: VanHanSlotArgs): Promise<AdminVanHanEditor> {
    const [current, previousEntry] = await Promise.all([
      this.vanHan.findYear(year),
      this.vanHan.findEntry(year - 1, zodiacOrder),
    ]);
    return toAdminEditor(current, zodiacOrder, previousEntry);
  }

  @Mutation(() => AdminVanHanSlot, { name: 'saveVanHanEntry' })
  async saveVanHanEntry(@Args('input') input: SaveVanHanEntryInput): Promise<AdminVanHanSlot> {
    const entry = await this.vanHan.saveEntry(input);
    return toAdminSlot(input.year, input.zodiacOrder, entry);
  }

  @Mutation(() => AdminVanHanYear, { name: 'publishVanHanYear' })
  async publishVanHanYear(@Args() { year }: VanHanYearArgs): Promise<AdminVanHanYear> {
    return toAdminYear(await this.vanHan.publishYear(year));
  }

  @Mutation(() => AdminVanHanYear, { name: 'unpublishVanHanYear' })
  async unpublishVanHanYear(@Args() { year }: VanHanYearArgs): Promise<AdminVanHanYear> {
    return toAdminYear(await this.vanHan.unpublishYear(year));
  }
}
