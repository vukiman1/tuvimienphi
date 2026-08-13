import type { HourQuality } from '@/features/ngay-tot/components/hour-quality-list';
import type {
  NhiThapBatTuPillar,
  NhiThapBatTuVerse,
} from '@/features/ngay-tot/components/nhi-thap-bat-tu-panel';
import type { PhiTinhBoard } from '@/features/ngay-tot/components/phi-tinh-boards';

// Placeholder layout data until the real hour-quality algorithms land.

const phiTinhCells = (
  values: readonly number[],
  goodValues: readonly number[],
): PhiTinhBoard['cells'] => values.map((value) => ({ value, isGood: goodValues.includes(value) }));

export const PHI_TINH_PLACEHOLDER: readonly PhiTinhBoard[] = [
  { label: 'Năm', cells: phiTinhCells([9, 5, 7, 8, 1, 3, 4, 6, 2], [9, 8, 1, 4]) },
  { label: 'Tháng', cells: phiTinhCells([1, 6, 8, 9, 2, 4, 5, 7, 3], [1, 6, 8, 2]) },
  { label: 'Ngày', cells: phiTinhCells([9, 5, 7, 8, 1, 3, 4, 6, 2], [9, 8, 1, 4]) },
  { label: 'Giờ', cells: phiTinhCells([3, 8, 1, 2, 4, 6, 7, 9, 5], [3, 8, 1, 4, 9]) },
];

export const NHI_THAP_BAT_TU_PILLARS_PLACEHOLDER: readonly NhiThapBatTuPillar[] = [
  {
    label: 'Năm',
    value: '2026',
    canChi: 'Bính Ngọ',
    star: 'Sao Tinh',
    element: 'Dương Hỏa',
    animal: 'Ngựa',
  },
  {
    label: 'Tháng',
    value: 'Sáu',
    canChi: 'Bính Thân',
    star: 'Sao Cang',
    element: 'Kim',
    animal: 'Rồng',
  },
  {
    label: 'Ngày',
    value: '29',
    canChi: 'Đinh Tị',
    star: 'Sao Chủy',
    element: 'Hỏa',
    animal: 'Khỉ',
  },
  {
    label: 'Giờ',
    value: '15:30',
    canChi: 'Mậu Thân',
    star: 'Sao Chẩn',
    element: 'Thủy',
    animal: 'Con Giun',
  },
];

export const NHI_THAP_BAT_TU_VERSES_PLACEHOLDER: readonly NhiThapBatTuVerse[] = [
  {
    title: 'Tinh Nhật Mã',
    subtitle: 'Năm 2026 - Bính Ngọ',
    lines: [
      'Sao Tinh tỏ rạng hợp xây nhà',
      'Vua ban quan lộc mãi thăng hoa',
      'Khai trương không hợp cùng mai táng',
      'Vợ gả cho người cách biệt xa',
    ],
  },
  {
    title: 'Cang Kim Long',
    subtitle: 'Tháng Sáu - Bính Thân',
    lines: [
      'Sao Cang xây cất chịu buồn lòng',
      'Mười ngày tại họa vướng vào trong',
      'An táng hôn nhân như được chọn',
      'Chết non dâu chịu cảnh phòng không',
    ],
  },
  {
    title: 'Chủy Hỏa Cầu',
    subtitle: 'Ngày 29 - Đinh Tị',
    lines: [
      'Sao Chủy dựng xây rối bận lòng',
      'Mai táng không lâu nhà bại vọng',
      'Trùng tang điểm gở điều do đấy',
      'Vàng bạc kho hàng cũng trống không',
    ],
  },
  {
    title: 'Chẩn Thủy Dẫn',
    subtitle: 'Giờ 15:30 - Mậu Thân',
    lines: [
      'Sao Chẩn tạo xây thăng tước quan',
      'Hôn ước vua ban được rỡ ràng',
      'Mai táng sao văn thêm chiếu rọi',
      'Ngày một giàu sang tích ngọc vàng',
    ],
  },
];

