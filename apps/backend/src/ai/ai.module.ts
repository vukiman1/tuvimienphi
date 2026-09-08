import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiClient } from './ai.client';
import { GeminiClient } from './gemini.client';

@Module({
  imports: [ConfigModule],
  providers: [{ provide: AiClient, useClass: GeminiClient }],
  exports: [AiClient],
})
export class AiModule {}
