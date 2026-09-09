import { TheSinhKhac } from '../../chi-ngu-hanh.js';
import { Sac, type LuanDe } from '../luan-de.js';

const de = (y: string, sac: Sac, trong: number, ...tuKhoa: string[]): LuanDe => ({
  y,
  do: [],
  sac,
  trong,
  tuKhoa,
});

/**
 * Viết theo giọng NÓI VỀ NGƯỜI, không theo giọng bảng: "sao dốc sức cho cung" là chú thích cơ chế,
 * nhét vào giữa câu văn thì đọc như dòng ghi chú kỹ thuật — đo được ở bản sinh thật.
 *
 * Thế ngũ hành giữa chính tinh và cung nó đứng. Đây là tầng luận độc lập với miếu vượng: một sao
 * miếu mà bị cung khắc thì mạnh mà không thoải mái, còn sao bình mà được cung sinh thì lại dễ thở.
 *
 * Bản nháp chưa có người biết tử vi soát.
 */
export const SINH_KHAC_LUAN: Readonly<Record<TheSinhKhac, LuanDe>> = {
  [TheSinhKhac.TiHoa]: de(
    'hợp cảnh nên dùng được trọn sức mình',
    Sac.Thuan,
    72,
    'hợp cảnh',
    'dùng được trọn',
  ),
  [TheSinhKhac.CungSinhSao]: de(
    'hoàn cảnh nâng đỡ nên phát huy dễ hơn bình thường',
    Sac.Thuan,
    76,
    'nâng đỡ',
    'phát huy',
  ),
  [TheSinhKhac.SaoSinhCung]: de(
    'được việc mà bản thân hao, làm nhiều mà hưởng ít',
    Sac.Nghich,
    74,
    'bản thân hao',
    'hưởng ít',
  ),
  [TheSinhKhac.SaoKhacCung]: de(
    'áp đặt được nhưng hay gặp phản lực từ chính hoàn cảnh',
    Sac.Nghich,
    74,
    'áp đặt',
    'phản lực',
  ),
  [TheSinhKhac.CungKhacSao]: de(
    'có sức mà khó bung ra hết vì hoàn cảnh kìm lại',
    Sac.Nghich,
    78,
    'khó bung',
    'kìm lại',
  ),
};
