import { describe, expect, test } from 'bun:test';
import { computeWeightConvert } from './compute';

describe('weight-convert', () => {
    test('kg to lb', () => {
        const result = computeWeightConvert({ value: '1', from: 'kg', to: 'lb' });
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, String(r.value)]));
        expect(byLabel.Ergebnis).toContain('2,2');
        expect(byLabel.Ergebnis).toContain('Pfund');
    });
});
