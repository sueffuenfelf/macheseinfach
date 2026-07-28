import { describe, expect, test } from 'bun:test';
import { computeSolidaritySurcharge } from './compute';

describe('solidarity-surcharge compute', () => {
    test('below freigrenze 2026 single', () => {
        const result = computeSolidaritySurcharge({
            year: '2026',
            filing: 'single',
            incomeTax: '15000',
        });
        expect(result.tone).toBe('success');
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, r.value]));
        expect(byLabel['Soli (5,5\u00a0%, grob)']).toBe('0,00\u00a0€');
        expect(byLabel['Freigrenze (Nullzone)']).toBe('20.350,00\u00a0€');
    });

    test('above freigrenze applies 5.5%', () => {
        const result = computeSolidaritySurcharge({
            year: '2025',
            filing: 'single',
            incomeTax: '30000',
        });
        expect(result.tone).toBe('warn');
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, r.value]));
        expect(byLabel['Soli (5,5\u00a0%, grob)']).toBe('1.650,00\u00a0€');
    });
});
