import type { FieldDef } from '../types';
import { CurrencyField } from './CurrencyField';
import { DateField } from './DateField';
import { NumberField } from './NumberField';
import { SegmentField } from './SegmentField';
import { TextareaField } from './TextareaField';
import { TextField } from './TextField';

type FieldRendererProps = {
    field: FieldDef;
    value: string;
    onChange: (value: string) => void;
    idPrefix?: string;
    invalid?: boolean;
    errorText?: string;
};

export function FieldRenderer({
    field,
    value,
    onChange,
    idPrefix,
    invalid,
    errorText,
}: FieldRendererProps) {
    switch (field.type) {
        case 'text':
            return (
                <TextField
                    field={field}
                    value={value}
                    onChange={onChange}
                    idPrefix={idPrefix}
                    invalid={invalid}
                    errorText={errorText}
                />
            );
        case 'currency':
            return (
                <CurrencyField
                    field={field}
                    value={value}
                    onChange={onChange}
                    idPrefix={idPrefix}
                    invalid={invalid}
                    errorText={errorText}
                />
            );
        case 'number':
            return (
                <NumberField
                    field={field}
                    value={value}
                    onChange={onChange}
                    idPrefix={idPrefix}
                    invalid={invalid}
                    errorText={errorText}
                />
            );
        case 'segment':
            return (
                <SegmentField field={field} value={value} onChange={onChange} idPrefix={idPrefix} />
            );
        case 'date':
            return (
                <DateField
                    field={field}
                    value={value}
                    onChange={onChange}
                    idPrefix={idPrefix}
                    invalid={invalid}
                    errorText={errorText}
                />
            );
        case 'textarea':
            return (
                <TextareaField
                    field={field}
                    value={value}
                    onChange={onChange}
                    idPrefix={idPrefix}
                    invalid={invalid}
                    errorText={errorText}
                />
            );
        default: {
            const _exhaustive: never = field;
            return _exhaustive;
        }
    }
}
