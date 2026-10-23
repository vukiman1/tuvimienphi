jest.mock('./validate/check-paragraphs', () => ({ checkParagraphs: jest.fn() }));

import {
  buildGiaDaoMucBriefs,
  buildTaiBachBrief,
  castNatal,
  GiaDaoMucKey,
  Gender,
  type NatalChart,
} from '@org/shared-tu-vi';
import { AiClient } from '../../ai/port/ai.client';
import type { AiRequest, AiResult } from '../../ai/port/ai.types';
import { type CungChapter, CungChapterGenerator, MucKind } from './cung-chapter.generator';
import { TAI_BACH_SYSTEM_PROMPT } from './prompt/tai-bach-prompt';
import { KHUNG_TAI_BACH } from './prompt/khung-tai-bach';
import { MAX_ATTEMPTS } from './sinh-voi-kiem';
import { checkParagraphs } from './validate/check-paragraphs';

const LA_SO: NatalChart = castNatal({
  solarDate: new Date(1953, 0, 25),
  hour: 21,
  gender: Gender.Nam,
});

const MUC_PHU_MAU = buildGiaDaoMucBriefs(LA_SO).find((muc) => muc.muc === GiaDaoMucKey.ChaMe);
if (!MUC_PHU_MAU) throw new Error('fixture LA_SO không dựng nổi brief Phụ Mẫu');

const PROMPT_MUC = 'PROMPT-THU';
const BUDGET_MS = 60_000;
const BAI_HAI_DOAN = JSON.stringify({ doan1: 'Hai câu. Câu nữa.', doan2: 'Hai câu. Câu nữa.' });
const BAI_MOT_DOAN = JSON.stringify({ doan: 'Một câu. Câu nữa.' });

const CHAPTER_THU = {
  buildBrief: buildTaiBachBrief,
  buildMucs: () => [{ kind: MucKind.CungKhac, brief: MUC_PHU_MAU, systemPrompt: PROMPT_MUC }],
  systemPrompt: TAI_BACH_SYSTEM_PROMPT,
  khung: KHUNG_TAI_BACH,
} satisfies CungChapter;

class ChuongThu extends CungChapterGenerator {
  constructor(ai: AiClient) {
    super(ai, CHAPTER_THU);
  }
}

class AiTheoSchema extends AiClient {
  readonly requests: AiRequest[] = [];

  generate(request: AiRequest): Promise<AiResult> {
    this.requests.push(request);
    const coHaiDoan = 'doan1' in (request.schema.properties ?? {});
    return Promise.resolve({
      text: coHaiDoan ? BAI_HAI_DOAN : BAI_MOT_DOAN,
      model: 'gia',
      inputTokens: 0,
      outputTokens: 0,
      failedAttempts: [],
      latencyMs: 0,
    });
  }

  requestsOf(system: string): AiRequest[] {
    return this.requests.filter((request) => request.system === system);
  }
}

const kiem = checkParagraphs as jest.MockedFunction<typeof checkParagraphs>;

describe('CungChapterGenerator mục cung khác', () => {
  beforeEach(() => {
    kiem.mockReset().mockReturnValue([]);
  });

  it('mục cung khác được viết hai đoạn bằng prompt riêng của nó', async () => {
    const ai = new AiTheoSchema();

    const ket = await new ChuongThu(ai).generate(LA_SO, BUDGET_MS);

    const [yeuCau] = ai.requestsOf(PROMPT_MUC);
    expect(yeuCau.schema.properties).toHaveProperty('doan1');
    expect(ket?.article.sections).toHaveLength(1);
    expect(ket?.article.sections?.[0].paragraphs).toHaveLength(2);
    expect(ket?.article.sections?.[0].sourceCung).toMatch(/^Phụ Mẫu · /);
  });

  it('brief gửi cho mô hình ở mục cung khác không kèm trường riêng của mục', async () => {
    const ai = new AiTheoSchema();

    await new ChuongThu(ai).generate(LA_SO, BUDGET_MS);

    const [yeuCau] = ai.requestsOf(PROMPT_MUC);
    const noiDung = JSON.stringify(yeuCau.messages[0]);
    for (const truong of ['"muc"', '"tieuDe"', '"sourceCung"', '"duKien"']) {
      expect(noiDung).not.toContain(truong.replace(/"/g, '\\"'));
    }
  });

  it('mục cung khác bị chặn đủ MAX_ATTEMPTS lần thì chỉ mất mục đó, bài chính vẫn trả về', async () => {
    kiem.mockImplementation((brief) => (brief.cung === 'Phụ Mẫu' ? ['chặn'] : []));
    const ai = new AiTheoSchema();

    const ket = await new ChuongThu(ai).generate(LA_SO, BUDGET_MS);

    expect(ket).not.toBeNull();
    expect(ket?.article.sections ?? []).toHaveLength(0);
    expect(ai.requestsOf(PROMPT_MUC)).toHaveLength(MAX_ATTEMPTS);
  });
});
