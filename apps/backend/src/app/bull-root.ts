import { BullModule } from '@nestjs/bullmq';
import type { DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

/** Nối BullMQ vào cùng Redis với phần còn lại của ứng dụng. */
export function bullRootImport(): DynamicModule {
  return BullModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
      connection: {
        host: config.get<string>('redis.host'),
        port: config.get<number>('redis.port'),
        password: config.get<string>('redis.password') || undefined,
        db: config.get<number>('redis.db'),
        ...(config.get<boolean>('redis.tls') ? { tls: {} } : {}),
        maxRetriesPerRequest: null,
      },
    }),
  });
}
