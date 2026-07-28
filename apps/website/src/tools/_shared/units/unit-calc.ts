import type { CalcResult, FieldValues } from '../shells';
import { parseFieldNumber } from '../shells';
import { convertByTable } from './convert';
import { fmtUnit } from './format';

export type UnitOption = { value: string; label: string };

export function computeUnitConversion(
    values: FieldValues,
    table: Record<string, number>,
    unitLabels: Record<string, string>,
    valueLabel = 'Wert',
): CalcResult {
    const amount = parseFieldNumber(values.value ?? '');
    const from = values.from ?? '';
    const to = values.to ?? '';

    if (amount === null) {
        return { rows: [], error: 'Bitte einen gültigen Wert eingeben.' };
    }
    if (!from || !to) {
        return { rows: [], error: 'Bitte Quell- und Zieleinheit wählen.' };
    }

    const result = convertByTable(amount, from, to, table);
    if (result === null) {
        return { rows: [], error: 'Unbekannte Einheit.' };
    }

    const fromLabel = unitLabels[from] ?? from;
    const toLabel = unitLabels[to] ?? to;

    return {
        tone: 'info',
        heading: `${fmtUnit(amount)} ${fromLabel} → ${toLabel}`,
        rows: [{ label: 'Ergebnis', value: `${fmtUnit(result)} ${toLabel}` }],
        hint: `${valueLabel}: ${fmtUnit(amount)} ${fromLabel}`,
    };
}
