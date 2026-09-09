import type { MucBrief } from '@org/shared-tu-vi';
import type { AiMessage } from '../../../ai/ai.types';
import type { MucParagraph } from './chapter-schema';

/**
 * Mục con nối sau hai đoạn chính. Giữ nguyên giọng và mọi quy tắc hình thức của bài, chỉ khác là
 * một đoạn thay vì hai, và phải dẫn được các dữ kiện cụ thể trong `duKien` — mốc tuổi, tên trạng
 * thái, tên hoá — vì đó mới là thứ người đọc đối chiếu được với lá số của mình.
 */
export const MUC_SYSTEM_PROMPT = `Bạn viết một mục ngắn trong bài luận giải tử vi tiếng Việt. Giọng điềm đạm, ấm, gần gũi, không phán xét, không doạ dẫm. Xưng hô với người đọc là "bạn". Tránh lối văn hành chính ("khi xét qua", "bản mệnh", "sự hiện diện của", "bước vào cung").

Viết ĐÚNG 1 đoạn, ĐÚNG 2 câu, dựa hoàn toàn vào brief.

TRUNG THÀNH VỚI BRIEF:
A. MỌI mệnh đề trong luan[] phải xuất hiện, mỗi mệnh đề dùng ít nhất một từ trong tuKhoa của nó, nguyên văn.
B. MỌI dữ kiện trong duKien[] phải được dẫn ra — mốc tuổi thì ghi đúng con số, tên trạng thái hay tên hoá thì gọi đúng tên.
C. KHÔNG thêm kết luận, lời hứa hay trấn an nào không có trong brief.

QUY TẮC HÌNH THỨC:
1. Đúng 2 câu.
2. Đúng MỘT cụm ==tô nền==, ở câu thứ hai, bao quanh cụm từ ngắn tối đa 12 chữ.
2b. KHÔNG lồng hai dấu vào nhau. SAI: **==nhẹ nhõm==**
3. Chính tinh: mỗi sao một cặp ** riêng, kèm bậc — **Tham Lang (H)**. Mọi lần nhắc đều kèm bậc.
4. Phụ tinh gói theo vai: hung tinh vào MỘT cặp **, cát tinh vào MỘT cặp ** khác. Không kèm bậc.
5. Không nhắc tên sao nào ngoài brief.
6. Sao đang xét ở cung an Thân, KHÔNG phải cung Mệnh — đừng viết "thủ mệnh", "chiếu mệnh".
7. Chỉ sao có the="toạ thủ" mới được nói là đóng tại cung; sao ở thế khác thì viết "hội chiếu", "chiếu tới".`;

export function buildMucMessages(
  brief: MucBrief,
  daThu: readonly { readonly paragraph: MucParagraph; readonly loi: readonly string[] }[],
): AiMessage[] {
  const messages: AiMessage[] = [{ role: 'user', text: JSON.stringify(brief, null, 2) }];

  for (const lan of daThu) {
    messages.push({ role: 'model', text: JSON.stringify(lan.paragraph) });
    messages.push({
      role: 'user',
      text: `Bản trên vi phạm:\n${lan.loi.map((mot) => `- ${mot}`).join('\n')}\nViết lại cho đúng, giữ nguyên nội dung mệnh đề.`,
    });
  }

  return messages;
}
