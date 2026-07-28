import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldNumber } from '../_shared/shells';
import { convertTemperature, fmtUnit, type TempUnit } from '../_shared/units';

const LABELS: Record<TempUnit, string> = {
    c: '°C',
    f: '°F',
    k: 'K',
};

export function computeTempConvert(values: FieldValues): CalcResult {
    const amount = parseFieldNumber(values.value ?? '');
    const from = (values.from ?? 'c') as TempUnit;
    const to = (values.to ?? 'f') as TempUnit;

    if (amount === null) {
        return { rows: [], error: 'Bitte einen gültigen Wert eingeben.' };
    }

    const result = convertTemperature(amount, from, to);
    const fromLabel = LABELS[from];
    const toLabel = LABELS[to];

    return {
        tone: 'info',
        heading: `${fmtUnit(amount)} ${fromLabel} → ${toLabel}`,
        rows: [{ label: 'Ergebnis', value: `${fmtUnit(result)} ${toLabel}` }],
    };
}
