/** Every string the landing page renders below the hero. */

export const PERSPECTIVES_SECTION = {
  title: 'One chart — nhiều góc nhìn',
  cards: [
    { key: 'la-so', name: 'Lá số', description: 'Tổng quan bản mệnh' },
    { key: 'dai-van', name: 'Đại vận', description: 'Biến chuyển cuộc đời' },
    { key: 'van-han', name: 'Vận hạn', description: 'Tử vi hàng năm' },
    { key: 'luan-giai', name: 'Luận giải', description: 'Phân tích chi tiết' },
  ],
} as const;

export const CHART_ANATOMY_SECTION = {
  title: 'Lá số của bạn có gì?',
  ctaLabel: 'Tạo lá số của tôi →',
  leftNotes: ['Phân tích 12 Cung mệnh', 'Hệ thống hàng trăm ngôi sao'],
  rightNotes: ['Đại vận cuộc đời', 'Luận giải theo từng cung'],
} as const;

export type PerspectiveKey = (typeof PERSPECTIVES_SECTION.cards)[number]['key'];
