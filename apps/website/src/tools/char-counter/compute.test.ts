import type { CalcResult, FieldDef, FieldValues } from '../_shared/shells';
import { defaultsFromFields } from '../_shared/shells';
import { computeCharCount } from './compute';
import { describe, expect, test } from 'bun:test';

const FIELDS: FieldDef[] = [
    { id: 'text', type: 'textarea', label: 'Text', default: '' },
    { id: 'limit', type: 'number', label: 'Limit', default: '', placeholder: 'z. B. 160' },
];

function run(patch: Partial<FieldValues>): CalcResult {
    const values: FieldValues = { ...defaultsFromFields(FIELDS) };
    for (const [key, value] of Object.entries(patch)) {
        if (value !== undefined) values[key] = value;
    }
    return computeCharCount(values);
}

describe('char-counter', () => {
    test('counts unicode chars not UTF-16 units', () => {
        const result = run({ text: '👍🏻' });
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, r.value]));
        expect(byLabel.Zeichen).toBe('2');
    });

    test('limit remaining', () => {
        const result = run({ text: 'hallo', limit: '10' });
        expect(result.tone).toBe('success');
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, r.value]));
        expect(byLabel.Frei).toBe('5');
    });

    test('over limit', () => {
        const result = run({ text: 'abcdefghij', limit: '5' });
        expect(result.tone).toBe('warn');
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, r.value]));
        expect(byLabel['Zu viel']).toBe('5');
    });
});
