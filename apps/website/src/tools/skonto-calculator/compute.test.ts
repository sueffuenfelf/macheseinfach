import { describe, expect, test } from 'bun:test';
import type { CalcResult, FieldDef, FieldValues } from '../_shared/shells';
import { defaultsFromFields } from '../_shared/shells';
import { computeSkonto } from './compute';

const SKONTO_FIELDS: FieldDef[] = [
    { id: 'amount', type: 'currency', label: 'Rechnungsbetrag', default: '' },
    { id: 'rate', type: 'number', label: 'Skontosatz', default: '2', suffix: '%' },
];

function run(patch: Partial<FieldValues>): CalcResult {
    const values: FieldValues = { ...defaultsFromFields(SKONTO_FIELDS) };
    for (const [key, value] of Object.entries(patch)) {
        if (value !== undefined) values[key] = value;
    }
    return computeSkonto(values);
}

describe('skonto-calculator compute', () => {
    test('2% skonto on 1000 EUR', () => {
        const result = run({ amount: '1.000,00', rate: '2' });
        expect(result.error).toBeUndefined();
        const byLabel = Object.fromEntries(
            result.rows.map((row) => [row.label, String(row.value).replace(/\u00a0/g, ' ')]),
        );
        expect(byLabel.Skontobetrag).toBe('20,00 €');
        expect(byLabel.Zahlbetrag).toBe('980,00 €');
    });

    test('invalid amount yields error', () => {
        const result = run({ amount: 'abc' });
        expect(result.error).toBeTruthy();
        expect(result.rows).toEqual([]);
    });

    test('invalid rate yields error', () => {
        const result = run({ amount: '100', rate: '0' });
        expect(result.error).toBeTruthy();
    });
});
