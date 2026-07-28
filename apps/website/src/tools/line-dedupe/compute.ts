import type { FieldValues, GenerateOutput } from '../_shared/shells';

export function generateLineDedupe(values: FieldValues): GenerateOutput {
    const text = values.text ?? '';
    if (!text) return null;
    const keepEmpty = (values.keepEmpty ?? 'no') === 'yes';
    const lines = text.split(/\r\n|\r|\n/);
    const seen = new Set<string>();
    const out: string[] = [];
    for (const line of lines) {
        if (!keepEmpty && line.trim() === '') {
            out.push(line);
            continue;
        }
        if (seen.has(line)) continue;
        seen.add(line);
        out.push(line);
    }
    return { kind: 'text', content: out.join('\n'), filename: 'deduped.txt' };
}
