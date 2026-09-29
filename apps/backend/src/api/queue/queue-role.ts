import { QueueRole } from '@org/backend-config';

export function shouldConsumeJobs(role: QueueRole): boolean {
  return role === QueueRole.CONSUMER || role === QueueRole.BOTH;
}
