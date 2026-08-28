import { MEDIA } from '@/config/media';

/**
 * The knowledge hub groups articles under seven feng-shui themed topics. `iconNo` points at the
 * hand-drawn glyph in /separated_icons (icon_2..icon_8; icon_1 is the "All" chip) so the topic,
 * label and artwork never drift apart.
 */
export const CATEGORIES = [
  { key: 'tong-quan', label: 'Tổng quan', iconNo: 2 },
  { key: 'cung-menh', label: 'Cung mệnh', iconNo: 3 },
  { key: 'sao-so', label: 'Sao số', iconNo: 4 },
  { key: 'dai-van', label: 'Đại vận', iconNo: 5 },
  { key: 'tieu-van', label: 'Tiểu vận', iconNo: 6 },
  { key: 'phong-thuy', label: 'Phong thủy', iconNo: 7 },
  { key: 'ung-dung', label: 'Ứng dụng', iconNo: 8 },
] as const;

export type CategoryKey = (typeof CATEGORIES)[number]['key'];

const CATEGORY_LABEL: Record<CategoryKey, string> = CATEGORIES.reduce(
  (acc, cat) => ({ ...acc, [cat.key]: cat.label }),
  {} as Record<CategoryKey, string>,
);

/** Human label for a category key (e.g. `tong-quan` → `Tổng quan`). */
export function categoryLabel(key: CategoryKey): string {
  return CATEGORY_LABEL[key] ?? key;
}

export interface Article {
  readonly slug: string;
  readonly title: string;
  readonly category: CategoryKey;
  readonly excerpt: string;
  readonly date: string;
  /** Raw view count; render with `formatViews`. */
  readonly views: number;
  readonly readingMinutes: number;
  readonly thumbnail: string;
  readonly body: readonly string[];
}

