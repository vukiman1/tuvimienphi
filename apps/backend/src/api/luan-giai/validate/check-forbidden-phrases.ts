import type { ChapterBrief } from '@org/shared-tu-vi';
import type { BaiCanKiem } from './bai-can-kiem';

const CHI_DUNG_O_CUNG_MENH = ['thủ mệnh', 'chiếu mệnh', 'toạ mệnh', 'tọa mệnh'] as const;

const HUA_HEN_VO_CAN_CU = [
  'vượt qua mọi',
  'mọi thử thách',
  'chắc chắn sẽ',
  'không bao giờ',
  'luôn luôn',
] as const;

const VAN_HANH_CHINH = [
  'bước vào cung',
  'sự hiện diện của',
  'sự hội tụ của',
  'khi xét qua',
] as const;

const VO_CHONG_O_CUNG_PHU_THE = /(?<!\p{L})(vợ|chồng)(?!\p{L}|\s(?:chất|chéo))/u;

function tim(bai: BaiCanKiem, cam: readonly string[]): string[] {
  return bai.doan.flatMap((doan, chiSo) => {
    const thuong = doan.toLowerCase();
    return cam
      .filter((cum) => thuong.includes(cum))
      .map((cum) => `đoạn ${chiSo + 1}: dùng cụm bị cấm "${cum}"`);
  });
}

function timVoChong(bai: BaiCanKiem): string[] {
  return bai.doan.flatMap((doan, chiSo) => {
    const khop = VO_CHONG_O_CUNG_PHU_THE.exec(doan.toLowerCase());
    return khop ? [`đoạn ${chiSo + 1}: dùng cụm bị cấm "${khop[1]}"`] : [];
  });
}

export function checkForbiddenPhrases(brief: ChapterBrief, bai: BaiCanKiem): string[] {
  const cumBiCam = tim(bai, [
    ...(brief.cung === 'Mệnh' ? [] : CHI_DUNG_O_CUNG_MENH),
    ...HUA_HEN_VO_CAN_CU,
  ]);
  return brief.cung === 'Phu Thê' ? [...cumBiCam, ...timVoChong(bai)] : cumBiCam;
}

export function checkStyle(bai: BaiCanKiem): string[] {
  return tim(bai, VAN_HANH_CHINH);
}
