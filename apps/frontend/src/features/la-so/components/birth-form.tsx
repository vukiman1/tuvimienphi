import { ChevronDown } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Form } from '@/components/ui/form';
import { FormError } from '@/components/ui/form-error';
import { FormField } from '@/components/ui/form-field';
import { SelectField, type SelectOption } from '@/components/ui/select-field';
import { Button } from '@/components/ui/button';
import { MEDIA } from '@/config/media';
import { useFormWithSubmitError } from '@/lib/use-form-with-submit-error';
import { cn } from '@/lib/utils';
import {
  BIRTH_HOURS,
  DAYS_IN_LONGEST_MONTH,
  GENDER_LABELS,
  Gender,
  MAX_BIRTH_YEAR,
  MIN_BIRTH_YEAR,
  MONTHS_IN_YEAR,
} from '@/features/la-so/birth-input';
import { CalendarToggle } from '@/features/la-so/components/calendar-toggle';
import {
  EMPTY_BIRTH_FORM,
  birthFieldSchemas,
  birthFormSchema,
  toBirthSearch,
  type BirthFormValues,
} from '@/features/la-so/birth-form-schema';

const FIELD_CLASS = [
  'h-10 w-full rounded-lg border-0 bg-white px-3 text-sm text-[#2a1f0e] shadow-md',
  'placeholder:text-[#7a6a55] focus-visible:outline-none',
  'transition-[box-shadow,color] duration-150 ease-out motion-reduce:transition-none',
  // Sáu ô này trước đó không có phản hồi rê chuột nào; viền vàng mảnh là đủ để biết bấm được.
  'hover:shadow-lg hover:ring-1 hover:ring-[#e0bd76]/60',
  // Lúc đang nhập phải nổi hơn hẳn lúc rê chuột, nếu không hai trạng thái lẫn vào nhau.
  'focus-visible:ring-2 focus-visible:ring-[#e0bd76] focus-visible:shadow-[0_0_16px_rgba(224,189,118,0.45)]',
].join(' ');

/* The plate is a transparent PNG: set it as an inline background so no `bg-*` utility can win
   the merge and paint a colour behind its cut corners. */
const SUBMIT_PLATE_STYLE = {
  backgroundImage: `url(${MEDIA.home.ctaPlate})`,
  backgroundSize: '100% 100%',
  backgroundRepeat: 'no-repeat',
} as const;

/**
 * `<select>` gốc không có `::placeholder`, nên chưa chọn gì thì chữ "Ngày" trông đậm y như "12" đã
 * chọn — nhìn vào không biết còn thiếu ô nào. `:has()` bắt đúng lúc option rỗng đang được chọn để
 * hạ chữ xuống màu mờ, khỏi phải nhớ trạng thái bằng JS.
 */
const SELECT_CLASS = `${FIELD_CLASS} appearance-none pr-8 [&:has(option[value='']:checked)]:text-[#7a6a55]`;

function countingOptions(count: number, from: number): readonly SelectOption<string>[] {
  return Array.from({ length: count }, (_, index) => {
    const value = String(from + index);
    return { value, label: value };
  });
}

const DAY_OPTIONS = countingOptions(DAYS_IN_LONGEST_MONTH, 1);
const MONTH_OPTIONS = countingOptions(MONTHS_IN_YEAR, 1);
const YEAR_OPTIONS = countingOptions(MAX_BIRTH_YEAR - MIN_BIRTH_YEAR + 1, MIN_BIRTH_YEAR)
  .slice()
  .reverse();

const GENDER_OPTIONS: readonly SelectOption<Gender | ''>[] = Object.values(Gender).map((value) => ({
  value,
  label: GENDER_LABELS[value],
}));

const HOUR_OPTIONS: readonly SelectOption<string>[] = BIRTH_HOURS.map((hour) => ({
  value: hour.key,
  label: `${hour.key} (${hour.range})`,
}));

