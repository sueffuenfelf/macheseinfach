import type { FieldValues, GenerateOutput } from '../_shared/shells';

/** Test a regex against sample text; return match report. */
export function generateRegexTest(values: FieldValues): GenerateOutput {
    const pattern = values.pattern ?? '';
    const text = values.text ?? '';
    if (!pattern) return null;

    const flags = values.flags ?? 'g';
    let re: RegExp;
    try {
        re = new RegExp(pattern, flags);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Ungültiges Pattern';
        return {
            kind: 'text',
            content: `Fehler: ${message}`,
            filename: 'regex-error.txt',
        };
    }

    const matches: string[] = [];
    if (flags.includes('g')) {
        let m: RegExpExecArray | null;
        const clone = new RegExp(re.source, re.flags);
        while ((m = clone.exec(text)) !== null) {
            matches.push(
                `Match @${m.index}: ${JSON.stringify(m[0])}` +
                    (m.length > 1
                        ? ` · Gruppen: ${m
                              .slice(1)
                              .map((g) => JSON.stringify(g))
                              .join(', ')}`
                        : ''),
            );
            if (m[0] === '') clone.lastIndex++;
            if (matches.length >= 200) {
                matches.push('… (abgebrochen nach 200 Treffern)');
                break;
            }
        }
    } else {
        const m = re.exec(text);
        if (m) {
            matches.push(`Match @${m.index}: ${JSON.stringify(m[0])}`);
        }
    }

    const lines = [
        `Pattern: /${pattern}/${flags}`,
        `Treffer: ${matches.length === 0 ? 0 : matches.filter((l) => l.startsWith('Match')).length}`,
        '',
        ...(matches.length ? matches : ['Keine Treffer.']),
    ];

    return {
        kind: 'code',
        content: lines.join('\n'),
        language: 'text',
        filename: 'regex-result.txt',
    };
}
