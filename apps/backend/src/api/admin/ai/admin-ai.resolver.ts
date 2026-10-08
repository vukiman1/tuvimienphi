import { StrategyKey } from '@org/backend-constants';
import { Roles } from '@org/backend-enum';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Throttle } from '@nestjs/throttler';
import { readableReason } from '../../../ai/ai-error-reason';
import { AiHealthService } from '../../../ai/ai-health.service';
import { AiProviderClients } from '../../../ai/ai-provider-clients';
import { AiSettingsService } from '../../../ai/ai-settings.service';
import { AiUsageService } from '../../../ai/ai-usage.service';
import { RequireRoles } from '../../auth/decorators/require-roles.decorator';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import {
  toAdminAiCallPage,
  toAdminAiProbe,
  toAdminAiProvider,
  toAdminAiSettings,
} from './admin-ai.mapper';
import {
  AdminAiCallPage,
  AdminAiHealth,
  AdminAiProvider,
  AdminAiSettings,
  AdminAiUsageDay,
} from './admin-ai.type';
import { ActiveAiProviderArgs, AiProviderArgs, AiProviderModelsArgs } from './dto/ai-provider.args';
import { AiCallsArgs, DEFAULT_CALLS_PAGE_SIZE } from './dto/ai-calls.args';
import { AiUsageArgs } from './dto/ai-usage.args';
import { SaveAiProviderInput } from './dto/save-ai-provider.input';
import { SetAiProviderBudgetArgs } from './dto/set-ai-provider-budget.args';
import { TestAiProviderInput } from './dto/test-ai-provider.input';
import { assertUsageRange } from './usage-range';

const PROVIDER_CALLS_PER_MINUTE = 12;
const MINUTE_MS = 60_000;

@Resolver(() => AdminAiSettings)
@UseGuards(GqlAuthGuard(StrategyKey.JWT.ADMIN), RolesGuard)
@RequireRoles(Roles.SUPER_ADMIN)
export class AdminAiResolver {
  constructor(
    private readonly settings: AiSettingsService,
    private readonly health: AiHealthService,
    private readonly providers: AiProviderClients,
    private readonly usage: AiUsageService,
  ) {}

  @Query(() => AdminAiSettings, { name: 'aiSettings' })
  async aiSettings(): Promise<AdminAiSettings> {
    return this.current();
  }

  @Query(() => [String], { name: 'aiProviderModels' })
  @Throttle({ default: { limit: PROVIDER_CALLS_PER_MINUTE, ttl: MINUTE_MS } })
  async aiProviderModels(@Args() { provider, apiKey }: AiProviderModelsArgs): Promise<string[]> {
    const key = apiKey ?? (await this.settings.apiKeyOf(provider));
    try {
      return await this.providers.of(provider).listModels(key);
    } catch (error) {
      throw new BadRequestException(
        `${provider} would not list its models: ${readableReason(error)}`,
      );
    }
  }

  @Query(() => [AdminAiUsageDay], { name: 'aiUsage' })
  async aiUsage(@Args() { from, to }: AiUsageArgs): Promise<AdminAiUsageDay[]> {
    assertUsageRange(from, to);
    return this.usage.daily(from, to);
  }

  @Query(() => AdminAiCallPage, { name: 'aiCalls' })
  async aiCalls(
    @Args() { from, to, provider, model, purpose, page, limit }: AiCallsArgs,
  ): Promise<AdminAiCallPage> {
    assertUsageRange(from, to);
    return toAdminAiCallPage(
      await this.usage.calls(
        { from, to, provider, model, purpose },
        page ?? 1,
        limit ?? DEFAULT_CALLS_PAGE_SIZE,
      ),
    );
  }

  @Mutation(() => AdminAiProvider, { name: 'setAiProviderBudget' })
  async setAiProviderBudget(
    @Args() { provider, monthlyBudgetUsd }: SetAiProviderBudgetArgs,
  ): Promise<AdminAiProvider> {
    return toAdminAiProvider(await this.settings.setBudget(provider, monthlyBudgetUsd ?? null));
  }

  @Mutation(() => AdminAiProvider, { name: 'saveAiProvider' })
  async saveAiProvider(@Args('input') input: SaveAiProviderInput): Promise<AdminAiProvider> {
    const row = await this.settings.save(input.provider, {
      apiKey: input.apiKey,
      models: input.models,
    });
    return toAdminAiProvider(row);
  }

  @Mutation(() => AdminAiSettings, { name: 'clearAiProviderKey' })
  async clearAiProviderKey(@Args() { provider }: AiProviderArgs): Promise<AdminAiSettings> {
    await this.settings.clearKey(provider);
    return this.current();
  }

  @Mutation(() => AdminAiSettings, { name: 'setActiveAiProvider' })
  async setActiveAiProvider(@Args() { provider }: ActiveAiProviderArgs): Promise<AdminAiSettings> {
    await this.settings.setActive(provider ?? null);
    return this.current();
  }

  @Mutation(() => AdminAiHealth, { name: 'testAiProvider' })
  @Throttle({ default: { limit: PROVIDER_CALLS_PER_MINUTE, ttl: MINUTE_MS } })
  async testAiProvider(@Args('input') input: TestAiProviderInput): Promise<AdminAiHealth> {
    const apiKey = input.apiKey ?? (await this.settings.apiKeyOf(input.provider));
    const outcome = await this.health.probe(input.provider, { apiKey, models: input.models });
    return toAdminAiProbe(outcome, new Date());
  }

  @Mutation(() => AdminAiProvider, { name: 'checkAiProvider' })
  @Throttle({ default: { limit: PROVIDER_CALLS_PER_MINUTE, ttl: MINUTE_MS } })
  async checkAiProvider(@Args() { provider }: AiProviderArgs): Promise<AdminAiProvider> {
    return toAdminAiProvider(await this.health.check(provider));
  }

  private async current(): Promise<AdminAiSettings> {
    const [source, rows] = await Promise.all([this.settings.source(), this.settings.list()]);
    return toAdminAiSettings(source, rows);
  }
}
