import type { ChapterBrief } from '@org/shared-tu-vi';
import type { AiMessage } from '../../../ai/port/ai.types';
import type { LanThu } from '../sinh-voi-kiem';
import { serializeBriefForPrompt } from './serialize-brief';

function yeuCauVietLai(loi: readonly string[]): string {
  return `Bản trên vi phạm:\n${loi.map((mot) => `- ${mot}`).join('\n')}\nViết lại cho đúng, giữ nguyên nội dung mệnh đề.`;
}

export function buildMessages<T>(brief: ChapterBrief, daThu: readonly LanThu<T>[]): AiMessage[] {
  return [
    { role: 'user', text: serializeBriefForPrompt(brief) },
    ...daThu.flatMap((lan): AiMessage[] => [
      { role: 'model', text: JSON.stringify(lan.paragraph) },
      { role: 'user', text: yeuCauVietLai(lan.loi) },
    ]),
  ];
}
