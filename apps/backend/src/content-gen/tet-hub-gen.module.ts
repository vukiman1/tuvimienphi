import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from '@org/backend-config';
import { CryptoModule } from '@org/backend-crypto';
import { createDatabaseOptions } from '@org/backend-database';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
      load: [configuration],
      expandVariables: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: createDatabaseOptions,
    }),
    CryptoModule,
    AiModule,
  ],
})
export class TetHubGenModule {}
