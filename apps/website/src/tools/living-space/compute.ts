import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldNumber } from '../_shared/shells';

function area(w: number, l: number): number {
    return Math.round(w * l * 100) / 100;
}

/** Living space from rectangle or L-shape room measures (m). */
export function computeLivingSpace(values: FieldValues): CalcResult {
    const shape = values.shape ?? 'rect';
    const w1 = parseFieldNumber(values.w1 ?? '');
    const l1 = parseFieldNumber(values.l1 ?? '');
    if (w1 === null || l1 === null || w1 <= 0 || l1 <= 0) {
        return { rows: [], error: 'Bitte Breite und Länge des Hauptbereichs in Metern angeben.' };
    }

    const a1 = area(w1, l1);

    if (shape === 'rect') {
        return {
            tone: 'info',
            heading: 'Wohnfläche (Rechteck)',
            rows: [
                { label: 'Maße', value: `${w1.toLocaleString('de-DE')} × ${l1.toLocaleString('de-DE')} m` },
                { label: 'Fläche', value: `${a1.toLocaleString('de-DE')} m²` },
            ],
            hint: 'Grobe Geometrie — keine WoFlV-Berechnung (Schrägen, Balkone etc. fehlen).',
        };
    }

    const w2 = parseFieldNumber(values.w2 ?? '');
    const l2 = parseFieldNumber(values.l2 ?? '');
    if (w2 === null || l2 === null || w2 <= 0 || l2 <= 0) {
        return { rows: [], error: 'Für L-Form bitte auch den zweiten Schenkel angeben.' };
    }
    const a2 = area(w2, l2);
    const total = Math.round((a1 + a2) * 100) / 100;

    return {
        tone: 'info',
        heading: 'Wohnfläche (L-Form)',
        rows: [
            { label: 'Bereich A', value: `${a1.toLocaleString('de-DE')} m²` },
            { label: 'Bereich B', value: `${a2.toLocaleString('de-DE')} m²` },
            { label: 'Summe', value: `${total.toLocaleString('de-DE')} m²` },
        ],
        hint: 'Zwei Rechtecke addiert — keine WoFlV-Berechnung.',
    };
}
