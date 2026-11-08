import { CHI, TAM_TAI_LOI } from '@org/shared-tu-vi';
import type { AiMessage } from '../../ai/port/ai.types';
import type { LanThu } from '../../api/luan-giai/generation/sinh-voi-kiem';
import { tamTaiKeyword } from '../chi-verdicts';
import { rejectedAttemptMessages } from '../rejected-attempts';
import { ConGiapSection, type ConGiapBrief } from './con-giap.brief';
import type { ConGiapDraft } from './con-giap.schema';

export const CON_GIAP_SYSTEM_PROMPT = `Bạn viết một trang "Tử vi con giáp" cho người Việt, về một con giáp trong một năm xem cụ thể: Tam tai, quan hệ với Thái tuế và tuổi xông đất.

Quy tắc bắt buộc:
- Chỉ viết từ các dữ kiện bên dưới. Không thêm năm Tam tai, quan hệ Thái tuế, con giáp hợp hay con giáp nên tránh nào dữ kiện không nêu. Không tự bịa thêm ý nghĩa.
- Viết thẳng cho người đọc như một bài viết hoàn chỉnh. Không nhắc tới dữ kiện, hướng dẫn, cách bài được soạn hay người soạn; không viết "theo dữ kiện", "theo thông tin được cung cấp".
- Mỗi mục phải dùng đúng nguyên văn các cụm trong danh sách "Phải nêu" của mục đó. Tên con giáp viết hoa chữ cái đầu.
- Mục xông đất chỉ nhắc đúng các con giáp dữ kiện liệt kê: nêu con giáp hợp xông đất và con giáp nên tránh, không nhắc con giáp nào khác ngoài chính con giáp của trang và con giáp của năm xem.
- Giọng bình tĩnh, thực tế: dân gian nói gì, cần cẩn thận điều gì, nên làm gì. Không dọa, không nói giảm nhẹ quá mức, không dùng từ gây sợ hãi.
- Không bán hàng, không khuyên cúng bái hay mua sắm. Không viết "phải cúng", "nên mua", "bắt buộc cúng".
- Mỗi mục gồm từ 2 đến 4 đoạn văn. Mỗi đoạn nói một ý riêng, không lặp lại ý đoạn trước.
- Thái tuế là cách dân gian gọi vị thần trực năm; chỉ nói rằng tuổi phạm Thái tuế thường được khuyên cẩn trọng và giữ mọi việc ở mức vừa phải.
- Văn xuôi tiếng Việt tự nhiên, không dùng markdown, không gạch đầu dòng.

Trả về JSON đúng schema.`;

const SECTION_TITLES: Readonly<Record<ConGiapSection, string>> = {
  [ConGiapSection.TongQuan]: 'Tổng quan con giáp trong năm (mục tongQuan)',
  [ConGiapSection.TamTai]: 'Tam tai (mục tamTai)',
  [ConGiapSection.ThaiTue]: 'Quan hệ với Thái tuế (mục thaiTue)',
  [ConGiapSection.XongDat]: 'Tuổi hợp xông đất và tuổi nên tránh (mục xongDat)',
};

function describeTamTai(brief: ConGiapBrief): string {
  const { tamTai, viewYear } = brief.facts;
  const verdict =
    tamTai === null
      ? `Năm ${viewYear} tuổi này không nằm trong ba năm Tam tai`
      : `Năm ${viewYear} của tuổi này là ${tamTaiKeyword(tamTai)}`;
  return `Tam tai: ${verdict}. ${TAM_TAI_LOI}`;
}

function describeThaiTue(brief: ConGiapBrief): string {
  const { thaiTue, viewChi } = brief.facts;
  const verdict =
    thaiTue.length === 0
      ? 'tuổi này không phạm Thái tuế'
      : `tuổi này phạm Thái tuế theo các quan hệ: ${thaiTue.join(', ')}`;
  return `Thái tuế: năm xem là năm ${CHI[viewChi]}; ${verdict}.`;
}

function describeXongDat(brief: ConGiapBrief): string {
  const { hop, tranh } = brief.facts.xongDat;
  const names = (chis: readonly number[]): string =>
    chis.length === 0 ? 'không có' : chis.map((chi) => CHI[chi]).join(', ');
  return `Xông đất (nhà chủ tuổi ${CHI[brief.facts.chi]}): tuổi hợp xông đất: ${names(hop)}. Tuổi nên tránh xông đất: ${names(tranh)}.`;
}

function describeFacts(brief: ConGiapBrief): string {
  const { chi, viewYear } = brief.facts;
  return [
    `Con giáp: ${CHI[chi]}, năm xem: ${viewYear}.`,
    describeTamTai(brief),
    describeThaiTue(brief),
    describeXongDat(brief),
  ].join('\n');
}

function describeSections(brief: ConGiapBrief): string {
  return Object.values(ConGiapSection)
    .map((section) => {
      const keywords = brief.claims
        .filter((claim) => claim.section === section)
        .map((claim) => `"${claim.keyword}"`);
      return `${SECTION_TITLES[section]}\nPhải nêu: ${keywords.join(', ')}`;
    })
    .join('\n\n');
}

export function buildConGiapMessages(
  brief: ConGiapBrief,
  daThu: readonly LanThu<ConGiapDraft>[],
): AiMessage[] {
  return [
    { role: 'user', text: `${describeFacts(brief)}\n\n${describeSections(brief)}` },
    ...rejectedAttemptMessages(daThu),
  ];
}
