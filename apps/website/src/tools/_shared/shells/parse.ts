import { parseGermanNumber } from '../../../lib/format';
import type { FieldDef, FieldValues } from './types';

/** Initial string values from field defaults. */
export function defaultsFromFields(fields: readonly FieldDef[]): FieldValues {
    const values: FieldValues = {};
    for (const field of fields) {
        if (field.type === 'segment') {
            values[field.id] = field.default ?? field.options[0]?.value ?? '';
            continue;
        }
        values[field.id] = field.default ?? '';
    }
    return values;
}

/**
 * Parse a German-formatted number. Empty → null; invalid → null.
 * Uses `parseGermanNumber` but distinguishes empty/invalid from zero.
 */
export function parseFieldNumber(raw: string): number | null {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const normalized = trimmed.replace(/\./g, '').replace(',', '.');
    if (!/^-?\d+(\.\d+)?$/.test(normalized)) return null;
    const n = Number(normalized);
    return Number.isFinite(n) ? n : null;
}

/** Currency alias — same rules as `parseFieldNumber`. */
export function parseFieldCurrency(raw: string): number | null {
    return parseFieldNumber(raw);
}

/**
 * Lenient German number parse for compute paths that treat empty as 0
 * (matches girocode / existing tools). Prefer `parseFieldNumber` when
 * empty must be distinguished from zero.
 */
export function parseGermanAmount(raw: string): number {
    return parseGermanNumber(raw);
}

/** ISO date string (yyyy-mm-dd) → Date at local midnight, or null. */
export function parseFieldDate(raw: string): Date | null {
    const trimmed = raw.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
    const [y, m, d] = trimmed.split('-').map(Number);
    if (!y || !m || !d) return null;
    const date = new Date(y, m - 1, d);
    if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
        return null;
    }
    return date;
}
