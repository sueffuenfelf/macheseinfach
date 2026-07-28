import { describe, expect, test } from 'bun:test';
import { computeLengthConvert } from './compute';

describe('length-convert', () => {
    test('cm to inch', () => {
        const result = computeLengthConvert({ value: '2,54', from: 'cm', to: 'inch' });
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, String(r.value)]));
        expect(byLabel.Ergebnis).toContain('1');
        expect(byLabel.Ergebnis).toContain('Zoll');
    });
});
