import { describe, expect, test } from 'bun:test';
import type { CalcResult, FieldDef, FieldValues } from '../_shared/shells';
import { defaultsFromFields } from '../_shared/shells';
import { computeInvoiceDueDate } from './compute';

const DUE_DATE_FIELDS: FieldDef[] = [
    { id: 'invoiceDate', type: 'date', label: 'Rechnungsdatum', default: '' },
    { id: 'termDays', type: 'number', label: 'Zahlungsziel', default: '14', suffix: 'Tage' },
];

function run(patch: Partial<FieldValues>): CalcResult {
    const values: FieldValues = { ...defaultsFromFields(DUE_DATE_FIELDS) };
    for (const [key, value] of Object.entries(patch)) {
        if (value !== undefined) values[key] = value;
    }
    return computeInvoiceDueDate(values);
}

describe('invoice-due-date compute', () => {
    test('14 days from 2026-01-01', () => {
        const result = run({ invoiceDate: '2026-01-01', termDays: '14' });
        expect(result.error).toBeUndefined();
        const byLabel = Object.fromEntries(result.rows.map((row) => [row.label, row.value]));
        expect(byLabel['Rechnungsdatum']).toBe('01.01.2026');
        expect(String(byLabel['Fällig am'])).toContain('15. Januar 2026');
    });

    test('30 days from invoice date', () => {
        const result = run({ invoiceDate: '2026-07-01', termDays: '30' });
        expect(result.error).toBeUndefined();
        const due = result.rows.find((r) => r.label === 'Fällig am')?.value;
        expect(String(due)).toContain('31. Juli 2026');
    });

    test('invalid date yields error', () => {
        const result = run({ invoiceDate: '2026-02-30', termDays: '14' });
        expect(result.error).toBeTruthy();
    });

    test('invalid term yields error', () => {
        const result = run({ invoiceDate: '2026-01-01', termDays: '-1' });
        expect(result.error).toBeTruthy();
    });
});
