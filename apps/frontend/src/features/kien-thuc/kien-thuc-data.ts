export const ARTICLE_CATEGORIES = ['Tử Vi', 'Phong Thủy', 'Tứ Trụ', 'Xem Ngày'] as const;

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

export interface Article {
  readonly slug: string;
  readonly title: string;
  readonly category: ArticleCategory;
  readonly excerpt: string;
  readonly date: string;
  readonly readingMinutes: number;
  readonly body: readonly string[];
}

export const ARTICLES: readonly Article[] = [
  {
    slug: 'thien-can-dia-chi',
    title: 'Thiên Can, Địa Chi và vòng Lục Thập Hoa Giáp',
    category: 'Tử Vi',
    excerpt:
      'Mười Thiên Can ghép cùng mười hai Địa Chi tạo thành chu kỳ sáu mươi năm — nền tảng của mọi phép luận tử vi, tứ trụ và xem ngày.',
    date: '2026-08-10',
    readingMinutes: 6,
    body: [
      'Thiên Can gồm mười chữ: Giáp, Ất, Bính, Đinh, Mậu, Kỷ, Canh, Tân, Nhâm, Quý. Mỗi Can mang một hành và một tính âm dương cố định, thể hiện phần "khí trời" trong một thời điểm.',
      'Địa Chi gồm mười hai chữ, gắn với mười hai con giáp: Tý, Sửu, Dần, Mão, Thìn, Tỵ, Ngọ, Mùi, Thân, Dậu, Tuất, Hợi. Địa Chi tượng trưng cho phần "khí đất", cho mùa và cho phương vị.',
      'Ghép một Thiên Can với một Địa Chi theo thứ tự, ta được một cặp Can Chi. Vì bội số chung nhỏ nhất của 10 và 12 là 60, nên phải qua đúng sáu mươi cặp mới lặp lại từ đầu — đó là vòng Lục Thập Hoa Giáp, chu kỳ sáu mươi năm.',
      'Mỗi năm, tháng, ngày, giờ đều được gọi tên bằng một cặp Can Chi. Khi biết Can Chi của bốn yếu tố này (gọi là Tứ Trụ), người xem có thể luận ra ngũ hành thịnh suy, từ đó suy ra vận mệnh và sự hợp khắc.',
      'Nắm vững Can Chi là bước đầu tiên bắt buộc: mọi khái niệm sau này — nạp âm, tam hợp, lục xung, tam tai — đều dựng trên nền tảng này.',
    ],
  },
  {
    slug: 'ngu-hanh-tuong-sinh-tuong-khac',
    title: 'Ngũ hành tương sinh, tương khắc',
    category: 'Tử Vi',
    excerpt:
      'Kim, Mộc, Thủy, Hỏa, Thổ vận hành theo hai vòng sinh và khắc. Hiểu đúng hai vòng này là chìa khóa để cân bằng mệnh cục.',
    date: '2026-08-08',
    readingMinutes: 5,
    body: [
      'Ngũ hành là năm loại khí: Kim (kim loại), Mộc (cây cối), Thủy (nước), Hỏa (lửa), Thổ (đất). Mọi sự vật đều được quy về một trong năm hành này.',
      'Vòng tương sinh diễn tả sự nuôi dưỡng: Mộc sinh Hỏa, Hỏa sinh Thổ, Thổ sinh Kim, Kim sinh Thủy, Thủy sinh Mộc. Hành trước bồi đắp cho hành sau.',
      'Vòng tương khắc diễn tả sự chế ngự: Mộc khắc Thổ, Thổ khắc Thủy, Thủy khắc Hỏa, Hỏa khắc Kim, Kim khắc Mộc. Hành trước kìm hãm hành sau.',
      'Trong luận mệnh, không phải cứ được sinh là tốt hay bị khắc là xấu. Một mệnh quá vượng cần được khắc để tiết bớt; một mệnh quá nhược lại cần được sinh để bồi thêm. Cái đích là sự cân bằng.',
      'Vì vậy khi chọn màu sắc, hướng nhà hay vật phẩm phong thủy, người ta luôn xét xem bản mệnh đang thiếu hay thừa hành nào, rồi mới bổ khuyết cho đúng.',
    ],
  },
  {
    slug: 'tam-tai-va-cach-hoa-giai',
    title: 'Tam Tai là gì và cách hóa giải',
    category: 'Xem Ngày',
    excerpt:
      'Ba năm Tam Tai đến với mỗi nhóm tam hợp theo chu kỳ. Biết mình có phạm hay không giúp chủ động giữ mình thay vì lo sợ.',
    date: '2026-08-05',
    readingMinutes: 4,
    body: [
      'Tam Tai là ba năm liên tiếp được cho là kém thuận cho mỗi người, xoay vòng theo nhóm tam hợp Địa Chi.',
      'Bốn nhóm tam hợp là: Thân – Tý – Thìn, Dần – Ngọ – Tuất, Tỵ – Dậu – Sửu, Hợi – Mão – Mùi. Mỗi nhóm gặp Tam Tai vào ba năm cố định trong mỗi mười hai năm.',
      'Quan niệm dân gian cho rằng năm Tam Tai dễ gặp trắc trở về sức khỏe, giấy tờ, tiền bạc. Tuy nhiên đây là ảnh hưởng chung, không phải định mệnh; mức độ còn tùy vào lá số từng người.',
      'Cách hóa giải phổ biến là giữ tâm ổn định, tránh quyết định lớn mang tính mạo hiểm trong năm đầu, thận trọng giấy tờ và đi lại, làm nhiều việc thiện. Không nên vì sợ Tam Tai mà đình trệ mọi việc.',
    ],
  },
  {
    slug: 'kim-lau-hoang-oc-lam-nha',
    title: 'Kim Lâu và Hoang Ốc khi làm nhà',
    category: 'Phong Thủy',
    excerpt:
      'Trước khi động thổ hay nhập trạch, người xưa xét tuổi gia chủ qua hai phép Kim Lâu và Hoang Ốc để tránh năm xấu.',
    date: '2026-08-02',
    readingMinutes: 5,
    body: [
      'Kim Lâu xét theo tuổi mụ của gia chủ. Người ta lấy tuổi mụ chia cho 9, xét số dư rơi vào Kim Lâu Thân, Thê, Tử hay Lục Súc — mỗi loại ứng với một điều kiêng khác nhau khi làm nhà.',
      'Hoang Ốc lại xét tuổi theo một vòng sáu cung: Nhất Cát, Nhị Nghi, Tam Địa Sát, Tứ Tấn Tài, Ngũ Thọ Tử, Lục Hoang Ốc. Rơi vào cung tốt thì thuận, rơi vào cung xấu thì nên tránh hoặc mượn tuổi.',
      'Khi tuổi gia chủ không đẹp, giải pháp thường dùng là "mượn tuổi": nhờ một người hợp tuổi đứng ra động thổ, làm lễ, còn gia chủ tạm lánh mặt lúc khởi công.',
      'Cần nhớ hai phép này chỉ xét riêng tuổi làm nhà, không thay thế cho việc chọn ngày giờ tốt và xem hướng. Một công trình thuận lợi cần cả tuổi đẹp, ngày đẹp lẫn hướng hợp mệnh.',
    ],
  },
  {
    slug: 'cung-menh-va-ban-menh-nap-am',
    title: 'Cung mệnh và bản mệnh nạp âm',
    category: 'Tử Vi',
    excerpt:
      'Nhiều người nhầm cung mệnh với bản mệnh. Đây là hai khái niệm khác nhau, dùng cho hai mục đích khác nhau.',
    date: '2026-07-28',
    readingMinutes: 5,
    body: [
      'Bản mệnh nạp âm là hành của năm sinh theo Lục Thập Hoa Giáp — ví dụ Canh Tý là Bích Thượng Thổ, Tân Sửu là Bích Thượng Thổ. Đây là "mệnh" mà người ta hay hỏi: mệnh Kim, mệnh Mộc, mệnh Thủy...',
      'Cung mệnh (cung phi) lại tính theo năm sinh và giới tính, cho ra một trong tám cung Bát Quái: Càn, Khảm, Cấn, Chấn, Tốn, Ly, Khôn, Đoài. Cung phi dùng để xét hướng nhà, hướng bàn làm việc theo Đông tứ trạch và Tây tứ trạch.',
      'Như vậy, bản mệnh nạp âm dùng để xét sinh khắc ngũ hành và chọn màu sắc, vật phẩm; còn cung mệnh dùng để chọn phương hướng.',
      'Khi ai đó nói "hợp hướng Đông", họ đang nói về cung mệnh. Khi nói "hợp màu trắng vì mệnh Kim", họ đang nói về bản mệnh nạp âm. Phân biệt rõ hai khái niệm giúp tránh áp dụng sai.',
    ],
  },
  {
    slug: 'chon-ngay-tot-theo-hoang-dao',
    title: 'Chọn ngày tốt theo giờ Hoàng đạo',
    category: 'Xem Ngày',
    excerpt:
      'Một ngày tốt còn cần giờ tốt. Mười hai giờ trong ngày chia thành Hoàng đạo và Hắc đạo, quyết định thời điểm khởi sự.',
    date: '2026-07-25',
    readingMinutes: 4,
    body: [
      'Trong một ngày có mười hai giờ (mỗi giờ hai tiếng đồng hồ), luân phiên mang sao tốt (Hoàng đạo) hoặc sao xấu (Hắc đạo) tùy theo Địa Chi của ngày.',
      'Giờ Hoàng đạo là giờ có quý nhân, cát tinh chiếu, thích hợp cho việc trọng đại như cưới hỏi, khai trương, xuất hành, ký kết. Giờ Hắc đạo thì nên tránh khởi sự lớn.',
      'Cách tra nhanh là dựa vào Chi của ngày để biết giờ nào là Hoàng đạo. Người xưa còn có các bài vè để nhớ, nhưng ngày nay lịch vạn niên đã ghi sẵn.',
      'Nguyên tắc thực dụng: chọn ngày tốt trước, sau đó trong ngày ấy chọn tiếp giờ Hoàng đạo hợp với việc mình làm và không xung với tuổi gia chủ.',
    ],
  },
];

export function findArticle(slug: string): Article | undefined {
  return ARTICLES.find((article) => article.slug === slug);
}

export function formatArticleDate(date: string): string {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}
