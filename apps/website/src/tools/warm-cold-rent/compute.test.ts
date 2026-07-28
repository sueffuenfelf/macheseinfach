import { describe, expect, test } from 'bun:test';
import { computeWarmColdRent } from './compute';

describe('warm-cold-rent', () => {
    test('cold to warm', () => {
        const result = computeWarmColdRent({
            mode: 'cold-to-warm',
            amount: '800',
            utilities: '200',
        });
        const byLabel = Object.fromEntries(
            result.rows.map((r) => [r.label, String(r.value).replace(/\u00a0/g, ' ')]),
        );
        expect(byLabel.Warmmiete).toBe('1.000,00 €');
        expect(byLabel['NK-Anteil']).toBe('20 %');
    });

    test('warm to cold', () => {
        const result = computeWarmColdRent({
            mode: 'warm-to-cold',
            amount: '1000',
            utilities: '200',
        });
        const byLabel = Object.fromEntries(
            result.rows.map((r) => [r.label, String(r.value).replace(/\u00a0/g, ' ')]),
        );
        expect(byLabel.Kaltmiete).toBe('800,00 €');
    });
});
