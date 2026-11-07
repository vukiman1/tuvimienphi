import {
  TET_HUB_VIEW_YEAR,
  TUOI_NAM_FIRST_BIRTH_YEAR,
  TUOI_NAM_LAST_BIRTH_YEAR,
} from '@org/shared-tu-vi';
import type { AiClient } from '../ai/port/ai.client';
import type { AiSchema } from '../ai/port/ai.types';
import { runWithAiCallContext } from '../ai/port/ai-call-context';
import { sinhVoiKiem, type CachSinh } from '../api/luan-giai/generation/sinh-voi-kiem';
import { forbiddenPhraseViolations, paragraphCountViolations } from './check-text';
import { isRecord, isStringArray } from './schema-guards';
import type { TetHubIntro } from './tet-hub-writer';

const MIN_PARAGRAPHS = 2;
const MAX_PARAGRAPHS = 3;
const INTRO_BUDGET_MS = 120_000;
const INTRO_LABEL = 'tet-hub:hub-intro';

const HUB_INTRO_SYSTEM_PROMPT = `Bạn viết đoạn giới thiệu cho trang tổng hợp "Tử vi ${TET_HUB_VIEW_YEAR} theo tuổi" của một website tử vi tiếng Việt.

Phạm vi của trang tổng hợp: liên kết tới trang riêng cho từng năm sinh âm lịch từ ${TUOI_NAM_FIRST_BIRTH_YEAR} đến ${TUOI_NAM_LAST_BIRTH_YEAR} (sao chiếu mệnh, hạn, Kim lâu, Hoang ốc, mệnh năm sinh với mệnh năm xem, lời khuyên theo giai đoạn đời) và tới trang cho từng con giáp (Tam tai, Thái tuế, tuổi hợp xông đất năm ${TET_HUB_VIEW_YEAR}).

Quy tắc bắt buộc:
- Giọng bình tĩnh, thực tế, giải thích đây là cách xem của dân gian. Không dọa, không bán hàng, không khuyên cúng bái hay mua sắm. Không nhắc con số hay kết luận cụ thể nào cho từng tuổi.
- Gồm từ ${MIN_PARAGRAPHS} đến ${MAX_PARAGRAPHS} đoạn văn xuôi tiếng Việt, không markdown, không gạch đầu dòng.

Trả về JSON đúng schema.`;

const HUB_INTRO_REQUEST = `Viết đoạn giới thiệu cho trang tổng hợp Tử vi ${TET_HUB_VIEW_YEAR} theo tuổi.`;

const HUB_INTRO_SCHEMA: AiSchema = {
  type: 'object',
  properties: {
    intro: {
      type: 'array',
      items: { type: 'string', description: 'Một đoạn văn' },
      description: `Từ ${MIN_PARAGRAPHS} đến ${MAX_PARAGRAPHS} đoạn văn`,
    },
  },
  required: ['intro'],
};

export class MalformedHubIntroError extends Error {
  constructor(readonly raw: string) {
    super('model returned something that is not the expected Tết hub intro object');
    this.name = 'MalformedHubIntroError';
  }
}

function isTetHubIntro(value: unknown): value is TetHubIntro {
  return isRecord(value) && isStringArray(value.intro);
}

function parseHubIntro(text: string): TetHubIntro {
  const parsed: unknown = JSON.parse(text);
  if (!isTetHubIntro(parsed)) throw new MalformedHubIntroError(text);
  return { intro: parsed.intro };
}

function checkHubIntro({ intro }: TetHubIntro): readonly string[] {
  return [
    ...paragraphCountViolations('intro', intro, MIN_PARAGRAPHS, MAX_PARAGRAPHS),
    ...forbiddenPhraseViolations(intro.join('\n')),
  ];
}

const HUB_INTRO_GENERATION: CachSinh<TetHubIntro> = {
  system: HUB_INTRO_SYSTEM_PROMPT,
  schema: HUB_INTRO_SCHEMA,
  messages: () => [{ role: 'user', text: HUB_INTRO_REQUEST }],
  parse: parseHubIntro,
  check: checkHubIntro,
};

export async function generateHubIntro(
  ai: AiClient,
  beforeAttempt: () => Promise<void>,
): Promise<TetHubIntro> {
  const { value } = await runWithAiCallContext({ label: INTRO_LABEL }, () =>
    sinhVoiKiem(ai, HUB_INTRO_GENERATION, INTRO_BUDGET_MS, undefined, beforeAttempt),
  );
  return value;
}
