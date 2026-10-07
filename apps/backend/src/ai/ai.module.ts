import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiHealthService } from './ai-health.service';
import { AiProviderClients } from './ai-provider-clients';
import { AiSettingsService } from './ai-settings.service';
import { AiClient } from './ai.client';
import { AnthropicProvider } from './anthropic.provider';
import { AiProviderEntity } from './entities/ai-provider.entity';
import { GeminiProvider } from './gemini.provider';
import { OpenAiProvider } from './openai.provider';
import { RoutingAiClient } from './routing-ai.client';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([AiProviderEntity])],
  providers: [
    GeminiProvider,
    OpenAiProvider,
    AnthropicProvider,
    AiProviderClients,
    AiSettingsService,
    AiHealthService,
    { provide: AiClient, useClass: RoutingAiClient },
  ],
  exports: [AiClient, AiSettingsService, AiHealthService, AiProviderClients],
})
export class AiModule {}
