import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiHealthService } from './settings/ai-health.service';
import { AiProviderClients } from './providers/ai-provider-clients';
import { AiSettingsService } from './settings/ai-settings.service';
import { AiUsageService } from './usage/ai-usage.service';
import { AiClient } from './port/ai.client';
import { AnthropicProvider } from './providers/anthropic.provider';
import { AiCallEntity } from './usage/entities/ai-call.entity';
import { AiProviderEntity } from './settings/entities/ai-provider.entity';
import { AiUsageDailyEntity } from './usage/entities/ai-usage-daily.entity';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenAiProvider } from './providers/openai.provider';
import { RoutingAiClient } from './routing-ai.client';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([AiProviderEntity, AiUsageDailyEntity, AiCallEntity]),
  ],
  providers: [
    GeminiProvider,
    OpenAiProvider,
    AnthropicProvider,
    AiProviderClients,
    AiSettingsService,
    AiUsageService,
    AiHealthService,
    { provide: AiClient, useClass: RoutingAiClient },
  ],
  exports: [AiClient, AiSettingsService, AiHealthService, AiProviderClients, AiUsageService],
})
export class AiModule {}
