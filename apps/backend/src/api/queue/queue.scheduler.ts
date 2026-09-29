import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { QueueService } from './queue.service';

@Injectable()
export class QueueScheduler implements OnModuleInit {
  private readonly logger = new Logger(QueueScheduler.name);

  constructor(private readonly queue: QueueService) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.queue.scheduleHourly();
    } catch (error: unknown) {
      this.logger.error({ message: 'Could not register the recurring jobs', error });
    }
  }
}
