import { Logger } from '@nestjs/common';
import type { AiMessage } from '../ai/port/ai.types';
import type { LanThu } from '../api/luan-giai/generation/sinh-voi-kiem';

type RejectionLogger = (attempt: number, model: string, violations: readonly string[]) => void;

const logger = new Logger('TetHubGeneration');

function rewriteRequest(violations: readonly string[]): string {
  return `Bản trên vi phạm:\n${violations.map((violation) => `- ${violation}`).join('\n')}\nViết lại cho đúng, giữ nguyên nội dung các mệnh đề.`;
}

export function rejectedAttemptMessages<T>(daThu: readonly LanThu<T>[]): AiMessage[] {
  return daThu.flatMap((lan): AiMessage[] => [
    { role: 'model', text: JSON.stringify(lan.paragraph) },
    { role: 'user', text: rewriteRequest(lan.loi) },
  ]);
}

export function logRejectedAttempt(label: string): RejectionLogger {
  return (attempt: number, model: string, violations: readonly string[]): void => {
    logger.warn(`${label} attempt ${attempt} (${model}) rejected: ${violations.join('; ')}`);
  };
}
