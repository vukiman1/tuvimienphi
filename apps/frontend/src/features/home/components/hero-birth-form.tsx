import { ChevronDown } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Form } from '@/components/ui/form';
import { FormError } from '@/components/ui/form-error';
import { FormField } from '@/components/ui/form-field';
import { SelectField, type SelectOption } from '@/components/ui/select-field';
import { Button } from '@/components/ui/button';
import { MEDIA } from '@/config/media';
import { useFormWithSubmitError } from '@/lib/use-form-with-submit-error';
import {
  BIRTH_HOURS,
  DAYS_IN_LONGEST_MONTH,
  GENDER_LABELS,
  Gender,
  MAX_BIRTH_YEAR,
  MIN_BIRTH_YEAR,
  MONTHS_IN_YEAR,
} from '@/features/la-so/birth-input';
import { CalendarToggle } from '@/features/home/components/calendar-toggle';
import {
  EMPTY_HERO_BIRTH_FORM,
  heroBirthFieldSchemas,
  heroBirthSchema,
  toBirthSearch,
  type HeroBirthFormValues,
} from '@/features/home/hero-birth-schema';

const FIELD_CLASS =
  'h-10 w-full rounded-lg border-0 bg-white px-3 text-sm text-[#2a1f0e] shadow-md placeholder:text-[#7a6a55] focus-visible:ring-2 focus-visible:ring-[#e0bd76] focus-visible:outline-none';

/* The plate is a transparent PNG: set it as an inline background so no `bg-*` utility can win
   the merge and paint a colour behind its cut corners. */
const SUBMIT_PLATE_STYLE = {
  backgroundImage: `url(${MEDIA.home.ctaPlate})`,
  backgroundSize: '100% 100%',
  backgroundRepeat: 'no-repeat',
} as const;

const SELECT_CLASS = `${FIELD_CLASS} appearance-none pr-8`;

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
  value: hour.chi,
  label: `${hour.chi} (${hour.range})`,
}));

function SelectChevron() {
  return (
    <ChevronDown
      aria-hidden
      className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-[#7a6a55]"
    />
  );
}

export function HeroBirthForm() {
  const navigate = useNavigate();

  const { form, submitError } = useFormWithSubmitError<HeroBirthFormValues>({
    defaultValues: EMPTY_HERO_BIRTH_FORM,
    schema: heroBirthSchema,
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
            onChange: heroBirthFieldSchemas.fullName,
            onBlur: heroBirthFieldSchemas.fullName,
            onSubmit: heroBirthFieldSchemas.fullName,
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
                onChange: heroBirthFieldSchemas.day,
                onSubmit: heroBirthFieldSchemas.day,
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
                onChange: heroBirthFieldSchemas.month,
                onSubmit: heroBirthFieldSchemas.month,
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
                onChange: heroBirthFieldSchemas.year,
                onSubmit: heroBirthFieldSchemas.year,
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
              onChange: heroBirthFieldSchemas.hour,
              onSubmit: heroBirthFieldSchemas.hour,
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
              onChange: heroBirthFieldSchemas.gender,
              onSubmit: heroBirthFieldSchemas.gender,
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
            className="mx-auto mt-2 flex aspect-[808/161] h-auto w-full max-w-[420px] items-center justify-center rounded-none bg-transparent p-0 font-display text-lg font-bold tracking-wide text-[#fdf3dc] uppercase [text-shadow:0_1px_3px_rgba(60,26,4,0.85)] hover:bg-transparent hover:brightness-110 sm:text-2xl sm:tracking-wider"
            style={SUBMIT_PLATE_STYLE}
            type="submit"
          >
            {isSubmitting ? 'Đang mở lá số...' : 'Lập lá số của tôi →'}
          </Button>
        )}
      />
    </Form>
  );
}
