import type { CurrencyFieldDef } from '../types';
import { FieldError, FieldHint, FieldLabel } from './FieldLabel';

type CurrencyFieldProps = {
    field: CurrencyFieldDef;
    value: string;
    onChange: (value: string) => void;
    idPrefix?: string;
    invalid?: boolean;
    errorText?: string;
};

export function CurrencyField({
    field,
    value,
    onChange,
    idPrefix = 'field',
    invalid,
    errorText,
}: CurrencyFieldProps) {
    const id = `${idPrefix}-${field.id}`;
    return (
        <div>
            <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
            <div className="relative">
                <input
                    id={id}
                    inputMode="decimal"
                    className="ms-input pr-10 [font-variant-numeric:tabular-nums]"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={field.placeholder ?? '0,00'}
                    data-invalid={invalid || undefined}
                    aria-describedby={field.hint ? `${id}-hint` : undefined}
                />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 font-display text-[12px] font-bold text-[var(--color-ink-soft)]">
                    €
                </span>
            </div>
            {invalid && errorText ? <FieldError>{errorText}</FieldError> : null}
            {!invalid && field.hint ? (
                <FieldHint>
                    <span id={`${id}-hint`}>{field.hint}</span>
                </FieldHint>
            ) : null}
        </div>
    );
}
