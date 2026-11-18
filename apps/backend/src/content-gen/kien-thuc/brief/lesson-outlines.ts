export interface LessonOutline {
  readonly mustCover: readonly string[];
  readonly requiredMentions: readonly string[];
}

export const LESSON_OUTLINES: Readonly<Record<string, LessonOutline>> = {
  'tu-vi-la-gi': {
    mustCover: [
      'Lá số được lập từ giờ, ngày, tháng, năm sinh theo âm lịch và giới tính của một người.',
      'Tử vi dùng để soi chiếu, không dùng để phán số mệnh.',
      'Giới thiệu con đường học phía trước.',
    ],
    requiredMentions: [],
  },
  'la-so-tu-vi-gom-nhung-gi': {
    mustCover: [
      'Địa bàn mười hai cung quanh lá số.',
      'Ô giữa ghi ngày giờ sinh, âm dương, bản mệnh kèm cục, cân lượng, chủ mệnh, chủ thân và lai nhân cung, đúng thứ tự như trên lá số của trang này.',
      'Cách đọc một cung và nên nhìn đâu trước.',
    ],
    requiredMentions: [],
  },
  'am-duong-ngu-hanh-co-ban': {
    mustCover: [
      'Âm và dương là hai mặt của một thể.',
      'Âm dương hiện trên lá số ở dòng Âm dương của ô giữa, và quyết định đại vận đi thuận hay nghịch.',
      'Năm hành và vòng sinh, vòng khắc.',
      'Hành của cung là hành của địa chi nơi cung đóng, nên hành của sao gặp hành của cung.',
    ],
    requiredMentions: ['âm dương'],
  },
  '12-cung-tu-vi': {
    mustCover: ['Mỗi cung một dòng ý nghĩa.', 'Thứ tự các cung quanh địa bàn.'],
    requiredMentions: [],
  },
  'cung-menh-va-cung-than': {
    mustCover: [
      'Phân biệt cung Mệnh và cung Thân.',
      'Vì sao Thân chỉ rơi vào sáu cung.',
      'Trường hợp Thân cư Mệnh.',
    ],
    requiredMentions: ['cung Mệnh', 'cung Thân'],
  },
  'tam-hop-xung-chieu': {
    mustCover: [
      'Tam hợp giữa các cung.',
      'Đối cung và ý nghĩa xung chiếu.',
      'Đọc một cung cùng các cung hội họp; nhắc một câu về vô chính diệu, nối tới [[thuat-ngu/vo-chinh-dieu|vô chính diệu]], không thành mục riêng.',
    ],
    requiredMentions: ['tam hợp', 'xung chiếu', 'đối cung'],
  },
  'y-nghia-chinh-tinh': {
    mustCover: ['Chính tinh là gì.', 'Một dòng cho mỗi chính tinh, chưa bàn bậc.'],
    requiredMentions: ['chính tinh'],
  },
  'chom-tu-vi-va-chom-thien-phu': {
    mustCover: ['Hai chòm sao chính.', 'Chòm Thiên Phủ soi gương chòm Tử Vi ra sao.'],
    requiredMentions: ['chòm Tử Vi', 'chòm Thiên Phủ'],
  },
  'mieu-vuong-dac-binh-ham': {
    mustCover: [
      'Năm bậc miếu, vượng, đắc địa, bình hòa, hãm nghĩa là gì.',
      'Cách đọc chữ bậc bên cạnh một sao.',
      'Có sao không mang bậc nào.',
    ],
    requiredMentions: ['miếu', 'hãm'],
  },
  'phu-tinh-thuong-gap': {
    mustCover: [
      'Các cặp phụ tinh.',
      'Phân biệt cát và hung.',
      'Vì sao phụ tinh tô màu cho một cung.',
    ],
    requiredMentions: ['phụ tinh'],
  },
  'tu-hoa-la-gi': {
    mustCover: ['Tứ hóa bám vào sao nào.', 'Tứ hóa đi theo can của năm.'],
    requiredMentions: ['tứ hóa'],
  },
  'tuan-va-triet': {
    mustCover: ['Tuần và Triệt chặn điều gì.', 'Đọc một cung nằm dưới Tuần hay Triệt.'],
    requiredMentions: ['Tuần', 'Triệt'],
  },
  'cach-xem-dai-van': {
    mustCover: ['Đại vận đầu khởi ở đâu.', 'Đọc một vận như đọc một cung.'],
    requiredMentions: ['đại vận'],
  },
  'tieu-van-hang-nam': {
    mustCover: ['Cung của năm là gì.', 'Khác đại vận ra sao.'],
    requiredMentions: ['tiểu vận'],
  },
  'sao-thai-tue': {
    mustCover: ['Thái Tuế là gì.', 'Các sao lưu niên.', 'Giữ giọng điềm tĩnh.'],
    requiredMentions: ['Thái Tuế', 'lưu niên'],
  },
  'ung-dung-tu-vi-cong-viec': {
    mustCover: ['Cung Quan Lộc và các cung hội họp.', 'Dùng lá số để soi chiếu, không ra lệnh.'],
    requiredMentions: [],
  },
  'phong-thuy-va-tu-vi': {
    mustCover: [
      'Phong thủy và tử vi khác nhau thế nào.',
      'Mỗi môn nói được gì và không nói được gì.',
    ],
    requiredMentions: [],
  },
  'doc-la-so-cua-chinh-ban': {
    mustCover: ['Đọc lá số mẫu theo từng bước.', 'Hướng dẫn người đọc lập lá số của mình.'],
    requiredMentions: [],
  },
};
