import { Module } from '@nestjs/common';
import { SentryModule } from '@sentry/nestjs/setup';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from '@org/backend-database';
import { CryptoModule } from '@org/backend-crypto';
import { JwtModule } from '@org/backend-jwt';
import configuration from '@org/backend-config';
import { RedisModule } from '@org/backend-redis';
import { join } from 'path';
import { AuthModule } from '../api/auth/auth.module';
import { LaSoModule } from '../api/la-so/la-so.module';
import { LuanGiaiModule } from '../api/luan-giai/luan-giai.module';
import { UserModule } from '../api/user/user.module';
import { EmailModule } from '../email/email.module';
import { StorageModule } from '../storage/storage.module';
import { HealthModule } from '../health/health.module';
import { QueueModule } from '../api/queue/queue.module';
import { VanHanModule } from '../api/van-han/van-han.module';
import { AdminModule } from '../api/admin/admin.module';
import { AppController } from './app.controller';
import { providers } from './app.provider';
import { AppService } from './app.service';
import { bullRootImport } from './bull-root';
import { graphqlRootImport } from './graphql-root';
import { queueBoardRootImports } from './queue-board-registration';

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
    bullRootImport(),
    graphqlRootImport(),
    ...queueBoardRootImports(),
    DatabaseModule,
    JwtModule,
    CryptoModule,
    EmailModule,
    StorageModule,
    AuthModule,
    UserModule,
    LaSoModule,
    LuanGiaiModule,
    RedisModule,
    HealthModule,
    QueueModule,
    VanHanModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService, ...providers],
})
export class AppModule {}
