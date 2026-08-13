import { getDayPillar } from '@/lib/lunar-calendar';

const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tị', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
const CHI_RANGES = [
  '23h - 1h',
  '1h - 3h',
  '3h - 5h',
  '5h - 7h',
  '7h - 9h',
  '9h - 11h',
  '11h - 13h',
  '13h - 15h',
  '15h - 17h',
  '17h - 19h',
  '19h - 21h',
  '21h - 23h',
];

// 12 sao trực thời, in fixed order.
const SAO_TRUC = [
  { name: 'Thanh Long', hoangDao: true, desc: 'thiên quý, thái ất tinh' },
  { name: 'Minh Đường', hoangDao: true, desc: 'minh phụ, quý nhân tinh' },
  { name: 'Thiên Hình', hoangDao: false, desc: 'thiên hình' },
  { name: 'Chu Tước', hoangDao: false, desc: 'thiên tụng' },
  { name: 'Kim Quỹ', hoangDao: true, desc: 'nguyệt tiên, phúc đức tinh' },
  { name: 'Thiên Đức', hoangDao: true, desc: 'thiên đức, bảo quang tinh' },
  { name: 'Bạch Hổ', hoangDao: false, desc: 'thiên sát' },
  { name: 'Ngọc Đường', hoangDao: true, desc: 'thiên khai, thiếu vi tinh' },
  { name: 'Thiên Lao', hoangDao: false, desc: 'tỏa thần' },
  { name: 'Huyền Vũ', hoangDao: false, desc: 'thiên ngục' },
  { name: 'Tư Mệnh', hoangDao: true, desc: 'nhật tiên, phượng liễn tinh' },
  { name: 'Câu Trần', hoangDao: false, desc: 'địa ngục' },
] as const;

// layHHD: rotation of the 12 sao by the day's chi (chi % 6).
const HHD_ROTATIONS = [
  [5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3, 4],
  [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2],
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  [11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  [9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8],
  [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6],
] as const;

const HOANG_DAO_RATING = 4;
const HAC_DAO_RATING = 2;
const CHI_COUNT = 12;

export interface HoangDaoHour {
  readonly range: string;
  readonly canChi: string;
  readonly saoTruc: string;
  readonly saoDesc: string;
  readonly isHoangDao: boolean;
  readonly rating: number;
  readonly stars: string;
  readonly favorable: string;
  readonly unfavorable: string;
}

const HOANG_DAO_FAVORABLE =
  'Giờ hoàng đạo, thuận cho việc trọng đại: xuất hành, khai trương, cầu tài, hôn sự, nhập trạch.';
const HOANG_DAO_UNFAVORABLE = 'Không có việc đại kỵ.';
const HAC_DAO_FAVORABLE = 'Chỉ nên làm việc thường nhật, tránh khởi sự lớn.';
const HAC_DAO_UNFAVORABLE =
  'Giờ hắc đạo, kỵ việc trọng đại: cưới hỏi, khai trương, an táng, xuất hành xa.';

function hourCanIndex(dayCan: number, hourChi: number): number {
  // Ngũ thử độn: giờ Tý can = (dayCan mod 5) * 2, then advance by chi.
  return ((((dayCan % 5) * 2 + hourChi) % 10) + 10) % 10;
}

export function getGioHoangDao(date: Date): readonly HoangDaoHour[] {
  const { can: dayCan, chi: dayChi } = getDayPillar(date);
  const rotation = HHD_ROTATIONS[dayChi % 6];

  return CHI.map((_, hour) => {
    const sao = SAO_TRUC[rotation[hour] - 1];
    const canChi = `${CAN[hourCanIndex(dayCan, hour)]} ${CHI[hour % CHI_COUNT]}`;
    return {
      range: CHI_RANGES[hour],
      canChi,
      saoTruc: sao.name,
      saoDesc: sao.desc,
      isHoangDao: sao.hoangDao,
      rating: sao.hoangDao ? HOANG_DAO_RATING : HAC_DAO_RATING,
      stars: `${sao.name} (${sao.desc})`,
      favorable: sao.hoangDao ? HOANG_DAO_FAVORABLE : HAC_DAO_FAVORABLE,
      unfavorable: sao.hoangDao ? HOANG_DAO_UNFAVORABLE : HAC_DAO_UNFAVORABLE,
    };
  });
}
