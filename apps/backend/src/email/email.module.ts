import { BullModule } from '@nestjs/bullmq';
import { Global, Module, type Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '@org/backend-config';
import { shouldConsumeJobs } from '../api/queue/queue-role';
import { producerConnection, type RedisSettings } from '../app/redis-connection';
import { EMAIL_QUEUE } from './email-job';
import { EmailQueueService } from './email-queue.service';
import { EmailProcessor } from './email.processor';
import { EmailService } from './email.service';

const { queue } = configuration();

function emailRunners(): Provider[] {
  return shouldConsumeJobs(queue.role) ? [EmailProcessor] : [];
}

@Global()
@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueueAsync({
      name: EMAIL_QUEUE,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: producerConnection(config.getOrThrow<RedisSettings>('redis')),
      }),
    }),
  ],
  providers: [EmailService, EmailQueueService, ...emailRunners()],
  exports: [EmailService, EmailQueueService],
})
export class EmailModule {}
