jest.mock('./validate/check-paragraphs', () => ({ checkParagraphs: jest.fn() }));

import { buildCongDanhMucBriefs, castNatal, Gender, type NatalChart } from '@org/shared-tu-vi';
import { AiClient } from '../../ai/ai.client';
import type { AiRequest, AiResult } from '../../ai/ai.types';
import { CongDanhGenerator } from './cong-danh.generator';
import { checkParagraphs } from './validate/check-paragraphs';

const LA_SO: NatalChart = castNatal({
  solarDate: new Date(1953, 0, 25),
  hour: 21,
  gender: Gender.Nam,
});

const BAI = JSON.stringify({ doan1: 'Hai câu. Câu nữa.', doan2: 'Hai câu. Câu nữa.' });

const BUDGET_MS = 60_000;

class AiGia extends AiClient {
  readonly requests: AiRequest[] = [];

  constructor(private readonly hangDoi: string[]) {
    super();
  }

  generate(request: AiRequest): Promise<AiResult> {
    this.requests.push(request);
    const text = this.hangDoi.shift() ?? '';
    return Promise.resolve({
      text,
      model: 'gia',
      inputTokens: 0,
      outputTokens: 0,
      failedAttempts: [],
      latencyMs: 0,
    });
  }
}

class AiTheoSchema extends AiClient {
  readonly requests: AiRequest[] = [];

  generate(request: AiRequest): Promise<AiResult> {
    this.requests.push(request);
    const laBaiChinh = 'doan1' in (request.schema.properties ?? {});
    const text = laBaiChinh ? BAI : JSON.stringify({ doan: 'Một câu. Câu nữa.' });
    return Promise.resolve({
      text,
      model: 'gia',
      inputTokens: 0,
      outputTokens: 0,
      failedAttempts: [],
      latencyMs: 0,
    });
  }
}

const kiem = checkParagraphs as jest.MockedFunction<typeof checkParagraphs>;

describe('CongDanhGenerator', () => {
  beforeEach(() => {
    kiem.mockReset().mockReturnValue([]);
  });

  it('ghép bài từ khung cố định và hai đoạn mô hình viết', async () => {
    const ai = new AiGia([BAI]);

    const ket = await new CongDanhGenerator(ai).generate(LA_SO, BUDGET_MS);

    expect(ket?.article.title).toBe('Công danh sự nghiệp');
    expect(ket?.article.sourceCung).toBe('Quan Lộc');
    expect(ket?.article.paragraphs).toHaveLength(3);
    expect(ket?.article.paragraphs.slice(1)).toEqual(['Hai câu. Câu nữa.', 'Hai câu. Câu nữa.']);
    expect(ket?.attempts).toBe(1);
  });

  it('gắn mục phụ vào bài, mỗi mục một lần gọi mô hình', async () => {
    const ai = new AiTheoSchema();
    const soMuc = buildCongDanhMucBriefs(LA_SO).length;

    const ket = await new CongDanhGenerator(ai).generate(LA_SO, BUDGET_MS);

    expect(soMuc).toBeGreaterThan(0);
    expect(ket?.article.sections).toHaveLength(soMuc);
    expect(ai.requests).toHaveLength(soMuc + 1);
  });
});
