import type { TextareaFieldDef } from '../types';
import { FieldError, FieldHint, FieldLabel } from './FieldLabel';

type TextareaFieldProps = {
    field: TextareaFieldDef;
    value: string;
    onChange: (value: string) => void;
    idPrefix?: string;
    invalid?: boolean;
    errorText?: string;
};

export function TextareaField({
    field,
    value,
    onChange,
    idPrefix = 'field',
    invalid,
    errorText,
}: TextareaFieldProps) {
    const id = `${idPrefix}-${field.id}`;
    return (
        <div>
            <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
            <textarea
                id={id}
                className="ms-input min-h-[120px] resize-y py-3 font-mono text-[13px] leading-relaxed"
                rows={field.rows ?? 6}
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
