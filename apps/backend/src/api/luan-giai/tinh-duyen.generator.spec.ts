jest.mock('./validate/check-paragraphs', () => ({ checkParagraphs: jest.fn() }));

import {
  buildTinhDuyenMucBriefs,
  castNatal,
  GiaDaoMucKey,
  Gender,
  type NatalChart,
} from '@org/shared-tu-vi';
import { AiClient } from '../../ai/ai.client';
import type { AiRequest, AiResult } from '../../ai/ai.types';
import { GIA_DAO_SYSTEM_PROMPT } from './prompt/tinh-duyen-prompt';
import { TinhDuyenGenerator } from './tinh-duyen.generator';
import { checkParagraphs } from './validate/check-paragraphs';

const LA_SO: NatalChart = castNatal({
  solarDate: new Date(1953, 0, 25),
  hour: 21,
  gender: Gender.Nam,
});

const BAI = JSON.stringify({ doan1: 'Hai câu. Câu nữa.', doan2: 'Hai câu. Câu nữa.' });
const BUDGET_MS = 60_000;
const GIA_DAO_SLUGS = ['con-cai', 'cha-me'];

class AiTheoSchema extends AiClient {
  readonly requests: AiRequest[] = [];

  generate(request: AiRequest): Promise<AiResult> {
    this.requests.push(request);
    const coHaiDoan = 'doan1' in (request.schema.properties ?? {});
    return Promise.resolve({
      text: coHaiDoan ? BAI : JSON.stringify({ doan: 'Một câu. Câu nữa.' }),
      model: 'gia',
      inputTokens: 0,
      outputTokens: 0,
      failedAttempts: [],
      latencyMs: 0,
    });
  }
}

function cungCuaBrief(request: AiRequest): unknown {
  const brief: unknown = JSON.parse(request.messages[0].text);
  return typeof brief === 'object' && brief !== null && 'cung' in brief ? brief.cung : undefined;
}

const kiem = checkParagraphs as jest.MockedFunction<typeof checkParagraphs>;

describe('TinhDuyenGenerator', () => {
  beforeEach(() => {
    kiem.mockReset().mockReturnValue([]);
  });

  it('ghép bài từ khung tình duyên và đọc cung Phu Thê', async () => {
    const ket = await new TinhDuyenGenerator(new AiTheoSchema()).generate(LA_SO, BUDGET_MS);

    expect(ket?.article.title).toBe('Tình duyên Gia đạo');
    expect(ket?.article.sourceCung).toBe('Phu Thê');
  });

  it('các mục ra theo thứ tự: phụ tinh Phu Thê trước, rồi con cái, rồi cha mẹ', async () => {
    const ket = await new TinhDuyenGenerator(new AiTheoSchema()).generate(LA_SO, BUDGET_MS);

    expect(ket?.article.sections?.map((section) => section.slug)).toEqual([
      ...buildTinhDuyenMucBriefs(LA_SO).map((muc) => muc.muc),
      ...GIA_DAO_SLUGS,
    ]);
  });

  it('mục con cái và cha mẹ mỗi mục hai đoạn', async () => {
    const ket = await new TinhDuyenGenerator(new AiTheoSchema()).generate(LA_SO, BUDGET_MS);

    const giaDao = ket?.article.sections?.filter((section) => GIA_DAO_SLUGS.includes(section.slug));
    expect(giaDao).toHaveLength(2);
    expect(giaDao?.every((section) => section.paragraphs.length === 2)).toBe(true);
  });

  it.each([
    [GiaDaoMucKey.ConCai, 'Tử Tức'],
    [GiaDaoMucKey.ChaMe, 'Phụ Mẫu'],
  ])('mục %s gửi brief cung %s bằng prompt riêng của mục đó', async (muc, cung) => {
    const ai = new AiTheoSchema();

    await new TinhDuyenGenerator(ai).generate(LA_SO, BUDGET_MS);

    const yeuCau = ai.requests.filter((request) => request.system === GIA_DAO_SYSTEM_PROMPT[muc]);
    expect(yeuCau.map(cungCuaBrief)).toEqual([cung]);
  });

  it('mỗi mục một lần gọi mô hình, cộng một lần cho bài chính', async () => {
    const ai = new AiTheoSchema();

    const ket = await new TinhDuyenGenerator(ai).generate(LA_SO, BUDGET_MS);

    expect(ai.requests).toHaveLength((ket?.article.sections?.length ?? 0) + 1);
  });

  it('mục Cha mẹ bị chặn đủ 5 lần thì chương vẫn trả về, chỉ thiếu mục đó', async () => {
    kiem.mockImplementation((brief) => (brief.cung === 'Phụ Mẫu' ? ['chặn'] : []));

    const ket = await new TinhDuyenGenerator(new AiTheoSchema()).generate(LA_SO, BUDGET_MS);

    const slugs = ket?.article.sections?.map((section) => section.slug) ?? [];
    expect(ket).not.toBeNull();
    expect(slugs).not.toContain('cha-me');
    expect(slugs).toContain('con-cai');
  });
});
