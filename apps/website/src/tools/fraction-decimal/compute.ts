import type { CalcResult, FieldValues } from '../_shared/shells';
import { decimalToFraction, fmtUnit, parseFractionInput } from '../_shared/units';

export function computeFractionDecimal(values: FieldValues): CalcResult {
    const mode = values.mode ?? 'to-decimal';
    const input = (values.input ?? '').trim();

    if (!input) {
        return { rows: [], error: 'Bitte einen Wert eingeben.' };
    }

    if (mode === 'to-decimal') {
        const decimal = parseFractionInput(input);
        if (decimal === null) {
            return {
                rows: [],
                error: 'Ungültiger Bruch — z. B. 3/4 oder 1 1/2.',
            };
        }
        return {
            tone: 'info',
            heading: `${input} als Dezimalzahl`,
            rows: [{ label: 'Dezimal', value: fmtUnit(decimal) }],
        };
    }

    const decimal = parseFractionInput(input);
    if (decimal === null) {
        return { rows: [], error: 'Ungültige Dezimalzahl — z. B. 0,75.' };
    }

    const fraction = decimalToFraction(decimal);
    return {
        tone: 'info',
        heading: `${fmtUnit(decimal)} als Bruch`,
        rows: [{ label: 'Bruch', value: fraction }],
        hint: 'Näherungsbruch — für exakte Werte Bruch eingeben.',
    };
}
