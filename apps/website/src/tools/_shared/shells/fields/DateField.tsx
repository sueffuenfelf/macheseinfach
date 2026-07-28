import type { DateFieldDef } from '../types';
import { FieldError, FieldHint, FieldLabel } from './FieldLabel';

type DateFieldProps = {
    field: DateFieldDef;
    value: string;
    onChange: (value: string) => void;
    idPrefix?: string;
    invalid?: boolean;
    errorText?: string;
};

export function DateField({
    field,
    value,
    onChange,
    idPrefix = 'field',
    invalid,
    errorText,
}: DateFieldProps) {
    const id = `${idPrefix}-${field.id}`;
    return (
        <div>
            <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
            <input
                id={id}
                type="date"
                className="ms-input [font-variant-numeric:tabular-nums]"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                data-invalid={invalid || undefined}
            />
            {invalid && errorText ? <FieldError>{errorText}</FieldError> : null}
            {!invalid && field.hint ? <FieldHint>{field.hint}</FieldHint> : null}
        </div>
    );
}
