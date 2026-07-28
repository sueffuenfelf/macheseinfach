import { describe, expect, test } from 'bun:test';
import { computeSpeedConvert } from './compute';

describe('speed-convert', () => {
    test('kmh to mph', () => {
        const result = computeSpeedConvert({ value: '100', from: 'kmh', to: 'mph' });
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, String(r.value)]));
        expect(byLabel.Ergebnis).toContain('62');
        expect(byLabel.Ergebnis).toContain('mph');
    });
});
