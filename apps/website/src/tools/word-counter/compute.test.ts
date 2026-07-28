import { describe, expect, test } from 'bun:test';
import type { CalcResult, FieldValues } from '../_shared/shells';
import { computeWordCount } from './compute';

function run(text: string): CalcResult {
    const values: FieldValues = { text };
    return computeWordCount(values);
}

describe('word-counter', () => {
    test('empty', () => {
        const result = run('');
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, r.value]));
        expect(byLabel.Wörter).toBe('0');
    });

    test('counts german words', () => {
        const result = run('Eins zwei drei.');
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, r.value]));
        expect(byLabel.Wörter).toBe('3');
    });

    test('collapses whitespace', () => {
        const result = run('  a   b  \n c ');
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, r.value]));
        expect(byLabel.Wörter).toBe('3');
    });
});
