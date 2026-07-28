import { describe, expect, test } from 'bun:test';
import { computeInvoiceMargin } from './compute';

describe('invoice-margin compute', () => {
    test('100 EK 30% margin 19% vat', () => {
        const result = computeInvoiceMargin({ cost: '100', margin: '30', vat: '19' });
        expect(result.error).toBeUndefined();
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, r.value]));
        expect(byLabel['Verkauf netto']).toBe('130,00\u00a0€');
        expect(byLabel['MwSt 19\u00a0%']).toBe('24,70\u00a0€');
        expect(byLabel['Verkauf brutto']).toBe('154,70\u00a0€');
    });

    test('invalid cost', () => {
        expect(computeInvoiceMargin({ cost: '', margin: '10', vat: '19' }).error).toBeTruthy();
    });
});
