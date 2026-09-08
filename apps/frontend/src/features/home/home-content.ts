/** Every string the landing page renders below the hero. */

export const CHART_ANATOMY_SECTION = {
  title: 'Lá số của bạn có gì?',
  subtitle: 'Một lá số – nhiều góc nhìn về cuộc đời',
  ctaLabel: 'Tạo lá số của tôi',
  /** Ba thẻ đầu đứng bên trái lá số, ba thẻ sau đứng bên phải — xem `ChartAnatomySection`. */
  cards: [
    {
      icon: 'atom',
      title: 'Mệnh & tính cách',
      description: 'Hiểu những đặc điểm nổi bật trong bản mệnh của bạn.',
    },
    {
      icon: 'book',
      title: '12 cung trong lá số',
      description: 'Khám phá ý nghĩa của 12 cung Mệnh, Tài Bạch, Quan Lộc...',
    },
    {
      icon: 'sun',
      title: 'Hệ thống sao',
      description: 'Phân tích sự kết hợp của chính tinh và phụ tinh tại từng cung.',
    },
    {
      icon: 'heart',
      title: 'Tình duyên & gia đạo',
      description: 'Nhìn nhận xu hướng trong các mối quan hệ, hôn nhân, gia đình.',
    },
    {
      icon: 'briefcase',
      title: 'Công danh & tài lộc',
      description: 'Phân tích công việc, năng lực và tài chính.',
    },
    {
      icon: 'meditation',
      title: 'Đại vận & vận hạn',
      description: 'Theo dõi những giai đoạn quan trọng trong cuộc đời.',
    },
  ],
} as const;

export const UNDERSTANDING_SECTION = {
  title: 'Hiểu đúng về tử vi',
  subtitle: 'Tử vi không phải để định đoán, mà để hiểu mình và chủ động hơn trong cuộc sống.',
  points: [
    {
      icon: 'medallion-lotus',
      title: 'Tử vi không quyết định số phận',
      description:
        'Lá số phản ánh những xu hướng và đặc điểm, không phải một bản án cố định cho cuộc đời.',
      linkLabel: 'Phân tích khách quan',
      to: '/kien-thuc',
    },
    {
      icon: 'medallion-yin-yang',
      title: 'Thiên thời – Địa lợi – Nhân hòa',
      description:
        'Hoàn cảnh tạo ra cơ hội, nhưng lựa chọn và hành động của mỗi người vẫn đóng vai trò quan trọng.',
      linkLabel: 'Khoa học & Tâm linh',
      to: '/kien-thuc',
    },
    {
      icon: 'medallion-book',
      title: 'Hiểu mình để chủ động hơn',
      description:
        'Tử vi là công cụ giúp bạn có thêm góc nhìn để suy ngẫm và đưa ra lựa chọn phù hợp.',
      linkLabel: 'Góc nhìn hiện đại',
      to: '/kien-thuc',
    },
  ],
} as const;

/**
 * Năm bài giới thiệu ở trang chủ. Chữ lấy nguyên từ bản thiết kế, nên hai bài đầu chưa có bài viết
 * thật đứng sau — `slug` bỏ trống thì thẻ dẫn về trang kiến thức thay vì một địa chỉ không tồn tại.
 * Viết xong bài nào thì điền `slug` của bài đó vào là thẻ tự trỏ đúng chỗ.
 */
export const KNOWLEDGE_SECTION = {
  title: 'Khám phá kiến thức tử vi',
  subtitle: 'Những bài viết giúp bạn hiểu sâu hơn về tử vi dưới góc nhìn hiện đại.',
  ctaLabel: 'Xem tất cả',
  featuredBadge: 'Nổi bật',
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
