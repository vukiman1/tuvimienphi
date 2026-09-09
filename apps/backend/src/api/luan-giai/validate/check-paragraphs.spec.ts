import { Sac, TheChieu, type ThanCuBrief } from '@org/shared-tu-vi';
import type { ThanCuParagraphs } from '../prompt/chapter-schema';
import { checkParagraphs } from './check-paragraphs';

/**
 * Brief viết cố định chứ không suy từ một lá số thật: hợp đồng của bộ kiểm là `(brief, bài)`, nên
 * nó không được vỡ mỗi lần bảng luận đổi nội dung.
 */
const BRIEF: ThanCuBrief = {
  cungThan: 'Phu Thê',
  chi: 'Tị',
  gioiTinh: 'nam' as ThanCuBrief['gioiTinh'],
  chiNamSinh: 'Tý',
  chinhTinh: [
    { ten: 'Liêm Trinh', bac: 'H' },
    { ten: 'Tham Lang', bac: 'H' },
  ],
  laVoChinhDieu: false,
  hungTinh: [
    { ten: 'Đại Hao', the: TheChieu.ToaThu },
    { ten: 'Kiếp Sát', the: TheChieu.ToaThu },
  ],
  catTinh: [
    { ten: 'Thiên Y', the: TheChieu.ToaThu },
    { ten: 'Thiên Thọ', the: TheChieu.TamHop },
  ],
  anNgu: 'Tuần',
  luan: [
    {
      y: 'người bạn đời có sức hút, giỏi giao tiếp',
      do: ['Liêm Trinh', 'Tham Lang'],
      sac: Sac.Thuan,
      trong: 90,
      tuKhoa: ['sức hút', 'giao tiếp'],
    },
    {
      y: 'hợp duyên, dễ được người khác giới quý mến',
      do: ['Thiên Y'],
      sac: Sac.Thuan,
      trong: 45,
      tuKhoa: ['hợp duyên', 'quý mến'],
    },
    {
      y: 'hao tán, dễ tiêu tốn tâm sức và tiền bạc',
      do: ['Đại Hao'],
      sac: Sac.Nghich,
      trong: 65,
      tuKhoa: ['hao tán', 'tiêu tốn'],
    },
    {
      y: 'có giai đoạn chịu áp lực hoặc mất mát',
      do: ['Kiếp Sát'],
      sac: Sac.Nghich,
      trong: 60,
      tuKhoa: ['áp lực', 'mất mát'],
    },
    {
      y: 'có yếu tố bền, giữ được lâu khi đã ổn định',
      do: ['Thiên Thọ'],
      sac: Sac.HoaGiai,
      trong: 55,
      tuKhoa: ['bền', 'giữ được lâu'],
    },
  ],
};

const DAT: ThanCuParagraphs = {
  doan1:
    'Cung Phu Thê có **Liêm Trinh (H)** đi cùng **Tham Lang (H)**, cho thấy người bạn đời có sức hút và giỏi giao tiếp. Có thêm **Thiên Y** đóng tại đây, người ấy cũng ==hợp duyên và được quý mến==.',
  doan2:
    'Tuy nhiên, **Đại Hao, Kiếp Sát** cùng góp mặt nên đường tình cảm có lúc hao tán, tiêu tốn tâm sức, cũng có giai đoạn chịu áp lực hoặc mất mát. Điều đáng chú ý là **Thiên Thọ** hội chiếu tới, chủ sự bền và giữ được lâu khi đã ổn định, vì vậy ==sóng gió thường nằm ở chặng đầu== hơn là ở cả chặng đường.',
};

describe('checkParagraphs', () => {
  it('cho qua bản viết đúng cả năm tầng', () => {
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
    const loi = checkParagraphs(BRIEF, { ...DAT, doan2: `${DAT.doan2} Nhưng rồi cũng qua.` });
    expect(loi).toContain('đoạn 2: 3 câu, cần đúng 2');
  });

  it('chặn mệnh đề bất lợi bị viết nhạt đi cho dễ đọc', () => {
    const loi = checkParagraphs(BRIEF, {
      ...DAT,
      doan2:
        'Tuy nhiên, **Đại Hao, Kiếp Sát** cùng góp mặt nên đường tình cảm đôi khi cần thêm khéo léo. Điều đáng chú ý là **Thiên Thọ** hội chiếu tới, chủ sự bền và giữ được lâu khi đã ổn định, vì vậy ==sóng gió thường nằm ở chặng đầu== hơn là ở cả chặng đường.',
    });
    expect(loi.join('\n')).toMatch(/hao tán/);
    expect(loi.join('\n')).toMatch(/áp lực/);
  });

  it('chặn mệnh đề bị gán cho sao không sinh ra nó', () => {
    const loi = checkParagraphs(BRIEF, {
      ...DAT,
      doan2: DAT.doan2.replace('**Đại Hao, Kiếp Sát**', '**Kiếp Sát**'),
    });
    expect(loi.join('\n')).toMatch(/quy kết sai.*Đại Hao/);
  });

  it('chặn thuật ngữ chỉ đúng ở cung Mệnh khi Thân không cư Mệnh', () => {
    const loi = checkParagraphs(BRIEF, {
      ...DAT,
      doan1: DAT.doan1.replace('Cung Phu Thê có', 'Thủ mệnh có'),
    });
    expect(loi).toContain('đoạn 1: dùng cụm bị cấm "thủ mệnh"');
  });

  it('chặn lời hứa hẹn không có trong brief', () => {
    const loi = checkParagraphs(BRIEF, {
      ...DAT,
      doan2: DAT.doan2.replace('hơn là ở cả chặng đường.', 'và bạn sẽ vượt qua mọi khó khăn.'),
    });
    expect(loi.join('\n')).toMatch(/vượt qua mọi/);
  });

  it('chặn việc nói sao chiếu tới là đang đóng tại cung', () => {
    const loi = checkParagraphs(BRIEF, {
      ...DAT,
      doan2: DAT.doan2.replace('**Thiên Thọ** hội chiếu tới, chủ', '**Thiên Thọ** toạ thủ, chủ'),
    });
    expect(loi.join('\n')).toMatch(/Thiên Thọ.*tam hợp.*không đứng tại cung/);
  });
});
