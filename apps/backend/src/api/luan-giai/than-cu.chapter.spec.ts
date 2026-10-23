jest.mock('./validate/check-paragraphs', () => ({ checkParagraphs: jest.fn() }));

import { castNatal, Gender, type NatalChart } from '@org/shared-tu-vi';
import { AiClient } from '../../ai/port/ai.client';
import type { AiRequest, AiResult } from '../../ai/port/ai.types';
import { ChapterGenerator } from './chapter-generator';
import { THAN_CU_CHAPTER } from './than-cu.chapter';
import { checkParagraphs } from './validate/check-paragraphs';

const CO_BANG: NatalChart = castNatal({
  solarDate: new Date(1960, 4, 26),
  hour: 21,
  gender: Gender.Nam,
});

const BAI = JSON.stringify({ doan1: 'Hai câu. Câu nữa.', doan2: 'Hai câu. Câu nữa.' });
const BUDGET_MS = 60_000;

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

describe('THAN_CU_CHAPTER', () => {
  beforeEach(() => {
    kiem.mockReset().mockReturnValue([]);
  });

  it('ghép bài từ khung cố định và hai đoạn mô hình viết', async () => {
    const ket = await new ChapterGenerator(new AiTheoSchema()).generate(
      THAN_CU_CHAPTER,
      CO_BANG,
      BUDGET_MS,
    );
    const article = ket?.article;

    expect(article?.title).toBe('Thân cư Phu Thê');
    expect(article?.subheading).toBe('Nam tuổi Tý – Thân cư Phu Thê');
    expect(article?.paragraphs).toHaveLength(3);
    expect(article?.paragraphs[0]).toContain('Thân cư Phu Thê');
  });
});
