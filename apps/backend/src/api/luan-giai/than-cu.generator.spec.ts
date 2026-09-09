import { castNatal, Gender, type NatalChart } from '@org/shared-tu-vi';
import { AiClient } from '../../ai/ai.client';
import type { AiRequest, AiResult } from '../../ai/ai.types';
import {
  ChapterRejectedError,
  ChapterTimedOutError,
  MalformedChapterError,
} from './luan-giai.errors';
import { ThanCuGenerator } from './than-cu.generator';

const CO_BANG: NatalChart = castNatal({
  solarDate: new Date(1960, 4, 26),
  hour: 21,
  gender: Gender.Nam,
});
/** Cung an Thân vô chính diệu — không có sao nào để dựng mệnh đề nền, nên không bao giờ ra bài. */
const CHUA_SOAN: NatalChart = castNatal({
  solarDate: new Date(1985, 0, 3),
  hour: 21,
  gender: Gender.Nam,
});

const DAT = JSON.stringify({
  doan1:
    'Cung Phu Thê có **Liêm Trinh (H)** đi cùng **Tham Lang (H)**, cho thấy người bạn đời không dễ an phận. Có thêm **Thiên Y** đóng tại đây, người ấy thường ==có sức hút, giỏi giao tiếp và hợp duyên==, dễ được quý mến.',
  doan2:
    'Tuy nhiên, **Đại Hao, Kiếp Sát** cùng góp mặt nên đường tình cảm có lúc hao tán, tiêu tốn tâm sức và tiền bạc, cũng có giai đoạn chịu áp lực hoặc mất mát. Điều đáng chú ý là **Thiên Thọ** đóng tại đây chủ sự bền, giữ được lâu khi đã ổn định, vì vậy ==sóng gió thường nằm ở chặng đầu== hơn là ở cả chặng đường.',
});

const HONG = JSON.stringify({ doan1: 'Một câu thôi.', doan2: 'Cũng một câu thôi.' });

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

describe('ThanCuGenerator', () => {
  it('ghép bài từ khung cố định và hai đoạn mô hình viết', async () => {
    const ket = await new ThanCuGenerator(new AiGia([DAT])).generate(CO_BANG, BUDGET_MS);
    const article = ket?.article;

    expect(article?.title).toBe('Thân cư Phu Thê');
    expect(article?.subheading).toBe('Nam tuổi Tý – Thân cư Phu Thê');
    expect(article?.paragraphs).toHaveLength(3);
    expect(article?.paragraphs[0]).toContain('Thân cư Phu Thê');
  });

  it('sinh lại kèm danh sách lỗi khi bản đầu không qua bộ kiểm', async () => {
    const ai = new AiGia([HONG, DAT]);

    const ket = await new ThanCuGenerator(ai).generate(CO_BANG, BUDGET_MS);

    expect(ket?.attempts).toBe(2);
    expect(ai.requests).toHaveLength(2);
    expect(ai.requests[1].messages.at(-1)?.text).toContain('câu, cần đúng 2');
  });

  it('bỏ cuộc sau khi hết lượt và nêu rõ vi phạm còn lại', async () => {
    const ai = new AiGia([HONG, HONG, HONG, HONG, HONG]);

    await expect(new ThanCuGenerator(ai).generate(CO_BANG, BUDGET_MS)).rejects.toThrow(
      ChapterRejectedError,
    );
    expect(ai.requests).toHaveLength(5);
  });

  it('trả null khi cung an Thân vô chính diệu, không gọi mô hình', async () => {
    const ai = new AiGia([DAT]);

    await expect(new ThanCuGenerator(ai).generate(CHUA_SOAN, BUDGET_MS)).resolves.toBeNull();
    expect(ai.requests).toHaveLength(0);
  });

  it('dừng trước khi gọi mô hình nếu ngân sách thời gian không đủ cho một lượt', async () => {
    const ai = new AiGia([DAT]);

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
