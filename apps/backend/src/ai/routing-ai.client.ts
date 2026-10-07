import { Injectable } from '@nestjs/common';
import { AiProviderClients } from './ai-provider-clients';
import { AiSettingsService } from './ai-settings.service';
import { AiClient } from './ai.client';
import { AiNotConfiguredError } from './ai.errors';
import type { AiRequest, AiResult } from './ai.types';

@Injectable()
export class RoutingAiClient extends AiClient {
  constructor(
    private readonly settings: AiSettingsService,
    private readonly providers: AiProviderClients,
  ) {
    super();
  }

  async generate(request: AiRequest): Promise<AiResult> {
    const active = await this.settings.resolveActive();
    if (!active) {
      throw new AiNotConfiguredError();
    }
    return this.providers.of(active.provider).generate(request, active.credentials);
  }
}
