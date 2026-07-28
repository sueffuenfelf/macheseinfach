import type { FieldValues, GenerateOutput } from '../_shared/shells';

export type CaseMode = 'upper' | 'lower' | 'title' | 'sentence';

function toTitleCase(text: string): string {
    return text.replace(/\S+/g, (word) => {
        const first = word.charAt(0).toLocaleUpperCase('de-DE');
        return first + word.slice(1).toLocaleLowerCase('de-DE');
    });
}

function toSentenceCase(text: string): string {
    const lower = text.toLocaleLowerCase('de-DE');
    return lower.replace(/(^\s*\p{L})|([.!?…]\s+\p{L})/gu, (m) => m.toLocaleUpperCase('de-DE'));
}

export function generateCaseConvert(values: FieldValues): GenerateOutput {
    const text = values.text ?? '';
    if (!text) return null;
    const mode = (values.mode ?? 'upper') as CaseMode;
    let content: string;
    switch (mode) {
        case 'upper':
            content = text.toLocaleUpperCase('de-DE');
            break;
        case 'lower':
            content = text.toLocaleLowerCase('de-DE');
            break;
        case 'title':
            content = toTitleCase(text);
            break;
        case 'sentence':
            content = toSentenceCase(text);
            break;
        default:
            content = text;
    }
    return { kind: 'text', content, filename: 'text.txt' };
}
