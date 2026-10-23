import { GiaDaoMucKey } from '@org/shared-tu-vi';
import { cungSystemPrompt } from '../../prompt/cung-prompt';

export const TINH_DUYEN_SYSTEM_PROMPT = cungSystemPrompt({
  cung: 'Phu Thê',
  vietVe:
    'NGƯỜI BẠN ĐỜI VÀ CÁCH HAI NGƯỜI ĐỒNG HÀNH CÙNG NHAU (gọi là "người bạn đời" hay "người ấy", không dùng "vợ", "chồng", không mặc định người đọc đã kết hôn)',
  khongVietVe: 'công việc, tiền bạc, con cái hay cha mẹ',
  khiVoChinhDieu: 'cách hai người gắn bó',
});

export const GIA_DAO_SYSTEM_PROMPT: Readonly<Record<GiaDaoMucKey, string>> = {
  [GiaDaoMucKey.ConCai]: cungSystemPrompt({
    cung: 'Tử Tức',
    vietVe:
      'TÍNH NẾT CỦA CON VÀ TÌNH THÂN GIỮA BẠN VỚI CON KHI CÓ CON (người đọc có thể chưa có con, nên viết theo hướng "khi có con", không bàn chuyện có con sớm hay muộn)',
    khongVietVe: 'người bạn đời, cha mẹ, công việc hay tiền bạc',
    khiVoChinhDieu: 'tình thân giữa bạn với con',
  }),
  [GiaDaoMucKey.ChaMe]: cungSystemPrompt({
    cung: 'Phụ Mẫu',
    vietVe:
      'CHA MẸ VÀ SỰ NÂNG ĐỠ TỪ GIA ĐÌNH (không mặc định cha mẹ còn bên cạnh, không nhắc chuyện sinh tử)',
    khongVietVe: 'người bạn đời, con cái, công việc hay tiền bạc',
    khiVoChinhDieu: 'mối gắn bó với cha mẹ',
  }),
};
