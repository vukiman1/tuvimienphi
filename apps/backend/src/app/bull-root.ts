import { BullModule } from '@nestjs/bullmq';
import type { DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

/** Dùng chung cho tiến trình API và tiến trình worker — hai bên phải nối vào đúng một Redis. */
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

export const CONFIG_ROOT_OPTIONS = {
  isGlobal: true,
  ignoreEnvFile: true,
  expandVariables: true,
} as const;
