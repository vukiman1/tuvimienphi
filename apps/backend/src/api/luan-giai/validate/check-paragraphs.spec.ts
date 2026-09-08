import { buildThanCuBrief, castNatal, Gender, type ThanCuBrief } from '@org/shared-tu-vi';
import type { ThanCuParagraphs } from '../prompt/chapter-schema';
import { checkParagraphs } from './check-paragraphs';

const BRIEF: ThanCuBrief = buildThanCuBrief(
  castNatal({ solarDate: new Date(1960, 4, 26), hour: 21, gender: Gender.Nam }),
) as ThanCuBrief;

const DAT: ThanCuParagraphs = {
  doan1:
    'Cung Phu Thê có **Liêm Trinh (H)** đi cùng **Tham Lang (H)**, cho thấy người bạn đời không dễ an phận. Có thêm **Thiên Y** đóng tại đây, người ấy thường ==có sức hút, giỏi giao tiếp và hợp duyên==, dễ được quý mến.',
  doan2:
    'Tuy nhiên, **Đại Hao, Kiếp Sát** cùng góp mặt nên đường tình cảm có lúc hao tán, tiêu tốn tâm sức và tiền bạc, cũng có giai đoạn chịu áp lực hoặc mất mát. Điều đáng chú ý là **Thiên Thọ** đóng tại đây chủ sự bền, giữ được lâu khi đã ổn định, vì vậy ==sóng gió thường nằm ở chặng đầu== hơn là ở cả chặng đường.',
};

describe('checkParagraphs', () => {
  it('cho qua bản viết đúng cả ba tầng', () => {
    expect(checkParagraphs(BRIEF, DAT)).toEqual([]);
  });

  it('chặn sao có thật nhưng không có trong lá số', () => {
    const loi = checkParagraphs(BRIEF, {
      ...DAT,
      doan2: DAT.doan2.replace('**Đại Hao, Kiếp Sát**', '**Đại Hao, Kiếp Sát, Thiên Diêu**'),
    });
    expect(loi).toContain('đoạn 2: "Thiên Diêu" không có trong brief');
  });

  it('chặn chính tinh nhắc mà thiếu bậc', () => {
    const loi = checkParagraphs(BRIEF, {
      ...DAT,
      doan1: DAT.doan1.replace('**Tham Lang (H)**', '**Tham Lang**'),
    });
    expect(loi).toContain('đoạn 1: chính tinh "Tham Lang" thiếu bậc');
  });

  it('chặn phụ tinh cùng vai bị tách thành nhiều cặp', () => {
    const loi = checkParagraphs(BRIEF, {
      ...DAT,
      doan2: DAT.doan2.replace('**Đại Hao, Kiếp Sát**', '**Đại Hao** và **Kiếp Sát**'),
    });
    expect(loi).toContain('đoạn 2: hung tinh tách thành 2 cặp **');
  });

  it('chặn đoạn viết thành ba câu', () => {
    const loi = checkParagraphs(BRIEF, {
      ...DAT,
      doan2: `${DAT.doan2} Nhưng mọi thử thách rồi cũng qua.`,
    });
    expect(loi).toContain('đoạn 2: 3 câu, cần đúng 2');
  });

  it('chặn mệnh đề bất lợi bị viết nhạt đi cho dễ đọc', () => {
    const loi = checkParagraphs(BRIEF, {
      ...DAT,
      doan2:
        'Tuy nhiên, **Đại Hao, Kiếp Sát** cùng góp mặt nên đường tình cảm đôi khi cần thêm sự khéo léo. Điều đáng chú ý là **Thiên Thọ** đóng tại đây chủ sự bền, giữ được lâu khi đã ổn định, vì vậy ==sóng gió thường nằm ở chặng đầu== hơn là ở cả chặng đường.',
    });
    expect(loi.join('\n')).toMatch(/hao tán/);
    expect(loi.join('\n')).toMatch(/áp lực/);
  });

  it('chặn mệnh đề bị gán cho sao không sinh ra nó', () => {
    const loi = checkParagraphs(BRIEF, {
      ...DAT,
      doan2:
        'Tuy nhiên, **Kiếp Sát** góp mặt nên đường tình cảm có lúc hao tán, tiêu tốn tâm sức và tiền bạc, cũng có giai đoạn chịu áp lực hoặc mất mát. Điều đáng chú ý là **Thiên Thọ** đóng tại đây chủ sự bền, giữ được lâu khi đã ổn định, vì vậy ==sóng gió thường nằm ở chặng đầu== hơn là ở cả chặng đường.',
    });
    expect(loi.join('\n')).toMatch(/quy kết sai.*Đại Hao/);
  });
});
