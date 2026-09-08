import './instrument';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { createAppLogger } from './app/app.logger';
import { WorkerModule } from './worker/worker.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule, {
    bufferLogs: true,
  });
  app.useLogger(createAppLogger());
  app.enableShutdownHooks();

  Logger.log('🛠  Worker đang chạy, chờ job luận giải');
}

void bootstrap();
