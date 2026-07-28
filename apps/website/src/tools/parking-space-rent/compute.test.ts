import { describe, expect, test } from 'bun:test';
import { computeParkingSpaceRent } from './compute';

describe('parking-space-rent', () => {
    test('percent of rent', () => {
        const result = computeParkingSpaceRent({ mode: 'share', rent: '1000', pct: '10' });
        const byLabel = Object.fromEntries(
            result.rows.map((r) => [r.label, String(r.value).replace(/\u00a0/g, ' ')]),
        );
        expect(byLabel['Stellplatz grob']).toBe('100,00 €');
    });

    test('fixed to percent', () => {
        const result = computeParkingSpaceRent({
            mode: 'fixed',
            rent: '1000',
            garage: '80',
        });
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, String(r.value)]));
        expect(byLabel.Anteil).toBe('8 %');
    });
});
