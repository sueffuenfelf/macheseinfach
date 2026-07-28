import { describe, expect, test } from 'bun:test';
import { computePercent } from './compute';

describe('percent-calc', () => {
    test('percent of', () => {
        const result = computePercent({ mode: 'of', a: '19', b: '100' });
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, r.value]));
        expect(byLabel.Ergebnis).toBe('19');
    });

    test('is what percent', () => {
        const result = computePercent({ mode: 'is', a: '25', b: '200' });
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, String(r.value)]));
        expect(byLabel.Anteil).toContain('12,5');
    });

    test('percent change', () => {
        const result = computePercent({ mode: 'change', a: '100', b: '120' });
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, String(r.value)]));
        expect(byLabel.Änderung).toContain('20');
    });
});
