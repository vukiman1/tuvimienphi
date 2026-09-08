import type { CungName } from '../../dia-ban.js';
import { Sac, type LuanDe } from '../luan-de.js';

/**
 * Mệnh đề nền cho tổ hợp chính tinh toạ thủ tại cung an Thân.
 *
 * Bảng được phép thưa: ô chưa soạn thì bài ngắn hơn chứ không sai. `bao-phu.spec.ts` in ra phần
 * còn thiếu và chỉ báo lỗi khi một cung tụt xuống dưới ngưỡng đủ để dựng bài.
 *
 * Nội dung dưới đây là hạt giống để dựng khung, CHƯA có người biết tử vi soát. Đừng mở cho người
 * dùng đọc trước khi soát xong: văn nghe xuôi tai mà sai luật là kiểu sai không ai phát hiện ra.
 */
export const CHINH_TINH_THAN_CU: Readonly<
  Partial<Record<string, Partial<Record<CungName, readonly LuanDe[]>>>>
> = {
  'Liêm Trinh + Tham Lang': {
    'Phu Thê': [
      {
        y: 'người bạn đời có sức hút, giỏi giao tiếp và không cam chịu an phận',
        do: ['Liêm Trinh', 'Tham Lang'],
        sac: Sac.Thuan,
        trong: 90,
        tuKhoa: ['sức hút', 'giao tiếp', 'an phận'],
      },
      {
        y: 'cả hai đều là sao đào hoa nên đường tình duyên nhiều sóng, dễ dang dở trước khi định',
        do: ['Liêm Trinh', 'Tham Lang'],
        sac: Sac.Nghich,
        trong: 85,
        tuKhoa: ['đào hoa', 'nhiều sóng', 'dang dở'],
      },
      {
        y: 'duyên đến muộn thì bền hơn duyên đến sớm',
        do: ['Tham Lang'],
        sac: Sac.HoaGiai,
        trong: 60,
        tuKhoa: ['muộn', 'bền'],
      },
    ],
  },
  'Tham Lang': {
    'Phu Thê': [
      {
        y: 'người bạn đời hoạt bát, khéo giao thiệp và biết cách chiều lòng người',
        do: ['Tham Lang'],
        sac: Sac.Thuan,
        trong: 88,
        tuKhoa: ['hoạt bát', 'giao thiệp', 'chiều lòng'],
      },
      {
        y: 'Tham Lang chủ đào hoa nên tình duyên dễ nhiều mối, khó dứt khoát',
        do: ['Tham Lang'],
        sac: Sac.Nghich,
        trong: 80,
        tuKhoa: ['đào hoa', 'nhiều mối', 'dứt khoát'],
      },
      {
        y: 'đắc địa nên nét phong lưu chuyển thành sức hút lành mạnh',
        do: ['Tham Lang'],
        sac: Sac.HoaGiai,
        trong: 65,
        tuKhoa: ['phong lưu', 'sức hút'],
      },
    ],
  },
};
