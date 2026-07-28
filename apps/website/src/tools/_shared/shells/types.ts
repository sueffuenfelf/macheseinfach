import type { ReactNode } from 'react';

/** Shared result tones — matches ResultCard. */
export type ResultTone = 'success' | 'warn' | 'danger' | 'info';

export type FieldOption = {
    value: string;
    label: string;
};

type FieldBase = {
    id: string;
    label: string;
    /** Optional help under the control */
    hint?: string;
};

export type TextFieldDef = FieldBase & {
    type: 'text';
    default?: string;
    placeholder?: string;
    mono?: boolean;
};

export type CurrencyFieldDef = FieldBase & {
    type: 'currency';
    default?: string;
    placeholder?: string;
};

export type NumberFieldDef = FieldBase & {
    type: 'number';
    default?: string;
    placeholder?: string;
    suffix?: string;
};

export type SegmentFieldDef = FieldBase & {
    type: 'segment';
    options: readonly FieldOption[];
    default?: string;
};

export type DateFieldDef = FieldBase & {
    type: 'date';
    default?: string;
};

export type TextareaFieldDef = FieldBase & {
    type: 'textarea';
    default?: string;
    placeholder?: string;
    rows?: number;
};

export type FieldDef =
    | TextFieldDef
    | CurrencyFieldDef
    | NumberFieldDef
    | SegmentFieldDef
    | DateFieldDef
    | TextareaFieldDef;

/** All field values are stored as strings in the form state. */
export type FieldValues = Record<string, string>;

export type ResultRow = {
    label: string;
    value: ReactNode;
};

export type CalcResult = {
    rows: ResultRow[];
    tone?: ResultTone;
    heading?: string;
    hint?: string;
    /** When set, shell shows an error ResultCard instead of rows. */
    error?: string;
};

export type CheckResult = {
    ok: boolean;
    tone: ResultTone;
    heading: string;
    summary?: string;
    details?: ResultRow[];
    message?: string;
};

export type GenerateOutput =
    | { kind: 'text'; content: string; filename?: string }
    | { kind: 'code'; content: string; language?: string; filename?: string }
    | { kind: 'qr'; dataUrl: string; filename?: string }
    | null;

export type PasteSeverity = 'ok' | 'info' | 'warn' | 'error';

export type PasteFinding = {
    id: string;
    severity: PasteSeverity;
    title: string;
    detail?: string;
};

export type ExtractField = {
    id: string;
    label: string;
    value: string;
    mono?: boolean;
};