function SelectChevron() {
  return (
    <ChevronDown
      aria-hidden
      className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-[#7a6a55]"
    />
  );
}

export function BirthForm() {
  const navigate = useNavigate();

  const { form, submitError } = useFormWithSubmitError<BirthFormValues>({
    defaultValues: EMPTY_BIRTH_FORM,
    schema: birthFormSchema,
    fallbackError: 'Không mở được lá số. Thử lại sau ít phút.',
    onSubmit: async (values) => {
      await navigate({ to: '/la-so', search: toBirthSearch(values) });
    },
  });

  return (
    <Form className="grid gap-3" onSubmit={form.handleSubmit}>
      <FormError message={submitError} />

      <div className="relative">
        <form.Field
          name="fullName"
          validators={{
            onChange: birthFieldSchemas.fullName,
            onBlur: birthFieldSchemas.fullName,
            onSubmit: birthFieldSchemas.fullName,
          }}
          children={(field) => (
            <FormField
              autoComplete="name"
              className={FIELD_CLASS}
              field={field}
              isLabelHidden
              label="Họ & Tên"
              placeholder="Họ & Tên"
            />
          )}
        />
      </div>

      <div className="flex flex-wrap items-start gap-3">
        <div className="grid min-w-[240px] flex-1 grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="relative">
            <form.Field
              name="day"
              validators={{
                onChange: birthFieldSchemas.day,
                onSubmit: birthFieldSchemas.day,
              }}
              children={(field) => (
                <SelectField
                  className={SELECT_CLASS}
                  field={field}
                  isLabelHidden
                  label="Ngày sinh"
                  options={DAY_OPTIONS}
                  placeholder="Ngày"
                />
              )}
            />
            <SelectChevron />
          </div>

          <div className="relative">
            <form.Field
              name="month"
              validators={{
                onChange: birthFieldSchemas.month,
                onSubmit: birthFieldSchemas.month,
              }}
              children={(field) => (
                <SelectField
                  className={SELECT_CLASS}
                  field={field}
                  isLabelHidden
                  label="Tháng sinh"
                  options={MONTH_OPTIONS}
                  placeholder="Tháng"
                />
              )}
            />
            <SelectChevron />
          </div>

          <div className="relative col-span-2 sm:col-span-1">
            <form.Field
              name="year"
              validators={{
                onChange: birthFieldSchemas.year,
                onSubmit: birthFieldSchemas.year,
              }}
              children={(field) => (
                <SelectField
                  className={SELECT_CLASS}
                  field={field}
                  isLabelHidden
                  label="Năm sinh"
                  options={YEAR_OPTIONS}
                  placeholder="Năm"
                />
              )}
            />
            <SelectChevron />
          </div>
        </div>

        <form.Field
          name="calendar"
          children={(field) => (
            <CalendarToggle onChange={field.handleChange} value={field.state.value} />
          )}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-44 flex-1">
          <form.Field
            name="hour"
            validators={{
              onChange: birthFieldSchemas.hour,
              onSubmit: birthFieldSchemas.hour,
            }}
            children={(field) => (
              <SelectField
                className={SELECT_CLASS}
                field={field}
                isLabelHidden
                label="Giờ sinh"
                options={HOUR_OPTIONS}
                placeholder="Giờ sinh"
              />
            )}
          />
          <SelectChevron />
        </div>

        <div className="relative min-w-40 flex-1">
          <form.Field
            name="gender"
            validators={{
              onChange: birthFieldSchemas.gender,
              onSubmit: birthFieldSchemas.gender,
            }}
            children={(field) => (
              <SelectField
                className={SELECT_CLASS}
                field={field}
                isLabelHidden
                label="Giới tính"
                options={GENDER_OPTIONS}
                placeholder="Giới tính  Nam/Nữ"
              />
            )}
          />
          <SelectChevron />
        </div>
      </div>

      {/* Never disabled: TanStack Form keeps a form-level onSubmit error until the next submit, so a
          disabled button would lock the form after the first failed attempt. */}
      <form.Subscribe
        selector={({ isSubmitting }) => isSubmitting}
        children={(isSubmitting) => (
          <Button
            className={cn(
              'mx-auto mt-2 flex aspect-[808/161] h-auto w-full max-w-[420px] items-center justify-center rounded-none bg-transparent p-0 font-display text-lg font-bold tracking-wide text-[#fdf3dc] uppercase [text-shadow:0_1px_3px_rgba(60,26,4,0.85)] hover:bg-transparent sm:text-2xl sm:tracking-wider',
              // Phóng bằng thuộc tính `scale` chứ không phải `transform` — xem ghi chú trong styles.css.
              'transition-[scale,filter] duration-200 ease-out hover:scale-[1.03] active:scale-[0.98]',
              // Quầng sáng vẽ bằng `drop-shadow` chứ không phải `box-shadow`: nền nút là ảnh PNG có
              // góc cắt, `box-shadow` sẽ đổ bóng theo hình chữ nhật chứ không theo dáng nút.
              'hover:brightness-110 hover:drop-shadow-[0_0_18px_rgba(224,189,118,0.55)]',
              'focus-visible:brightness-110 focus-visible:drop-shadow-[0_0_18px_rgba(224,189,118,0.55)]',
              'motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100',
            )}
            style={SUBMIT_PLATE_STYLE}
            type="submit"
          >
            {isSubmitting ? 'Đang mở lá số...' : 'Lập lá số của tôi'}
          </Button>
        )}
      />
    </Form>
  );
}
