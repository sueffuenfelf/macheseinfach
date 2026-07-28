import { describe, expect, test } from 'bun:test';
import { computeExpenseRatio } from './compute';

describe('expense-ratio compute', () => {
    test('30% ratio', () => {
        const result = computeExpenseRatio({ income: '100000', expenses: '30000' });
        expect(result.error).toBeUndefined();
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, r.value]));
        expect(byLabel.Kostenquote).toBe('30,0\u00a0%');
        expect(byLabel['Überschuss / Fehlbetrag']).toBe('70.000,00\u00a0€');
    });

    test('high ratio warns', () => {
        const result = computeExpenseRatio({ income: '10000', expenses: '9000' });
        expect(result.tone).toBe('warn');
    });

    test('zero income error', () => {
        expect(computeExpenseRatio({ income: '0', expenses: '100' }).error).toBeTruthy();
    });
});