export const HOUR_QUALITY_PLACEHOLDER: readonly HourQuality[] = [
  {
    range: '23h - 1h',
    canChi: 'Canh Tý',
    rating: 1,
    isHoangDao: false,
    stars: 'Bạch Hổ (thiên sát), Tuần Trung Không Vong, Hỏa Tinh, Địa Binh, Tham Lang',
    favorable: 'di đồ, kiến quý, tu tác, tạo táng.',
    unfavorable:
      'bách sự bất lợi, khai quang, kiến tự quan, lập thần tượng, nhập trạch, phá thổ, thần miếu, tu tạo, viễn hồi, động thổ.',
  },
  {
    range: '1h - 3h',
    canChi: 'Tân Sửu',
    rating: 5,
    isHoangDao: true,
    stars:
      'Ngọc Đường (thiên khai, thiếu vi tinh), Tứ Đại Cát Thời, Tam Hợp, Đường Phù, Hữu Bật, Thủy Tinh, Nhật Mộ, Tuần Trung Không Vong',
    favorable:
      'an sàng, an táng, an táo, cầu tài, cầu tự, di đồ, giao dịch, giá thú, khai thương khố, khai thị, kiến quý, kì phúc, nhập trạch, phó nhậm, thượng lương, thượng quan, tu tạo, tạo táng, đính hôn.',
    unfavorable: 'khai quang, kiến tự quan, lập thần tượng, thần miếu, viễn hồi.',
  },
  {
    range: '3h - 5h',
    canChi: 'Nhâm Dần',
    rating: 1,
    isHoangDao: false,
    stars:
      'Thiên Lao (tỏa thần), Thời Hại, Thiên Cương, La Thiên Đại Thoái, Triệt Lộ Không Vong, Kiếp Sát, Thiên Tặc, Thái Âm, Ngũ Hợp, Quốc Ấn',
    favorable:
      'an sàng, cầu tài, cầu tự, di đồ, giá thú, kiến quý, lục lễ, tu tác, xuất hành, đính hôn.',
    unfavorable:
      'bách sự bất lợi, công chúng sự vụ, giá mã, hứa nguyện, khai quang, khai thương khố, khởi tạo, nhập trạch, phó nhậm, phạt mộc, phần hương, thiết tiếu, thù thần, thượng quan, thụ tạo, tiến biểu chương, tu phương, từ tụng, động thổ.',
  },
  {
    range: '5h - 7h',
    canChi: 'Quý Mão',
    rating: 2,
    isHoangDao: false,
    stars: 'Huyền Vũ (thiên ngục), Ngũ Bất Ngộ, Cô Thần, Triệt Lộ Không Vong, Tham Lang, Mộc Tinh',
    favorable: 'an táng, di đồ, kiến quý, nhập trạch, thượng lương, tu tác, tu tạo, tạo táng.',
    unfavorable:
      'bác hí, hứa nguyện, khai quang, kì phúc, kết hôn nhân, phó nhậm, phần hương, thiết tiếu, thù thần, thượng quan, tiến biểu chương, từ tụng, xuất hành.',
  },
  {
    range: '7h - 9h',
    canChi: 'Giáp Thìn',
    rating: 4,
    isHoangDao: true,
    stars:
      'Tư Mệnh (nhật tiên, phượng liễn tinh), Tứ Đại Cát Thời, Hữu Bật, Minh Tinh, Kế Đô, Thiên Cẩu Hạ Thực',
    favorable:
      'cầu tài, di đồ, giá thú, kiến quý, phó nhậm, thượng quan, thụ phong, tu tạo, tác táo, tạo táng, tự táo, xuất hành.',
    unfavorable: 'kì phúc, nữ chủ bất lợi, thiết tiếu, tu tề, tế tự.',
  },
  {
    range: '9h - 11h',
    canChi: 'Ất Tị',
    rating: 2,
    isHoangDao: false,
    stars: 'Câu Trần (địa ngục), Thổ Tinh, Đế Vượng, Thời Kiến, Tả Phụ',
    favorable:
      'an táng, cầu tài, cầu tự, di đồ, giao dịch, giá thú, khai thị, kiến quý, nhập trạch, phó nhậm, thượng lương, thượng quan, tu tác, tu tạo, tạo táng, xuất hành, đính hôn.',
    unfavorable: 'bách sự bất lợi.',
  },
  {
    range: '11h - 13h',
    canChi: 'Bính Ngọ',
    rating: 5,
    isHoangDao: true,
    stars:
      'Thanh Long (thiên quý, thái ất tinh), Quý Đăng Thiên Môn, Hỷ Thần, Ngũ Phù, Nhật Lộc, La Hầu, Thiên Binh',
    favorable:
      'an sàng, cầu tài, cầu tự, giao dịch, giá thú, khai thị, kiến quý, kì phúc, lục lễ, nhập trạch, phó nhậm, thượng quan, tạo táng, xuất hành, đính hôn.',
    unfavorable: 'nam chủ bất lợi, nhập liễm, thượng lương.',
  },
  {
    range: '13h - 15h',
    canChi: 'Đinh Mùi',
    rating: 5,
    isHoangDao: true,
    stars:
      'Minh Đường (minh phụ, quý nhân tinh), Tứ Đại Cát Thời, Thiên Xá, Vũ Khúc, Kim Tinh, Tỷ Kiên',
    favorable:
      'an táng, cầu tự, giá thú, hưng tu, khai thị, kì phúc, lợi sự cát, nhập trạch, thượng lương, trai tiếu, tu tác, tu tạo, tạo táng, tế tự, tự phúc, đính hôn.',
    unfavorable: 'Bất kị',
  },
  {
    range: '15h - 17h',
    canChi: 'Mậu Thân',
    rating: 2,
    isHoangDao: false,
    stars: 'Thiên Hình (thiên hình), Thời Hình, Hà Khôi, Lục Mậu, Lôi Binh, Thái Dương, Lục Hợp',
    favorable:
      'an sàng, an táng, cầu tài, cầu tự, giao dịch, giá thú, khai thị, lục lễ, nhập trạch, thụ tạo, tu phương, xuất hành, đính hôn.',
    unfavorable:
      'bách sự bất lợi, công chúng sự vụ, khởi cổ, phó nhậm, phần hương, thiết tiếu, thù thần, thượng quan, tu thuyền, từ tụng.',
  },
  {
    range: '17h - 19h',
    canChi: 'Kỷ Dậu',
    rating: 2,
    isHoangDao: false,
    stars:
      'Chu Tước (thiên tụng), Quả Tú, Hỏa Tinh, Cổ Mộ Sát, Cửu Xú, Thiên Ất Quí Nhân, Phúc Tinh Quí Nhân, Tam Hợp, Trường Sinh, La Thiên Đại Tiến',
    favorable:
      'cầu tài, cầu tự, di đồ, giao dịch, giá thú, khai thị, kiến quý, kì phúc, nhập trạch, thù thần, tu tác, tu tạo, tạo táng, tế tự, xuất hành, đính hôn.',
    unfavorable: 'an táng, bách sự bất lợi, di tỉ, kết hôn nhân, tu tạo mộ viên, tụng sự, xuất sư.',
  },
  {
    range: '19h - 21h',
    canChi: 'Canh Tuất',
    rating: 3,
    isHoangDao: true,
    stars: 'Kim Quỹ (nguyệt tiên, phúc đức tinh), Tứ Đại Cát Thời, Thủy Tinh, Ngũ Quỷ, Địa Binh',
    favorable: 'an táng, kì phúc, nhập trạch, thượng lương, tạo táng, đính hôn.',
    unfavorable: 'phá thổ, phó nhậm, thượng quan, xuất hành, động thổ.',
  },
  {
    range: '21h - 23h',
    canChi: 'Tân Hợi',
    rating: 4,
    isHoangDao: true,
    stars:
      'Thiên Đức (thiên đức, bảo quang tinh), Thiên Ất Quí Nhân, Thiên Quan Quí Nhân, Thái Âm, Dịch Mã, Ngũ Quỷ',
    favorable:
      'cầu tài, giao dịch, giá thú, khai thị, kiến quý, kì phúc, phó nhậm, thù thần, tu tác, tạo táng, tế tự, xuất hành, đính hôn.',
    unfavorable: 'bách sự bất lợi, di đồ, tu tạo, động thổ.',
  },
];
