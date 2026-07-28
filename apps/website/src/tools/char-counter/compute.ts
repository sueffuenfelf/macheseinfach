import type { CalcResult, FieldValues } from '../_shared/shells';

/** Count characters, words, lines, and optional limit status. */
export function computeCharCount(values: FieldValues): CalcResult {
    const text = values.text ?? '';
    const limitRaw = (values.limit ?? '').trim();
    const chars = [...text].length;
    const charsNoSpaces = [...text.replace(/\s/g, '')].length;
    const bytes = new TextEncoder().encode(text).length;
    const lines = text.length === 0 ? 0 : text.split(/\r\n|\r|\n/).length;

    const rows = [
        { label: 'Zeichen', value: String(chars) },
        { label: 'Ohne Leerzeichen', value: String(charsNoSpaces) },
        { label: 'Bytes (UTF-8)', value: String(bytes) },
        { label: 'Zeilen', value: String(lines) },
    ];

    if (limitRaw === '') {
        return {
            tone: 'info',
            heading: 'Zeichenzahl',
            rows,
            hint: text.length === 0 ? 'Text einfügen, um zu zählen.' : undefined,
        };
    }

    const limit = Number(limitRaw.replace(',', '.'));
    if (!Number.isFinite(limit) || limit < 0) {
        return { rows: [], error: 'Limit muss eine gültige Zahl sein (z. B. 160).' };
    }

    const remaining = Math.floor(limit) - chars;
    const over = remaining < 0;
    return {
        tone: over ? 'warn' : 'success',
        heading: over ? 'Über dem Limit' : 'Im Limit',
        rows: [
            ...rows,
            { label: 'Limit', value: String(Math.floor(limit)) },
            {
                label: over ? 'Zu viel' : 'Frei',
                value: String(Math.abs(remaining)),
            },
        ],
    };
}
