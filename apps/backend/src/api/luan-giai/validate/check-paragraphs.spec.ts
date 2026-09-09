import { Sac, TheChieu, type ThanCuBrief } from '@org/shared-tu-vi';
import type { ThanCuParagraphs } from '../prompt/chapter-schema';
import { checkParagraphs } from './check-paragraphs';
import { baiChinh, baiMuc } from './to-bai';

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

/** Bài chính luôn là hai đoạn; gói lại cho gọn vì mọi ca dưới đây đều đi qua đúng hình dạng đó. */
const kiem = (paragraphs: ThanCuParagraphs): string[] =>
  checkParagraphs(BRIEF, baiChinh(paragraphs));

describe('checkParagraphs', () => {
  it('cho qua bản viết đúng cả năm tầng', () => {
    expect(kiem(DAT)).toEqual([]);
  });

  it('chặn sao có thật nhưng không có trong lá số', () => {
    const loi = kiem({
      ...DAT,
      doan2: DAT.doan2.replace('**Đại Hao, Kiếp Sát**', '**Đại Hao, Kiếp Sát, Thiên Diêu**'),
    });
    expect(loi).toContain('đoạn 2: "Thiên Diêu" không có trong brief');
  });

  it('chặn chính tinh nhắc mà thiếu bậc', () => {
    const loi = kiem({
      ...DAT,
      doan1: DAT.doan1.replace('**Tham Lang (H)**', '**Tham Lang**'),
    });
    expect(loi).toContain('đoạn 1: chính tinh "Tham Lang" thiếu bậc');
  });

  it('chặn phụ tinh cùng vai bị tách thành nhiều cặp', () => {
    const loi = kiem({
      ...DAT,
      doan2: DAT.doan2.replace('**Đại Hao, Kiếp Sát**', '**Đại Hao** và **Kiếp Sát**'),
    });
    expect(loi).toContain('đoạn 2: hung tinh tách thành 2 cặp **');
  });

  it('chặn đoạn viết thành ba câu', () => {
    const loi = kiem({ ...DAT, doan2: `${DAT.doan2} Nhưng rồi cũng qua.` });
    expect(loi).toContain('đoạn 2: 3 câu, cần đúng 2');
  });

  it('chặn mệnh đề bất lợi bị viết nhạt đi cho dễ đọc', () => {
    const loi = kiem({
      ...DAT,
      doan2:
        'Tuy nhiên, **Đại Hao, Kiếp Sát** cùng góp mặt nên đường tình cảm đôi khi cần thêm khéo léo. Điều đáng chú ý là **Thiên Thọ** hội chiếu tới, chủ sự bền và giữ được lâu khi đã ổn định, vì vậy ==sóng gió thường nằm ở chặng đầu== hơn là ở cả chặng đường.',
    });
    expect(loi.join('\n')).toMatch(/hao tán/);
    expect(loi.join('\n')).toMatch(/áp lực/);
  });

  it('chặn mệnh đề bị gán cho sao không sinh ra nó', () => {
    const loi = kiem({
      ...DAT,
      doan2: DAT.doan2.replace('**Đại Hao, Kiếp Sát**', '**Kiếp Sát**'),
    });
    expect(loi.join('\n')).toMatch(/quy kết sai.*Đại Hao/);
  });

  it('chặn thuật ngữ chỉ đúng ở cung Mệnh khi Thân không cư Mệnh', () => {
    const loi = kiem({
      ...DAT,
      doan1: DAT.doan1.replace('Cung Phu Thê có', 'Thủ mệnh có'),
    });
    expect(loi).toContain('đoạn 1: dùng cụm bị cấm "thủ mệnh"');
  });

  it('chặn lời hứa hẹn không có trong brief', () => {
    const loi = kiem({
      ...DAT,
      doan2: DAT.doan2.replace('hơn là ở cả chặng đường.', 'và bạn sẽ vượt qua mọi khó khăn.'),
    });
    expect(loi.join('\n')).toMatch(/vượt qua mọi/);
  });

  it('chỉ ra đúng lỗi khi hai dấu bị lồng vào nhau', () => {
    const loi = kiem({
      ...DAT,
      doan1: DAT.doan1.replace(
        '==hợp duyên và được quý mến==',
        '**==hợp duyên và được quý mến==**',
      ),
    });

    expect(loi).toContain(
      'đoạn 1: không được lồng ==...== vào trong **...**, hai dấu phải tách rời',
    );
    expect(loi.join('\n')).not.toMatch(/không có trong brief/);
  });

  it('chạy được y nguyên trên mục con một đoạn', () => {
    // Mục con dùng lại phần lá số của brief chính, chỉ khác `luan` — nên bộ kiểm không phải biết
    // nó là mục hay là bài.
    const briefMuc: ThanCuBrief = {
      ...BRIEF,
      luan: [
        {
          y: 'cung này vào đại vận khoảng 33 đến 42 tuổi',
          do: [],
          sac: Sac.Thuan,
          trong: 90,
          tuKhoa: ['33', '42'],
        },
        { y: 'cung đang ở đoạn khởi', do: [], sac: Sac.Nghich, trong: 82, tuKhoa: ['đoạn khởi'] },
      ],
    };

    const dat = checkParagraphs(
      briefMuc,
      baiMuc({
        doan: 'Cung này vào đại vận khoảng 33 đến 42 tuổi, đó là quãng nó lên tiếng rõ nhất. Vòng Tràng Sinh cho thấy cung đang ở ==đoạn khởi==, việc gì bắt đầu lúc này cũng có đà.',
      }),
    );

    expect(dat).toEqual([]);
  });

  it('chặn việc nói sao chiếu tới là đang đóng tại cung', () => {
    const loi = kiem({
      ...DAT,
      doan2: DAT.doan2.replace('**Thiên Thọ** hội chiếu tới, chủ', '**Thiên Thọ** toạ thủ, chủ'),
    });
    expect(loi.join('\n')).toMatch(/Thiên Thọ.*tam hợp.*không đứng tại cung/);
  });
});
