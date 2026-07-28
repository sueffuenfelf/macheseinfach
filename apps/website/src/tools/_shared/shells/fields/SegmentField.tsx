import type { SegmentFieldDef } from '../types';
import { FieldHint, FieldLabel } from './FieldLabel';

type SegmentFieldProps = {
    field: SegmentFieldDef;
    value: string;
    onChange: (value: string) => void;
    /** Reserved for id stability when multiple segments share a page. */
    idPrefix?: string;
};

export function SegmentField({ field, value, onChange }: SegmentFieldProps) {
    return (
        <div>
            <FieldLabel>{field.label}</FieldLabel>
            <div className="flex flex-wrap gap-2">
                {field.options.map((option) => {
                    const selected = value === option.value;
                    return (
                        <button
                            key={option.value}
                            type="button"
                            aria-pressed={selected}
                            className={`rounded-lg border-2 border-black px-3 py-2 font-display text-[12px] font-bold uppercase tracking-[0.04em] shadow-[2px_2px_0_#000] transition ${
                                selected
                                    ? 'bg-black text-white'
                                    : 'bg-white hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[3px_3px_0_#000]'
                            }`}
                            onClick={() => onChange(option.value)}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>
            {field.hint ? <FieldHint>{field.hint}</FieldHint> : null}
        </div>
    );
}
