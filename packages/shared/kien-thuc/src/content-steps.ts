export interface PlannedStep {
  readonly step: number;
  readonly title: string;
  readonly summary: string;
}

export const KIEN_THUC_STEPS: readonly PlannedStep[] = [
  {
    step: 1,
    title: 'Tử vi là gì',
    summary: 'Tử vi là gì, một lá số gồm những gì, âm dương và ngũ hành cơ bản.',
  },
  {
    step: 2,
    title: 'Mười hai cung',
    summary: 'Mười hai cung, cung Mệnh và cung Thân, tam hợp và xung chiếu.',
  },
  {
    step: 3,
    title: 'Chính tinh',
    summary: 'Mười bốn chính tinh, hai chòm sao và năm bậc từ miếu tới hãm.',
  },
  {
    step: 4,
    title: 'Phụ tinh và Tứ hóa',
    summary: 'Phụ tinh thường gặp, tứ hóa theo can năm, Tuần và Triệt.',
  },
  {
    step: 5,
    title: 'Đại vận và tiểu vận',
    summary: 'Đại vận mười năm, tiểu vận từng năm và sao Thái Tuế.',
  },
  {
    step: 6,
    title: 'Ứng dụng vào đời sống',
    summary: 'Công việc, phong thủy và đọc lá số của chính bạn.',
  },
];
