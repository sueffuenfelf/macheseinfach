import { describe, expect, test } from 'bun:test';
import { checkTaxDeadlines } from './compute';

describe('tax-deadline-calendar check', () => {
    test('next quarterly deadline from mid-year', () => {
        const result = checkTaxDeadlines({
            year: '2026',
            cadence: 'quarterly',
            asOf: '2026-05-01',
        });
        expect(result.ok).toBe(true);
        expect(result.heading).toContain('UStVA Q2');
        expect(result.heading).toContain('10.07.2026');
    });

    test('monthly shows January filing', () => {
        const result = checkTaxDeadlines({
            year: '2026',
            cadence: 'monthly',
            asOf: '2026-01-15',
        });
        expect(result.ok).toBe(true);
        expect(result.heading).toContain('UStVA 01/2026');
        expect(result.heading).toContain('10.02.2026');
    });

    test('includes ESt deadline near year end', () => {
        const result = checkTaxDeadlines({
            year: '2025',
            cadence: 'quarterly',
            asOf: '2026-06-01',
        });
        expect(result.details?.some((d) => d.label.includes('Einkommensteuer'))).toBe(true);
    });
});
