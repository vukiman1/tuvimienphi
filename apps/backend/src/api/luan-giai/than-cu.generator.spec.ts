/**
 * Bộ kiểm được mock: spec này kiểm chuyện ĐIỀU PHỐI — sinh lại mấy lần, dừng khi nào, trả gì khi
 * bảng chưa soạn — chứ không kiểm nội dung. Để nó gọi bộ kiểm thật thì mỗi lần đổi bảng luận là
 * spec vỡ, dù phần điều phối không đụng tới.
 */
jest.mock('./validate/check-paragraphs', () => ({ checkParagraphs: jest.fn() }));

// `buildThanCuBrief` cũng mock: sau khi bảng phủ 100% thì không còn lá số thật nào cho ra null,
// mà đường null vẫn phải giữ làm lưới an toàn khi bảng thay đổi.
jest.mock('@org/shared-tu-vi', () => ({
  ...jest.requireActual('@org/shared-tu-vi'),
  buildThanCuBrief: jest.fn(),
}));

import { buildThanCuBrief, castNatal, Gender, type NatalChart } from '@org/shared-tu-vi';
import { AiClient } from '../../ai/ai.client';
import type { AiRequest, AiResult } from '../../ai/ai.types';
import {
  ChapterRejectedError,
  ChapterTimedOutError,
  MalformedChapterError,
} from './luan-giai.errors';
import { ThanCuGenerator } from './than-cu.generator';
import { checkParagraphs } from './validate/check-paragraphs';

const CO_BANG: NatalChart = castNatal({
  solarDate: new Date(1960, 4, 26),
  hour: 21,
  gender: Gender.Nam,
});

const BAI = JSON.stringify({ doan1: 'Hai câu. Câu nữa.', doan2: 'Hai câu. Câu nữa.' });

/** Rộng rãi để test hành vi chứ không test đồng hồ. */
const BUDGET_MS = 60_000;

class AiGia extends AiClient {
  readonly requests: AiRequest[] = [];

  constructor(private readonly hangDoi: string[]) {
    super();
  }

  generate(request: AiRequest): Promise<AiResult> {
    this.requests.push(request);
    const text = this.hangDoi.shift() ?? '';
    return Promise.resolve({ text, model: 'gia', outputTokens: 0 });
  }
}

const kiem = checkParagraphs as jest.MockedFunction<typeof checkParagraphs>;
const dungBrief = buildThanCuBrief as jest.MockedFunction<typeof buildThanCuBrief>;
const BRIEF_THAT = jest.requireActual('@org/shared-tu-vi').buildThanCuBrief(CO_BANG);
const DAT_HET: string[] = [];
const VI_PHAM = ['đoạn 2: 3 câu, cần đúng 2'];

describe('ThanCuGenerator', () => {
  beforeEach(() => {
    kiem.mockReset();
    dungBrief.mockReset().mockReturnValue(BRIEF_THAT);
  });

  it('ghép bài từ khung cố định và hai đoạn mô hình viết', async () => {
    kiem.mockReturnValue(DAT_HET);

    const ket = await new ThanCuGenerator(new AiGia([BAI])).generate(CO_BANG, BUDGET_MS);
    const article = ket?.article;

    expect(article?.title).toBe('Thân cư Phu Thê');
    expect(article?.subheading).toBe('Nam tuổi Tý – Thân cư Phu Thê');
    expect(article?.paragraphs).toHaveLength(3);
    expect(article?.paragraphs[0]).toContain('Thân cư Phu Thê');
  });

  it('sinh lại kèm danh sách lỗi khi bản đầu không qua bộ kiểm', async () => {
    kiem.mockReturnValueOnce(VI_PHAM).mockReturnValue(DAT_HET);
    const ai = new AiGia([BAI, BAI]);

    const ket = await new ThanCuGenerator(ai).generate(CO_BANG, BUDGET_MS);

    expect(ket?.attempts).toBe(2);
    expect(ai.requests).toHaveLength(2);
    expect(ai.requests[1].messages.at(-1)?.text).toContain('câu, cần đúng 2');
  });

  it('bỏ cuộc sau khi hết lượt và nêu rõ vi phạm còn lại', async () => {
    kiem.mockReturnValue(VI_PHAM);
    const ai = new AiGia([BAI, BAI, BAI, BAI, BAI]);

    await expect(new ThanCuGenerator(ai).generate(CO_BANG, BUDGET_MS)).rejects.toThrow(
      ChapterRejectedError,
    );
    expect(ai.requests).toHaveLength(5);
  });

  it('trả null mà không gọi mô hình khi không dựng nổi brief', async () => {
    dungBrief.mockReturnValue(null);
    const ai = new AiGia([BAI]);

    await expect(new ThanCuGenerator(ai).generate(CO_BANG, BUDGET_MS)).resolves.toBeNull();
    expect(ai.requests).toHaveLength(0);
  });

  it('dừng trước khi gọi mô hình nếu ngân sách thời gian không đủ cho một lượt', async () => {
    const ai = new AiGia([BAI]);

    await expect(new ThanCuGenerator(ai).generate(CO_BANG, 100)).rejects.toThrow(
      ChapterTimedOutError,
    );
    expect(ai.requests).toHaveLength(0);
  });

  it('ném lỗi khi mô hình trả về thứ không phải hai đoạn', async () => {
    const ai = new AiGia(['không phải json']);

    await expect(new ThanCuGenerator(ai).generate(CO_BANG, BUDGET_MS)).rejects.toThrow(
      MalformedChapterError,
    );
  });
});
