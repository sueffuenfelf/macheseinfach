import type { FieldValues, GenerateOutput } from '../_shared/shells';

export type WhitespaceMode = 'collapse' | 'trim-lines' | 'one-line' | 'blank-lines';

export function generateWhitespaceClean(values: FieldValues): GenerateOutput {
    const text = values.text ?? '';
    if (!text) return null;
    const mode = (values.mode ?? 'collapse') as WhitespaceMode;
    let content: string;
    switch (mode) {
        case 'collapse':
            content = text.replace(/[^\S\n]+/g, ' ').replace(/ +\n/g, '\n').replace(/\n +/g, '\n');
            break;
        case 'trim-lines':
            content = text
                .split(/\r\n|\r|\n/)
                .map((l) => l.trim())
                .join('\n');
            break;
        case 'one-line':
            content = text.replace(/\s+/g, ' ').trim();
            break;
        case 'blank-lines':
            content = text.replace(/\n{3,}/g, '\n\n').replace(/^\n+|\n+$/g, '');
            break;
        default:
            content = text;
    }
    return { kind: 'text', content, filename: 'cleaned.txt' };
}
