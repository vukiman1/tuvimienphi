import type { THAN_CU_CUNGS } from '@org/shared-tu-vi';

export type ThanCuCung = (typeof THAN_CU_CUNGS)[number];

/**
 * Phần văn cố định của bài Thân cư. Bốn mẩu này chỉ phụ thuộc cung nào an Thân, không phụ thuộc sao
 * và không phụ thuộc người xem — viết một lần, dùng cho mọi lá số rơi vào cung đó.
 *
 * Thân chỉ an vào sáu cung nên bảng đủ ở sáu mục, không có ô trống.
 *
 * Nội dung do người viết, chưa qua tay người biết tử vi soát. Cùng cảnh báo như các bảng luận.
 */
export interface KhungThanCu {
  readonly quote: string;
  /** Đoạn định khung mở bài: nói Thân cư cung này nghĩa là gì, không nhắc tên sao nào. */
  readonly moBai: string;
  /** Đoạn chống hiểu sai, đóng khung nhấn mạnh ở cuối bài. */
  readonly summary: string;
  readonly closing: string;
}

export const THAN_CU_EYEBROW = 'Thân cư';
export const THAN_CU_CLOSING_LABEL = 'Một lời dành cho bạn';

export const KHUNG_THAN_CU: Readonly<Record<ThanCuCung, KhungThanCu>> = {
  Mệnh: {
    quote: 'Người sống đúng với mình thường đi chậm hơn lúc đầu, nhưng ít khi phải quay lại.',
    moBai:
      'Người có **Thân cư Mệnh** thường sống khá nhất quán với bản chất của mình, ít bị hoàn cảnh hay người khác kéo lệch đi. Khi trưởng thành, cái quyết định cuộc đời họ phần lớn nằm ở **chính lựa chọn và tính cách của bản thân** hơn là ở một mối quan hệ hay một chỗ dựa nào bên ngoài.',
    summary:
      'Thân cư Mệnh **không có nghĩa là cuộc đời dễ dàng hơn người khác**. Nó cho thấy phần thưởng lẫn cái giá đều đến từ cùng một nguồn: ==hiểu mình đến đâu thì đi vững đến đó==, nên việc đáng làm nhất vẫn là nhìn cho rõ chính mình.',
    closing: 'Không ai sống hộ được cuộc đời bạn, và đó vừa là gánh nặng vừa là món quà.',
  },
  'Phúc Đức': {
    quote: 'Có những thứ không mua được, chỉ tích được.',
    moBai:
      'Người có **Thân cư Phúc Đức** thường ngả về **phần tinh thần, nếp nhà và phúc phần tích luỹ** khi bước vào giai đoạn trưởng thành. Điều làm họ thấy đời đáng sống thường không nằm ở chức vị hay tiền bạc, mà ở sự yên ổn trong lòng và mối dây với gia tộc, tổ tiên.',
    summary:
      'Thân cư Phúc Đức **không có nghĩa là cứ ngồi yên thì phúc tự đến**. Nó cho thấy điều đáng đầu tư nhất của đời người ở đây là ==cách sống, cách đối đãi và những gì để lại==, vì đó mới là phần sinh lợi lâu nhất.',
    closing: 'Phúc không phải thứ được ban, mà là thứ được gom góp từng ngày.',
  },
  'Quan Lộc': {
    quote: 'Công việc không chỉ nuôi sống ta, nó còn định hình ta.',
    moBai:
      'Người có **Thân cư Quan Lộc** thường lấy **công việc và sự nghiệp làm trục chính của cuộc đời**. Bước vào tuổi trưởng thành, chỗ đứng nghề nghiệp có thể ảnh hưởng mạnh tới tâm trạng, các mối quan hệ và cả cách họ nhìn nhận giá trị bản thân.',
    summary:
      'Thân cư Quan Lộc **không có nghĩa là phải thành đạt mới đáng sống**. Nó cho thấy công việc ở đây mang sức nặng lớn hơn với người khác, nên ==chọn đúng việc và giữ được ranh giới== là bài học quan trọng hơn cả chuyện thăng tiến nhanh hay chậm.',
    closing: 'Làm việc mình tin là đúng, rồi để thời gian trả lời phần còn lại.',
  },
  'Thiên Di': {
    quote: 'Có người tìm thấy mình ở nhà, có người phải đi xa mới gặp.',
    moBai:
      'Người có **Thân cư Thiên Di** thường ngả về **bên ngoài: môi trường sống, chuyện đi xa và những người gặp trên đường**. Cơ hội lẫn thử thách lớn của đời họ ít khi nằm sẵn ở nơi sinh ra, mà thường mở ra khi họ bước ra khỏi vùng quen thuộc.',
    summary:
      'Thân cư Thiên Di **không có nghĩa là buộc phải tha hương mới nên chuyện**. Nó cho thấy ==môi trường và các mối quan hệ bên ngoài có sức nặng khác thường==, nên chọn chỗ đứng và chọn người đồng hành đáng được cân nhắc kỹ hơn.',
    closing: 'Đi xa không phải để chạy khỏi mình, mà để nhìn mình từ một khoảng cách khác.',
  },
  'Tài Bạch': {
    quote: 'Tiền là công cụ tốt và là ông chủ tồi.',
    moBai:
      'Người có **Thân cư Tài Bạch** thường đặt nhiều tâm sức vào **chuyện tiền bạc, tích luỹ và cảm giác an toàn về vật chất**. Khi trưởng thành, những quyết định lớn của họ hay xoay quanh chuyện đủ hay thiếu, giữ hay tiêu, nhiều hơn là quanh chuyện thích hay không thích.',
    summary:
      'Thân cư Tài Bạch **không có nghĩa là đời chỉ xoay quanh tiền**. Nó cho thấy tiền bạc ở đây chạm tới cảm giác an toàn sâu hơn người khác, nên ==biết bao nhiêu là đủ== lại là câu hỏi đáng trả lời hơn câu hỏi làm sao kiếm được nhiều.',
    closing: 'Của cải giữ được lâu thường nhờ cách tiêu, chứ không chỉ nhờ cách kiếm.',
  },
  'Phu Thê': {
    quote: 'Cuộc đời càng trưởng thành, chữ “đồng hành” càng trở nên quan trọng.',
    moBai:
      'Người có **Thân cư Phu Thê** thường đặt khá nhiều tâm sức vào **chuyện tình cảm, hôn nhân và gia đình**. Khi bước vào giai đoạn trưởng thành, người bạn đời có thể trở thành một trong những nhân tố ảnh hưởng mạnh đến lựa chọn, công việc và hướng phát triển của bản thân.',
    summary:
      'Thân cư Phu Thê **không có nghĩa là cuộc đời phụ thuộc vào người phối ngẫu**. Nó cho thấy bài học lớn của cuộc đời thường đến qua hai chữ “đồng hành”: ==chọn đúng người, biết nhường đúng lúc và cùng nhau vun đắp== thì gia đạo lại có thể trở thành hậu phương giúp bản thân đi xa hơn.',
    closing:
      'Duyên tốt không chỉ nằm ở việc gặp đúng người, mà còn ở khả năng cùng một người đi đúng đường.',
  },
};
