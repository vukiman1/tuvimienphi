import type { CungName } from '@org/shared-tu-vi';

export const CHAPTER_LABELS = {
  opening: 'Mở đầu',
  moment: 'Khoảnh khắc',
  map: 'Lá số',
  turn: 'Hiểu đúng',
  truths: 'Ba góc nhìn',
  knowledge: 'Kiến thức',
  yourStory: 'Câu chuyện của bạn',
} as const;

export const OPENING = {
  eyebrow: 'Mỗi người sinh ra trong một khoảnh khắc không lặp lại',
  title: 'Lập lá số',
  emphasis: 'tử vi',
  subtitle: 'Khám phá bản mệnh, định hướng tương lai qua khoa học Tử Vi.',
  ctaLabel: 'LẬP LÁ SỐ CỦA BẠN',
  skipLabel: 'Bỏ qua câu chuyện',
  scrollHint: 'Cuộn để khám phá',
  stickyLabel: 'Lập lá số',
} as const;

export const MOMENT = {
  eyebrow: '02 / Khoảnh khắc',
  parts: ['12', '·', '03', '·', '1995'],
  label: '12 tháng 03 năm 1995',
  caption: 'Một ngày. Một giờ. Một điểm bắt đầu.',
} as const;

interface MapStatement {
  readonly title: string;
  readonly description: string;
  readonly highlights: readonly CungName[];
}

export const MAP = {
  eyebrow: '03 / Bản đồ cuộc đời',
  title: 'Lá số của bạn có gì?',
  subtitle: 'Một lá số – nhiều góc nhìn về cuộc đời',
  boardCentre: '12 cung · 1 lá số',
  boardLabel: 'Sơ đồ 12 cung tử vi',
  ctaLabel: 'Tạo lá số của tôi',
  statements: [
    {
      title: 'Mệnh & tính cách',
      description: 'Hiểu những đặc điểm nổi bật trong bản mệnh của bạn.',
      highlights: ['Mệnh'],
    },
    {
      title: '12 cung trong lá số',
      description: 'Khám phá ý nghĩa của 12 cung Mệnh, Tài Bạch, Quan Lộc...',
      highlights: [
        'Mệnh',
        'Phụ Mẫu',
        'Phúc Đức',
        'Điền Trạch',
        'Quan Lộc',
        'Nô Bộc',
        'Thiên Di',
        'Tật Ách',
        'Tài Bạch',
        'Tử Tức',
        'Phu Thê',
        'Huynh Đệ',
      ],
    },
    {
      title: 'Hệ thống sao',
      description: 'Phân tích sự kết hợp của chính tinh và phụ tinh tại từng cung.',
      highlights: ['Mệnh', 'Tài Bạch', 'Quan Lộc'],
    },
    {
      title: 'Tình duyên & gia đạo',
      description: 'Nhìn nhận xu hướng trong các mối quan hệ, hôn nhân, gia đình.',
      highlights: ['Phu Thê', 'Tử Tức', 'Điền Trạch', 'Phụ Mẫu'],
    },
    {
      title: 'Công danh & tài lộc',
      description: 'Phân tích công việc, năng lực và tài chính.',
      highlights: ['Quan Lộc', 'Tài Bạch'],
    },
    {
      title: 'Đại vận & vận hạn',
      description: 'Theo dõi những giai đoạn quan trọng trong cuộc đời.',
      highlights: ['Mệnh', 'Thiên Di'],
    },
  ] satisfies readonly MapStatement[],
} as const;

export const TURN = {
  eyebrow: '04 / Hiểu đúng về tử vi',
  sentence: 'Tử vi không phải để định đoán, mà để hiểu mình và chủ động hơn trong cuộc sống.',
} as const;

export const TRUTHS = {
  eyebrow: '05 / Ba góc nhìn',
  title: 'Hiểu để',
  emphasis: 'chủ động.',
  points: [
    {
      title: 'Tử vi không quyết định số phận',
      description:
        'Lá số phản ánh những xu hướng và đặc điểm, không phải một bản án cố định cho cuộc đời.',
      linkLabel: 'Phân tích khách quan',
    },
    {
      title: 'Thiên thời – Địa lợi – Nhân hòa',
      description:
        'Hoàn cảnh tạo ra cơ hội, nhưng lựa chọn và hành động của mỗi người vẫn đóng vai trò quan trọng.',
      linkLabel: 'Khoa học & Tâm linh',
    },
    {
      title: 'Hiểu mình để chủ động hơn',
      description:
        'Tử vi là công cụ giúp bạn có thêm góc nhìn để suy ngẫm và đưa ra lựa chọn phù hợp.',
      linkLabel: 'Góc nhìn hiện đại',
    },
  ],
} as const;

export const KNOWLEDGE = {
  eyebrow: '06 / Kiến thức',
  title: 'Khám phá kiến thức',
  emphasis: 'tử vi',
  subtitle: 'Những bài viết giúp bạn hiểu sâu hơn về tử vi dưới góc nhìn hiện đại.',
  ctaLabel: 'Xem tất cả',
  featuredBadge: 'Nổi bật',
  featuredNumeral: '06',
  featured: {
    title: 'Thân cư là gì? 6 vị trí Thân cư nói lên điều gì?',
    excerpt:
      'Tìm hiểu ý nghĩa của Thân cư trong lá số tử vi và ảnh hưởng của 6 vị trí Thân cư đến cuộc đời mỗi người.',
    date: '12/08/2025',
    slug: undefined,
  },
  more: [
    { title: 'Tuần và Triệt trong lá số tử vi', date: '10/08/2025', slug: undefined },
    {
      title: 'Đại vận là gì? Cách xem đại vận trong lá số tử vi',
      date: '05/08/2025',
      slug: 'cach-xem-dai-van',
    },
    { title: 'Ý nghĩa của 12 cung trong lá số', date: '28/07/2025', slug: '12-cung-tu-vi' },
    {
      title: 'Chính tinh và phụ tinh khác nhau thế nào?',
      date: '20/07/2025',
      slug: 'y-nghia-chinh-tinh',
    },
  ],
} as const;

export const YOUR_STORY = {
  eyebrow: '07 / Câu chuyện của bạn',
  titleStart: 'Câu chuyện của',
  emphasis: 'bạn',
  titleEnd: 'bắt đầu từ đây',
  formHeading: 'Khoảnh khắc bạn sinh ra',
  assurances: [
    'Chính xác & khoa học',
    'Dễ hiểu & trực quan',
    'Bảo mật thông tin',
    'Miễn phí trọn đời',
  ],
} as const;
