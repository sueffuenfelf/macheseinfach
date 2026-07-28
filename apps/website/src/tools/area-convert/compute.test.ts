import { describe, expect, test } from 'bun:test';
import { computeAreaConvert } from './compute';

describe('area-convert', () => {
    test('m2 to ha', () => {
        const result = computeAreaConvert({ value: '10000', from: 'm2', to: 'ha' });
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, String(r.value)]));
        expect(byLabel.Ergebnis).toContain('1');
        expect(byLabel.Ergebnis).toContain('ha');
    });
});
