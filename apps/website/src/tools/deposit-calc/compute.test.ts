import { describe, expect, test } from 'bun:test';
import { computeDeposit } from './compute';

describe('deposit-calc', () => {
    test('3× cold rent', () => {
        const result = computeDeposit({ cold: '800' });
        expect(result.error).toBeUndefined();
        const byLabel = Object.fromEntries(
            result.rows.map((r) => [r.label, String(r.value).replace(/\u00a0/g, ' ')]),
        );
        expect(byLabel['Maximal (3 Monatsmieten)']).toBe('2.400,00 €');
        expect(byLabel['Rate bei 3 Teilzahlungen']).toBe('800,00 €');
    });

    test('invalid amount', () => {
        expect(computeDeposit({ cold: 'x' }).error).toBeTruthy();
    });
});