export const ARTICLES: readonly Article[] = [
  {
    slug: 'tu-vi-la-gi',
    title: 'Tử Vi là gì? Hiểu đúng về tử vi để ứng dụng trong cuộc sống',
    category: 'tong-quan',
    excerpt:
      'Tử vi là bộ môn khoa học phương Đông nghiên cứu vận mệnh con người dựa trên thời gian sinh. Hiểu đúng về tử vi giúp bạn nhận diện bản thân và đưa ra lựa chọn phù hợp hơn.',
    date: '2024-05-20',
    views: 12400,
    readingMinutes: 7,
    thumbnail: MEDIA.laSo.luopan,
    body: [
      'Tử vi (Tử Vi Đẩu Số) là một bộ môn luận đoán vận mệnh có nguồn gốc từ phương Đông, dựng trên giờ, ngày, tháng, năm sinh của mỗi người. Từ bốn yếu tố thời gian ấy, người ta an các sao vào mười hai cung để phác ra một "bản đồ" cuộc đời.',
      'Hiểu đúng, tử vi không phải để phán một cách cứng nhắc rằng số phận đã an bài. Nó là công cụ nhận diện xu hướng: đâu là điểm mạnh nên phát huy, đâu là giai đoạn cần thận trọng, từ đó chủ động sắp xếp việc lớn cho hợp thời.',
      'Vì vậy, thay vì hỏi "số tôi tốt hay xấu", cách dùng tử vi khôn ngoan là hỏi "với lá số này, tôi nên đi hướng nào cho đúng". Đó cũng là tinh thần xuyên suốt của kho kiến thức này.',
    ],
  },
  {
    slug: 'y-nghia-chinh-tinh',
    title: 'Ý nghĩa chính tinh trong lá số tử vi',
    category: 'sao-so',
    excerpt:
      'Chính tinh là nhóm sao chủ đạo quyết định tính cách và vận thế của mỗi cung. Nắm được ý nghĩa từng chính tinh là bước cốt lõi khi luận giải lá số.',
    date: '2024-05-18',
    views: 8600,
    readingMinutes: 6,
    thumbnail: MEDIA.home.decorPhongCanh,
    body: [
      'Trong tử vi, các sao được chia thành chính tinh và phụ tinh. Chính tinh là mười bốn sao chủ đạo — như Tử Vi, Thiên Phủ, Thiên Cơ, Thái Dương, Vũ Khúc, Thiên Đồng... — giữ vai trò định hình tính chất của cung mà chúng tọa thủ.',
      'Mỗi chính tinh mang một "khí chất" riêng: có sao chủ về quyền uy và lãnh đạo, có sao chủ về tài lộc, có sao thiên về trí tuệ hay tình cảm. Khi một sao đóng ở cung Mệnh, nó nhuộm màu lên cá tính; đóng ở cung Tài, Quan hay Phối, nó chi phối lĩnh vực tương ứng.',
      'Luận chính tinh không tách rời việc xét miếu – vượng – hãm (độ sáng của sao) và sự phối hợp với các sao khác. Một chính tinh tốt nhưng bị hãm địa hoặc gặp hung tinh vẫn có thể giảm cát; ngược lại, sao bình thường mà được cát tinh trợ giúp lại hóa hay.',
    ],
  },
  {
    slug: '12-cung-tu-vi',
    title: '12 cung trong tử vi và ý nghĩa chi tiết',
    category: 'cung-menh',
    excerpt:
      'Lá số chia thành mười hai cung, mỗi cung phụ trách một mặt của cuộc đời. Hiểu vai trò từng cung giúp bạn đọc lá số có hệ thống thay vì rời rạc.',
    date: '2024-05-17',
    views: 7300,
    readingMinutes: 6,
    thumbnail: MEDIA.laSo.illustrationCrane,
    body: [
      'Một lá số tử vi luôn có mười hai cung: Mệnh, Phụ Mẫu, Phúc Đức, Điền Trạch, Quan Lộc, Nô Bộc, Thiên Di, Tật Ách, Tài Bạch, Tử Tức, Phu Thê và Huynh Đệ. Mỗi cung là một "ô cửa" nhìn vào một khía cạnh của đời người.',
      'Cung Mệnh là trung tâm — nói lên bản chất, tính cách và cốt cách tổng thể. Các cung còn lại tỏa ra từ đó: Quan Lộc chủ sự nghiệp, Tài Bạch chủ tiền bạc, Phu Thê chủ hôn nhân, Thiên Di chủ việc xuất ngoại và giao tiếp bên ngoài.',
      'Đọc lá số có hệ thống nghĩa là không chỉ nhìn một cung đơn lẻ mà xét cả tam hợp, xung chiếu giữa các cung. Một cung Mệnh đẹp vẫn cần các cung phối hợp hài hòa thì vận thế mới thực sự trọn vẹn.',
    ],
  },
  {
    slug: 'cach-xem-dai-van',
    title: 'Cách xem đại vận trong lá số tử vi',
    category: 'dai-van',
    excerpt:
      'Đại vận là chu kỳ mười năm dẫn dắt vận thế. Biết cách xác định và luận đại vận giúp bạn nắm được nhịp lên xuống dài hạn của cuộc đời.',
    date: '2024-05-16',
    views: 6100,
    readingMinutes: 5,
    thumbnail: MEDIA.ngayTot.decorCrane,
    body: [
      'Đại vận (đại hạn) là chu kỳ mười năm, lần lượt đi qua từng cung trên lá số. Mỗi giai đoạn mười năm, vận thế chủ đạo của một người sẽ mang màu sắc của cung mà đại vận đang tọa lạc cùng các sao trong đó.',
      'Chiều đi của đại vận (thuận hay nghịch) phụ thuộc vào âm dương của tuổi và giới tính. Khi đại vận bước vào một cung có nhiều cát tinh miếu vượng, đó thường là mười năm thuận lợi; ngược lại, gặp cung nhiều hung tinh hãm địa thì cần giữ mình.',
      'Luận đại vận cần đặt cạnh lá số gốc: đại vận tốt trên nền lá số vững sẽ phát huy mạnh, còn đại vận xấu vẫn có thể được hóa giải nhờ cách cục đẹp. Đây là lớp thời gian dài hạn, làm nền cho tiểu vận từng năm.',
    ],
  },
  {
    slug: 'tieu-van-hang-nam',
    title: 'Tiểu vận hàng năm giúp bạn điều gì?',
    category: 'tieu-van',
    excerpt:
      'Bên cạnh đại vận mười năm, tiểu vận từng năm cho biết sắc thái riêng của mỗi năm — cơ sở để lên kế hoạch ngắn hạn sát thực tế.',
    date: '2024-05-14',
    views: 4800,
    readingMinutes: 4,
    thumbnail: MEDIA.ngayTot.sceneTop,
    body: [
      'Nếu đại vận là bức tranh mười năm thì tiểu vận là từng nét của mỗi năm. Tiểu vận cho biết trong một năm cụ thể, cung nào được chiếu, sao nào tác động, từ đó phác ra sắc thái chung: thuận cho việc gì, nên tránh việc gì.',
      'Tiểu vận không đứng một mình. Nó được đọc chồng lên đại vận và lá số gốc: một năm tiểu vận đẹp nằm trong đại vận tốt sẽ càng hanh thông; một năm tiểu vận xấu trong đại vận vững vẫn có thể xoay xở ổn thỏa.',
      'Giá trị thực tế của tiểu vận là giúp lên kế hoạch ngắn hạn: chọn năm thích hợp cho việc trọng đại như cưới hỏi, khởi nghiệp, chuyển nhà; và giữ nhịp thận trọng ở những năm được cảnh báo.',
    ],
  },
  {
    slug: 'phong-thuy-va-tu-vi',
    title: 'Phong thủy và tử vi: Mối liên hệ mật thiết',
    category: 'phong-thuy',
    excerpt:
      'Tử vi cho biết bản mệnh, phong thủy giúp bồi khuyết cho mệnh. Kết hợp hai môn giúp điều chỉnh môi trường sống thuận theo lá số.',
    date: '2024-05-13',
    views: 4200,
    readingMinutes: 5,
    thumbnail: MEDIA.laSo.luopan,
    body: [
      'Tử vi và phong thủy cùng đặt trên nền tảng âm dương – ngũ hành. Tử vi soi vào con người qua lá số, còn phong thủy soi vào không gian sống — hướng nhà, bố cục, màu sắc, vật phẩm — nhằm điều hòa dòng khí quanh ta.',
      'Khi biết bản mệnh và hành còn thiếu qua lá số, người ta dùng phong thủy để bồi khuyết: chọn hướng hợp cung phi, dùng màu sắc và chất liệu thuộc hành cần bổ, sắp đặt nơi làm việc và nghỉ ngơi cho thuận khí.',
      'Điều cần nhớ là phong thủy hỗ trợ chứ không thay thế nỗ lực bản thân. Một môi trường sống hài hòa giúp tinh thần vững vàng và quyết định sáng suốt hơn — đó mới là giá trị thực khi kết hợp hai môn.',
    ],
  },
  {
    slug: 'ung-dung-tu-vi-cong-viec',
    title: 'Ứng dụng tử vi trong công việc & cuộc sống',
    category: 'ung-dung',
    excerpt:
      'Hiểu lá số không để cam chịu mà để hành động đúng lúc, đúng chỗ. Đây là cách đưa tử vi vào những quyết định thường ngày.',
    date: '2024-05-15',
    views: 5400,
    readingMinutes: 5,
    thumbnail: MEDIA.ngayTot.decorCrane,
    body: [
      'Ứng dụng lớn nhất của tử vi không nằm ở lời tiên đoán, mà ở khả năng tự hiểu mình. Khi biết điểm mạnh và điểm yếu bẩm sinh, người ta chọn nghề, chọn môi trường và cách hợp tác phù hợp với cốt cách của mình.',
      'Về mặt thời điểm, đại vận và tiểu vận gợi ý nhịp lên xuống dài – ngắn hạn. Việc trọng đại như khởi nghiệp, đầu tư, cưới hỏi nên đặt vào giai đoạn thuận; những năm được cảnh báo thì nên củng cố, giữ sức thay vì mạo hiểm.',
      'Tinh thần cốt lõi vẫn là chủ động: tử vi cho bản đồ, còn đi đường là do mình. Hiểu vận mệnh để biết đâu là lúc tiến, đâu là lúc giữ — chứ không phải để buông xuôi phó mặc.',
    ],
  },
  {
    slug: 'sao-thai-tue',
    title: 'Sao Thái Tuế và cách hóa giải',
    category: 'sao-so',
    excerpt:
      'Thái Tuế là vị thần cai quản một năm. Năm phạm Thái Tuế thường được dặn giữ mình — hiểu đúng để chủ động thay vì lo lắng.',
    date: '2024-05-12',
    views: 9800,
    readingMinutes: 4,
    thumbnail: MEDIA.home.readerGalaxy,
    body: [
      'Thái Tuế là vị thần được cho là cai quản họa phúc trong một năm, ứng với Địa Chi của năm đó. Người có tuổi xung hoặc trùng với Thái Tuế năm ấy gọi là "phạm Thái Tuế".',
      'Quan niệm dân gian cho rằng năm phạm Thái Tuế dễ gặp xáo trộn về công việc, sức khỏe và các mối quan hệ. Song đây là ảnh hưởng chung, mức độ nặng nhẹ còn tùy lá số từng người.',
      'Cách ứng xử hợp lý là giữ tâm ổn định, thận trọng với quyết định lớn và giấy tờ, làm nhiều việc thiện — thay vì kiêng khem thái quá đến mức đình trệ mọi việc.',
    ],
  },
  {
    slug: 'tam-hop-luc-xung',
    title: 'Tam hợp, lục xung giữa các tuổi',
    category: 'tong-quan',
    excerpt:
      'Quan hệ hợp – xung giữa mười hai Địa Chi là cơ sở để xét hợp tuổi trong hôn nhân, làm ăn và chọn năm khởi sự.',
    date: '2024-05-11',
    views: 7600,
    readingMinutes: 5,
    thumbnail: MEDIA.home.decorPhongCanh,
    body: [
      'Mười hai Địa Chi kết thành bốn nhóm tam hợp — ba tuổi hợp khí với nhau: Thân–Tý–Thìn, Dần–Ngọ–Tuất, Tỵ–Dậu–Sửu, Hợi–Mão–Mùi. Người trong cùng nhóm thường dễ đồng thuận, tương trợ.',
      'Song song đó là sáu cặp lục xung — hai tuổi khắc nhau: Tý–Ngọ, Sửu–Mùi, Dần–Thân, Mão–Dậu, Thìn–Tuất, Tỵ–Hợi. Cặp xung dễ va chạm quan điểm, cần nhân nhượng để cân bằng.',
      'Tam hợp, lục xung là bước xét nhanh khi so tuổi cho hôn nhân hay hợp tác. Nhưng nó chỉ là một lát cắt: kết luận sau cùng vẫn phải đặt trên toàn bộ lá số của mỗi người.',
    ],
  },
  {
    slug: 'chon-huong-ban-lam-viec',
    title: 'Chọn hướng bàn làm việc hợp mệnh',
    category: 'phong-thuy',
    excerpt:
      'Hướng ngồi làm việc theo cung phi có thể hỗ trợ sự tập trung và tài lộc. Đây là cách xác định hướng tốt cho riêng bạn.',
    date: '2024-05-10',
    views: 6900,
    readingMinutes: 4,
    thumbnail: MEDIA.laSo.illustrationCrane,
    body: [
      'Theo phong thủy, hướng ngồi làm việc nên hợp với cung phi (cung mệnh) của mỗi người. Cung phi được tính từ năm sinh và giới tính, chia con người thành Đông tứ mệnh và Tây tứ mệnh.',
      'Người Đông tứ mệnh hợp bốn hướng Bắc, Nam, Đông, Đông Nam; người Tây tứ mệnh hợp Tây, Tây Bắc, Tây Nam, Đông Bắc. Ngồi quay mặt về một trong các hướng tốt được cho là hỗ trợ sự minh mẫn và thuận lợi.',
      'Bên cạnh hướng, còn cần tránh ngồi quay lưng ra cửa hay dưới xà ngang. Một chỗ ngồi vững chãi, sáng sủa, đúng hướng hợp mệnh sẽ giúp tinh thần ổn định hơn khi làm việc.',
    ],
  },
];

