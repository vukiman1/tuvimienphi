import { laSoIconUrl } from '@/config/media';

/** Sáu chương của trang luận giải. Nội dung do backend trả về, ở đây chỉ có mục lục. */
export interface LuanGiaiChapter {
  readonly order: string;
  readonly title: string;
  readonly iconUrl?: string;
}

export const LUAN_GIAI_CHAPTERS: readonly LuanGiaiChapter[] = [
  { order: '01', title: 'Thân cư', iconUrl: laSoIconUrl('compass') },
  { order: '02', title: 'Mệnh & Tính cách', iconUrl: laSoIconUrl('bagua') },
  { order: '03', title: 'Công danh Sự nghiệp', iconUrl: laSoIconUrl('sailboat') },
  { order: '04', title: 'Tài bạch Tiền tài', iconUrl: laSoIconUrl('coin') },
  { order: '05', title: 'Tình duyên Gia đạo', iconUrl: laSoIconUrl('lotus') },
  { order: '06', title: 'Vận hạn', iconUrl: laSoIconUrl('hourglass') },
];

export const LUAN_GIAI_MOTTO: readonly string[] = [
  'Thiên thời · Địa lợi · Nhân hòa',
  'Biết mình · Đổi vận · An tâm',
];
