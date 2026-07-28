import type {
    CalcResult,
    CheckResult,
    ExtractField,
    FieldDef,
    FieldValues,
    GenerateOutput,
    PasteFinding,
} from './_shared/shells';

export type CalcShellRuntime = {
    kind: 'calc';
    fields: readonly FieldDef[];
    compute: (values: FieldValues) => CalcResult;
};

export type CheckShellRuntime = {
    kind: 'check';
    fields: readonly FieldDef[];
    check: (values: FieldValues) => CheckResult | Promise<CheckResult>;
};

export type GenerateShellRuntime = {
    kind: 'generate';
    fields: readonly FieldDef[];
    generate: (values: FieldValues) => GenerateOutput | Promise<GenerateOutput>;
    isReady?: (values: FieldValues) => boolean;
};

export type PasteShellRuntime = {
    kind: 'paste';
    analyze: (input: string) => PasteFinding[] | Promise<PasteFinding[]>;
};

export type ExtractShellRuntime = {
    kind: 'extract';
    extract: (input: {
        text?: string;
        file?: File;
    }) => ExtractField[] | Promise<ExtractField[]>;
    mode?: 'text' | 'file' | 'both';
};

export type ToolShellRuntime =
    | CalcShellRuntime
    | CheckShellRuntime
    | GenerateShellRuntime
    | PasteShellRuntime
    | ExtractShellRuntime;
