import type { FieldDef, FieldValues } from '../tools/_shared/shells/types';
import { defaultsFromFields } from '../tools/_shared/shells/parse';

const scalarPrefill = new Map<string, Record<string, string>>();
const filePrefill = new Map<string, File>();
const pastePrefill = new Map<string, string>();

export function setToolScalarPrefill(toolId: string, values: Record<string, string>): void {
    scalarPrefill.set(toolId, values);
}

export function setToolFilePrefill(toolId: string, file: File): void {
    filePrefill.set(toolId, file);
}

export function setPasteTextPrefill(toolId: string, text: string): void {
    pastePrefill.set(toolId, text);
}

export function consumeToolFilePrefill(toolId: string): File | null {
    const file = filePrefill.get(toolId);
    if (file) filePrefill.delete(toolId);
    return file ?? null;
}

export function consumePasteTextPrefill(toolId: string): string | null {
    const text = pastePrefill.get(toolId);
    if (text) pastePrefill.delete(toolId);
    return text ?? null;
}

export function fieldDefaultsWithPrefill(
    toolId: string,
    fields: readonly FieldDef[],
): FieldValues {
    const defaults = defaultsFromFields(fields);
    const prefill = scalarPrefill.get(toolId);
    if (prefill) {
        scalarPrefill.delete(toolId);
        for (const [key, value] of Object.entries(prefill)) {
            if (key in defaults) defaults[key] = value;
        }
    }
    return defaults;
}
