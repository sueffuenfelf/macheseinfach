import { describe, expect, test } from 'bun:test';
import { computeUtilityPlausibility } from './compute';

describe('utility-plausibility', () => {
    test('mid-range gas', () => {
        const result = computeUtilityPlausibility({
            annual: '1430',
            sqm: '65',
            heating: 'gas',
        });
        expect(result.error).toBeUndefined();
        expect(result.tone).toBe('success');
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, String(r.value)]));
        expect(byLabel['Kosten / m² / Jahr']).toBe('22 €');
    });

    test('very high flags danger', () => {
        const result = computeUtilityPlausibility({
            annual: '5000',
            sqm: '50',
            heating: 'gas',
        });
        expect(result.tone).toBe('danger');
    });
});
