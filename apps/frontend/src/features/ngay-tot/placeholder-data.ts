import type {
  NhiThapBatTuPillar,
  NhiThapBatTuVerse,
} from '@/features/ngay-tot/components/nhi-thap-bat-tu-panel';

// Placeholder layout data until the real hour-quality algorithms land.

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
