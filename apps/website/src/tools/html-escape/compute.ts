import type { FieldValues, GenerateOutput } from '../_shared/shells';

const ESCAPE_MAP: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
};

const UNESCAPE_MAP: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x27;': "'",
    '&apos;': "'",
};

/** Escape or unescape HTML entities. */
export function generateHtmlEscape(values: FieldValues): GenerateOutput {
    const text = values.text ?? '';
    if (!text) return null;
    const mode = values.mode ?? 'escape';

    if (mode === 'escape') {
        const content = text.replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch] ?? ch);
        return { kind: 'code', content, language: 'html', filename: 'escaped.html' };
    }

    const content = text.replace(
        /&amp;|&lt;|&gt;|&quot;|&#39;|&#x27;|&apos;/gi,
        (entity) => UNESCAPE_MAP[entity.toLowerCase()] ?? entity,
    );
    return { kind: 'text', content, filename: 'unescaped.txt' };
}
