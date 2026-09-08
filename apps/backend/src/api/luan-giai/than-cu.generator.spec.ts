import { castNatal, Gender, type NatalChart } from '@org/shared-tu-vi';
import { AiClient } from '../../ai/ai.client';
import type { AiRequest, AiResult } from '../../ai/ai.types';
import { ChapterRejectedError, MalformedChapterError } from './luan-giai.errors';
import { ThanCuGenerator } from './than-cu.generator';

const CO_BANG: NatalChart = castNatal({
  solarDate: new Date(1960, 4, 26),
  hour: 21,
  gender: Gender.Nam,
});
/** Thân cư Phu Thê nhưng chính tinh là Cự Môn — bảng chưa soạn tới. */
const CHUA_SOAN: NatalChart = castNatal({
  solarDate: new Date(1985, 4, 20),
  hour: 9,
  gender: Gender.Nam,
});

const DAT = JSON.stringify({
  doan1:
    'Cung Phu Thê có **Liêm Trinh (H)** đi cùng **Tham Lang (H)**, cho thấy người bạn đời không dễ an phận. Có thêm **Thiên Y** đóng tại đây, người ấy thường ==có sức hút, giỏi giao tiếp và hợp duyên==, dễ được quý mến.',
  doan2:
    'Tuy nhiên, **Đại Hao, Kiếp Sát** cùng góp mặt nên đường tình cảm có lúc hao tán, tiêu tốn tâm sức và tiền bạc, cũng có giai đoạn chịu áp lực hoặc mất mát. Điều đáng chú ý là **Thiên Thọ** đóng tại đây chủ sự bền, giữ được lâu khi đã ổn định, vì vậy ==sóng gió thường nằm ở chặng đầu== hơn là ở cả chặng đường.',
});

const HONG = JSON.stringify({ doan1: 'Một câu thôi.', doan2: 'Cũng một câu thôi.' });

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
    const ket = await new ThanCuGenerator(new AiGia([DAT])).generate(CO_BANG);
    const article = ket?.article;

    expect(article?.title).toBe('Thân cư Phu Thê');
    expect(article?.subheading).toBe('Nam tuổi Tý – Thân cư Phu Thê');
    expect(article?.paragraphs).toHaveLength(3);
    expect(article?.paragraphs[0]).toContain('Thân cư Phu Thê');
  });

  it('sinh lại kèm danh sách lỗi khi bản đầu không qua bộ kiểm', async () => {
    const ai = new AiGia([HONG, DAT]);

    const ket = await new ThanCuGenerator(ai).generate(CO_BANG);

    expect(ket?.attempts).toBe(2);
    expect(ai.requests).toHaveLength(2);
    expect(ai.requests[1].messages.at(-1)?.text).toContain('câu, cần đúng 2');
  });

  it('bỏ cuộc sau ba lần và nêu rõ vi phạm còn lại', async () => {
    const ai = new AiGia([HONG, HONG, HONG]);

    await expect(new ThanCuGenerator(ai).generate(CO_BANG)).rejects.toThrow(ChapterRejectedError);
    expect(ai.requests).toHaveLength(3);
  });

  it('trả null khi bảng luận chưa soạn tới lá số, không gọi mô hình', async () => {
    const ai = new AiGia([DAT]);

    await expect(new ThanCuGenerator(ai).generate(CHUA_SOAN)).resolves.toBeNull();
    expect(ai.requests).toHaveLength(0);
  });

  it('ném lỗi khi mô hình trả về thứ không phải hai đoạn', async () => {
    const ai = new AiGia(['không phải json']);

    await expect(new ThanCuGenerator(ai).generate(CO_BANG)).rejects.toThrow(MalformedChapterError);
  });
});
