import type { TempUnit } from './factors';

/** Convert via a factor table (value × fromFactor → base → target). */
export function convertByTable(
    value: number,
    from: string,
    to: string,
    table: Record<string, number>,
): number | null {
    const fromFactor = table[from];
    const toFactor = table[to];
    if (fromFactor === undefined || toFactor === undefined) return null;
    if (toFactor === 0) return null;
    return (value * fromFactor) / toFactor;
}

function toCelsius(value: number, from: TempUnit): number {
    if (from === 'c') return value;
    if (from === 'f') return ((value - 32) * 5) / 9;
    return value - 273.15;
}

function fromCelsius(celsius: number, to: TempUnit): number {
    if (to === 'c') return celsius;
    if (to === 'f') return (celsius * 9) / 5 + 32;
    return celsius + 273.15;
}

export function convertTemperature(value: number, from: TempUnit, to: TempUnit): number {
    if (from === to) return value;
    return fromCelsius(toCelsius(value, from), to);
}

const CM_PER_INCH = 2.54;

/** Pixels at given DPI for a length in cm. */
export function cmToPx(cm: number, dpi: number): number {
    return (cm / CM_PER_INCH) * dpi;
}

/** Print width in cm for pixel count at given DPI. */
export function pxToCm(px: number, dpi: number): number {
    if (dpi === 0) return Number.NaN;
    return (px / dpi) * CM_PER_INCH;
}

/** DPI from pixel count and physical width in cm. */
export function dpiFromPxCm(px: number, cm: number): number {
    if (cm === 0) return Number.NaN;
    return px / (cm / CM_PER_INCH);
}
