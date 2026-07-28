import { describe, expect, test } from 'bun:test';
import { computeVolumeConvert } from './compute';

describe('volume-convert', () => {
    test('l to gal', () => {
        const result = computeVolumeConvert({ value: '3,785', from: 'l', to: 'gal' });
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, String(r.value)]));
        expect(byLabel.Ergebnis).toContain('1');
        expect(byLabel.Ergebnis).toContain('gal');
    });
});
