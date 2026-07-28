import type { FieldValues, GenerateOutput } from '../_shared/shells';

const TO_ASCII: Record<string, string> = {
    ä: 'ae',
    ö: 'oe',
    ü: 'ue',
    Ä: 'Ae',
    Ö: 'Oe',
    Ü: 'Ue',
    ß: 'ss',
};

const FROM_ASCII: Array<[RegExp, string]> = [
    [/ae/g, 'ä'],
    [/oe/g, 'ö'],
    [/ue/g, 'ü'],
    [/Ae/g, 'Ä'],
    [/Oe/g, 'Ö'],
    [/Ue/g, 'Ü'],
    [/ss/g, 'ß'],
];

export function generateUmlautConvert(values: FieldValues): GenerateOutput {
    const text = values.text ?? '';
    if (!text) return null;
    const direction = values.direction ?? 'to-ascii';
    let content: string;
    if (direction === 'to-ascii') {
        content = [...text].map((ch) => TO_ASCII[ch] ?? ch).join('');
    } else {
        content = text;
        for (const [re, repl] of FROM_ASCII) {
            content = content.replace(re, repl);
        }
    }
    return { kind: 'text', content, filename: 'umlaute.txt' };
}
