import { CUU_DIEU_LOI } from '@org/shared-tu-vi';
import type { AiMessage } from '../../ai/port/ai.types';
import type { LanThu } from '../../api/luan-giai/generation/sinh-voi-kiem';
import { TuoiNamSection, type TuoiNamBrief } from './tuoi-nam.brief';
import type { TuoiNamDraft } from './tuoi-nam.schema';

export const TUOI_NAM_SYSTEM_PROMPT = `Bạn viết một trang "Tử vi theo tuổi" cho người Việt, về một năm sinh âm lịch trong một năm xem cụ thể. Trang gộp cả nam mạng và nữ mạng của cùng năm sinh.

Quy tắc bắt buộc:
- Chỉ viết từ brief được đưa. Không thêm sao, hạn, cung hay kết luận nào brief không nêu. Mục nam mạng chỉ nhắc sao và hạn của nam; mục nữ mạng chỉ nhắc sao và hạn của nữ.
- Mỗi mục phải dùng đúng nguyên văn các cụm trong danh sách "Phải nêu" của mục đó.
- Giọng bình tĩnh, thực tế: dân gian nói gì, cần cẩn thận điều gì, nên làm gì. Không dọa, không nói giảm nhẹ quá mức, không dùng từ gây sợ hãi.
- Không bán hàng, không khuyên cúng bái hay mua sắm. Không viết "phải cúng", "nên mua", "bắt buộc cúng".
- Mỗi mục gồm từ 2 đến 4 đoạn văn. Mỗi đoạn nói một ý riêng, không lặp lại ý đoạn trước.
- Không giải thích Tam tai, Thái tuế hay xông đất; trang đã có liên kết sang trang con giáp cho các phần đó.
- Mục lời khuyên và tổng quan phải gắn với giai đoạn đời của độ tuổi này.
- FAQ gồm từ 3 đến 5 câu hỏi, trả lời từ brief. Bắt buộc có hai câu: "Nam {năm sinh} năm {năm xem} sao gì chiếu mệnh?" và "Nữ {năm sinh} năm {năm xem} gặp hạn gì?".
- Văn xuôi tiếng Việt tự nhiên, không dùng markdown, không gạch đầu dòng.

Trả về JSON đúng schema.`;

const SECTION_BRIEFS: readonly { readonly section: TuoiNamSection; readonly title: string }[] = [
  { section: TuoiNamSection.TongQuan, title: 'Tổng quan năm (mục tongQuan)' },
  {
    section: TuoiNamSection.SaoHanNam,
    title: 'Sao chiếu mệnh và hạn của nam mạng (mục saoHanNam)',
  },
  { section: TuoiNamSection.SaoHanNu, title: 'Sao chiếu mệnh và hạn của nữ mạng (mục saoHanNu)' },
  { section: TuoiNamSection.Menh, title: 'Mệnh năm sinh và mệnh năm xem (mục menh)' },
  { section: TuoiNamSection.CuoiNha, title: 'Cưới hỏi, làm nhà (mục cuoiNha)' },
  { section: TuoiNamSection.LoiKhuyen, title: 'Lời khuyên cho năm (mục loiKhuyen)' },
];

function describeFacts(brief: TuoiNamBrief): string {
  const { facts } = brief;
  return [
    `Năm sinh: ${facts.canChi} ${facts.birthYear}, năm xem: ${facts.viewYear}, tuổi mụ ${facts.tuoi}, giai đoạn đời: ${facts.giaiDoan}.`,
    `Mệnh năm sinh: ${facts.menh.name}. Mệnh năm xem: ${facts.menhNam.name}. Quan hệ: ${facts.menhVoiNam}.`,
    `Nam mạng: sao ${facts.nam.sao} (${CUU_DIEU_LOI[facts.nam.sao]}), hạn ${facts.nam.han}.`,
    `Nữ mạng: sao ${facts.nu.sao} (${CUU_DIEU_LOI[facts.nu.sao]}), hạn ${facts.nu.han}.`,
  ].join('\n');
}

function describeSections(brief: TuoiNamBrief): string {
  return SECTION_BRIEFS.map(({ section, title }) => {
    const keywords = brief.claims
      .filter((claim) => claim.section === section)
      .map((claim) => `"${claim.keyword}"`);
    return `${title}\nPhải nêu: ${keywords.join(', ')}`;
  }).join('\n\n');
}

function serializeTuoiNamBrief(brief: TuoiNamBrief): string {
  return `${describeFacts(brief)}\n\n${describeSections(brief)}`;
}

function rewriteRequest(violations: readonly string[]): string {
  return `Bản trên vi phạm:\n${violations.map((violation) => `- ${violation}`).join('\n')}\nViết lại cho đúng, giữ nguyên nội dung các mệnh đề.`;
}

export function buildTuoiNamMessages(
  brief: TuoiNamBrief,
  daThu: readonly LanThu<TuoiNamDraft>[],
): AiMessage[] {
  return [
    { role: 'user', text: serializeTuoiNamBrief(brief) },
    ...daThu.flatMap((lan): AiMessage[] => [
      { role: 'model', text: JSON.stringify(lan.paragraph) },
      { role: 'user', text: rewriteRequest(lan.loi) },
    ]),
  ];
}
