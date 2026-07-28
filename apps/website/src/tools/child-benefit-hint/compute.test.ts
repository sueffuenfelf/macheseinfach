import { describe, expect, test } from 'bun:test';
import { computeChildBenefitHint } from './compute';

describe('child-benefit-hint compute', () => {
    test('2 children 2026', () => {
        const result = computeChildBenefitHint({ year: '2026', count: '2', age: '' });
        expect(result.error).toBeUndefined();
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, r.value]));
        expect(byLabel['Satz pro Kind / Monat']).toBe('259,00\u00a0€');
        expect(byLabel['Monatlich gesamt']).toBe('518,00\u00a0€');
        expect(byLabel['Jährlich gesamt']).toBe('6.216,00\u00a0€');
    });

    test('2025 rate', () => {
        const result = computeChildBenefitHint({ year: '2025', count: '1' });
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, r.value]));
        expect(byLabel['Satz pro Kind / Monat']).toBe('255,00\u00a0€');
    });
});
