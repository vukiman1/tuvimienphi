import { BullModule } from '@nestjs/bullmq';
import type { DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { workerConnection, type RedisSettings } from './redis-connection';

/** Nối BullMQ vào cùng Redis với phần còn lại của ứng dụng. */
export function bullRootImport(): DynamicModule {
  return BullModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
      connection: workerConnection(config.getOrThrow<RedisSettings>('redis')),
    }),
  });
}
