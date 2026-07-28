import type { FieldValues, GenerateOutput } from '../_shared/shells';

/** Generate one or more UUID v4 strings. */
export function generateUuid(values: FieldValues): GenerateOutput {
    const count = Math.min(50, Math.max(1, Math.floor(Number(values.count ?? '1') || 1)));
    const lines: string[] = [];
    for (let i = 0; i < count; i++) {
        lines.push(crypto.randomUUID());
    }
    return {
        kind: 'code',
        content: lines.join('\n'),
        language: 'text',
        filename: 'uuids.txt',
    };
}
