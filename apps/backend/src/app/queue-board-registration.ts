import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';
import type { DynamicModule } from '@nestjs/common';
import configuration from '@org/backend-config';
import { createQueueBoardAuth } from './queue-board-auth';

const { app: appConfig, queueBoard } = configuration();

const QUEUE_BOARD_ROUTE = '/queues';

/**
 * The dashboard is all-or-nothing: `forFeature` resolves a provider that only `forRoot` supplies,
 * so a queue registering itself while the root is absent fails the whole application at boot.
 */
export function queueBoardRootImports(): DynamicModule[] {
  if (!queueBoard.enabled) return [];

  return [
    BullBoardModule.forRoot({
      route: QUEUE_BOARD_ROUTE,
      adapter: ExpressAdapter,
      middleware: createQueueBoardAuth(
        queueBoard.user,
        queueBoard.password,
        appConfig.nodeEnv === 'production',
      ),
    }),
  ];
}

export function queueBoardFeatureImports(name: string): DynamicModule[] {
  if (!queueBoard.enabled) return [];

  return [BullBoardModule.forFeature({ name, adapter: BullMQAdapter })];
}
