/** Every string the landing page renders below the hero. */

export const CHART_ANATOMY_SECTION = {
  title: 'Lá số của bạn có gì?',
  ctaLabel: 'Tạo lá số của tôi →',
  leftNotes: ['Phân tích 12 Cung mệnh', 'Hệ thống hàng trăm ngôi sao'],
  rightNotes: ['Đại vận cuộc đời', 'Luận giải theo từng cung'],
} as const;

export const UNDERSTANDING_SECTION = {
  title: 'Hiểu đúng về tử vi',
  points: [
    {
      icon: 'scroll',
      title: 'Tử vi không quyết định số phận,',
      description: 'mà giúp bạn hiểu bản thân và đưa ra lựa chọn đúng đắn.',
    },
    {
      icon: 'almanac',
      title: 'Thiên thời – Địa lợi – Nhân hòa:',
      description: 'Kết hợp 3 yếu tố để tạo nên cuộc sống tốt đẹp.',
    },
    {
      icon: 'lotus-hands',
      title: 'Tri thức tử vi là công cụ hỗ trợ,',
      description: 'không mê tín, không thay thế nỗ lực cá nhân.',
    },
  ],
  links: [
    { label: 'Phân tích khách quan', to: '/kien-thuc' },
    { label: 'Khoa học & Tâm linh', to: '/kien-thuc' },
    { label: 'Góc nhìn hiện đại', to: '/kien-thuc' },
  ],
} as const;
