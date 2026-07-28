import { describe, expect, test } from 'bun:test';
import type { CalcResult, FieldDef, FieldValues } from '../_shared/shells';
import { defaultsFromFields } from '../_shared/shells';
import { computeVat } from './compute';

/** Smoke: mock calc definition shape used by CalcToolShell / defineCalcTool. */
const VAT_FIELDS: FieldDef[] = [
    { id: 'amount', type: 'currency', label: 'Betrag', default: '' },
    {
        id: 'mode',
        type: 'segment',
        label: 'Richtung',
        options: [
            { value: 'gross-to-net', label: 'Brutto → Netto' },
            { value: 'net-to-gross', label: 'Netto → Brutto' },
        ],
        default: 'gross-to-net',
    },
    {
        id: 'rate',
        type: 'segment',
        label: 'MwSt',
        options: [
            { value: '19', label: '19 %' },
            { value: '7', label: '7 %' },
        ],
        default: '19',
    },
];

function run(patch: Partial<FieldValues>): CalcResult {
    const values: FieldValues = { ...defaultsFromFields(VAT_FIELDS) };
    for (const [key, value] of Object.entries(patch)) {
        if (value !== undefined) values[key] = value;
    }
    return computeVat(values);
}

describe('vat-calculator compute (CalcToolShell mock definition)', () => {
    test('defaults match shell field schema', () => {
        expect(defaultsFromFields(VAT_FIELDS)).toEqual({
            amount: '',
            mode: 'gross-to-net',
            rate: '19',
        });
    });

    test('gross to net at 19%', () => {
        const result = run({ amount: '119,00' });
        expect(result.error).toBeUndefined();
        expect(result.heading).toBe('Brutto → Netto');
        const byLabel = Object.fromEntries(
            result.rows.map((row) => [row.label, String(row.value).replace(/\u00a0/g, ' ')]),
        );
        expect(byLabel.Netto).toBe('100,00 €');
        expect(byLabel.MwSt).toBe('19,00 €');
        expect(byLabel.Brutto).toBe('119,00 €');
    });

    test('net to gross at 7%', () => {
        const result = run({
            amount: '100',
            mode: 'net-to-gross',
            rate: '7',
        });
        expect(result.error).toBeUndefined();
        const byLabel = Object.fromEntries(
            result.rows.map((row) => [row.label, String(row.value).replace(/\u00a0/g, ' ')]),
        );
        expect(byLabel.Netto).toBe('100,00 €');
        expect(byLabel.MwSt).toBe('7,00 €');
        expect(byLabel.Brutto).toBe('107,00 €');
    });

    test('invalid amount yields error result for shell', () => {
        const result = run({ amount: 'abc' });
        expect(result.error).toBeTruthy();
        expect(result.rows).toEqual([]);
    });
});
