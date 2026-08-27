import { getYearCanChi } from '@/lib/lunar-calendar';
import { ZODIAC_CHI, type ZodiacChi } from '@/lib/zodiac-icons';
import {
  VAN_HAN_FORTUNE_PLACEHOLDER,
  type VanHanAspect,
  type VanHanBirthYearFortune,
  type VanHanFortune,
} from '@/features/van-han/placeholder-data';

/**
 * Dữ liệu minh hoạ (mock) vận hạn cho cả 12 con giáp, sinh theo template — sẽ được thay bằng
 * dữ liệu thật từ backend. Phần năm sinh, can-chi và mệnh (nạp âm) được tính CHÍNH XÁC; phần luận
 * giải dùng câu mẫu chèn tên tuổi để mỗi con giáp có nội dung riêng, rõ ràng là nội dung demo.
 */

const REFERENCE_YEAR = 2026;
const BIRTH_YEAR_COUNT = 5;
const MIN_RATING = 1;
const MAX_RATING = 5;

/** 30 nạp âm của vòng 60 năm; mỗi tên ứng với 2 năm liên tiếp. Element = từ cuối cùng. */
const NAP_AM = [
  'Hải Trung Kim',
  'Lư Trung Hỏa',
  'Đại Lâm Mộc',
  'Lộ Bàng Thổ',
  'Kiếm Phong Kim',
  'Sơn Đầu Hỏa',
  'Giản Hạ Thủy',
  'Thành Đầu Thổ',
  'Bạch Lạp Kim',
  'Dương Liễu Mộc',
  'Tuyền Trung Thủy',
  'Ốc Thượng Thổ',
  'Tích Lịch Hỏa',
  'Tùng Bách Mộc',
  'Trường Lưu Thủy',
  'Sa Trung Kim',
  'Sơn Hạ Hỏa',
  'Bình Địa Mộc',
  'Bích Thượng Thổ',
  'Kim Bạch Kim',
  'Phú Đăng Hỏa',
  'Thiên Hà Thủy',
  'Đại Trạch Thổ',
  'Thoa Xuyến Kim',
  'Tang Đố Mộc',
  'Đại Khê Thủy',
  'Sa Trung Thổ',
  'Thiên Thượng Hỏa',
  'Thạch Lựu Mộc',
  'Đại Hải Thủy',
] as const;

/** Cửu diệu chiếu mệnh theo tuổi (nam / nữ), xoay vòng 9 năm — dùng cho phần minh hoạ. */
const SAO_NAM = [
  'La Hầu',
  'Thổ Tú',
  'Thủy Diệu',
  'Thái Bạch',
  'Thái Dương',
  'Vân Hớn',
  'Kế Đô',
  'Thái Âm',
  'Mộc Đức',
];
const SAO_NU = [
  'Kế Đô',
  'Vân Hớn',
  'Mộc Đức',
  'Thái Âm',
  'Thổ Tú',
  'La Hầu',
  'Thái Dương',
  'Thái Bạch',
  'Thủy Diệu',
];

const OVERVIEW_TONE = [
  'nhiều chuyển biến',
  'khá vững vàng',
  'lên xuống đan xen',
  'giàu cơ hội',
  'cần sự kiên định',
  'hanh thông có điều kiện',
];
const OVERVIEW_FOCUS = [
  'sức khỏe và tài chính',
  'các mối quan hệ và công việc',
  'kế hoạch dài hạn',
  'việc tích lũy và đầu tư an toàn',
  'sự nghiệp và học hỏi',
  'cân bằng gia đình và công việc',
];

const MALE_ADVICE = [
  'nên giữ gìn sức khỏe và tránh tranh chấp, hậu vận trong năm sẽ hanh thông.',
  'hợp khởi sự và mở rộng quan hệ, song cần thận trọng khi ký kết giấy tờ.',
  'dễ có tin vui từ công việc, nhưng nên tiết chế chi tiêu và nóng giận.',
  'cần đề phòng thị phi và đi lại xa, giữ bình tĩnh sẽ vượt qua trở ngại.',
  'thích hợp học hỏi và tích lũy, tránh đầu tư mạo hiểm trong năm nay.',
  'nên chăm lo gia đạo, giữ hòa khí để đón nhận may mắn cuối năm.',
];
const FEMALE_ADVICE = [
  'nên chú ý sức khỏe và cảm xúc, làm việc thiện để tích phúc.',
  'thuận lợi trong giao tiếp, song cần tránh hiểu lầm với người thân.',
  'dễ gặp quý nhân, nên chủ động nắm bắt cơ hội và giữ sức khỏe.',
  'lưu ý các vấn đề nội tiết, giấc ngủ và tránh lo nghĩ thái quá.',
  'hợp đi xa và học thêm kỹ năng mới, giữ tâm an sẽ nhiều thuận lợi.',
  'nên cân bằng công việc và gia đình, tránh ôm đồm quá sức.',
];

interface AspectTemplate {
  readonly label: string;
  readonly baseRating: number;
  readonly points: readonly string[];
}

