import type { NumberFieldDef } from '../types';
import { FieldError, FieldHint, FieldLabel } from './FieldLabel';

type NumberFieldProps = {
    field: NumberFieldDef;
    value: string;
    onChange: (value: string) => void;
    idPrefix?: string;
    invalid?: boolean;
    errorText?: string;
};

export function NumberField({
    field,
    value,
    onChange,
    idPrefix = 'field',
    invalid,
    errorText,
}: NumberFieldProps) {
    const id = `${idPrefix}-${field.id}`;
    return (
        <div>
            <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
            <div className="relative">
                <input
                    id={id}
                    inputMode="decimal"
                    className={`ms-input [font-variant-numeric:tabular-nums] ${field.suffix ? 'pr-12' : ''}`.trim()}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={field.placeholder}
                    data-invalid={invalid || undefined}
                />
                {field.suffix ? (
                    <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 font-display text-[12px] font-bold text-[var(--color-ink-soft)]">
                        {field.suffix}
                    </span>
                ) : null}
            </div>
            {invalid && errorText ? <FieldError>{errorText}</FieldError> : null}
            {!invalid && field.hint ? <FieldHint>{field.hint}</FieldHint> : null}
        </div>
    );
}
