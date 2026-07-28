import { describe, expect, test } from 'bun:test';
import type { CalcResult, FieldDef, FieldValues } from '../_shared/shells';
import { defaultsFromFields } from '../_shared/shells';
import {
    computeKleinunternehmerCheck,
    KLEINUNTERNEHMER_CURRENT_YEAR_LIMIT,
    KLEINUNTERNEHMER_PREVIOUS_YEAR_LIMIT,
} from './compute';

const KU_FIELDS: FieldDef[] = [
    { id: 'previousYear', type: 'currency', label: 'Umsatz Vorjahr', default: '' },
    { id: 'currentYear', type: 'currency', label: 'Umsatz laufendes Jahr', default: '' },
];

function run(patch: Partial<FieldValues>): CalcResult {
    const values: FieldValues = { ...defaultsFromFields(KU_FIELDS) };
    for (const [key, value] of Object.entries(patch)) {
        if (value !== undefined) values[key] = value;
    }
    return computeKleinunternehmerCheck(values);
}

describe('kleinunternehmer-check compute', () => {
    test('limits are current §19 values', () => {
        expect(KLEINUNTERNEHMER_PREVIOUS_YEAR_LIMIT).toBe(25_000);
        expect(KLEINUNTERNEHMER_CURRENT_YEAR_LIMIT).toBe(100_000);
    });

    test('under both limits → success', () => {
        const result = run({ previousYear: '20.000', currentYear: '50.000' });
        expect(result.error).toBeUndefined();
        expect(result.tone).toBe('success');
        expect(result.heading).toContain('unter den Grenzen');
    });

    test('over previous year limit → danger', () => {
        const result = run({ previousYear: '26.000' });
        expect(result.tone).toBe('danger');
        const row = result.rows.find((r) => r.label === 'Vorjahresumsatz');
        expect(String(row?.value)).toContain('Über der Grenze');
    });

    test('near limit → warn', () => {
        const result = run({ previousYear: '24.000' });
        expect(result.tone).toBe('warn');
    });

    test('no input yields error', () => {
        const result = run({});
        expect(result.error).toBeTruthy();
    });
});
