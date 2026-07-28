import type { FieldValues, GenerateOutput } from '../_shared/shells';

/** URL encode or decode. */
export function generateUrlEncode(values: FieldValues): GenerateOutput {
    const text = values.text ?? '';
    if (!text) return null;
    const mode = values.mode ?? 'encode';

    if (mode === 'encode') {
        return {
            kind: 'code',
            content: encodeURIComponent(text),
            language: 'text',
            filename: 'encoded.txt',
        };
    }

    try {
        return {
            kind: 'text',
            content: decodeURIComponent(text.replace(/\+/g, ' ')),
            filename: 'decoded.txt',
        };
    } catch {
        return {
            kind: 'text',
            content: 'Fehler: Ungültiges Percent-Encoding.',
            filename: 'error.txt',
        };
    }
}
