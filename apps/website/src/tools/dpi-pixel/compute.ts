import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldNumber } from '../_shared/shells';
import { cmToPx, dpiFromPxCm, fmtUnit, pxToCm } from '../_shared/units';

export function computeDpiPixel(values: FieldValues): CalcResult {
    const mode = values.mode ?? 'px-to-cm';
    const a = parseFieldNumber(values.a ?? '');
    const b = parseFieldNumber(values.b ?? '');

    if (a === null || b === null) {
        return { rows: [], error: 'Bitte zwei gültige Zahlen eingeben.' };
    }

    if (mode === 'px-to-cm') {
        if (b === 0) return { rows: [], error: 'DPI darf nicht 0 sein.' };
        const cm = pxToCm(a, b);
        return {
            tone: 'info',
            heading: `${fmtUnit(a, 0)} px bei ${fmtUnit(b, 0)} DPI`,
            rows: [{ label: 'Druckbreite', value: `${fmtUnit(cm)} cm` }],
        };
    }

    if (mode === 'cm-to-px') {
        if (b === 0) return { rows: [], error: 'DPI darf nicht 0 sein.' };
        const px = cmToPx(a, b);
        return {
            tone: 'info',
            heading: `${fmtUnit(a)} cm bei ${fmtUnit(b, 0)} DPI`,
            rows: [{ label: 'Pixel', value: `${fmtUnit(px, 0)} px` }],
        };
    }

    if (mode === 'dpi-calc') {
        if (b === 0) return { rows: [], error: 'Breite in cm darf nicht 0 sein.' };
        const dpi = dpiFromPxCm(a, b);
        return {
            tone: 'info',
            heading: `${fmtUnit(a, 0)} px auf ${fmtUnit(b)} cm`,
            rows: [{ label: 'Auflösung', value: `${fmtUnit(dpi, 0)} DPI` }],
        };
    }

    return { rows: [], error: 'Unbekannter Modus.' };
}
