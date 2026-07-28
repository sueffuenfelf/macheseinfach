import type { TextFieldDef } from '../types';
import { FieldError, FieldHint, FieldLabel } from './FieldLabel';

type TextFieldProps = {
    field: TextFieldDef;
    value: string;
    onChange: (value: string) => void;
    idPrefix?: string;
    invalid?: boolean;
    errorText?: string;
};

export function TextField({
    field,
    value,
    onChange,
    idPrefix = 'field',
    invalid,
    errorText,
}: TextFieldProps) {
    const id = `${idPrefix}-${field.id}`;
    return (
        <div>
            <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
            <input
                id={id}
                className={`ms-input ${field.mono ? 'font-mono tracking-[0.04em]' : ''}`.trim()}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={field.placeholder}
                data-invalid={invalid || undefined}
            />
            {invalid && errorText ? <FieldError>{errorText}</FieldError> : null}
            {!invalid && field.hint ? <FieldHint>{field.hint}</FieldHint> : null}
        </div>
    );
}
