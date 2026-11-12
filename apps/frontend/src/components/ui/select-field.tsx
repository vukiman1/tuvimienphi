import { ChevronDown } from 'lucide-react';
import { FieldError } from '@/components/ui/field-error';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/** The slice of a TanStack Form field this needs, kept structural so callers dodge its generics. */
export interface SelectFieldApi<TValue extends string> {
  name: string;
  state: { value: TValue; meta: { errors: ReadonlyArray<unknown> } };
  handleBlur: () => void;
  handleChange: (value: TValue) => void;
}

export interface SelectOption<TValue extends string> {
  readonly value: TValue;
  readonly label: string;
}

interface SelectFieldProps<TValue extends string> {
  readonly field: SelectFieldApi<TValue>;
  readonly label: string;
  readonly options: readonly SelectOption<TValue>[];
  /** Shown as a disabled first entry while nothing is chosen. */
  readonly placeholder?: string;
  /** Hides the label visually; it stays available to a screen reader. */
  readonly isLabelHidden?: boolean;
  /** Applied to the select itself, not the wrapper. */
  readonly className?: string;
}

/** Label, native select and error as one unit — the select counterpart of FormField. */
export function SelectField<TValue extends string>({
  field,
  label,
  options,
  placeholder,
  isLabelHidden = false,
  className,
}: SelectFieldProps<TValue>) {
  const errorId = `${field.name}-error`;

  return (
    <div className="grid gap-1">
      <Label className={isLabelHidden ? 'sr-only' : undefined} htmlFor={field.name}>
        {label}
      </Label>
      <div className="relative">
        <select
          aria-describedby={errorId}
          aria-invalid={field.state.meta.errors.length > 0}
          className={cn(
            'h-9 w-full min-w-0 appearance-none rounded-md border border-input bg-transparent py-1 pr-8 pl-3 text-base shadow-xs outline-none transition-[color,box-shadow] md:text-sm',
            'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
            className,
          )}
          id={field.name}
          name={field.name}
          onBlur={field.handleBlur}
          onChange={(event) => {
            const selected = options.find((option) => option.value === event.target.value);
            if (selected) {
              field.handleChange(selected.value);
            }
          }}
          value={field.state.value}
        >
          {placeholder !== undefined && (
            <option disabled value="">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-ink-soft"
        />
      </div>
      <FieldError errors={field.state.meta.errors} id={errorId} />
    </div>
  );
}
