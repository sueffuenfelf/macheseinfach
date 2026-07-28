import { describe, expect, test } from 'bun:test';
import { computeRentIncreaseIndex } from './compute';

describe('rent-increase-index', () => {
    test('applies percent change', () => {
        const result = computeRentIncreaseIndex({ rent: '1000', changePct: '3,5' });
        const byLabel = Object.fromEntries(
            result.rows.map((r) => [r.label, String(r.value).replace(/\u00a0/g, ' ')]),
        );
        expect(byLabel['Neue Miete (grob)']).toBe('1.035,00 €');
        expect(byLabel.Differenz).toBe('35,00 €');
    });
});
