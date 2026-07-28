import { createTwoFilesPatch, diffLines } from 'diff';
import type { FieldValues, GenerateOutput } from '../_shared/shells';

/** Unified diff of two texts (safe plain text, no HTML). */
export function generateTextDiff(values: FieldValues): GenerateOutput {
    const a = values.a ?? '';
    const b = values.b ?? '';
    if (!a && !b) return null;

    const changes = diffLines(a, b);
    let added = 0;
    let removed = 0;
    for (const part of changes) {
        const n = part.count ?? part.value.split('\n').length - (part.value.endsWith('\n') ? 1 : 0);
        if (part.added) added += Math.max(1, n);
        if (part.removed) removed += Math.max(1, n);
    }

    const patch = createTwoFilesPatch('A', 'B', a, b, undefined, undefined, {
        context: 3,
    });
    const summary = `# Diff · −${removed} / +${added} Zeilen\n\n`;
    return {
        kind: 'code',
        content: summary + patch,
        language: 'diff',
        filename: 'diff.patch',
    };
}
