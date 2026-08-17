import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { SentryModule } from '@sentry/nestjs/setup';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from '@org/backend-database';
import { CryptoModule } from '@org/backend-crypto';
import { JwtModule } from '@org/backend-jwt';
import configuration from '@org/backend-config';
import { RedisModule } from '@org/backend-redis';
import { join } from 'path';
import { AuthModule } from '../api/auth/auth.module';
import { UserModule } from '../api/user/user.module';
import { EmailModule } from '../email/email.module';
import { HealthModule } from '../health/health.module';
import { QueueModule } from '../api/queue/queue.module';
import { ScraperLichDungSuModule } from '../api/scraper/lichdungsu/lichdungsu.module';
import { AppController } from './app.controller';
import { providers } from './app.provider';
import { AppService } from './app.service';
import { createQueueBoardAuth } from './queue-board-auth';

const { app: appConfig, queueBoard } = configuration();

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
      load: [configuration],
      expandVariables: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'client'),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 60,
      },
    ]),
    BullModule.forRootAsync({
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
    }),
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
      middleware: createQueueBoardAuth(
        queueBoard.user,
        queueBoard.password,
        appConfig.nodeEnv === 'production',
      ),
    }),
    DatabaseModule,
    JwtModule,
    CryptoModule,
    EmailModule,
    AuthModule,
    UserModule,
    RedisModule,
    HealthModule,
    QueueModule,
    ScraperLichDungSuModule,
  ],
  controllers: [AppController],
  providers: [AppService, ...providers],
})
export class AppModule {}