/** Topics with the most reads — shown in the sidebar "Chủ đề được quan tâm" panel. */
export const HOT_TOPICS: readonly { readonly title: string; readonly views: string }[] = [
  { title: 'Sao Thái Tuế là gì?', views: '18.2K' },
  { title: 'Cách an sao & lập lá số tử vi', views: '15.7K' },
  { title: 'Thân cư Phu Thê có ý nghĩa gì?', views: '12.6K' },
  { title: 'Ý nghĩa 12 cung trong lá số', views: '11.1K' },
  { title: 'Đại vận 10 năm nói lên điều gì?', views: '9.8K' },
];

export type GuideIcon = 'almanac' | 'stars' | 'year';

/** The "Cẩm nang tử vi" handbook shortcuts in the sidebar. */
export const GUIDES: readonly {
  readonly title: string;
  readonly description: string;
  readonly icon: GuideIcon;
}[] = [
  { title: 'Hướng dẫn lập lá số tử vi', description: 'Chi tiết từ A – Z', icon: 'almanac' },
  { title: 'Giải nghĩa các sao', description: 'Trong lá số tử vi', icon: 'stars' },
  { title: 'Cách xem hạn năm', description: 'Đơn giản, dễ áp dụng', icon: 'year' },
];

/** A single closing aphorism for the sidebar "Trích dẫn hay" panel. */
export const QUOTE = {
  text: 'Hiểu được vận mệnh không phải để cam chịu, mà để biết mình nên đi hướng nào cho đúng.',
  author: 'Cổ nhân',
} as const;

export function findArticle(slug: string): Article | undefined {
  return ARTICLES.find((article) => article.slug === slug);
}

export function formatArticleDate(date: string): string {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

/** Compact view count, e.g. 12400 → "12.4K", 980 → "980". */
export function formatViews(views: number): string {
  if (views < 1000) return String(views);
  const thousands = views / 1000;
  // Drop a trailing ".0" so round counts read "12K", not "12.0K".
  return `${thousands.toFixed(1).replace(/\.0$/, '')}K`;
}
