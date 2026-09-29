import { QueueScheduler } from './queue.scheduler';
import { QueueService } from './queue.service';

function schedulerWith(scheduleHourly: jest.Mock): QueueScheduler {
  const queue = { scheduleHourly } as unknown as QueueService;
  return new QueueScheduler(queue);
}

describe('QueueScheduler', () => {
  it('registers the recurring work as soon as the process is ready to run jobs', async () => {
    const scheduleHourly = jest.fn().mockResolvedValue(undefined);

    await schedulerWith(scheduleHourly).onModuleInit();

    expect(scheduleHourly).toHaveBeenCalledTimes(1);
  });

  it('starts anyway when the schedule cannot be registered, so a Redis blip does not stop the worker', async () => {
    const scheduleHourly = jest.fn().mockRejectedValue(new Error('redis is down'));

    await expect(schedulerWith(scheduleHourly).onModuleInit()).resolves.toBeUndefined();
  });
});
