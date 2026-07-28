import { describe, expect, test } from 'bun:test';
import type { CalcResult, FieldDef, FieldValues } from '../_shared/shells';
import { defaultsFromFields } from '../_shared/shells';
import { computePaymentSplit, splitPaymentAmount } from './compute';

const SPLIT_FIELDS: FieldDef[] = [
    { id: 'amount', type: 'currency', label: 'Gesamtbetrag', default: '' },
    { id: 'count', type: 'number', label: 'Anzahl Raten', default: '3' },
];

function run(patch: Partial<FieldValues>): CalcResult {
    const values: FieldValues = { ...defaultsFromFields(SPLIT_FIELDS) };
    for (const [key, value] of Object.entries(patch)) {
        if (value !== undefined) values[key] = value;
    }
    return computePaymentSplit(values);
}

describe('payment-split compute', () => {
    test('splitPaymentAmount distributes remainder cents', () => {
        expect(splitPaymentAmount(100, 3)).toEqual([33.34, 33.33, 33.33]);
        expect(splitPaymentAmount(10, 3)).toEqual([3.34, 3.33, 3.33]);
    });

    test('split sums to total', () => {
        const parts = splitPaymentAmount(1234.56, 7);
        const sum = parts.reduce((a, b) => a + b, 0);
        expect(Math.round(sum * 100)).toBe(123_456);
    });

    test('shell compute shows rates', () => {
        const result = run({ amount: '100,00', count: '3' });
        expect(result.error).toBeUndefined();
        expect(result.rows).toHaveLength(5); // total + 3 rates + sum
        const rates = result.rows.filter((r) => r.label.startsWith('Rate'));
        expect(rates).toHaveLength(3);
    });

    test('invalid count yields error', () => {
        expect(run({ amount: '100', count: '1' }).error).toBeTruthy();
        expect(run({ amount: '100', count: '100' }).error).toBeTruthy();
    });
});
