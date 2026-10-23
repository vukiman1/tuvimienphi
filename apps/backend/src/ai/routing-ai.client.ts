import { Injectable } from '@nestjs/common';
import { AiProviderClients } from './providers/ai-provider-clients';
import { AiSettingsService } from './settings/ai-settings.service';
import { AiUsagePurpose } from './usage/ai-usage-purpose.enum';
import { AiUsageService } from './usage/ai-usage.service';
import { AiClient } from './port/ai.client';
import { AiNotConfiguredError } from './port/ai.errors';
import type { AiRequest, AiResult } from './port/ai.types';

@Injectable()
export class RoutingAiClient extends AiClient {
  constructor(
    private readonly settings: AiSettingsService,
    private readonly providers: AiProviderClients,
    private readonly usage: AiUsageService,
  ) {
    super();
  }

  async generate(request: AiRequest): Promise<AiResult> {
    const active = await this.settings.resolveActive();
    if (!active) {
      throw new AiNotConfiguredError();
    }
    return this.usage.track(active.provider, AiUsagePurpose.GENERATION, () =>
      this.providers.of(active.provider).generate(request, active.credentials),
    );
  }
}
