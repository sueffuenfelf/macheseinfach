import { describe, expect, test } from 'bun:test';
import { computeTempConvert } from './compute';

describe('temp-convert', () => {
    test('celsius to fahrenheit', () => {
        const result = computeTempConvert({ value: '0', from: 'c', to: 'f' });
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, String(r.value)]));
        expect(byLabel.Ergebnis).toContain('32');
        expect(byLabel.Ergebnis).toContain('°F');
    });
});
