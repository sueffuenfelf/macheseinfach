import type { CalcResult, FieldValues } from '../_shared/shells';

const WORDS_PER_MINUTE = 200;

function countWords(text: string): number {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).filter(Boolean).length;
}

/** Word count + rough reading time. */
export function computeWordCount(values: FieldValues): CalcResult {
    const text = values.text ?? '';
    const words = countWords(text);
    const sentences = (text.match(/[.!?…]+/g) ?? []).length || (words > 0 ? 1 : 0);
    const paragraphs =
        text.trim() === ''
            ? 0
            : text
                  .trim()
                  .split(/\n\s*\n/)
                  .filter((p) => p.trim()).length;
    const minutes = words === 0 ? 0 : Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
    const seconds = words === 0 ? 0 : Math.round((words / WORDS_PER_MINUTE) * 60);

    return {
        tone: 'info',
        heading: 'Wortzahl',
        rows: [
            { label: 'Wörter', value: String(words) },
            { label: 'Sätze (grob)', value: String(sentences) },
            { label: 'Absätze', value: String(paragraphs) },
            {
                label: 'Lesedauer',
                value: words === 0 ? '—' : `ca. ${minutes} Min (${seconds} s)`,
            },
        ],
        hint: `Annahme: ~${WORDS_PER_MINUTE} Wörter/Minute.`,
    };
}
