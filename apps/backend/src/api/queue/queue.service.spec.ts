import { Queue } from 'bullmq';
import { SCHEDULER_TIMEZONE } from './queue.constants';
import { QueueService } from './queue.service';

function serviceWith(upsertJobScheduler: jest.Mock): QueueService {
  const queue = { upsertJobScheduler } as unknown as Queue;
  return new QueueService(queue);
}

describe('QueueService.scheduleHourly', () => {
  it('pins the schedule to UTC rather than trusting whatever clock the host runs', async () => {
    const upsertJobScheduler = jest.fn().mockResolvedValue(undefined);

    await serviceWith(upsertJobScheduler).scheduleHourly();

    const [, repeatOptions] = upsertJobScheduler.mock.calls[0];
    expect(repeatOptions).toMatchObject({ tz: SCHEDULER_TIMEZONE });
    expect(SCHEDULER_TIMEZONE).toBe('UTC');
  });
});
