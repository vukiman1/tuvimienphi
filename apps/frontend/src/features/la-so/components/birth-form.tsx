import type { ReactElement } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Form } from '@/components/ui/form';
import { FormError } from '@/components/ui/form-error';
import { FormField } from '@/components/ui/form-field';
import { SelectField } from '@/components/ui/select-field';
import { CtaButton, CtaTone } from '@/design-system';
import { useNow } from '@/hooks/use-now';
import { useFormWithSubmitError } from '@/lib/use-form-with-submit-error';
import { CalendarToggle } from '@/features/la-so/components/calendar-toggle';
import {
  DAY_OPTIONS,
  GENDER_OPTIONS,
  HOUR_OPTIONS,
  MONTH_OPTIONS,
  yearOptionsUntil,
} from '@/features/la-so/components/birth-form.constants';
import type { Gender } from '@/features/la-so/birth-input';
import {
  EMPTY_BIRTH_FORM,
  birthFieldSchemas,
  birthFormSchema,
  toBirthSearch,
  type BirthFormValues,
} from '@/features/la-so/birth-form-schema';

const FIELD_CLASS =
  'h-11 w-full rounded-lg border border-ink/20 bg-day px-3 text-sm text-ink placeholder:text-ink-soft transition-[border-color,box-shadow] duration-150 hover:border-ink/40 focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none motion-reduce:transition-none';

const SELECT_CLASS = `${FIELD_CLASS} [&:has(option[value='']:checked)]:text-ink-soft`;

interface BirthFormProps {
  readonly initialGender?: Gender;
  readonly viewYear?: number;
}

export function BirthForm({ initialGender, viewYear }: BirthFormProps = {}): ReactElement {
  const navigate = useNavigate();
  const now = useNow();

  const { form, submitError } = useFormWithSubmitError<BirthFormValues>({
    defaultValues: { ...EMPTY_BIRTH_FORM, gender: initialGender ?? EMPTY_BIRTH_FORM.gender },
    schema: birthFormSchema,
    fallbackError: 'Không mở được lá số. Thử lại sau ít phút.',
    onSubmit: async (values) => {
      await navigate({
        to: '/la-so/detail',
        search: {
          ...toBirthSearch(values),
          ...(viewYear === undefined ? {} : { viewYear }),
        },
      });
    },
  });

  return (
    <Form className="grid gap-4 text-ink" onSubmit={form.handleSubmit}>
      <FormError message={submitError} />

      <form.Field
        name="calendar"
        children={(field) => (
          <CalendarToggle onChange={field.handleChange} value={field.state.value} />
        )}
      />

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
            label="Họ & Tên"
            placeholder="Nhập họ và tên của bạn"
          />
        )}
      />

      <div className="grid grid-cols-3 gap-3">
        <form.Field
          name="day"
          validators={{ onChange: birthFieldSchemas.day, onSubmit: birthFieldSchemas.day }}
          children={(field) => (
            <SelectField
              className={SELECT_CLASS}
              field={field}
              label="Ngày sinh"
              options={DAY_OPTIONS}
              placeholder="Ngày"
            />
          )}
        />
        <form.Field
          name="month"
          validators={{ onChange: birthFieldSchemas.month, onSubmit: birthFieldSchemas.month }}
          children={(field) => (
            <SelectField
              className={SELECT_CLASS}
              field={field}
              label="Tháng sinh"
              options={MONTH_OPTIONS}
              placeholder="Tháng"
            />
          )}
        />
        <form.Field
          name="year"
          validators={{ onChange: birthFieldSchemas.year, onSubmit: birthFieldSchemas.year }}
          children={(field) => (
            <SelectField
              className={SELECT_CLASS}
              field={field}
              label="Năm sinh"
              options={yearOptionsUntil(now.getFullYear())}
              placeholder="Năm"
            />
          )}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <form.Field
          name="hour"
          validators={{ onChange: birthFieldSchemas.hour, onSubmit: birthFieldSchemas.hour }}
          children={(field) => (
            <SelectField
              className={SELECT_CLASS}
              field={field}
              label="Giờ sinh"
              options={HOUR_OPTIONS}
              placeholder="Chọn giờ sinh"
            />
          )}
        />
        <form.Field
          name="gender"
          validators={{ onChange: birthFieldSchemas.gender, onSubmit: birthFieldSchemas.gender }}
          children={(field) => (
            <SelectField
              className={SELECT_CLASS}
              field={field}
              label="Giới tính"
              options={GENDER_OPTIONS}
              placeholder="Chọn giới tính"
            />
          )}
        />
      </div>

      <form.Subscribe
        selector={({ isSubmitting }) => isSubmitting}
        children={(isSubmitting) => (
          <CtaButton isFullWidth tone={CtaTone.Gold} type="submit">
            {isSubmitting ? 'Đang mở lá số...' : 'Lập lá số của tôi'}{' '}
            <span aria-hidden="true">→</span>
          </CtaButton>
        )}
      />
    </Form>
  );
}
