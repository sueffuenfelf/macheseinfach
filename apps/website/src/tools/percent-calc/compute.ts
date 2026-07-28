import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldNumber } from '../_shared/shells';

function fmt(n: number): string {
    return n.toLocaleString('de-DE', { maximumFractionDigits: 6 });
}

export function computePercent(values: FieldValues): CalcResult {
    const mode = values.mode ?? 'of';
    const a = parseFieldNumber(values.a ?? '');
    const b = parseFieldNumber(values.b ?? '');
    if (a === null || b === null) {
        return { rows: [], error: 'Bitte zwei gültige Zahlen eingeben.' };
    }

    if (mode === 'of') {
        // a% of b
        const result = (a / 100) * b;
        return {
            tone: 'info',
            heading: `${fmt(a)} % von ${fmt(b)}`,
            rows: [{ label: 'Ergebnis', value: fmt(result) }],
        };
    }

    if (mode === 'is') {
        // a is what % of b
        if (b === 0) return { rows: [], error: 'Division durch 0 — Basis darf nicht 0 sein.' };
        const pct = (a / b) * 100;
        return {
            tone: 'info',
            heading: `${fmt(a)} ist … % von ${fmt(b)}`,
            rows: [{ label: 'Anteil', value: `${fmt(pct)} %` }],
        };
    }

    // change: from a to b → percent change
    if (a === 0) return { rows: [], error: 'Ausgangspunkt 0 — Änderung in % nicht definiert.' };
    const change = ((b - a) / Math.abs(a)) * 100;
    return {
        tone: change >= 0 ? 'success' : 'warn',
        heading: `Von ${fmt(a)} nach ${fmt(b)}`,
        rows: [
            { label: 'Änderung', value: `${change >= 0 ? '+' : ''}${fmt(change)} %` },
            { label: 'Differenz', value: fmt(b - a) },
        ],
    };
}
