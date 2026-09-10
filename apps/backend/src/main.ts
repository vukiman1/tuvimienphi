import './instrument';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app/app.module';
import { GLOBAL_PREFIX, configureApp } from './app/configure-app';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
  configureApp(app);
  // A container host stops the process with SIGTERM on every deploy. Without this the process dies
  // where it stands: requests in flight are cut and the database and Redis pools never close.
  app.enableShutdownHooks();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${GLOBAL_PREFIX}`);
}

bootstrap();
