import { z } from 'zod';
import {
  CalendarType,
  Gender,
  MAX_NAME_LENGTH,
  birthInputSchema,
  type BirthInput,
} from '@/features/la-so/birth-input';

function isRealDate(day: number, month: number, year: number): boolean {
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

/**
 * The hero form's own contract: every control hands back a string, so the rules are written against
 * strings and the numbers only appear once the values leave the form.
 */
const heroBirthFields = z.object({
  fullName: z.string().trim().max(MAX_NAME_LENGTH, `Họ tên tối đa ${MAX_NAME_LENGTH} ký tự.`),
  day: z.string().min(1, 'Chọn ngày sinh.'),
  month: z.string().min(1, 'Chọn tháng sinh.'),
  year: z.string().min(1, 'Chọn năm sinh.'),
  calendar: z.enum(CalendarType),
  hour: z.string().min(1, 'Chọn giờ sinh.'),
  gender: z
    .union([z.enum(Gender), z.literal('')])
    .refine((value): value is Gender => value !== '', 'Chọn giới tính.'),
});

export const heroBirthFieldSchemas = heroBirthFields.shape;

export const heroBirthSchema = heroBirthFields.refine(
  (values) => isRealDate(Number(values.day), Number(values.month), Number(values.year)),
  { message: 'Ngày sinh không có trong tháng đã chọn.', path: ['day'] },
);

export type HeroBirthFormValues = z.input<typeof heroBirthFields>;

export const EMPTY_HERO_BIRTH_FORM: HeroBirthFormValues = {
  fullName: '',
  day: '',
  month: '',
  year: '',
  calendar: CalendarType.Solar,
  hour: '',
  gender: '',
};

/** Throws if handed values the form never validated — by then that is a bug, not user error. */
export function toBirthSearch(values: HeroBirthFormValues): BirthInput {
  const fullName = values.fullName.trim();

  return birthInputSchema.parse({
    ...(fullName ? { fullName } : {}),
    day: Number(values.day),
    month: Number(values.month),
    year: Number(values.year),
    calendar: values.calendar,
    hour: values.hour,
    gender: values.gender,
  });
}