const ASPECT_TEMPLATES: readonly AspectTemplate[] = [
  {
    label: 'Tài Vận',
    baseRating: 3,
    points: [
      'Dòng tiền của tuổi {chi} năm nay biến động, nên ưu tiên bảo toàn vốn và hạn chế đầu cơ.',
      'Có cơ hội tăng thu từ hợp tác, song cần đề phòng chi tiêu vượt kế hoạch.',
      'Giữ sổ sách rõ ràng, tránh cho vay hoặc đứng tên tài chính hộ người khác.',
    ],
  },
  {
    label: 'Sức Khoẻ',
    baseRating: 3,
    points: [
      'Tuổi {chi} cần chú ý giấc ngủ, tim mạch và tiêu hóa, tránh làm việc quá sức.',
      'Nên duy trì vận động điều độ, ăn uống thanh đạm và khám sức khỏe định kỳ.',
      'Giữ tinh thần lạc quan, hạn chế căng thẳng kéo dài sẽ giúp vận khí ổn định.',
    ],
  },
  {
    label: 'Sự Nghiệp',
    baseRating: 4,
    points: [
      'Công việc của tuổi {chi} có nhiều cơ hội phát triển, kèm theo cạnh tranh và áp lực.',
      'Cát tinh nâng đỡ giúp mở rộng quan hệ, dễ được giao trọng trách nếu chủ động.',
      'Tránh nóng vội và va chạm với đồng nghiệp; khiêm nhường sẽ hóa giải tiểu nhân.',
    ],
  },
  {
    label: 'Tình Duyên',
    baseRating: 3,
    points: [
      'Đường tình duyên của tuổi {chi} rộng mở, người độc thân dễ gặp đối tượng phù hợp.',
      'Người có đôi cần dành thời gian lắng nghe, tránh hiểu lầm và lời nói nóng giận.',
      'Lấy chân thành và bao dung làm gốc, tình cảm sẽ thêm bền chặt trong năm.',
    ],
  },
];

function pick<T>(items: readonly T[], index: number): T {
  return items[((index % items.length) + items.length) % items.length];
}

function menhOfYear(year: number): string {
  const sexagenary = (((year - 4) % 60) + 60) % 60;
  return NAP_AM[Math.floor(sexagenary / 2)];
}

/** 5 năm sinh gần nhất của con giáp (tính đến trước năm tham chiếu). */
function birthYearsForChi(chiIndex: number): number[] {
  let latest = REFERENCE_YEAR - 1;
  while ((((latest - 4) % 12) + 12) % 12 !== chiIndex) {
    latest -= 1;
  }
  return Array.from({ length: BIRTH_YEAR_COUNT }, (_, offset) => latest - offset * 12).reverse();
}

function buildOverview(chi: ZodiacChi, index: number): string[] {
  const refCanChi = getYearCanChi(REFERENCE_YEAR);
  return [
    `Người tuổi ${chi} bước vào năm ${REFERENCE_YEAR} ${refCanChi} với vận trình ${pick(OVERVIEW_TONE, index)}, vừa có quý nhân nâng đỡ, vừa phải đối diện không ít thử thách đòi hỏi sự bền bỉ.`,
    `Năm nay, tuổi ${chi} nên chú trọng ${pick(OVERVIEW_FOCUS, index)}; giữ thế chủ động nhưng thận trọng, các quyết định lớn cần cân nhắc kỹ và lắng nghe người có kinh nghiệm.`,
    `Biết tiết chế cảm xúc, lập kế hoạch dài hạn và duy trì thái độ ôn hòa sẽ giúp tuổi ${chi} hóa giải khó khăn, nắm bắt cơ hội và giữ vững thành quả trong năm.`,
  ];
}

function buildAspects(chi: ZodiacChi, index: number): VanHanAspect[] {
  return ASPECT_TEMPLATES.map((template, aspectIndex) => {
    const rating = Math.min(
      MAX_RATING,
      Math.max(MIN_RATING, template.baseRating + (((index + aspectIndex * 2) % 3) - 1)),
    );
    return {
      label: template.label,
      rating,
      points: template.points.map((point) => point.replace('{chi}', chi)),
    };
  });
}

function buildBirthYear(year: number, index: number): VanHanBirthYearFortune {
  const age = REFERENCE_YEAR - year;
  return {
    birthYear: year,
    canChi: getYearCanChi(year),
    menh: menhOfYear(year),
    male: `Nam ${age} tuổi có sao ${pick(SAO_NAM, age)} chiếu mệnh, ${pick(MALE_ADVICE, index + age)}`,
    female: `Nữ ${age} tuổi có sao ${pick(SAO_NU, age)} chiếu mệnh, ${pick(FEMALE_ADVICE, index + age)}`,
  };
}

function buildFortune(chi: ZodiacChi, chiIndex: number): VanHanFortune {
  const birthYears = birthYearsForChi(chiIndex);
  return {
    birthYears,
    overview: buildOverview(chi, chiIndex),
    aspects: buildAspects(chi, chiIndex),
    byBirthYear: birthYears.map((year) => buildBirthYear(year, chiIndex)),
  };
}

/** Vận hạn minh hoạ theo từng con giáp. Tuổi Ngọ giữ bản viết tay sẵn có, các tuổi khác sinh theo
 * template để mỗi con giáp có nội dung riêng thay vì fallback chung về tuổi Ngọ. */
export const VAN_HAN_FORTUNE_BY_CHI: Readonly<Record<ZodiacChi, VanHanFortune>> =
  Object.fromEntries(
    ZODIAC_CHI.map((entry, index) => [
      entry.chi,
      entry.chi === 'Ngọ' ? VAN_HAN_FORTUNE_PLACEHOLDER : buildFortune(entry.chi, index),
    ]),
  ) as Record<ZodiacChi, VanHanFortune>;
