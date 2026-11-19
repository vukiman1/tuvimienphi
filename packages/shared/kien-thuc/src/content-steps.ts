export interface PlannedStep {
  readonly step: number;
  readonly title: string;
}

export const KIEN_THUC_STEPS: readonly PlannedStep[] = [
  { step: 1, title: 'Tử vi là gì' },
  { step: 2, title: 'Mười hai cung' },
  { step: 3, title: 'Chính tinh' },
  { step: 4, title: 'Phụ tinh và Tứ hóa' },
  { step: 5, title: 'Đại vận và tiểu vận' },
  { step: 6, title: 'Ứng dụng vào đời sống' },
];
