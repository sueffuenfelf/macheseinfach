import type { FieldValues, GenerateOutput } from '../_shared/shells';

export type ReplaceRule = { find: string; replace: string };

/** Parse rules: one per line as `find => replace` or `find=replace`. */
export function parseReplaceRules(raw: string): ReplaceRule[] {
    const rules: ReplaceRule[] = [];
    for (const line of raw.split(/\r\n|\r|\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const arrow = trimmed.indexOf('=>');
        if (arrow >= 0) {
            rules.push({
                find: trimmed.slice(0, arrow).trimEnd(),
                replace: trimmed.slice(arrow + 2).trimStart(),
            });
            continue;
        }
        const eq = trimmed.indexOf('=');
        if (eq >= 0) {
            rules.push({
                find: trimmed.slice(0, eq).trimEnd(),
                replace: trimmed.slice(eq + 1).trimStart(),
            });
        }
    }
    return rules.filter((r) => r.find.length > 0);
}

export function applyBulkReplace(text: string, rules: ReplaceRule[]): string {
    let out = text;
    for (const rule of rules) {
        out = out.split(rule.find).join(rule.replace);
    }
    return out;
}

export function generateFindReplaceBulk(values: FieldValues): GenerateOutput {
    const text = values.text ?? '';
    const rules = parseReplaceRules(values.rules ?? '');
    if (!text && rules.length === 0) return null;
    if (rules.length === 0) {
        return { kind: 'text', content: text, filename: 'replaced.txt' };
    }
    return {
        kind: 'text',
        content: applyBulkReplace(text, rules),
        filename: 'replaced.txt',
    };
}
