import { QueueRole } from '@org/backend-config';
import { shouldConsumeJobs } from './queue-role';

describe('shouldConsumeJobs', () => {
  it('runs jobs in a single process, which is how a developer machine works', () => {
    expect(shouldConsumeJobs(QueueRole.BOTH)).toBe(true);
  });

  it('leaves the running of jobs to someone else when this process only serves the api', () => {
    expect(shouldConsumeJobs(QueueRole.PRODUCER)).toBe(false);
  });

  it('runs jobs when that is the whole reason this process exists', () => {
    expect(shouldConsumeJobs(QueueRole.CONSUMER)).toBe(true);
  });

  it('has at least one role that runs jobs, so work cannot be stranded by configuration alone', () => {
    const roles = [QueueRole.PRODUCER, QueueRole.CONSUMER, QueueRole.BOTH];

    expect(roles.some(shouldConsumeJobs)).toBe(true);
  });
});
