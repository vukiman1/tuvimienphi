import type { PhuTinhName } from '../../sao-names.js';
import { Sac, type LuanDe } from '../luan-de.js';

/**
 * Mệnh đề của phụ tinh, dùng chung cho mọi cung. Phần lớn phụ tinh bổ nghĩa hoặc hoá giải chứ ít
 * khi tự đứng thành kết luận, nên mỗi sao chỉ một mệnh đề và trọng số thấp hơn tầng nền.
 *
 * Cùng cảnh báo như bảng chính tinh: hạt giống, chưa soát.
 */
export const PHU_TINH_LUAN: Readonly<Partial<Record<PhuTinhName, LuanDe>>> = {
  'Đại Hao': {
    y: 'hao tán, dễ tiêu tốn tâm sức và tiền bạc vì chuyện tình cảm',
    do: ['Đại Hao'],
    sac: Sac.Nghich,
    trong: 65,
    tuKhoa: ['hao tán', 'tiêu tốn', 'tiền bạc'],
  },
  'Kiếp Sát': {
    y: 'có giai đoạn chịu áp lực hoặc mất mát trong quan hệ',
    do: ['Kiếp Sát'],
    sac: Sac.Nghich,
    trong: 60,
    tuKhoa: ['áp lực', 'mất mát'],
  },
  'Thiên Diêu': {
    y: 'thêm phần đa tình, dễ vướng chuyện ngoài luồng',
    do: ['Thiên Diêu'],
    sac: Sac.Nghich,
    trong: 60,
    tuKhoa: ['đa tình', 'ngoài luồng'],
  },
  'Đà La': {
    y: 'trắc trở kéo dài, việc gì cũng chậm và dây dưa',
    do: ['Đà La'],
    sac: Sac.Nghich,
    trong: 62,
    tuKhoa: ['trắc trở', 'chậm', 'dây dưa'],
  },
  'Cô Thần': {
    y: 'có lúc thấy cô đơn ngay trong chính mối quan hệ',
    do: ['Cô Thần'],
    sac: Sac.Nghich,
    trong: 58,
    tuKhoa: ['cô đơn'],
  },
  'Phá Toái': {
    y: 'dễ có đổ vỡ hoặc gián đoạn giữa chừng',
    do: ['Phá Toái'],
    sac: Sac.Nghich,
    trong: 55,
    tuKhoa: ['đổ vỡ', 'gián đoạn'],
  },
  'Thiên Không': {
    y: 'dễ hụt hẫng vì kỳ vọng không khớp thực tế',
    do: ['Thiên Không'],
    sac: Sac.Nghich,
    trong: 55,
    tuKhoa: ['hụt hẫng', 'kỳ vọng'],
  },
  'Kình Dương': {
    y: 'dễ va chạm, lời qua tiếng lại',
    do: ['Kình Dương'],
    sac: Sac.Nghich,
    trong: 55,
    tuKhoa: ['va chạm', 'lời qua tiếng lại'],
  },
  'Hỏa Tinh': {
    y: 'tính khí nóng, xung đột đến nhanh đi nhanh',
    do: ['Hỏa Tinh'],
    sac: Sac.Nghich,
    trong: 50,
    tuKhoa: ['nóng', 'xung đột'],
  },
  'Linh Tinh': {
    y: 'uất ức âm ỉ, khó nói thẳng',
    do: ['Linh Tinh'],
    sac: Sac.Nghich,
    trong: 50,
    tuKhoa: ['uất ức', 'khó nói'],
  },
  'Thiên Hình': {
    y: 'nguyên tắc cứng, dễ thành khắc khẩu',
    do: ['Thiên Hình'],
    sac: Sac.Nghich,
    trong: 50,
    tuKhoa: ['nguyên tắc', 'khắc khẩu'],
  },
  'Địa Không': {
    y: 'dễ hụt hẫng, có giai đoạn thấy trống trải ngay trong quan hệ',
    do: ['Địa Không'],
    sac: Sac.Nghich,
    trong: 62,
    tuKhoa: ['hụt hẫng', 'trống trải'],
  },
  'Tiểu Hao': {
    y: 'hao vặt, tốn kém lặt vặt vì chuyện tình cảm',
    do: ['Tiểu Hao'],
    sac: Sac.Nghich,
    trong: 45,
    tuKhoa: ['hao vặt', 'tốn kém'],
  },
  'Hóa Quyền': {
    y: 'người ấy có tiếng nói và quyền quyết trong nhà',
    do: ['Hóa Quyền'],
    sac: Sac.Thuan,
    trong: 68,
    tuKhoa: ['tiếng nói', 'quyền quyết'],
  },
  'Hóa Lộc': {
    y: 'có phần lộc đi kèm, đường tài chính của hai người dễ thở',
    do: ['Hóa Lộc'],
    sac: Sac.Thuan,
    trong: 58,
    tuKhoa: ['phần lộc', 'dễ thở'],
  },
  'Thiên Khôi': {
    y: 'gặp việc khó thường có quý nhân đỡ một tay',
    do: ['Thiên Khôi'],
    sac: Sac.HoaGiai,
    trong: 52,
    tuKhoa: ['quý nhân'],
  },
  'Hồng Loan': {
    y: 'duyên đến rõ ràng, dễ có hôn sự đúng lúc',
    do: ['Hồng Loan'],
    sac: Sac.Thuan,
    trong: 62,
    tuKhoa: ['duyên đến', 'hôn sự'],
  },
  'Thiên Y': {
    y: 'hợp duyên, dễ được người khác giới quý mến',
    do: ['Thiên Y'],
    sac: Sac.Thuan,
    trong: 45,
    tuKhoa: ['hợp duyên', 'quý mến'],
  },
  'Đào Hoa': {
    y: 'duyên dáng, nhiều người để ý',
    do: ['Đào Hoa'],
    sac: Sac.Thuan,
    trong: 45,
    tuKhoa: ['duyên dáng', 'để ý'],
  },
  'Bát Tọa': {
    y: 'có chỗ đứng, được nể trọng trong quan hệ',
    do: ['Bát Tọa'],
    sac: Sac.Thuan,
    trong: 40,
    tuKhoa: ['chỗ đứng', 'nể trọng'],
  },
  'Thiên Thọ': {
    y: 'có yếu tố bền, giữ được lâu khi đã ổn định',
    do: ['Thiên Thọ'],
    sac: Sac.HoaGiai,
    trong: 55,
    tuKhoa: ['bền', 'giữ được lâu'],
  },
  'Nguyệt Đức': {
    y: 'có phúc đức che chở, gặp việc thường có người đỡ',
    do: ['Nguyệt Đức'],
    sac: Sac.HoaGiai,
    trong: 50,
    tuKhoa: ['che chở', 'người đỡ'],
  },
  'Thiên Đức': {
    y: 'có đức che chở, hung hóa cát',
    do: ['Thiên Đức'],
    sac: Sac.HoaGiai,
    trong: 50,
    tuKhoa: ['che chở', 'hung hóa cát'],
  },
  'Thiên Hỉ': {
    y: 'có tin vui, không khí hòa hợp',
    do: ['Thiên Hỉ'],
    sac: Sac.HoaGiai,
    trong: 45,
    tuKhoa: ['tin vui', 'hòa hợp'],
  },
};
