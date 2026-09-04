import { z } from 'zod';
import {
  CalendarType,
  Gender,
  INVALID_BIRTH_DATE_MESSAGE,
  MAX_NAME_LENGTH,
  birthInputSchema,
  isRealBirthDate,
  type BirthInput,
} from '@/features/la-so/birth-input';

/**
 * The form's own contract: every control hands back a string, so the rules are written against
 * strings and the numbers only appear once the values leave the form.
 */
const birthFields = z.object({
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

export const birthFieldSchemas = birthFields.shape;

export const birthFormSchema = birthFields.refine(
  (values) =>
    isRealBirthDate({
      day: Number(values.day),
      month: Number(values.month),
      year: Number(values.year),
      calendar: values.calendar,
    }),
  { message: INVALID_BIRTH_DATE_MESSAGE, path: ['day'] },
);

export type BirthFormValues = z.input<typeof birthFields>;

export const EMPTY_BIRTH_FORM: BirthFormValues = {
  fullName: '',
  day: '',
  month: '',
  year: '',
  calendar: CalendarType.Solar,
  hour: '',
  gender: '',
};

/** Throws if handed values the form never validated — by then that is a bug, not user error. */
export function toBirthSearch(values: BirthFormValues): BirthInput {
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
