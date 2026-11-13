export interface LuanGiaiChapter {
  readonly order: string;
  readonly title: string;
}

export const LUAN_GIAI_CHAPTERS: readonly LuanGiaiChapter[] = [
  { order: '01', title: 'Thân cư' },
  { order: '02', title: 'Mệnh & Tính cách' },
  { order: '03', title: 'Công danh Sự nghiệp' },
  { order: '04', title: 'Tài bạch Tiền tài' },
  { order: '05', title: 'Tình duyên Gia đạo' },
  { order: '06', title: 'Vận hạn' },
];

export const LUAN_GIAI_MOTTO: readonly string[] = [
  'Thiên thời · Địa lợi · Nhân hòa',
  'Biết mình · Đổi vận · An tâm',
];
