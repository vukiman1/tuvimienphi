import type { CungName } from '../../dia-ban.js';
import type { Rating } from '../../sao-rating.js';
import { Sac, type LuanDe } from '../luan-de.js';

/**
 * Viết mệnh đề như một MỆNH ĐỀ, không như một câu hoàn chỉnh: bỏ liên từ dẫn ("sao còn vượng nên…",
 * "đắc địa nên…") vì mô hình trích gần như nguyên văn, và một câu văn nhét vào giữa câu khác thì
 * đọc gãy. Bậc miếu vượng đã nằm ở khoá `theoBac` rồi, không cần nhắc lại trong lời.
 *
 * Mệnh đề của một ô bảng. `chung` đúng ở mọi bậc; `theoBac` dành cho những sao mà miếu và hãm luận
 * khác nhau về CHẤT chứ không phải về mức — Thái Dương miếu ở Ngọ là mặt trời giữa trưa, hãm ở Tý
 * là mặt trời nửa đêm, không phải cùng một kết luận đọc nhẹ đi.
 */
export interface CellLuan {
  readonly chung: readonly LuanDe[];
  readonly theoBac?: Partial<Record<Rating, readonly LuanDe[]>>;
}

/**
 * Mệnh đề nền cho tổ hợp chính tinh toạ thủ tại cung an Thân.
 *
 * Bảng được phép thưa: ô chưa soạn thì bài ngắn hơn chứ không sai. `bao-phu.spec.ts` chỉ báo lỗi
 * khi khoá gõ sai, vì khoá sai thì bảng im lặng không bao giờ khớp.
 *
 * Nội dung dưới đây là hạt giống để dựng khung, CHƯA có người biết tử vi soát. Đừng mở cho người
 * dùng đọc trước khi soát xong: văn nghe xuôi tai mà sai luật là kiểu sai không ai phát hiện ra.
 */
export const CHINH_TINH_THAN_CU: Readonly<
  Partial<Record<string, Partial<Record<CungName, CellLuan>>>>
> = {
  'Liêm Trinh + Tham Lang': {
    'Phu Thê': {
      chung: [
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
  },
  'Tham Lang': {
    'Phu Thê': {
      chung: [
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
      ],
      theoBac: {
        Đ: [
          {
            y: 'nét phong lưu chuyển thành sức hút lành mạnh',
            do: ['Tham Lang'],
            sac: Sac.HoaGiai,
            trong: 65,
            tuKhoa: ['phong lưu', 'sức hút'],
          },
        ],
      },
    },
  },
  'Thái Dương': {
    'Phu Thê': {
      chung: [
        {
          y: 'người bạn đời tính tình sáng sủa, thẳng thắn, không ưa vòng vo',
          do: ['Thái Dương'],
          sac: Sac.Thuan,
          trong: 86,
          tuKhoa: ['sáng sủa', 'thẳng thắn', 'vòng vo'],
        },
        {
          y: 'Thái Dương chủ sự bộc trực nên hai người dễ va nhau ở lời nói hơn ở lòng dạ',
          do: ['Thái Dương'],
          sac: Sac.Nghich,
          trong: 72,
          tuKhoa: ['bộc trực', 'va nhau', 'lời nói'],
        },
      ],
      theoBac: {
        M: [
          {
            y: 'người ấy có chỗ đứng riêng, được người ngoài nể trọng',
            do: ['Thái Dương'],
            sac: Sac.Thuan,
            trong: 92,
            tuKhoa: ['chỗ đứng', 'nể trọng'],
          },
        ],
        V: [
          {
            y: 'người ấy rộng rãi, biết lo cho người khác',
            do: ['Thái Dương'],
            sac: Sac.Thuan,
            trong: 84,
            tuKhoa: ['rộng rãi', 'biết lo'],
          },
        ],
        H: [
          {
            y: 'dễ mệt vì gánh vác, sáng với người ngoài mà mỏi ở trong nhà',
            do: ['Thái Dương'],
            sac: Sac.Nghich,
            trong: 82,
            tuKhoa: ['gánh vác', 'mỏi'],
          },
        ],
      },
    },
  },
};
